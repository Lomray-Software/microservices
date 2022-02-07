module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  include: [
    '**/src/**/*.ts'
  ],
  exclude: [
    '**/src/interfaces',
    '**/services/external/api.ts',
    'template'
  ],
  all: true,
  cache: false,
  reporter: [
    'text',
    'text-summary',
    'lcov'
  ]
}
