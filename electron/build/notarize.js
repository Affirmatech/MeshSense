const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.credentials') });
const { spawnSync } = require('child_process');
const { notarize } = require('@electron/notarize');

async function notarizeMacos(context) {
  const { appOutDir } = context;

  const {
    APPLE_ID,
    APPLE_APP_SPECIFIC_PASSWORD,
    APPLE_TEAM_ID,
  } = process.env;

  if (!(APPLE_ID && APPLE_APP_SPECIFIC_PASSWORD && APPLE_TEAM_ID)) {
    console.log('Skipping notarizing step. APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, and APPLE_TEAM_ID env variables must be set');
    return;
  }

  if (process.env.SKIP_NOTARIZE !== undefined) {
    console.warn('Skipping notarizing step. SKIP_NOTARIZE env variable is set.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log('Notarizing macOS app...');
  await notarize({
    // appBundleId: build.appId,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
    teamId: APPLE_TEAM_ID,
  });
}

exports.default = async function notarizeOrSign(context) {
  const { electronPlatformName } = context;
  if (electronPlatformName === 'darwin') {
    await notarizeMacos(context);
  } else {
    console.log(`No notarization or signing for platform ${electronPlatformName}`);
  }
};