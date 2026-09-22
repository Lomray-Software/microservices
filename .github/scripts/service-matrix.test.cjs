'use strict';

const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { inventory, selectServices, changedFiles } = require('./service-matrix.cjs');

const services = ['authentication', 'users', 'users-admin'];
const fixtureScripts = { 'lint:check': 'echo lint', 'ts:check': 'echo types', test: 'echo test' };
const script = path.join(__dirname, 'service-matrix.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'service-matrix-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, text = '') => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  };
  for (const name of services) write(`microservices/${name}/package.json`, JSON.stringify({ scripts: fixtureScripts }));
  return { root, write };
}

function repository(t) {
  const f = fixture(t);
  // Synthetic Git test identity; never used for repository publication.
  const env = { ...process.env, GIT_AUTHOR_NAME: 'fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid', GIT_COMMITTER_NAME: 'fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid' };
  const git = (...args) => execFileSync('git', args, { cwd: f.root, env, encoding: 'utf8' }).trim();
  git('init', '--quiet');
  const commit = () => { git('add', '-A'); git('-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '--allow-empty', '-m', 'fixture'); return git('rev-parse', 'HEAD'); };
  return { ...f, git, commit };
}

test('root documentation and an empty diff produce [] (never an empty name)', () => {
  assert.deepEqual(selectServices(['README.md', 'context7.json', 'scripts/check-docs.cjs'], services), []);
  assert.deepEqual(selectServices([], services), []);
});

test('one service is exact, deduplicated and does not match a substring neighbour', () => {
  assert.deepEqual(selectServices(['microservices/users/src/a.ts', 'microservices/users/README.md', 'README.md'], services), ['users']);
});

test('multiple services are stable and sorted', () => {
  assert.deepEqual(selectServices(['microservices/users-admin/package.json', 'microservices/authentication/src/a.ts'], services), ['authentication', 'users-admin']);
});

test('shared tooling, configuration, tests and unknown root paths select all', () => {
  for (const file of ['package.json', 'package-lock.json', '.eslintrc.js', '.prettierrc.js', 'nyc.config.js', '.env', 'configs/config.local.json', 'tests/new.ts', 'template/new/package.json', '.github/workflows/pr-check.yml', '.github/scripts/service-matrix.cjs', 'scripts/new-tool.cjs', 'new-root-file', 'microservices/README.md', 'microservices-other/users/a.ts']) {
    assert.deepEqual(selectServices([file], services), services, file);
  }
});

test('unknown/removed services fail even when another path selects all', () => {
  for (const files of [['microservices/unknown/a.ts'], ['package.json', 'microservices/unknown/a.ts']]) {
    assert.throws(() => selectServices(files, services), /Unknown or removed service/);
  }
});

test('malformed inputs cannot become an empty success', () => {
  for (const files of [null, {}, '', '["README.md"]', [null], [17], [''], ['/README.md'], ['../README.md'], ['./README.md'], ['a//b'], ['a/../b'], ['a\\b'], ['a\nb']]) {
    assert.throws(() => selectServices(files, services));
  }
  for (const names of [[], [''], ['../users'], ['users', 'users'], [null]]) assert.throws(() => selectServices([], names));
});

test('inventory reads real manifests, rejects missing scripts, symlinks and malformed JSON', (t) => {
  const f = fixture(t);
  assert.deepEqual(inventory(f.root), services);
  f.write('microservices/users/package.json', '{}');
  assert.throws(() => inventory(f.root), /missing script/);
  f.write('microservices/users/package.json', '{');
  assert.throws(() => inventory(f.root), SyntaxError);
  f.write('microservices/users/package.json', JSON.stringify({ scripts: fixtureScripts }));
  fs.symlinkSync('users', path.join(f.root, 'microservices', 'alias'));
  assert.throws(() => inventory(f.root), /symlink/);
});

test('deleted files and cross-service renames select every affected service', (t) => {
  const f = repository(t);
  f.write('microservices/users/src/old.ts', 'original');
  f.write('microservices/users-admin/src/delete.ts', 'deleted');
  const base = f.commit();
  f.write('microservices/authentication/src/new.ts', 'original');
  fs.unlinkSync(path.join(f.root, 'microservices/users/src/old.ts'));
  fs.unlinkSync(path.join(f.root, 'microservices/users-admin/src/delete.ts'));
  const head = f.commit();
  const files = changedFiles(f.root, base, head);
  assert.deepEqual(files, ['microservices/authentication/src/new.ts', 'microservices/users-admin/src/delete.ts', 'microservices/users/src/old.ts']);
  assert.deepEqual(selectServices(files, inventory(f.root)), services);
});

test('merge-base diff excludes unrelated base-branch changes', (t) => {
  const f = repository(t);
  const common = f.commit();
  f.write('README.md', 'docs');
  const head = f.commit();
  f.git('checkout', '--quiet', '--detach', common);
  f.write('package.json', '{}');
  const base = f.commit();
  f.git('checkout', '--quiet', '--detach', head);
  assert.deepEqual(changedFiles(f.root, base, head), ['README.md']);
});

test('CLI emits explicit empty output, nonempty matrix and no output on failure', (t) => {
  const f = repository(t);
  const base = f.commit();
  f.write('README.md', 'docs');
  let head = f.commit();
  // The output file lives outside the fixture repository so it is not itself a changed file.
  const outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'service-matrix-output-'));
  t.after(() => fs.rmSync(outputDirectory, { recursive: true, force: true }));
  const output = path.join(outputDirectory, 'output');
  const run = (extra = {}) => {
    fs.writeFileSync(output, '');
    return spawnSync(process.execPath, [script], { cwd: f.root, env: { ...process.env, BASE_SHA: base, HEAD_SHA: head, GITHUB_OUTPUT: output, ...extra }, encoding: 'utf8' });
  };
  assert.equal(run().status, 0);
  assert.equal(fs.readFileSync(output, 'utf8'), 'list=[]\nhas-services=false\n');
  f.write('microservices/users/src/file with spaces.ts', 'source');
  head = f.commit();
  assert.equal(run().status, 0);
  assert.equal(fs.readFileSync(output, 'utf8'), 'list=["users"]\nhas-services=true\n');
  for (const extra of [{ BASE_SHA: '' }, { HEAD_SHA: base }, { BASE_SHA: 'f'.repeat(40) }, { BASE_SHA: '--help' }, { GITHUB_OUTPUT: '' }]) {
    assert.notEqual(run(extra).status, 0);
    assert.equal(fs.readFileSync(output, 'utf8'), '');
  }
  f.write('microservices/unknown/src/new.ts', 'source');
  head = f.commit();
  const failed = run();
  assert.notEqual(failed.status, 0);
  assert.match(failed.stderr, /ENOENT:.*microservices\/unknown\/package\.json/);
  assert.equal(fs.readFileSync(output, 'utf8'), '');
});

test('a removed service fails closed rather than receiving an invalid matrix row', (t) => {
  const f = repository(t);
  const base = f.commit();
  fs.rmSync(path.join(f.root, 'microservices/users'), { recursive: true });
  const head = f.commit();
  assert.throws(() => selectServices(changedFiles(f.root, base, head), inventory(f.root)), /Unknown or removed service/);
});

test('a new complete service enters the matrix; incomplete or symlink manifests fail', (t) => {
  const f = repository(t);
  const base = f.commit();
  f.write('microservices/new-worker/package.json', JSON.stringify({ scripts: fixtureScripts }));
  const head = f.commit();
  assert.deepEqual(selectServices(changedFiles(f.root, base, head), inventory(f.root)), ['new-worker']);
  fs.unlinkSync(path.join(f.root, 'microservices/new-worker/package.json'));
  fs.symlinkSync('../users/package.json', path.join(f.root, 'microservices/new-worker/package.json'));
  assert.throws(() => inventory(f.root), /regular file/);
});

test('all allowlisted paths skip, near-miss names and documentation suffixes do not', () => {
  for (const file of ['README.md', 'LICENSE', 'CODE_OF_CONDUCT.md', 'context7.json', 'scripts/check-docs.cjs', '.github/ci-service-selection.md']) {
    assert.deepEqual(selectServices([file], services), []);
  }
  for (const file of ['README.md/tool.js', 'context7.json.js', 'docs/shared.ts', '.github/scripts/README.md', 'scripts/check-docs.cjs/extra']) {
    assert.deepEqual(selectServices([file], services), services);
  }
});

test('workflow keeps checks, gates both matrices and isolates Sonar concurrency', () => {
  const workflow = fs.readFileSync(path.join(__dirname, '../workflows/pr-check.yml'), 'utf8');
  assert.equal((workflow.match(/if: needs\.changed-microservices\.outputs\.has-services == 'true'/g) || []).length, 2);
  assert.equal((workflow.match(/microservice: \$\{\{ fromJson\(needs\.changed-microservices\.outputs\.microservices\) \}\}/g) || []).length, 2);
  assert.match(workflow, /run: node --test \.github\/scripts\/service-matrix\.test\.cjs/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \}\}\n          fetch-depth: 0/);
  const checks = workflow.split('\n  checks:')[1].split('\n  sonarcube:')[0];
  for (const command of ['npm install', 'npm run lint:check', 'npm run ts:check', 'npm run test']) {
    assert.ok(checks.includes(`run: ${command}\n        working-directory: microservices/\${{ matrix.microservice }}`), command);
  }
  assert.match(checks, /run: npm ci/);
  assert.match(checks, /node-version: '22'/);
  assert.doesNotMatch(workflow, /continue-on-error|@lomray\/microservices-cli|tj-actions\/changed-files/);
  assert.match(workflow, /group:.*sonarcube-\$\{\{ matrix.microservice \}\}/);
  assert.match(workflow, /uses: SonarSource\/sonarcloud-github-action@master/);
  assert.match(workflow, /SONAR_TOKEN: \$\{\{ secrets\.SONAR_CLOUD_TOKEN \}\}/);
});
