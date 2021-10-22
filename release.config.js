const branch = process.env.GIT_BRANCH;

module.exports = {
  branches: ['prod', 'staging'],
  extends: 'semantic-release-monorepo',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    // only release
    ...(branch === 'prod' ? [
      '@semantic-release/github',
    ] : [
      // only update package.json version in staging branch
      "@semantic-release/update-package-json",
    ]),
  ]
}
