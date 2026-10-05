import 'dotenv/config';
import { CloudAdapter, ConfigurationBotFrameworkAuthentication } from 'botbuilder';
import type { ConfigurationBotFrameworkAuthenticationOptions } from 'botbuilder';
import { createApp } from './app.js';
import { loadConfig } from './config.js';

function main(): void {
  const config = loadConfig();

  const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
    process.env as ConfigurationBotFrameworkAuthenticationOptions
  );
  const adapter = new CloudAdapter(botFrameworkAuthentication);

  adapter.onTurnError = async (context, error) => {
    console.error('Unhandled turn error:', error);
    await context.sendActivity('Sorry, something went wrong handling that message.').catch(() => {});
  };

  const app = createApp(config, adapter);
  app.listen(config.port, () => {
    console.log(
      `Analyst Teams bot listening on port ${config.port} ` +
        `(${Object.keys(config.users).length} authorized users, ` +
        `${config.datasetIds.length} datasets)`
    );
  });
}

try {
  main();
} catch (error) {
  console.error('Fatal error starting Teams bot:', error);
  process.exit(1);
}
