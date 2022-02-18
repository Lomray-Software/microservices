module.exports = {
	ui:         'bdd',
	timeout:    5000,
  extension:  ['ts'],
	watchFiles: ['__tests__/**/*.ts', 'src/**/*.ts'],
  require:    ['./__helpers__/sinon-chai.ts', './__helpers__/root-hooks.ts'],
};
