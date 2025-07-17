const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const pkg = require('../package.json');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const pluginSrc = path.resolve(workspaceRoot, 'src');

const config = getDefaultConfig(projectRoot);

// Manually extend the config
config.watchFolders = [workspaceRoot];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  [pkg.name]: pluginSrc,
};

module.exports = config;
