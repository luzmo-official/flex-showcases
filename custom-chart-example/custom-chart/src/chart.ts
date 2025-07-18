import { formatter } from '@luzmo/analytics-components-kit/utils';
import type {
  ItemData,
  ItemFilter,
  ItemThemeConfig,
  Slot,
  SlotConfig,
  ThemeConfig
} from '@luzmo/dashboard-contents-types';
import * as d3 from 'd3';

interface DealData {
  salesRep: string;
  dealName: string;
  dealAmount: number;
  dealProbability: number; // 0-1
  expectedCloseDate: string;
}

interface SalesRepData {
  name: string;
  x: number;
  y: number;
  deals: DealData[];
}

interface ProcessedDealData extends DealData {
  x: number;
  y: number;
  radius: number;
  color: string;
  salesRepX: number;
  salesRepY: number;
}

// State management
interface ChartState {
  salesRepSlot?: Slot;
  dealNameSlot?: Slot;
  dealAmountSlot?: Slot;
  dealProbabilitySlot?: Slot;
  expectedCloseDateSlot?: Slot;
  selectedDeals: Set<string>;
  svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  zoom?: d3.ZoomBehavior<SVGSVGElement, unknown>;
  currentContainer?: HTMLElement;
  currentDealData?: DealData[];
  currentDimensions?: ChartDimensions;
  currentIsEmptyState?: boolean;
  selectedSalesRep?: string;
  selectedDeal?: string;
  currentTheme?: ThemeConfig;
  language?: string;
}

// Initialize chart state
const chartState: ChartState = {
  selectedDeals: new Set(),
  selectedSalesRep: undefined,
  selectedDeal: undefined,
  language: 'en'
};

// Define types for chart configuration
interface ChartDimensions {
  width: number;
  height: number;
}

interface ChartParams {
  container: HTMLElement;
  data: ItemData['data'];
  slots: Slot[];
  slotConfigurations: SlotConfig[];
  options: Record<string, any> & { theme?: ItemThemeConfig };
  language: string;
  dimensions: { width: number; height: number };
}

/**
 * Main render function for the 2D Deal Reps chart
 */
export const render = ({
  container,
  data = [],
  slots = [],
  slotConfigurations = [],
  options = {},
  language = 'en',
  dimensions: { width, height } = { width: 0, height: 0 }
}: ChartParams): void => {
  // Clear container
  container.innerHTML = '';

  const theme: ThemeConfig = options?.theme || {};

  // Store current state for redraw
  chartState.currentContainer = container;
  chartState.currentDimensions = { width, height };

  // Store slots in chart state
  chartState.salesRepSlot = slots.find((s) => s.name === 'category');
  chartState.dealNameSlot = slots.find((s) => s.name === 'name');
  chartState.dealAmountSlot = slots.find((s) => s.name === 'size');
  chartState.dealProbabilitySlot = slots.find((s) => s.name === 'color');
  chartState.expectedCloseDateSlot = slots.find((s) => s.name === 'time');

  // Check if we have the required slots filled
  const hasSalesRep = chartState.salesRepSlot?.content?.length! > 0;
  const hasDealName = chartState.dealNameSlot?.content?.length! > 0;
  const hasDealAmount = chartState.dealAmountSlot?.content?.length! > 0;
  const hasDealProbability = chartState.dealProbabilitySlot?.content?.length! > 0;
  const hasExpectedCloseDate = chartState.expectedCloseDateSlot?.content?.length! > 0;

  const isEmptyState = !data.length || !hasSalesRep || !hasDealName || !hasDealAmount || !hasDealProbability || !hasExpectedCloseDate;


  // If no data (empty slots), generate sample data, otherwise process real data.
  const dealData: DealData[] = !data?.length ?
    generateSampleDealData(language) :
    processDealData(data, language);

  // Store current data for redraw
  chartState.currentDealData = dealData;
  chartState.currentIsEmptyState = isEmptyState;

  // Create 2D visualization
  setup2DVisualization(container, dealData, width, height, theme, language);

  // Store the chart data on the container for reference during resize
  (container as any).__chartData = dealData;
  (container as any).__isEmptyState = isEmptyState;
};

/**
 * Resize handler
 */
export const resize = ({
  container,
  slots = [],
  slotConfigurations = [],
  options = {},
  language = 'en',
  dimensions: { width, height } = { width: 0, height: 0 }
}: ChartParams): void => {
  // Get the existing state
  const dealData: DealData[] = (container as any).__chartData || [];

  // Update current dimensions
  chartState.currentDimensions = { width, height };

  // If no SVG exists, fall back to full render
  const svg = d3.select(container).select('svg');
  if (svg.empty()) {
    return;
  }

  // Calculate new layout dimensions (same logic as in render)
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Update SVG dimensions
  svg
    .attr('width', width)
    .attr('height', height);

  // Get current zoom transform before updating
  const mainGroup = svg.select('g');
  const currentTransform = d3.zoomTransform(svg.node() as SVGSVGElement);

  // Recalculate sales rep positions
  const dealsBySalesRep = d3.group(dealData, d => d.salesRep);
  const salesReps = Array.from(dealsBySalesRep.keys());
  
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const repRadius = Math.min(innerWidth, innerHeight) * 0.35;

  const salesRepData: SalesRepData[] = salesReps.map((rep, index) => {
    const angle = (index / salesReps.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * repRadius;
    const y = centerY + Math.sin(angle) * repRadius;
    return { name: rep, x, y, deals: dealsBySalesRep.get(rep) || [] };
  }) as SalesRepData[];

  // Recalculate deal positions
  const today = new Date();
  const processedDeals: ProcessedDealData[] = [];
  const maxDealAmount = Math.max(...dealData.map(deal => deal.dealAmount));
  const maxCloseDate = new Date(Math.max(...dealData.map(deal => new Date(deal.expectedCloseDate).getTime())));
  const maxDaysToClose = daysBetween(today, maxCloseDate);

  salesRepData.forEach(repData => {
    repData.deals.forEach((deal, dealIndex) => {
      const daysToClose = daysBetween(today, new Date(deal.expectedCloseDate));
      const maxDistance = Math.min(innerWidth, innerHeight) * 0.20;
      const salesRepRadius = 25;
      const minDistance = salesRepRadius + 15;

      const normalizedTime = maxDaysToClose > 0 ? Math.min(daysToClose / maxDaysToClose, 1) : 0;
      const distance = minDistance + (normalizedTime * (maxDistance - minDistance));

      const dealAngle = (dealIndex / repData.deals.length) * Math.PI * 2;
      const dealX = repData.x + Math.cos(dealAngle) * distance;
      const dealY = repData.y + Math.sin(dealAngle) * distance;

      const minRadius = 4;
      const maxRadius = 15;
      const radius = minRadius + (deal.dealAmount / maxDealAmount) * (maxRadius - minRadius);

      processedDeals.push({
        ...deal,
        x: dealX,
        y: dealY,
        radius: Math.max(minRadius, Math.min(maxRadius, radius)),
        color: getDealProbabilityColor(deal.dealProbability),
        salesRepX: repData.x,
        salesRepY: repData.y
      });
    });
  });

  // Update sales rep circles positions
  mainGroup.selectAll('.sales-rep-circle')
    .data(salesRepData)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);

  // Update sales rep initials positions
  mainGroup.selectAll('.sales-rep-initials')
    .data(salesRepData)
    .attr('x', d => d.x)
    .attr('y', d => d.y);

  // Update sales rep labels positions
  mainGroup.selectAll('.sales-rep-label')
    .data(salesRepData)
    .attr('x', d => d.x)
    .attr('y', d => d.y + 40);

  // Update deal count badges positions
  mainGroup.selectAll('.deal-count-badge')
    .data(salesRepData)
    .attr('transform', d => `translate(${d.x + 18}, ${d.y - 18})`);

  // Update connection lines positions
  mainGroup.selectAll('.connection-line')
    .data(processedDeals)
    .attr('x1', d => d.salesRepX)
    .attr('y1', d => d.salesRepY)
    .attr('x2', d => d.x)
    .attr('y2', d => d.y);

  // Update deal circles positions and sizes
  mainGroup.selectAll('.deal')
    .data(processedDeals)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.radius);

  // Update zoom behavior and restore current transform
  if (chartState.zoom) {
    // Update zoom behavior with new zoom handler for new dimensions
    const updatedZoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', function (event) {
        mainGroup.attr('transform', `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
      });
    
    svg.call(updatedZoom as any);
    chartState.zoom = updatedZoom;
    
    // Restore the current zoom transform
    svg.call(updatedZoom.transform as any, currentTransform);
  }
};

/**
 * Generate sample data for empty state visualization
 */
function generateSampleDealData(language: string): DealData[] {
  const salesReps: Record<string, string>[] = [
    { en: 'Alice Johnson' },
    { en: 'Bob Smith' },
    { en: 'Carol Williams' },
    { en: 'David Brown' }
  ];
  const dealNames: Record<string, string>[] = [
    { en: 'Enterprise Deal' },
    { en: 'SMB Contract' },
    { en: 'Partnership Agreement' },
    { en: 'Service Contract' },
    { en: 'Renewal Deal' }
  ];

  return salesReps.flatMap(rep => {
    const numDeals = Math.floor(Math.random() * 4) + 3;
    return Array.from({ length: numDeals }, (_, i) => ({
      salesRep: rep[language],
      dealName: `${dealNames[Math.floor(Math.random() * dealNames.length)][language]} ${i + 1}`,
      dealAmount: Math.floor(Math.random() * 950000) + 50000,
      dealProbability: Math.random(),
      expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + Math.floor(Math.random() * 500) + 1)).toISOString()
    }));
  });
}

/**
 * Process raw data to a format that can be used to render the chart.
 */
function processDealData(data: ItemData['data'] = [], language: string): DealData[] {
  return data
  .map(row => {
    return {
      salesRep: row[0]?.name?.[language] || 'Unknown rep',
      dealName: row[1]?.name?.[language] || 'Unknown deal',
      expectedCloseDate: row[2] || new Date().toISOString(),
      dealAmount: row[3] || 0,
      dealProbability: row[4] || 0
    };
  })
}

/**
 * Create color based on deal probability (red -> yellow -> orange -> green)
 */
function getDealProbabilityColor(probability: number): string {
  if (probability <= 0.33) {
    // Red to Yellow (0-33%)
    const factor = probability / 0.33;
    const red = 255;
    const green = Math.round(255 * factor);
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  }
  else if (probability <= 0.66) {
    // Yellow to Orange (33-66%)
    const factor = (probability - 0.33) / 0.33;
    const red = 255;
    const green = Math.round(255 - (76 * factor));
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  }
  else {
    // Orange to Green (66-100%)
    const factor = (probability - 0.66) / 0.34;
    const red = Math.round(255 - (255 * factor));
    const green = 255;
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

/**
 * Determine if a color is light or dark based on its luminance
 */
function isLightOrDarkColor(color: string): 'light' | 'dark' {
  let r: number, g: number, b: number;

  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      // Short hex format (#rgb)
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      // Full hex format (#rrggbb)
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      // Invalid hex format, default to dark
      return 'dark';
    }
  }
  // Handle rgb/rgba colors
  else if (color.startsWith('rgb')) {
    const matches = color.match(/\d+/g);
    if (!matches || matches.length < 3) {
      // Invalid rgb format, default to dark
      return 'dark';
    }
    r = parseInt(matches[0]);
    g = parseInt(matches[1]);
    b = parseInt(matches[2]);
  }
  // Handle named colors or other formats - default to dark for safety
  else {
    return 'dark';
  }

  // Calculate relative luminance using the standard formula
  // First convert RGB to linear RGB
  const toLinear = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const linearR = toLinear(r);
  const linearG = toLinear(g);
  const linearB = toLinear(b);

  // Calculate luminance
  const luminance = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB;

  // Return true if light (threshold of 0.5, you can adjust this)
  return luminance > 0.5 ? 'light' : 'dark';
}

/**
 * Setup 2D visualization using D3.js
 */
function setup2DVisualization(container: HTMLElement, dealData: DealData[], width: number, height: number, theme: ThemeConfig, language: string): void {
  const margin = { top: 40, right: 40, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  chartState.currentTheme = theme;

  const themeBackgroundColor = theme.itemsBackground || 'rgb(255, 255, 255)';
  const themeMainColor = theme.mainColor || 'rgb(118, 75, 162)';

  d3.select(container).classed('light-mode', isLightOrDarkColor(themeBackgroundColor) === 'light');
  d3.select(container).classed('dark-mode', isLightOrDarkColor(themeBackgroundColor) === 'dark');

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background-color', themeBackgroundColor)

  chartState.svg = svg;

  // Create main group for zooming/panning
  const mainGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Group deals by sales rep
  const dealsBySalesRep = d3.group(dealData, d => d.salesRep);
  const salesReps = Array.from(dealsBySalesRep.keys());

  // Position sales reps in a circular layout
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  const repRadius = Math.min(innerWidth, innerHeight) * 0.35;

  const salesRepData: SalesRepData[] = salesReps.map((rep, index) => {
    const angle = (index / salesReps.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * repRadius;
    const y = centerY + Math.sin(angle) * repRadius;
    return { name: rep, x, y, deals: dealsBySalesRep.get(rep) || [] };
  });

  // Process deal positions and properties
  const today = new Date();
  const processedDeals: ProcessedDealData[] = [];

  // Calculate the maximum deal amount in the dataset for scaling
  const maxDealAmount = Math.max(...dealData.map(deal => deal.dealAmount));

  // Calculate the maximum close date in the dataset for distance scaling
  const maxCloseDate = new Date(Math.max(...dealData.map(deal => new Date(deal.expectedCloseDate).getTime())));
  const maxDaysToClose = daysBetween(today, maxCloseDate);

  salesRepData.forEach(repData => {
    repData.deals.forEach((deal, dealIndex) => {
      // Calculate distance based on expected close date
      const daysToClose = daysBetween(today, new Date(deal.expectedCloseDate));
      const maxDistance = Math.min(innerWidth, innerHeight) * 0.20;
      const salesRepRadius = 25; // Sales rep image radius
      const minDistance = salesRepRadius + 15; // Sales rep radius + padding to avoid overlap

      // Scale distance linearly from minDistance to maxDistance based on the dataset's time range
      const normalizedTime = maxDaysToClose > 0 ? Math.min(daysToClose / maxDaysToClose, 1) : 0;
      const distance = minDistance + (normalizedTime * (maxDistance - minDistance));

      // Position deals around the sales rep in a circular pattern
      const dealAngle = (dealIndex / repData.deals.length) * Math.PI * 2;
      const dealX = repData.x + Math.cos(dealAngle) * distance;
      const dealY = repData.y + Math.sin(dealAngle) * distance;

      // Calculate deal circle radius based on amount (scaled by max amount in dataset)
      const minRadius = 4;
      const maxRadius = 15;
      const radius = minRadius + (deal.dealAmount / maxDealAmount) * (maxRadius - minRadius);

      processedDeals.push({
        ...deal,
        x: dealX,
        y: dealY,
        radius: Math.max(minRadius, Math.min(maxRadius, radius)),
        color: getDealProbabilityColor(deal.dealProbability),
        salesRepX: repData.x,
        salesRepY: repData.y
      });
    });
  });

  // Create enhanced tooltip
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'tooltip');

  // Draw connecting lines with animation
  const connectionLines = mainGroup.selectAll('.connection-line')
    .data(processedDeals)
    .enter()
    .append('line')
    .attr('class', 'connection-line connection-line-enter')
    .attr('x1', d => d.salesRepX)
    .attr('y1', d => d.salesRepY)
    .attr('x2', d => d.salesRepX) // Start from sales rep position
    .attr('y2', d => d.salesRepY)
    .attr('stroke-width', 1)
    .attr('opacity', 0);

  // Animate connection lines
  connectionLines
    .transition()
    .duration(800)
    .delay((d, i) => i * 20)
    .ease(d3.easeCubicOut)
    .attr('x2', d => d.x)
    .attr('y2', d => d.y)
    .attr('opacity', 0.6);

  // Create individual circular clip paths for each sales rep
  const defs = svg.append('defs');

  // Add gradient definitions for enhanced visual effects
  const gradientDefs = defs.append('defs');

  // Create a radial gradient for sales rep borders
  const repGradient = gradientDefs.append('radialGradient')
    .attr('id', 'rep-border-gradient')
    .attr('cx', '50%')
    .attr('cy', '50%')
    .attr('r', '50%');

  repGradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', theme.mainColor || '#6366f1')
    .attr('stop-opacity', 0.8);

  repGradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', theme.mainColor || '#6366f1')
    .attr('stop-opacity', 1);

  // Helper function to get initials from a name
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2); // Limit to 2 characters
  }

  // Draw sales rep circles with background color
  const salesRepCircles = mainGroup.selectAll('.sales-rep-circle')
    .data(salesRepData)
    .enter()
    .append('circle')
    .attr('class', 'sales-rep-circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', 25)
    .attr('fill', themeMainColor)
    .attr('stroke', 'url(#rep-border-gradient)')
    .attr('stroke-width', 3)
    .style('cursor', 'pointer')
    .style('opacity', 0);

  // Animate sales rep circles entrance
  salesRepCircles
    .transition()
    .duration(600)
    .delay((d, i) => i * 100)
    .ease(d3.easeCubicOut)
    .style('opacity', 1);

  // Draw sales rep initials text
  const salesRepInitials = mainGroup.selectAll('.sales-rep-initials')
    .data(salesRepData)
    .enter()
    .append('text')
    .attr('class', 'sales-rep-initials')
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', '600')
    .attr('fill', isLightOrDarkColor(themeMainColor) === 'light' ? '#333' : '#fff')
    .style('cursor', 'pointer')
    .style('opacity', 0)
    .text(d => getInitials(d.name));

  // Animate sales rep initials entrance
  salesRepInitials
    .transition()
    .duration(600)
    .delay((d, i) => i * 100 + 100)
    .ease(d3.easeCubicOut)
    .style('opacity', 1);

  // Add deal count badges in top-right corner of sales rep circles
  const dealCountBadges = mainGroup.selectAll('.deal-count-badge')
    .data(salesRepData)
    .enter()
    .append('g')
    .attr('class', 'deal-count-badge')
    .attr('transform', d => `translate(${d.x + 18}, ${d.y - 18})`)
    .style('opacity', 0);

  // Badge background circle
  dealCountBadges
    .append('circle')
    .attr('r', 10)
    .attr('fill', theme.itemsBackground || 'white')
    .attr('stroke', themeMainColor)
    .attr('stroke-width', 2);

  // Badge text showing deal count
  dealCountBadges
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-size', '10px')
    .attr('font-weight', '600')
    .attr('fill', isLightOrDarkColor(theme.itemsBackground || 'white') === 'light' ? '#333' : '#fff')
    .text(d => d.deals.length);

  // Animate badge entrance
  dealCountBadges
    .transition()
    .duration(400)
    .delay((d, i) => i * 100 + 300)
    .ease(d3.easeCubicOut)
    .style('opacity', 1);

  // Add click event handlers to sales rep circles and initials
  function handleSalesRepClick(event: any, clickedRepData: SalesRepData) {
    const isCurrentlySelected = chartState.selectedSalesRep === clickedRepData.name;

    if (isCurrentlySelected) {
      // Reset selection - show all sales reps and deals at full opacity
      chartState.selectedSalesRep = undefined;

      // Reset all sales rep elements
      salesRepCircles.transition().duration(300).style('opacity', 1);
      salesRepInitials.transition().duration(300).style('opacity', 1);
      salesRepLabels.transition().duration(300).style('opacity', 1);
      dealCountBadges.transition().duration(300).style('opacity', 1);

      // Reset all deals and connections
      dealCircles.transition().duration(300).style('opacity', 1);
      connectionLines.transition().duration(300).attr('opacity', 0.6);

      window.parent.postMessage({ type: 'setFilter', filters: [] }, '*');
    }
    else {
      // Set new selection - fade others
      chartState.selectedSalesRep = clickedRepData.name;

      // Fade other sales reps
      salesRepCircles
        .transition()
        .duration(300)
        .style('opacity', d => d.name === clickedRepData.name ? 1 : 0.2);

      salesRepInitials
        .transition()
        .duration(300)
        .style('opacity', d => d.name === clickedRepData.name ? 1 : 0.2);

      salesRepLabels
        .transition()
        .duration(300)
        .style('opacity', d => d.name === clickedRepData.name ? 1 : 0.2);

      dealCountBadges
        .transition()
        .duration(300)
        .style('opacity', d => d.name === clickedRepData.name ? 1 : 0.2);

      // Fade deals not belonging to the selected sales rep
      dealCircles
        .transition()
        .duration(300)
        .style('opacity', d => d.salesRep === clickedRepData.name ? 1 : 0.2);

      // Fade connection lines for deals not belonging to the selected sales rep
      connectionLines
        .transition()
        .duration(300)
        .attr('opacity', d => d.salesRep === clickedRepData.name ? 0.6 : 0.08);

      // Create and send filter
      if (chartState.salesRepSlot?.content[0]) {
        const filters: ItemFilter[] = [{
          expression: '? = ?',
          parameters: [
            {
              column_id: chartState.salesRepSlot.content[0].columnId || chartState.salesRepSlot.content[0].column,
              dataset_id: chartState.salesRepSlot.content[0].datasetId || chartState.salesRepSlot.content[0].set,
              level: chartState.salesRepSlot.content[0].level || undefined
            },
            clickedRepData.name
          ]
        }];

        window.parent.postMessage({ type: 'setFilter', filters }, '*');
      }
    }

    // Update clear filter button visibility
    updateClearFilterButtonVisibility();
  }

  // Add hover effects for sales rep circles
  salesRepCircles
    .on('mouseover', function(event, d) {
      const circle = d3.select(this);
      
      // Add drop shadow filter on hover
      circle
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .style('filter', 'drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 8px)')
        .attr('stroke-width', 4);
    })
    .on('mouseout', function(event, d) {
      const circle = d3.select(this);
      
      // Remove hover effects
      circle
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .style('filter', 'none')
        .attr('stroke-width', 3);
    })
    .on('click', function(event, d) {
      const circle = d3.select(this);
      
      // Reset hover effects on click
      circle
        .style('filter', 'none')
        .attr('stroke-width', 3);
      
      handleSalesRepClick(event, d);
    });

  // Add hover effects for sales rep initials
  salesRepInitials
    .on('mouseover', function(event, d) {
      // Find the corresponding circle and trigger its hover effect
      salesRepCircles
        .filter(circleData => circleData.name === d.name)
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .style('filter', 'drop-shadow(rgba(0, 0, 0, 0.25) 0px 4px 8px)')
        .attr('stroke-width', 4);
    })
    .on('mouseout', function(event, d) {
      // Find the corresponding circle and reset its hover effect
      salesRepCircles
        .filter(circleData => circleData.name === d.name)
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .style('filter', 'none')
        .attr('stroke-width', 3);
    })
    .on('click', function(event, d) {
      // Reset hover effects on click for the corresponding circle
      salesRepCircles
        .filter(circleData => circleData.name === d.name)
        .style('filter', 'none')
        .attr('stroke-width', 3);
      
      handleSalesRepClick(event, d);
    });

  // Deal click handler
  function handleDealClick(event: any, d: ProcessedDealData) {
    const circle = d3.select(event.currentTarget);
    const dealKey = `${d.salesRep}_${d.dealName}`;
    const isCurrentlySelected = chartState.selectedDeal === dealKey;

    // Handle selection state
    if (isCurrentlySelected) {
      chartState.selectedDeal = undefined;

      // Reset all deal circles
      dealCircles.transition().duration(300).style('opacity', 1);

      // Reset all sales rep elements
      salesRepCircles.transition().duration(300).style('opacity', 1);
      salesRepInitials.transition().duration(300).style('opacity', 1);
      salesRepLabels.transition().duration(300).style('opacity', 1);
      dealCountBadges.transition().duration(300).style('opacity', 1);

      // Reset all connection lines
      connectionLines
        .transition()
        .duration(300)
        .attr('opacity', 0.6)
        .attr('stroke-width', 1)

      window.parent.postMessage({ type: 'setFilter', filters: [] }, '*');
    }
    else {
      chartState.selectedDeal = dealKey;

      // Fade other deals
      dealCircles
        .transition()
        .duration(300)
        .style('opacity', dealData => {
          const currentDealKey = `${dealData.salesRep}_${dealData.dealName}`;
          return currentDealKey === dealKey ? 1 : 0.2;
        });

      // Fade sales reps that don't own the selected deal
      salesRepCircles
        .transition()
        .duration(300)
        .style('opacity', repData => repData.name === d.salesRep ? 1 : 0.2);

      salesRepInitials
        .transition()
        .duration(300)
        .style('opacity', repData => repData.name === d.salesRep ? 1 : 0.2);

      salesRepLabels
        .transition()
        .duration(300)
        .style('opacity', repData => repData.name === d.salesRep ? 1 : 0.2);

      dealCountBadges
        .transition()
        .duration(300)
        .style('opacity', repData => repData.name === d.salesRep ? 1 : 0.2);

      // Fade other connection lines and highlight the selected one
      connectionLines
        .transition()
        .duration(300)
        .attr('opacity', lineData => {
          const currentLineKey = `${lineData.salesRep}_${lineData.dealName}`;
          return currentLineKey === dealKey ? 1 : 0.1;
        })
        .attr('stroke-width', lineData => {
          const currentLineKey = `${lineData.salesRep}_${lineData.dealName}`;
          return currentLineKey === dealKey ? 4 : 1;
        })
        .attr('stroke', lineData => {
          const currentLineKey = `${lineData.salesRep}_${lineData.dealName}`;
          return currentLineKey === dealKey ? themeMainColor : 'inherit';
        });

      // Create and send filter
      if (chartState.dealNameSlot?.content[0]) {
        const filters: ItemFilter[] = [{
          expression: '? = ?',
          parameters: [
            {
              column_id: chartState.dealNameSlot.content[0].columnId || chartState.dealNameSlot.content[0].column,
              dataset_id: chartState.dealNameSlot.content[0].datasetId || chartState.dealNameSlot.content[0].set,
              level: chartState.dealNameSlot.content[0].level || undefined
            },
            d.dealName
          ]
        }];

        window.parent.postMessage({ type: 'setFilter', filters }, '*');
      }
    }

    // Update clear filter button visibility
    updateClearFilterButtonVisibility();
  }

  // Draw sales rep labels with staggered animation
  const salesRepLabels = mainGroup.selectAll('.sales-rep-label')
    .data(salesRepData)
    .enter()
    .append('text')
    .attr('class', 'sales-rep-label')
    .attr('x', d => d.x)
    .attr('y', d => d.y + 40)
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('font-weight', '600')
    .style('opacity', 0)
    .text(d => d.name);

  // Animate labels
  salesRepLabels
    .transition()
    .duration(400)
    .delay((d, i) => i * 100 + 600)
    .ease(d3.easeCubicOut)
    .style('opacity', 1);

  // Draw deal circles with sophisticated entrance animation
  const dealCircles = mainGroup.selectAll('.deal')
    .data(processedDeals)
    .enter()
    .append('circle')
    .attr('class', 'deal')
    .attr('cx', d => d.salesRepX) // Start from sales rep position
    .attr('cy', d => d.salesRepY)
    .attr('r', 0) // Start with radius 0
    .attr('fill', d => d.color)
    .attr('stroke', 'rgba(0, 0, 0, 0.2)')
    .attr('stroke-width', 1)
    .style('cursor', 'pointer')
    .style('opacity', 0);

  // Animate deal circles entrance
  dealCircles
    .transition()
    .duration(800)
    .delay((d, i) => i * 20)
    .ease(d3.easeCubicOut)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.radius)
    .style('opacity', 1);

  // Enhanced hover interactions for deals
  dealCircles
    .on('mouseover', function (event, d) {
      const circle = d3.select(this);

      // Enhanced hover animation
      circle
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .attr('stroke-width', 4)
        .style('filter', 'drop-shadow(rgba(0, 0, 0, 0.25) 0px 2px 4px)')

      // Show enhanced tooltip
      tooltip.transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .style('opacity', 0.9)
        .style('transform', 'translateY(0)');

      const probabilityFormatter = (probability: number) => {
        const probabilityFormatter: any = chartState.dealProbabilitySlot?.content[0] ? 
          formatter(chartState.dealProbabilitySlot.content[0]) : 
          (val: any) => val;

        return probabilityFormatter(probability);
      }

      const amountFormatter = (amount: number) => {
        const amountFormatter: any = chartState.dealAmountSlot?.content[0] ? 
          formatter(chartState.dealAmountSlot.content[0]) : 
          (val: any) => val;
        
        return amountFormatter(amount);
      }

      const salesRepLabel = chartState.salesRepSlot?.content[0] ? chartState.salesRepSlot.content[0].label?.[language] : 'Rep';
      const amountLabel = chartState.dealAmountSlot?.content[0] ? chartState.dealAmountSlot.content[0].label?.[language] : 'Amount';
      const probabilityLabel = chartState.dealProbabilitySlot?.content[0] ? chartState.dealProbabilitySlot.content[0].label?.[language] : 'Probability';
      const closeDateLabel = chartState.expectedCloseDateSlot?.content[0] ? chartState.expectedCloseDateSlot.content[0].label?.[language] : 'Close date';

      tooltip.html(`
        <div class="tooltip-header">
          <strong class="tooltip-title">${d.dealName}</strong>
        </div>
        <div class="tooltip-content">
          <span class="tooltip-label">${salesRepLabel}:</span>
          <span class="tooltip-value">${d.salesRep}</span>
          <span class="tooltip-label">${amountLabel}:</span>
          <span class="tooltip-value-amount">${amountFormatter(d.dealAmount)}</span>
          <span class="tooltip-label">${probabilityLabel}:</span>
          <span class="tooltip-value-probability">${probabilityFormatter(d.dealProbability)}</span>
          <span class="tooltip-label">${closeDateLabel}:</span>
          <span class="tooltip-value">${new Date(d.expectedCloseDate).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      `);

      // Smart tooltip positioning to prevent clipping
      const tooltipNode = tooltip.node() as HTMLElement;
      const tooltipRect = tooltipNode.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Calculate horizontal position
      let leftPos = event.pageX + 15;
      if (leftPos + tooltipRect.width > windowWidth) {
        // Position to the left of cursor if it would clip on the right
        leftPos = event.pageX - tooltipRect.width - 15;
      }
      
      // Calculate vertical position  
      let topPos = event.pageY - 10;
      if (topPos + tooltipRect.height > windowHeight) {
        // Position above cursor if it would clip at the bottom
        topPos = event.pageY - tooltipRect.height - 10;
      }
      
      // Ensure tooltip doesn't go off the left edge or top edge
      leftPos = Math.max(10, leftPos);
      topPos = Math.max(10, topPos);
      
      tooltip
        .style('left', leftPos + 'px')
        .style('top', topPos + 'px');

      // Highlight connection line
      connectionLines
        .filter(lineData => lineData === d)
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('stroke-width', 4)
        .attr('stroke', '#6366f1');
    })
    .on('mouseout', function (event, d) {
      const circle = d3.select(this);

      // Reset hover animation
      circle
        .transition()
        .duration(200)
        .ease(d3.easeCubicOut)
        .attr('stroke-width', 1)
        .attr('stroke', 'rgba(0, 0, 0, 0.2)')
        .attr('stroke-opacity', null)
        .style('filter', 'none')
        .attr('transform', 'scale(1)');

      // Hide tooltip
      tooltip.transition()
        .duration(300)
        .style('opacity', 0)
        .style('transform', 'translateY(5px)');

      // Reset connection line
      connectionLines
        .filter(lineData => lineData === d)
        .transition()
        .duration(200)
        .attr('opacity', 0.6)
        .attr('stroke-width', 1)
    })
    .on('click', handleDealClick);

  // Add zoom and pan behavior with enhanced constraints
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', function (event) {
      mainGroup.attr('transform', `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
    });

  svg.call(zoom);
  chartState.zoom = zoom;

  // Add clear filter button
  const clearFilterButton = d3.select(container)
    .append('div')
    .attr('class', 'overlay clear-filter-button')
    .style('display', 'none')
    .style('cursor', 'pointer')
    .html('Clear filter')
    .on('click', function() {
      // Clear selection states
      chartState.selectedSalesRep = undefined;
      chartState.selectedDeal = undefined;

      // Reset all sales rep elements
      salesRepCircles.transition().duration(300).style('opacity', 1);
      salesRepInitials.transition().duration(300).style('opacity', 1);
      salesRepLabels.transition().duration(300).style('opacity', 1);
      dealCountBadges.transition().duration(300).style('opacity', 1);

      // Reset all deals and connections
      dealCircles.transition().duration(300).style('opacity', 1);
      connectionLines
        .transition()
        .duration(300)
        .attr('opacity', 0.6)
        .attr('stroke-width', 1)
        .attr('stroke', null);

      // Hide the clear filter button
      clearFilterButton.style('display', 'none');

      // Send empty filters
      window.parent.postMessage({ type: 'setFilter', filters: [] }, '*');
    });

  // Function to update clear filter button visibility
  function updateClearFilterButtonVisibility() {
    const isFilterActive = chartState.selectedSalesRep || chartState.selectedDeal;
    clearFilterButton.style('display', isFilterActive ? 'block' : 'none');
  }
}
