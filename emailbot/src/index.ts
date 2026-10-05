import 'dotenv/config';
import { loadConfig } from './config.js';
import { listenForMail } from './imap-listener.js';
import { handleIncomingEmail } from './message-handler.js';
import { createMailSender } from './smtp-sender.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const send = createMailSender(config);

  console.log(
    `Analyst email bot watching ${config.imapUser} ` +
      `(${Object.keys(config.users).length} authorized senders, ` +
      `${config.datasetIds.length} datasets)`
  );

  await listenForMail(config, (raw) => handleIncomingEmail({ raw, config, send }));
}

main().catch((error) => {
  console.error('Fatal error starting email bot:', error);
  process.exit(1);
});
