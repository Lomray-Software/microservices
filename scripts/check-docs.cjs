const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
const config = JSON.parse(fs.readFileSync(path.join(root, 'context7.json')));
assert(config.rules.every((rule) => rule.length <= 255));
for (const match of readme.matchAll(/\]\(([^)]+)\)/g)) {
  const link = match[1].split('#')[0];
  if (link && !/^(https?:|mailto:)/.test(link)) {
    assert(fs.existsSync(path.join(root, link)), link);
  }
}
const services = fs.readdirSync(path.join(root, 'microservices')).filter((name) => fs.existsSync(path.join(root, 'microservices', name, 'package.json')));
assert.equal(services.length, 11);
for (const service of services) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'microservices', service, 'package.json')));
  assert.equal(manifest.name, `@lomray/microservice-${service}`);
  assert(manifest.repository.url.includes('Lomray-Software/microservices'));
  assert(readme.includes(`](microservices/${service})`));
}
for (const excluded of ['template', 'tests', 'configs', 'http-requests']) assert(config.excludeFolders.includes(excluded));
assert.deepEqual(config.folders, ['microservices']);
assert.equal(config.branch, 'prod');
assert(readme.includes('root manifest'));
assert(readme.includes('84e83b5663497b5884fee249e57656c1576f626d'));
console.log('Eleven service boundaries and README links PASS (not infrastructure testing)');
