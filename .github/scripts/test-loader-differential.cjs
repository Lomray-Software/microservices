'use strict';

// Characterization of the locked loader stack, not an application test substitute.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');

const names = [
  'ts-node runs real CommonJS tests and restores mocked modules',
  'a failed test assertion cannot report success',
  'native ESM loading reproduces the rewiremock bootstrap failure',
];

function validate(result, enabled) {
  assert.ifError(result.error);
  assert.equal(result.signal, null, 'no killed or timed-out process is evidence');
  assert.equal(result.status, enabled ? 1 : 0, result.stdout + result.stderr);
  const text = result.stdout;
  const comments = text.split('\n').filter(line => line.startsWith('# '))
    .map(line => line.slice(2));
  const records = comments.filter(line => line.startsWith('{"extension":'))
    .map(line => JSON.parse(line));
  assert.deepEqual(records, enabled ? [
    { extension: 'ts', negative: false, status: 1 },
  ] : [
    { extension: 'ts', negative: false, status: 0 },
    { extension: 'ts', negative: true, status: 1 },
    { extension: 'mjs', negative: false, status: 1 },
  ]);
  const summary = { tests: 3, suites: 0, pass: enabled ? 0 : 3,
    fail: enabled ? 1 : 0, cancelled: 0, skipped: enabled ? 2 : 0, todo: 0 };
  for (const [key, value] of Object.entries(summary)) {
    const rows = comments.filter(line => new RegExp(`^${key} \\d+$`).test(line));
    assert.deepEqual(rows, [`${key} ${value}`]);
  }
  const outcomes = text.split('\n').filter(line => /^(?:not )?ok \d+ - /.test(line));
  assert.deepEqual(outcomes, names.map((name, index) =>
    `${enabled && index === 0 ? 'not ok' : 'ok'} ${index + 1} - ${name}` +
    (enabled && index > 0 ? ' # SKIP test name does not match pattern' : '')));
  if (enabled) {
    // Inspect only fixture console output, not the expected outer node:test assertion.
    const child = comments.slice(0, comments.findIndex(line => line.startsWith('Subtest:')))
      .join('\n');
    assert.match(child, /Rewiremock: there is no "parent module"/);
    assert.match(child, /mocha\/lib\/nodejs\/esm-utils\.js/);
    assert.doesNotMatch(child, /LOADER_ASSERTIONS_EXECUTED|AssertionError|SyntaxError|ERR_MODULE_NOT_FOUND|Cannot find module|\b[1-9]\d* passing/);
    assert.doesNotMatch(result.stderr, /SyntaxError|ERR_MODULE_NOT_FOUND|Cannot find module/);
  }
}

function main() {
  assert.equal(process.version, 'v22.23.2', 'reassess the experiment for a new runtime');
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.match(process.env.TESTED_SHA || '', /^[a-f0-9]{40}$/);
  assert.equal(sha, process.env.TESTED_SHA, 'experiment must test the selected merge tree');
  console.log(JSON.stringify({ node: process.version, testedSha: sha }));
  const directory = path.join(process.env.RUNNER_TEMP || require('node:os').tmpdir(),
    'test-loader-differential');
  fs.mkdirSync(directory, { recursive: true });
  for (const enabled of [true, false]) {
    const mode = enabled ? 'strip-enabled' : 'strip-disabled';
    const args = ['--test', '--test-reporter=tap'];
    if (enabled) args.push(`--test-name-pattern=^${names[0]}$`);
    args.push('.github/scripts/test-loader.test.cjs');
    const result = spawnSync(process.execPath, args, {
      encoding: 'utf8', timeout: 120000,
      env: { ...process.env, NODE_OPTIONS: enabled
        ? '--experimental-strip-types' : '--no-experimental-strip-types' },
    });
    fs.writeFileSync(path.join(directory, `${mode}.stdout.log`), result.stdout || '');
    fs.writeFileSync(path.join(directory, `${mode}.stderr.log`), result.stderr || '');
    fs.writeFileSync(path.join(directory, `${mode}.json`), JSON.stringify({
      status: result.status, signal: result.signal, error: result.error?.message,
      node: process.version, testedSha: sha,
    }, null, 2));
    console.log(JSON.stringify({ mode, status: result.status, signal: result.signal }));
    console.log(result.stdout || '');
    console.error(result.stderr || '');
    validate(result, enabled);
  }
  console.log('PASS exact Node22 loader differential; service suites remain separate');
}

module.exports = { validate, names };
if (require.main === module) main();
