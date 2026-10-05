import assert from 'node:assert/strict';
import test from 'node:test';
import { CHART_CID, extractEmailQuestion, markdownToEmailHtml, replySubject } from './email-text.js';
import { handleIncomingEmail, type AnalystAsk } from './message-handler.js';
import { processUnseen } from './mailbox.js';
import type { AIPromptRequestParams, AppConfig, ItemConfig, OutgoingReply } from './types.js';

const config: AppConfig = {
  imapHost: 'imap.example.com',
  imapPort: 993,
  imapSecure: true,
  imapUser: 'bot@company.com',
  imapPassword: 'secret',
  imapMailbox: 'INBOX',
  smtpHost: 'smtp.example.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: 'bot@company.com',
  smtpPassword: 'secret',
  smtpFrom: 'Luzmo Analyst <bot@company.com>',
  smtpFromAddress: 'bot@company.com',
  datasetIds: ['ds-1'],
  luzmoHost: 'https://api.luzmo.com',
  users: {
    'alice@company.com': { luzmoKey: 'key', luzmoToken: 'token' },
  },
  useEmbedAuth: false,
};

function rawMessage(headers: Record<string, string>, body: string): Buffer {
  const lines = Object.entries(headers).map(([name, value]) => `${name}: ${value}`);
  return Buffer.from(`${lines.join('\r\n')}\r\n\r\n${body}`);
}

function textAnswer(text: string): AnalystAsk {
  return async function* ask() {
    yield { start: true, conversationId: 'conv-1' };
    yield { textDelta: text };
    yield {
      finish: true,
      conversationId: 'conv-1',
      result: { assistant_message: { message: text } },
    };
  };
}

test('quoted replies, signatures, and empty bodies become one question', () => {
  assert.equal(
    extractEmailQuestion(
      'What are the top categories?\n\nOn Mon, Oct 5, 2026 at 10:00 AM Bot wrote:\n> older answer\n',
      'Re: Revenue'
    ),
    'What are the top categories?'
  );

  assert.equal(
    extractEmailQuestion('What is revenue?\n\n-- \nAlice\n', 'Revenue'),
    'What is revenue?'
  );

  assert.equal(extractEmailQuestion('   \n', 'Re: Top categories'), 'Top categories');
  assert.equal(replySubject('Re: Top categories'), 'Re: Top categories');
  assert.equal(replySubject('Top categories'), 'Re: Top categories');
});

test('email html escapes markup and keeps bold', () => {
  const html = markdownToEmailHtml('Use <b> & **bold**');
  assert.match(html, /Use &lt;b&gt; &amp; <strong>bold<\/strong>/);
});

test('allowlisted mail is answered in-thread with an inline chart', async () => {
  const calls: AIPromptRequestParams[] = [];
  const png = Buffer.from('png-bytes');
  const sent: OutgoingReply[] = [];
  const chart: ItemConfig = { type: 'bar-chart', slots: [], options: {} };

  const ask: AnalystAsk = async function* (params) {
    calls.push(params);
    yield { start: true, conversationId: 'conv-1' };
    yield {
      finish: true,
      conversationId: 'conv-1',
      result: {
        assistant_message: {
          message: 'Revenue is up.',
          aiMessageAssets: [{ type: 'item', value: chart }],
        },
      },
    };
  };

  const result = await handleIncomingEmail({
    raw: rawMessage(
      {
        From: 'Alice <alice@company.com>',
        To: 'bot@company.com',
        Subject: 'Top categories',
        'Message-ID': '<root-chart@company.com>',
      },
      'What are the top categories by revenue?'
    ),
    config,
    ask,
    renderChart: async () => png,
    send: async (reply) => {
      sent.push(reply);
    },
  });

  assert.equal(result.action, 'replied');
  assert.equal(calls[0]?.question, 'What are the top categories by revenue?');
  assert.equal(calls[0]?.conversationId, undefined);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'alice@company.com');
  assert.equal(sent[0].subject, 'Re: Top categories');
  assert.equal(sent[0].inReplyTo, '<root-chart@company.com>');
  assert.match(sent[0].html, new RegExp(`src="cid:${CHART_CID}"`));
  assert.equal(sent[0].attachments.length, 1);
  assert.equal(sent[0].attachments[0].cid, CHART_CID);
  assert.equal(sent[0].attachments[0].contentType, 'image/png');
  assert.equal(sent[0].attachments[0].contentDisposition, 'inline');
  assert.equal(sent[0].attachments[0].content.equals(png), true);

  const followUp = await handleIncomingEmail({
    raw: rawMessage(
      {
        From: 'alice@company.com',
        To: 'bot@company.com',
        Subject: 'Re: Top categories',
        'Message-ID': '<follow-chart@company.com>',
        'In-Reply-To': '<root-chart@company.com>',
        References: '<root-chart@company.com>',
      },
      'Break that down by month.'
    ),
    config,
    ask,
    renderChart: async () => null,
    send: async (reply) => {
      sent.push(reply);
    },
  });

  assert.equal(followUp.action, 'replied');
  assert.equal(calls[1]?.conversationId, 'conv-1');
  assert.equal(sent[1].attachments.length, 0);
  assert.equal(sent[1].html.includes('<img'), false);
});

test('mail from unknown senders, the bot itself, and auto-replies is ignored', async () => {
  const sent: OutgoingReply[] = [];
  const send = async (reply: OutgoingReply) => {
    sent.push(reply);
  };

  const unknown = await handleIncomingEmail({
    raw: rawMessage(
      {
        From: 'eve@elsewhere.com',
        To: 'bot@company.com',
        Subject: 'Hello',
        'Message-ID': '<eve@company.com>',
      },
      'What is revenue?'
    ),
    config,
    ask: textAnswer('nope'),
    send,
  });
  assert.deepEqual(unknown, { action: 'skipped', reason: 'unauthorized' });

  const self = await handleIncomingEmail({
    raw: rawMessage(
      {
        From: 'Luzmo Analyst <bot@company.com>',
        To: 'alice@company.com',
        Subject: 'Re: Hello',
        'Message-ID': '<self@company.com>',
      },
      'Revenue is up.'
    ),
    config,
    ask: textAnswer('nope'),
    send,
  });
  assert.deepEqual(self, { action: 'skipped', reason: 'self' });

  const auto = await handleIncomingEmail({
    raw: rawMessage(
      {
        From: 'alice@company.com',
        To: 'bot@company.com',
        Subject: 'Out of office',
        'Message-ID': '<auto@company.com>',
        'Auto-Submitted': 'auto-replied',
      },
      'I am away.'
    ),
    config,
    ask: textAnswer('nope'),
    send,
  });
  assert.deepEqual(auto, { action: 'skipped', reason: 'auto-reply' });
  assert.equal(sent.length, 0);
});

test('a repeated message id is not answered twice', async () => {
  let sends = 0;
  const raw = rawMessage(
    {
      From: 'alice@company.com',
      To: 'bot@company.com',
      Subject: 'Once',
      'Message-ID': '<once@company.com>',
    },
    'What is revenue?'
  );

  await handleIncomingEmail({
    raw,
    config,
    ask: textAnswer('Revenue is up.'),
    send: async () => {
      sends += 1;
    },
  });
  const second = await handleIncomingEmail({
    raw,
    config,
    ask: textAnswer('Revenue is up.'),
    send: async () => {
      sends += 1;
    },
  });

  assert.equal(sends, 1);
  assert.deepEqual(second, { action: 'skipped', reason: 'duplicate' });
});

test('unseen mail is retried once and then marked seen', async () => {
  const seen: number[] = [];
  let attempts = 0;
  await processUnseen(
    {
      async searchUnseen() {
        return [7, 8];
      },
      async fetchSource(uid) {
        return uid === 8 ? null : Buffer.from('mail');
      },
      async markSeen(uid) {
        seen.push(uid);
      },
    },
    async () => {
      attempts += 1;
      if (attempts === 1) throw new Error('temporary');
    }
  );

  assert.equal(attempts, 2);
  assert.deepEqual(seen, [7, 8]);
});
