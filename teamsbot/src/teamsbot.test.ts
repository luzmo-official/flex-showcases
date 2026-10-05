import assert from 'node:assert/strict';
import { createServer } from 'http';
import test from 'node:test';
import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  type ConfigurationBotFrameworkAuthenticationOptions,
} from 'botbuilder';
import { buildAIPromptProperties } from './aiprompt-client.js';
import { buildAnalystCard } from './analyst-card.js';
import { createApp } from './app.js';
import { getChartPng, storeChart } from './chart-store.js';
import { markdownToTeams } from './markdown-to-teams.js';
import { formatProgressTree } from './progress-format.js';
import { extractQuestionText, isAddressedToBot, samePrincipal } from './question.js';
import { conversationThreadKey, getConversationId, setConversationId } from './thread-history.js';
import type { AppConfig } from './types.js';
import { credentialsForEmail, normalizeUsersConfig } from './users.js';

const config: AppConfig = {
  microsoftAppId: 'app',
  microsoftAppPassword: 'secret',
  microsoftAppType: 'SingleTenant',
  microsoftAppTenantId: 'tenant',
  port: 0,
  publicBaseUrl: 'https://example.com',
  datasetIds: ['ds-1'],
  luzmoHost: 'https://api.luzmo.com',
  users: { 'a@b.co': { luzmoKey: 'k', luzmoToken: 't' } },
  useEmbedAuth: true,
};

test('personal chat, channel root, and thread replies share stable keys', () => {
  assert.equal(
    conversationThreadKey({
      id: 'msg-1',
      conversation: { id: '19:personal', conversationType: 'personal' },
    }),
    'personal:19:personal'
  );

  assert.equal(
    conversationThreadKey({
      id: '123',
      conversation: { id: '19:channel@thread.tacv2', conversationType: 'channel' },
    }),
    '19:channel@thread.tacv2:123'
  );

  assert.equal(
    conversationThreadKey({
      id: '456',
      conversation: {
        id: '19:channel@thread.tacv2;messageid=123',
        conversationType: 'channel',
      },
    }),
    '19:channel@thread.tacv2:123'
  );
});

test('conversation ids are remembered for a thread', () => {
  const key = `test:${Date.now()}`;
  assert.equal(getConversationId(key), undefined);
  setConversationId(key, 'conv-1');
  assert.equal(getConversationId(key), 'conv-1');
});

test('mentions are required for a new channel message and ignored in personal chats', () => {
  assert.equal(
    isAddressedToBot({
      conversationType: 'personal',
      conversationId: '19:personal',
      recipientId: '28:bot',
      mentions: [],
    }),
    true
  );

  assert.equal(
    isAddressedToBot({
      conversationType: 'channel',
      conversationId: '19:channel@thread.tacv2',
      recipientId: '28:bot',
      mentions: [],
    }),
    false
  );

  assert.equal(
    isAddressedToBot({
      conversationType: 'channel',
      conversationId: '19:channel@thread.tacv2',
      recipientId: '28:app-id',
      mentions: [{ id: '28:app-id' }],
    }),
    true
  );

  assert.equal(
    isAddressedToBot({
      conversationType: 'channel',
      conversationId: '19:channel@thread.tacv2;messageid=99',
      recipientId: '28:bot',
      mentions: [],
    }),
    true
  );

  assert.equal(samePrincipal('28:app-id', 'app-id'), true);
});

test('question text drops the bot mention', () => {
  assert.equal(
    extractQuestionText('<at>Luzmo Analyst</at> What are the top categories?', ['<at>Luzmo Analyst</at>']),
    'What are the top categories?'
  );
  assert.equal(extractQuestionText('<at>Luzmo Analyst</at>', []), '');
});

test('progress text interpolates metadata and drops missing placeholders', () => {
  const text = formatProgressTree({
    id: 'root',
    step: 'root',
    status: 'inProgress',
    children: [
      {
        id: 'a',
        step: 'query',
        status: 'success',
        description: 'Queried {{dataset}}',
        descriptionMetadata: { dataset: 'Sales' },
      },
      {
        id: 'b',
        step: 'missing',
        status: 'pending',
        description: 'Waiting on {{missing}}',
      },
    ],
  });

  assert.match(text, /Queried Sales/);
  assert.match(text, /Waiting on/);
  assert.equal(text.includes('{{'), false);
});

test('markdown headings become bold and code blocks stay put', () => {
  const converted = markdownToTeams('# Revenue\nUse `## not a heading`\n```\n# code\n```');
  assert.match(converted, /^\*\*Revenue\*\*/);
  assert.match(converted, /`## not a heading`/);
  assert.match(converted, /```\n# code\n```/);
});

test('analyst card includes the chart image and flags errors', () => {
  const card = buildAnalystCard({
    progress: '',
    body: 'Revenue is up.',
    suffix: null,
    imageUrl: 'https://example.com/charts/abc',
    isError: false,
  });
  const body = card.body as Array<Record<string, unknown>>;
  assert.equal(card.version, '1.4');
  assert.equal(body.some((block) => block.type === 'Image' && block.url === 'https://example.com/charts/abc'), true);

  const errorCard = buildAnalystCard({
    progress: 'step',
    body: 'Error: nope',
    suffix: null,
    imageUrl: null,
    isError: true,
  });
  const errorBody = errorCard.body as Array<Record<string, unknown>>;
  assert.equal(errorBody.find((block) => block.text === 'Error: nope')?.color, 'Attention');
});

test('user emails are matched case-insensitively', () => {
  const users = normalizeUsersConfig({
    'Alice@Company.com': { luzmoKey: 'key', luzmoToken: 'token' },
  });
  assert.deepEqual(credentialsForEmail(users, 'alice@company.com'), {
    email: 'alice@company.com',
    luzmoKey: 'key',
    luzmoToken: 'token',
  });
  assert.equal(credentialsForEmail(users, 'nobody@company.com'), null);
});

test('AIPrompt requests pin datasets and continue a conversation', () => {
  const properties = buildAIPromptProperties('Top products?', ['ds-1', 'ds-2'], 'conv-9');
  assert.equal(properties.agent, 'analyst');
  assert.equal(properties.stream, true);
  assert.equal(properties.conversation_id, 'conv-9');
  assert.deepEqual(properties.input, [
    { type: 'text', text: 'Top products?' },
    { type: 'dataset', id: 'ds-1' },
    { type: 'dataset', id: 'ds-2' },
  ]);
});

test('a malformed messaging payload returns 400 instead of crashing', async () => {
  process.env.MicrosoftAppId ??= '11111111-1111-4111-8111-111111111111';
  process.env.MicrosoftAppPassword ??= 'secret';
  process.env.MicrosoftAppType ??= 'SingleTenant';
  process.env.MicrosoftAppTenantId ??= '22222222-2222-4222-8222-222222222222';

  const adapter = new CloudAdapter(
    new ConfigurationBotFrameworkAuthentication(
      process.env as ConfigurationBotFrameworkAuthenticationOptions
    )
  );
  const app = createApp(config, adapter);
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('test server did not bind a port');

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'Invalid activity');
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('chart route returns a stored PNG and rejects unknown ids', async () => {
  const adapter = { process: async () => undefined } as unknown as CloudAdapter;
  const app = createApp(config, adapter);
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('test server did not bind a port');
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const health = await fetch(`${base}/`);
    assert.equal(health.status, 200);
    assert.equal(await health.text(), 'Luzmo Analyst Teams bot is running.');

    const png = Buffer.from('not-a-real-png');
    const id = storeChart(png);
    const chart = await fetch(`${base}/charts/${id}`);
    assert.equal(chart.status, 200);
    assert.equal(chart.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await chart.arrayBuffer()), png);
    assert.equal(getChartPng(id)?.equals(png), true);

    const missing = await fetch(`${base}/charts/zzzz`);
    assert.equal(missing.status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
