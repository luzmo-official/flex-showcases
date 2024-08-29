import cors from 'cors';
import express from 'express';
import config from 'config';

import { retrieveAiChart, retrieveEmbedToken } from './helpers.js';

export const setupLocalServer = () => {
  const app = express();
  const port = config.get('port');

  app.use(express.json());
  app.use(cors());

  app.post('/retrieve-ai-chart', async (req, res) => {
    const { dataset_id, question, message_history = [] } = req.body;

    try {
      const response = await retrieveAiChart({
        dataset_id,
        question,
        message_history,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json(error);
    }
  });

  app.post('/retrieve-embed-token', async (req, res) => {
    const { dashboard_ids = [], dataset_ids = [] } = req.body;

    try {
      const token = await retrieveEmbedToken({ dashboard_ids, dataset_ids });
      res.status(200).json({ result: 'success', token });
    } catch (error) {
      res.status(500).json(error);
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};
