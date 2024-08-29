import config from 'config';

import { retrieveAiChart, retrieveEmbedToken } from './helpers.js';
import { setupLocalServer } from './local.js';

export const handler = async (event) => {
  const path = event.rawPath;
  const body = JSON.parse(event.body);
  console.log('Received request:', path, body);

  const { dataset_id, question, message_history = [] } = body;

  if (path === '/retrieve-ai-chart') {
    try {
      const response = await retrieveAiChart({
        dataset_id,
        question,
        message_history,
      });
      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }
  }

  if (path === '/retrieve-embed-token') {
    const { dashboard_ids = [], dataset_ids = [] } = body;

    try {
      const token = await retrieveEmbedToken({ dashboard_ids, dataset_ids });
      return {
        statusCode: 200,
        body: JSON.stringify({ result: 'success', token }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify(error),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Path Not Found' }),
  };
};

// Used for local development
if (config.get('local')) {
  setupLocalServer();
}
