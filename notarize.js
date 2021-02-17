require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function runNotarize(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  const options = {
    appPath: `${appOutDir}/${appName}.app`,
    appBundleId: 'com.waylt.electron',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  };

  return await notarize(options);
};
