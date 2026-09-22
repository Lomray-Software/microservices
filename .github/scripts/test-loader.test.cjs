'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const mocha = require.resolve('mocha/bin/mocha.js');
const register = require.resolve('ts-node/register');
const modules = path.dirname(path.dirname(require.resolve('mocha/package.json')));
const serviceConfig = require.resolve('@lomray/microservice-config/tsconfig.json');
const source = `
import assert from 'node:assert/strict';
import rewiremock from 'rewiremock';

describe('CommonJS TypeScript loader', () => {
  it('executes hooks, module interception and assertions', () => {
    assert.equal((globalThis as any).loaderHookRan, true);
    assert.equal(typeof require, 'function');
    const actual = rewiremock.proxy(() => require('./subject.cjs'), {
      './dependency.cjs': { value: 41 },
    });
    assert.equal(actual, process.env.LOADER_NEGATIVE_CONTROL ? -1 : 42,
      'LOADER_ASSERTION_CONTROL');
    assert.equal(require('./subject.cjs'), 2);
    console.log('LOADER_ASSERTIONS_EXECUTED');
  });
});
`;

function runFixture(extension, negative = false) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'microservices-loader-'));
  try {
    fs.symlinkSync(modules, path.join(directory, 'node_modules'), 'dir');
    fs.writeFileSync(path.join(directory, 'tsconfig.json'), JSON.stringify({
      extends: serviceConfig,
      compilerOptions: { baseUrl: directory },
    }));
    fs.writeFileSync(path.join(directory, 'hooks.cjs'),
      'exports.mochaHooks = { beforeAll() { globalThis.loaderHookRan = true; } };\n');
    fs.writeFileSync(path.join(directory, 'dependency.cjs'), 'exports.value = 1;\n');
    fs.writeFileSync(path.join(directory, 'subject.cjs'),
      "module.exports = require('./dependency.cjs').value + 1;\n");
    const filename = `fixture.${extension}`;
    // The explicit ESM control differs only in its extension and erased type cast.
    fs.writeFileSync(path.join(directory, filename),
      extension === 'mjs' ? source.replace('(globalThis as any)', 'globalThis') : source);
    const env = { ...process.env, NODE_ENV: 'tests',
      TS_NODE_COMPILER_OPTIONS: '{"target":"es6"}' };
    delete env.LOADER_NEGATIVE_CONTROL;
    if (negative) env.LOADER_NEGATIVE_CONTROL = '1';
    const result = spawnSync(process.execPath, [mocha, '--no-config', '--no-package',
      '--require', register, '--require', './hooks.cjs', '--reporter', 'spec',
      '--unhandled-rejections=strict', filename],
    { cwd: directory, env, encoding: 'utf8', timeout: 30000 });
    assert.ifError(result.error);
    assert.equal(result.signal, null, 'fixture must exit without being killed');
    const output = result.stdout + result.stderr;
    console.log(JSON.stringify({ extension, negative, status: result.status }));
    console.log(output);
    return { status: result.status, output };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('ts-node runs real CommonJS tests and restores mocked modules', () => {
  const result = runFixture('ts');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /1 passing/);
  assert.match(result.output, /LOADER_ASSERTIONS_EXECUTED/);
});

test('a failed test assertion cannot report success', () => {
  const result = runFixture('ts', true);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /1 failing/);
  assert.match(result.output, /AssertionError.*LOADER_ASSERTION_CONTROL/);
  assert.doesNotMatch(result.output, /LOADER_ASSERTIONS_EXECUTED|there is no "parent module"/);
});

test('native ESM loading reproduces the rewiremock bootstrap failure', () => {
  const result = runFixture('mjs');
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /Rewiremock: there is no "parent module"/);
  assert.doesNotMatch(result.output, /LOADER_ASSERTIONS_EXECUTED|1 passing/);
});
