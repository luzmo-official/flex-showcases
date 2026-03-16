import ChartConfigPanel from './ChartConfigPanel';

export default function RightPanel({ dashboard, auth, geoContext }) {
  const {
    selectedItem,
    updateItemSlots,
    updateItemOptions,
    updateItemFilters,
  } = dashboard;

  return (
    <div className="flex-col" style={{ height: '100%', overflowY: 'auto' }}>
      <ChartConfigPanel
        item={selectedItem}
        auth={auth}
        geoContext={geoContext}
        onSlotsChange={updateItemSlots}
        onOptionsChange={updateItemOptions}
        onFiltersChange={updateItemFilters}
      />
    </div>
  );
}
