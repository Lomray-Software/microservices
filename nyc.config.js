module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  include: [
    '**/src/**/*.ts'
  ],
  exclude: [
    '**/src/interfaces',
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
