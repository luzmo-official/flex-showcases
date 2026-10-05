import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appId = process.env.MicrosoftAppId?.trim();
const guid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

if (!appId || !guid.test(appId)) {
  console.error('Set MicrosoftAppId to the Entra application (client) id GUID.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(resolve(root, 'appPackage/manifest.json'), 'utf8'));
manifest.bots[0].botId = appId;

const publicBaseUrl = process.env.PUBLIC_BASE_URL?.trim();
if (publicBaseUrl) {
  const url = new URL(publicBaseUrl);
  if (url.protocol !== 'https:') {
    console.error('PUBLIC_BASE_URL must be https so Teams can load chart images.');
    process.exit(1);
  }
  manifest.validDomains = [url.host];
}

const outDir = resolve(root, 'dist/appPackage');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const zipPath = resolve(root, 'luzmo-analyst-teams.zip');
rmSync(zipPath, { force: true });
execFileSync('cp', ['color.png', 'outline.png', outDir], { cwd: resolve(root, 'appPackage') });
execFileSync('zip', ['-r', '-j', zipPath, '.'], { cwd: outDir });

console.log(`Wrote ${zipPath}`);
if (manifest.validDomains.length === 0) {
  console.log('validDomains is empty. Set PUBLIC_BASE_URL and package again so chart images load in Teams.');
}
