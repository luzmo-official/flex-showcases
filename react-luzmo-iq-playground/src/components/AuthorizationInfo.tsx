import { useEffect, useState, useCallback } from "react";
import "./AuthorizationInfo.css";
import { AuthorizationProps, DatasetInfo } from "../types/components";
import {
  AuthorizationResponse,
  QueryResponse,
  SecurableResponse,
} from "../types/api";

/**
 * Authorization information component specific to this example app.
 * This is not a requirement for Luzmo IQ, but helps to verify
 * dataset access before starting the chat interface.
 *
 * Features:
 * - Verifies authorization token validity
 * - Lists accessible datasets with row counts
 * - Shows dataset names and IDs
 * - Provides a gateway to the chat interface
 */
export function AuthorizationInfo({
  authKey,
  authToken,
  apiHost,
  onLoadingChange,
  onError,
  onStartChat,
  onReset,
}: AuthorizationProps) {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetches row counts for each dataset using the data API
  const fetchRowCounts = useCallback(
    async (datasetIds: string[]): Promise<number[]> => {
      try {
        const queries = datasetIds.map((datasetId) => ({
          measures: [
            {
              column_id: "*",
              dataset_id: datasetId,
            },
          ],
        }));

        const response = await fetch(`${apiHost}0.1.0/data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get",
            version: "0.1.0",
            key: authKey,
            token: authToken,
            find: {
              queries,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const queryResponse: QueryResponse | QueryResponse[] =
          await response.json();

        // Handle both single response and array of responses
        if (Array.isArray(queryResponse)) {
          return queryResponse.map((response) => response.data[0][0]);
        } else {
          return queryResponse.data.map((row) => row[0]);
        }
      } catch (err) {
        console.error("Error fetching row counts:", err);
        return [];
      }
    },
    [authKey, authToken, apiHost]
  );

  // Fetches dataset names and metadata using the securable API
  const fetchDatasetMetadata = useCallback(
    async (datasetIds: string[]): Promise<Map<string, string>> => {
      const nameMap = new Map<string, string>();

      try {
        const responses = await Promise.all(
          datasetIds.map((id) =>
            fetch(`${apiHost}0.1.0/securable`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "get",
                version: "0.1.0",
                key: authKey,
                token: authToken,
                find: {
                  where: {
                    id,
                    type: "dataset",
                  },
                },
              }),
            })
          )
        );

        const jsonResponses = await Promise.all(
          responses.map(async (response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json() as Promise<SecurableResponse>;
          })
        );

        jsonResponses.forEach((data, index) => {
          const dataset = data.rows[0];
          if (dataset) {
            const name =
              dataset.name?.en ||
              Object.values(dataset.name || {})[0] ||
              "Unnamed";
            nameMap.set(datasetIds[index], name);
          }
        });
      } catch (err) {
        console.error("Error fetching dataset metadata:", err);
      }

      return nameMap;
    },
    [authKey, authToken, apiHost]
  );

  useEffect(() => {
    // Main authorization check - verifies token validity and fetches dataset access
    const fetchAuthorization = async () => {
      try {
        const response = await fetch(`${apiHost}0.1.0/authorization`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get",
            version: "0.1.0",
            key: authKey,
            token: authToken,
            find: {
              where: {
                id: authKey,
                type: "embed",
              },
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data: AuthorizationResponse = await response.json();

        if (data.rows[0]?.access?.datasets) {
          // Filter datasets to only those with 'Use' rights
          const authorizedDatasets = data.rows[0].access.datasets
            .filter((dataset) => dataset.rights.Use)
            .map((dataset) => ({ id: dataset.id }));

          setDatasets(authorizedDatasets);

          const datasetIds = authorizedDatasets.map((dataset) => dataset.id);

          // Fetch both row counts and metadata in parallel
          const [rowCounts, nameMap] = await Promise.all([
            fetchRowCounts(datasetIds),
            fetchDatasetMetadata(datasetIds),
          ]);

          const datasetsWithInfo = authorizedDatasets.map((dataset, index) => ({
            ...dataset,
            rowCount: rowCounts[index],
            name: nameMap.get(dataset.id),
          }));

          setDatasets(datasetsWithInfo);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch authorization info"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorization();
  }, [authKey, authToken, apiHost, fetchDatasetMetadata, fetchRowCounts]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  useEffect(() => {
    onError?.(error || null);
  }, [error, onError]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="auth-info-content loading-spinner">
          <div className="spinner" />
          <div>Checking dataset information...</div>
        </div>
      );
    }

    if (error) {
      return (
        <>
          <div className="auth-info-content auth-info-error">
            <strong>Error:</strong> {error}
          </div>
          <button className="primary-button" onClick={onReset}>
            Change configuration
          </button>
        </>
      );
    }

    const hasEmptyDatasets = datasets.some((dataset) => dataset.rowCount === 0);

    return (
      <>
        <div className="auth-info-content">
          <p className="auth-info-description">
            Luzmo IQ will be able to access the following datasets with the
            embed token provided:
          </p>
          {hasEmptyDatasets && (
            <div className="auth-info-warning">
              <strong>Warning: You have datasets with 0 rows</strong>
              <p>
                A dataset may be empty, or the embed token has no access to the
                rows in a dataset. The latter may happen when a dataset expects{" "}
                <a
                  href="https://academy.luzmo.com/article/e921u7ua"
                  target="_blank"
                >
                  parameter filters
                </a>
                , but the token does not include the right parameters.
              </p>
            </div>
          )}
          <ol className="dataset-list">
            {datasets.map((dataset) => (
              <li key={dataset.id}>
                <div className="dataset-name">{dataset.name || dataset.id}</div>
                {dataset.rowCount !== undefined && (
                  <div className="dataset-rows">
                    <span className="dataset-label">Rows:</span>
                    {dataset.rowCount.toLocaleString()}
                    {dataset.rowCount === 0 && " ⚠️"}
                  </div>
                )}
                {dataset.name && (
                  <div className="dataset-id">
                    <span className="dataset-label">Dataset ID:</span>
                    {dataset.id}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
        <button
          className="primary-button"
          onClick={onStartChat}
          disabled={loading || !!error}
        >
          Start Luzmo IQ chat
        </button>
      </>
    );
  };

  return (
    <div className="config-form">
      <h2>Luzmo IQ</h2>
      {renderContent()}
    </div>
  );
}
