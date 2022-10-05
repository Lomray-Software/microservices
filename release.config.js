/**
 * This is root config for microservices
 * All microservices extends from this
 */
module.exports = {
  branches: [
    'prod',
    {
      name: 'staging',
      prerelease: 'beta',
      channel: 'beta',
    },
  ],
  extends: 'semantic-release-monorepo',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/exec', {
      publishCmd: "sed -i -e 's/1.0.0/${nextRelease.version}/g' lib/package.json.js" +
        " && sed -i -e 's/1.0.0/${nextRelease.version}/g' lib/package.json" +
        " && sed -i -e 's/1.0.0/${nextRelease.version}/g' package.json" +
        " && zip -r build.zip lib"
    }],
    ['@semantic-release/npm', {
      pkgRoot: './lib'
    }],
    ['@semantic-release/github', {
      labels: false,
      releasedLabels: false,
      successComment: false,
      assets: [
        { path: 'build.zip', label: 'Build-${nextRelease.gitTag}' },
      ]
    }],
  ]
}
