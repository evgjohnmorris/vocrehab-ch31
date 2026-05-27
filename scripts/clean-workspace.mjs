import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const includeDist = process.argv.includes('--include-dist');

const cleanupTargets = [
  'preview.err.log',
  'preview.out.log',
  'server.err.log',
  'server.out.log',
  'client/.tmp',
  'client/playwright-report',
  'client/test-results'
];

if (includeDist) {
  cleanupTargets.push('client/dist');
}

const results = [];

for (const relativeTarget of cleanupTargets) {
  const absoluteTarget = path.resolve(repoRoot, relativeTarget);

  try {
    await fs.rm(absoluteTarget, { recursive: true, force: true });
    results.push({ target: relativeTarget, status: 'removed' });
  } catch (error) {
    if (error.code === 'EBUSY' || error.code === 'EPERM') {
      results.push({
        target: relativeTarget,
        status: 'skipped',
        message: 'in use by a running local process'
      });
      continue;
    }

    results.push({ target: relativeTarget, status: 'failed', message: error.message });
  }
}

const failures = results.filter((result) => result.status === 'failed');

for (const result of results) {
  if (result.status === 'removed') {
    console.log(`removed ${result.target}`);
    continue;
  }

  if (result.status === 'skipped') {
    console.log(`skipped ${result.target}: ${result.message}`);
    continue;
  }

  console.error(`failed ${result.target}: ${result.message}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
