module.exports = {
	ui:         'bdd',
	timeout:    5000,
  extension:  ['ts'],
	watchFiles: ['integration/**/*.ts'],
  require:    ['./helpers/mocha/sinon-chai.ts', './helpers/mocha/root-hooks.ts'],
};
