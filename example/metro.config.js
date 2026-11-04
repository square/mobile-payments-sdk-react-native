const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const { getConfig } = require('react-native-builder-bob/metro-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getConfig(getDefaultConfig(__dirname), {
  root,
  pkg,
  project: __dirname,
});

// Metro no longer reads `blacklistRE`, which bob sets to keep the root's copy
// of react-native out of the bundle, so pass the same pattern as `blockList`.
config.resolver.blockList = config.resolver.blacklistRE;

module.exports = config;
