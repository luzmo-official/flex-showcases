import { useEffect, useState } from 'react';

import { NumberWithBorder } from './shared/number-with-border';

import './cases-table.css'; // Custom styles if needed
import { LuzmoDataService } from '../services/LuzmoDataService';

export const CasesTable = ({
  casesTypeColumn,
  casesStatusColumn,
  casesStatusesSelection,
}) => {
  const [data, setData] = useState([]);
  const luzmoDataService = new LuzmoDataService();
  useEffect(() => {
    luzmoDataService
      .getCases(casesTypeColumn, casesStatusColumn)
      .then((data) => {
        const newData = data.reduce((currentData, [category, type, count]) => {
          let categoryParent = currentData.find(
            (el) => el.title === category.id
          );
          if (!categoryParent) {
            categoryParent = { title: category.id, statuses: [] };
            currentData.push(categoryParent);
          }

          categoryParent.statuses.push({
            label: type.id,
            color: type.color,
            count: count,
          });

          return currentData;
        }, []);

        const dataWithPercentages = newData
          .map((category) => {
            const categoryTotalCount = category.statuses.reduce(
              (sum, status) => sum + status.count,
              0
            );

            return {
              ...category,
              statuses: category.statuses
                .map((status) => ({
                  ...status,
                  percentage: (100 * status.count) / categoryTotalCount,
                }))
                .sort((a, b) => {
                  // Sort statuses
                  const statusOrder = ['To do', 'In progress', 'Completed'];
                  const statusA = statusOrder.indexOf(a.label);
                  const statusB = statusOrder.indexOf(b.label);

                  return statusA - statusB;
                }),
            };
          })
          .sort((a, b) => {
            // Sort case types
            const order = [
              'Basic Building & Case Details',
              'Construction Info',
              'Spread of Fire',
              'Structural Failure',
            ];

            const categoryA = order.indexOf(a.title);
            const categoryB = order.indexOf(b.title);

            return categoryA - categoryB;
          });

        console.log("Update widget's data:", dataWithPercentages);
        setData(dataWithPercentages);
        /*
        [
    {
      title: 'Basic Building & Case Details',
      statuses: [
        { label: 'To do', count: 5, percentage: 10.5, color: 'red' },
        { label: 'In progress', count: 50, percentage: 52.2, color: 'yellow' },
        { label: 'Completed', count: 30, percentage: 37.3, color: 'green' },
      ],
    },
    {
      title: 'Construction Info',
      statuses: [
        { label: 'To do', count: 20, percentage: 19.3, color: 'red' },
        { label: 'In progress', count: 45, percentage: 36, color: 'yellow' },
        { label: 'Completed', count: 56, percentage: 44.7, color: 'green' },
      ],
    },
  ]
        */
      });
  }, []);
  return (
    <>
      <h2>Properties</h2>
      <div className="property-table">
        {data.map((category, index) => (
          <div key={index} className="category">
            <h3 style={{ textAlign: 'left' }}>{category.title}</h3>
            <table>
              <tbody>
                {category.statuses.map((status, idx) => (
                  <tr
                    key={idx}
                    style={{
                      opacity:
                        casesStatusesSelection.length === 0 ||
                        casesStatusesSelection.includes(status.label)
                          ? 1
                          : 0.4,
                    }}
                  >
                    <td align="left">{status.label}</td>
                    <td align="right">
                      <NumberWithBorder
                        value={status.count}
                        style={{ width: 'fit-content' }}
                      />
                    </td>
                    <td className="progress-bar-container">
                      <div
                        className={`progress-bar`}
                        style={{
                          width: `${status.percentage}%`,
                          backgroundColor: status.color,
                          border: casesStatusesSelection.includes(status.label)
                            ? '2px solid #0003'
                            : '',
                        }}
                      ></div>
                      <div style={{ color: 'black', marginLeft: '4px' }}>
                        {status.percentage.toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </>
  );
};
