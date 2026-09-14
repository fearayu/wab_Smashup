import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));

let server;
try {
  const serve = await import('./serve.mjs');
  server = serve.server;
  await new Promise((resolve) => server.once('listening', resolve));
} catch (e) {
  console.error('[e2e] could not start static server:', e.message);
  process.exit(1);
}

const harness = join(__dirname, 'run-e2e.mjs');
const require = createRequire(import.meta.url);
require.resolve('puppeteer-core'); // fail fast with a clear message if not installed

const child = spawn(process.execPath, [harness], { stdio: 'inherit', cwd: process.cwd() });

child.on('close', (code) => {
  server.close();
  process.exit(code || 0);
});