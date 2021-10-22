const { exec } = require("child_process");

const verifyRelease = (pluginConfig, context) => {
  const { logger, nextRelease } = context;
  const nextReleaseVersion = nextRelease.version;

  exec(`npm version ${nextReleaseVersion}`);

  logger.log(`package.json updated to: ${nextReleaseVersion}`);
};

module.exports = { verifyRelease }
