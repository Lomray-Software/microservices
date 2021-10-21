module.exports = {
  extends: "@istanbuljs/nyc-config-typescript",
  include: [
    'src/**/*.ts'
  ],
  exclude: [
    'src/interfaces'
  ],
  all: true,
  cache: false,
  reporter: [
    'text',
    'text-summary',
    'lcov'
  ]
}
