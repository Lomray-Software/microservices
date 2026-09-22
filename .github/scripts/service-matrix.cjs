'use strict';

const { execFileSync } = require('node:child_process');
const { appendFileSync, lstatSync, readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

// Only these repository-wide files are independent of service code and tooling.
const docsOnly = new Set([
  'README.md',
  'CODE_OF_CONDUCT.md',
  'LICENSE',
  'context7.json',
  'scripts/check-docs.cjs',
  '.github/ci-service-selection.md',
]);
const serviceName = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function inventory(root) {
  const directory = join(root, 'microservices');
  const rootEntry = lstatSync(directory);
  if (rootEntry.isSymbolicLink() || !rootEntry.isDirectory()) {
    throw new Error('Service inventory root must be a real directory, not a symlink');
  }
  const services = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('Service inventory contains a symlink');
    if (!entry.isDirectory()) continue;
    if (!serviceName.test(entry.name)) throw new Error('Invalid service directory name');
    const manifest = join(directory, entry.name, 'package.json');
    if (!lstatSync(manifest).isFile()) throw new Error('Service manifest must be a regular file');
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    for (const command of ['lint:check', 'ts:check', 'test']) {
      if (typeof pkg.scripts?.[command] !== 'string' || !pkg.scripts[command].trim()) {
        throw new Error(`Service ${entry.name} is missing script ${command}`);
      }
    }
    services.push(entry.name);
  }
  if (!services.length) throw new Error('Service inventory is empty');
  return services.sort();
}

function selectServices(files, services) {
  if (!Array.isArray(files) || !Array.isArray(services) || !services.length ||
      services.some((name) => typeof name !== 'string' || !serviceName.test(name)) ||
      new Set(services).size !== services.length) {
    throw new Error('Invalid changed-files input or service inventory');
  }
  const known = new Set(services);
  const selected = new Set();
  let shared = false;
  for (const file of files) {
    if (typeof file !== 'string' || !file || /[\x00-\x1f\x7f\\]/.test(file) ||
        file.split('/').some((part) => !part || part === '.' || part === '..')) {
      throw new Error('Invalid repository-relative changed path');
    }
    const [top, service, ...rest] = file.split('/');
    if (top === 'microservices' && rest.length) {
      if (!known.has(service)) throw new Error(`Unknown or removed service: ${service}`);
      selected.add(service);
    } else if (!docsOnly.has(file)) {
      // Shared configuration, new root files and unknown tooling are not docs exemptions.
      shared = true;
    }
  }
  return (shared ? [...known] : [...selected]).sort();
}

function changedFiles(root, base, head) {
  if (![base, head].every((sha) => typeof sha === 'string' && /^[a-f0-9]{40}$/.test(sha))) {
    throw new Error('Base and head must be full commit SHAs');
  }
  const git = (args) => execFileSync('git', args, { cwd: root, maxBuffer: 16 * 1024 * 1024 });
  for (const sha of [base, head]) git(['rev-parse', '--verify', `${sha}^{commit}`]);
  const raw = git(['diff', '--no-ext-diff', '--no-textconv', '--name-only', '--no-renames', '-z', `${base}...${head}`, '--']);
  if (!raw.length) return [];
  const text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
  if (!text.endsWith('\0')) throw new Error('Incomplete changed-files output');
  return text.slice(0, -1).split('\0');
}

function validateTestedTree(root, base, head, tested) {
  if (![base, head, tested].every((sha) => typeof sha === 'string' && /^[a-f0-9]{40}$/.test(sha))) {
    throw new Error('Base, head and tested tree must be full commit SHAs');
  }
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  if (git(['rev-parse', 'HEAD']) !== tested) {
    throw new Error('Checkout does not match the tested merge SHA');
  }
  const parents = git(['show', '-s', '--format=%P', tested]).split(' ');
  if (parents.length !== 2 || parents[0] !== base || parents[1] !== head) {
    throw new Error('Tested tree must merge the exact event base and PR head');
  }
}

function main() {
  const root = process.cwd();
  const tested = process.env.TESTED_SHA;
  validateTestedTree(root, process.env.BASE_SHA, process.env.HEAD_SHA, tested);
  const files = changedFiles(root, process.env.BASE_SHA, process.env.HEAD_SHA);
  const selected = selectServices(files, inventory(root));
  const output = `list=${JSON.stringify(selected)}\nhas-services=${selected.length > 0}\ntested-sha=${tested}\n`;
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required');
  // Nothing is emitted before the complete input and inventory have been validated.
  appendFileSync(process.env.GITHUB_OUTPUT, output);
  console.log(output.trim());
}

if (require.main === module) {
  try { main(); } catch (error) {
    console.error(`Service selection failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { inventory, selectServices, changedFiles, validateTestedTree };
