'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { validate, names } = require('./test-loader-differential.cjs');

function fixture(enabled) {
  const records = enabled ? [{ extension: 'ts', negative: false, status: 1 }]
    : [{ extension: 'ts', negative: false, status: 0 },
      { extension: 'ts', negative: true, status: 1 },
      { extension: 'mjs', negative: false, status: 1 }];
  const rows = ['TAP version 13', ...records.map(record => '# ' + JSON.stringify(record))];
  if (enabled) rows.push('# Error: Rewiremock: there is no "parent module"',
    '# at formattedImport (/node_modules/mocha/lib/nodejs/esm-utils.js:9:14)');
  (enabled ? names.slice(0, 1) : names).forEach((name, index) => rows.push(`# Subtest: ${name}`,
    `${enabled ? 'not ok' : 'ok'} ${index + 1} - ${name}`));
  if (enabled) rows.push('  error: AssertionError from the outer wrapper is expected');
  for (const [key, value] of Object.entries({ tests: enabled ? 1 : 3, suites: 0,
    pass: enabled ? 0 : 3, fail: enabled ? 1 : 0, cancelled: 0,
    skipped: 0, todo: 0 })) rows.push(`# ${key} ${value}`);
  return { status: enabled ? 1 : 0, signal: null, stdout: rows.join('\n'), stderr: '' };
}

test('accepts only the defined enabled and disabled result shapes', () => {
  validate(fixture(true), true);
  validate(fixture(false), false);
});

const mutations = {
  'spawn error': r => { r.error = new Error('spawn failed'); },
  'killed child': r => { r.signal = 'SIGTERM'; },
  'wrong wrapper status': r => { r.status = 9; },
  'unrelated child error': r => { r.stdout = r.stdout.replace('Rewiremock:', 'Other:'); },
  'missing import stack': r => { r.stdout = r.stdout.replace('esm-utils.js', 'other.js'); },
  'child assertion instead of bootstrap': r => { r.stdout = r.stdout.replace('# Error:', '# AssertionError:'); },
  'child syntax failure': r => { r.stdout = r.stdout.replace('# Error:', '# SyntaxError:'); },
  'child module missing': r => { r.stdout = r.stdout.replace('# Error:', '# ERR_MODULE_NOT_FOUND:'); },
  'assertions unexpectedly executed': r => { r.stdout = r.stdout.replace('# Error:', '# LOADER_ASSERTIONS_EXECUTED\n# Error:'); },
  'positive Mocha count': r => { r.stdout = r.stdout.replace('# Error:', '# 1 passing\n# Error:'); },
  'wrong child status': r => { r.stdout = r.stdout.replace('"status":1', '"status":0'); },
  'missing fixture record': r => { r.stdout = r.stdout.replace(/^# \{"extension".*\n/m, ''); },
  'extra fixture record': r => { r.stdout = r.stdout.replace('TAP version 13', 'TAP version 13\n# {"extension":"ts","negative":false,"status":1}'); },
  'wrong skipped count': r => { r.stdout = r.stdout.replace('# skipped 0', '# skipped 1'); },
  'duplicate summary': r => { r.stdout += '\n# fail 1'; },
  'wrong named outcome': r => { r.stdout = r.stdout.replace('not ok 1', 'ok 1'); },
};
for (const [name, mutate] of Object.entries(mutations)) {
  test(`rejects ${name}`, () => {
    const result = fixture(true);
    mutate(result);
    assert.throws(() => validate(result, true));
  });
}

test('rejects skipped or missing disabled controls', () => {
  const result = fixture(false);
  result.stdout = result.stdout.replace('# pass 3', '# pass 2');
  assert.throws(() => validate(result, false));
});
