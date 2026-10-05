import express from 'express';
import type { CloudAdapter, TurnContext } from 'botbuilder';
import { getChartPng } from './chart-store.js';
import type { AppConfig } from './types.js';
import { handleTurn } from './message-handler.js';

export function createApp(config: AppConfig, adapter: CloudAdapter): express.Express {
  const app = express();
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.type('text/plain').send('Luzmo Analyst Teams bot is running.');
  });

  app.get('/charts/:id', (req, res) => {
    const png = getChartPng(req.params.id);
    if (!png) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(png);
  });

  app.post('/api/messages', async (req, res) => {
    try {
      await adapter.process(req, res, async (context: TurnContext) => {
        await handleTurn(context, config, adapter);
      });
    } catch (error) {
      console.error('Failed to process activity:', error);
      if (!res.headersSent) {
        res.status(400).json({ error: 'Invalid activity' });
      }
    }
  });

  return app;
}
