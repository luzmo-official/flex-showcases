import { DonutChart } from './components/donut-chart';
import { CasesTable } from './components/cases-table';

import './App.css';
import { useState } from 'react';

function App() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const casesStatusColumn = {
    datasetId: 'da533614-51ca-4ea8-b600-172fb21b997f',
    columnId: '5e05eba7-901b-4f00-a612-02a26350d048',
    label: 'Case status',
  };

  const casesTypeColumn = {
    datasetId: 'da533614-51ca-4ea8-b600-172fb21b997f',
    columnId: '09506646-49d1-41e0-bb35-1a03d598127e',
    label: 'Case type',
  };

  const donutChartMeasureCountLabel = 'Number of cases';

  const onCaseStatusesSelection = (newStatuses: string[]) => {
    console.log(newStatuses);
    setSelectedStatuses(newStatuses);
  };

  return (
    <>
      <div className="container">
        <div
          className="elementContainer"
          style={{ minWidth: '300px', width: '40%' }}
        >
          <DonutChart
            categoryColumn={casesStatusColumn}
            donutChartMeasureCountLabel={donutChartMeasureCountLabel}
            casesStatusesSelection={selectedStatuses}
            onCaseStatusesSelection={onCaseStatusesSelection}
          />
        </div>
        <div style={{ display: 'flex', border: '1px solid #ebecef' }}></div>
        <div
          className="elementContainer"
          style={{ minWidth: '500px', width: '100%' }}
        >
          <CasesTable
            casesTypeColumn={casesTypeColumn}
            casesStatusColumn={casesStatusColumn}
            casesStatusesSelection={selectedStatuses}
          />
        </div>
      </div>
    </>
  );
}

export default App;
