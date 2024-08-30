import Luzmo from '@luzmo/nodejs-sdk';
import config from 'config';

export const client = new Luzmo({
  api_key: config.get('luzmo.apiKey'),
  api_token: config.get('luzmo.apiToken'),
});

export const retrieveAiChart = async ({
  dataset_id,
  question,
  message_history = [],
}) => {
  const response = await client.create('aichart', {
    type: 'generate-chart',
    dataset_id,
    question,
    message_history,
  });
  return response;
};

export const retrieveEmbedToken = async ({
  dashboard_ids = [],
  dataset_ids = [],
}) => {
  const token = await client.create('authorization', {
    type: 'embed',
    expiry: new Date(new Date().getTime() + 1 * 60 * 60000).toISOString(),
    username: 'ai-showcases',
    name: 'AI showcases',
    email: 'ai-showcases@luzmo.com',
    access: {
      dashboards: dashboard_ids.map((id) => ({ id, rights: 'use' })),
      datasets: dataset_ids.map((id) => ({ id, rights: 'use' })),
    },
  });
  return token;
};
