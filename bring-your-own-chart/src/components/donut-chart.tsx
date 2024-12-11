import { LuzmoVizItemComponent } from '@luzmo/react-embed';
import { useRef, useState } from 'react';
import { NumberWithBorder } from './shared/number-with-border';

// Custom legend component that is fed with Luzmo's visualization data
const DonutChartLegend = ({ data, casesStatusesSelection }) => {
  return (
    <div style={{ minWidth: '200px', borderTop: '1px solid #ebecef' }}>
      {data.length === 0 && <div>Loading legend data...</div>}
      {data.sort(([labelA], [labelB]) => {
                  // Sort statuses
                  const statusOrder = ['To do', 'In progress', 'Completed'];
                  const statusA = statusOrder.indexOf(labelA);
                  const statusB = statusOrder.indexOf(labelB);

                  return statusA - statusB;
                }).map(([label, color, absoluteValue, percentageValue], index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'left',
            paddingTop: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid #ebecef',
            opacity:
              casesStatusesSelection.length === 0 ||
              casesStatusesSelection.includes(label)
                ? 1
                : 0.4,
          }}
        >
          <span
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '8px',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          ></span>
          <span
            style={{
              flexGrow: 1,
              textAlign: 'left',
              display: 'flex',
              gap: '6px',
              padding: '0.1rem',
            }}
          >
            <NumberWithBorder value={absoluteValue} />
            {label}
          </span>
          <span style={{ fontWeight: 'bold' }}>{percentageValue}%</span>
        </div>
      ))}
    </div>
  );
};

// Uses Luzmo Flex widget to render donut chart and get data
export const DonutChart = ({
  categoryColumn,
  donutChartMeasureCountLabel,
  casesStatusesSelection,
  onCaseStatusesSelection,
}) => {
  const donutVizItemInstance = useRef(null);

  const [data, setData] = useState([]);

  const getChartData = () => {
    const chartData = donutVizItemInstance.current.getData();
    console.log(chartData);

    // Total is required to calculate percentages
    const total = chartData.reduce((acc, row) => acc + row[1], 0);

    // Map into array of arrays [ [category, color, absolute_value, percentage_value] ]
    const newData = chartData.map((row) => {
      return [
        row[0].id,
        row[0].color,
        row[1],
        Math.round((100 * row[1]) / total),
      ];
    });

    // Set the chart data as state
    setData(newData);
  };

  const handleWidgetSelection = (event: CustomEvent) => {
    if (event.detail.changed.length === 0) {
      onCaseStatusesSelection([]);
      return;
    }

    onCaseStatusesSelection(event.detail.changed[0].filters[0].parameters[1]);
  };

  return (
    <div>
      <LuzmoVizItemComponent
        ref={donutVizItemInstance}
        style={{ width: '100%', height: '20rem' }}
        type="donut-chart"
        options={{
          display: {
            title: false,
            legend: false,
          },
          mode: 'donut',
          slices: {
            width: 0.2,
            roundedCorners: 0,
          },
        }}
        slots={[
          {
            name: 'measure',
            content: [
              {
                column: categoryColumn.columnId,
                set: categoryColumn.datasetId,
                label: {
                  en: donutChartMeasureCountLabel,
                },
                type: 'hierarchy',
                aggregationFunc: 'count',
              },
            ],
          },
          {
            name: 'category',
            content: [
              {
                column: categoryColumn.columnId,
                set: categoryColumn.datasetId,
                label: {
                  en: categoryColumn.label,
                },
                type: 'hierarchy',
              },
            ],
          },
        ]}
        rendered={getChartData}
        changedFilters={(event) => handleWidgetSelection(event)}
      />
      <DonutChartLegend
        data={data}
        casesStatusesSelection={casesStatusesSelection}
      />
    </div>
  );
};
