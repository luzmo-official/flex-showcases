import { useState, useMemo, useCallback, memo } from 'react';
import { useMapData } from './hooks/useMapData';
import { useDashboardItems } from './hooks/useDashboardItems';
import { useLuzmoAuth } from './hooks/useLuzmoAuth';
import { useLuzmoData } from './hooks/useLuzmoData';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import MapView from './components/MapView';
import DashboardEditor from './components/DashboardEditor';
import ChartConfigPanel from './components/ChartConfigPanel';
import AddItemDialog from './components/AddItemDialog';

const MemoHeader = memo(Header);
const MemoLeftPanel = memo(LeftPanel);
const MemoMapView = memo(MapView);
const MemoDashboardEditor = memo(DashboardEditor);
const MemoChartConfigPanel = memo(ChartConfigPanel);

const HIDDEN = { display: 'none' };
const VISIBLE = undefined;

function App() {
  const [showAddItem, setShowAddItem] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const auth = useLuzmoAuth();
  const luzmoData = useLuzmoData(auth);
  const mapData = useMapData(luzmoData.points);
  const dashboard = useDashboardItems();

  const [mapFilters, setMapFilters] = useState([]);

  const { datasetId, latColumnId, lonColumnId } = luzmoData.columnMapping;

  const handleMapFiltersChanged = useCallback((filters) => {
    setMapFilters(Array.isArray(filters) ? filters : []);
  }, []);

  const geoContext = useMemo(
    () => ({
      selectionBounds: mapData.selectionBounds,
      datasetId,
      latColumnId,
      lonColumnId,
    }),
    [mapData.selectionBounds, datasetId, latColumnId, lonColumnId]
  );

  const handleAddItemType = useCallback((type) => {
    dashboard.addItem(type);
    setShowAddItem(false);
  }, [dashboard.addItem]);

  const handleOpenAddItem = useCallback(() => setShowAddItem(true), []);
  const handleCloseAddItem = useCallback(() => setShowAddItem(false), []);

  const toggleLeft = useCallback(() => setLeftOpen((o) => !o), []);
  const toggleRight = useCallback(() => setRightOpen((o) => !o), []);

  return (
    <div
      className="app-layout"
      data-left-collapsed={!leftOpen || undefined}
      data-right-collapsed={!rightOpen || undefined}
    >
      <MemoHeader onAddItem={handleOpenAddItem} />

      <div className="app-left">
        <button
          className="panel-collapse-toggle panel-collapse-toggle--left"
          onClick={toggleLeft}
          title={leftOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {leftOpen ? '\u25C0' : '\u25B6'}
        </button>
        <div style={leftOpen ? VISIBLE : HIDDEN}>
          <MemoLeftPanel luzmoData={luzmoData} auth={auth} />

          <div style={{ borderTop: '1px solid var(--app-border)' }}>
            <MemoChartConfigPanel
              item={dashboard.selectedItem}
              auth={auth}
              geoContext={geoContext}
              onSlotsChange={dashboard.updateItemSlots}
              onOptionsChange={dashboard.updateItemOptions}
              onFiltersChange={dashboard.updateItemFilters}
            />
          </div>
        </div>
      </div>

      <div className="app-main">
        <MemoMapView auth={auth} mapSlots={luzmoData.mapSlots} onFiltersChanged={handleMapFiltersChanged} />
      </div>

      <div className="app-right">
        <button
          className="panel-collapse-toggle panel-collapse-toggle--right"
          onClick={toggleRight}
          title={rightOpen ? 'Collapse panel' : 'Expand panel'}
        >
          {rightOpen ? '\u25B6' : '\u25C0'}
        </button>
        <div style={rightOpen ? VISIBLE : HIDDEN} className="right-panel-inner">
          <MemoDashboardEditor
            dashboard={dashboard}
            auth={auth}
            geoContext={geoContext}
            mapFilters={mapFilters}
            onAddItem={handleOpenAddItem}
          />
        </div>
      </div>

      {showAddItem && (
        <AddItemDialog
          onSelect={handleAddItemType}
          onClose={handleCloseAddItem}
        />
      )}
    </div>
  );
}

export default App;
