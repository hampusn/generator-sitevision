import Generator from 'yeoman-generator';
import deepmerge from 'deepmerge';
import { findFirstFile, getParentDir, parseJson } from './utils.js';
import { YEOMAN_CONFIG_NAMESPACE, CUSTOM_CONFIG_FILE_NAME } from './const.js';

/**
 * Parses a file and returns the configuration object normalized. 
 * 
 * @param {String} contents The file contents to parse.
 * @param {String} ext The extension of the config file. Used to determine which kind of parsing should be used.
 * @returns {Object} The normalized configuration object.
 */
const parseConfig = function parseConfig (contents, ext) {
  let parsedConfiguration = {};

  switch (ext) {
    case '.json':
      parsedConfiguration = parseJson(contents);
    default:
  }

  if (parsedConfiguration[YEOMAN_CONFIG_NAMESPACE]) {
    return parsedConfiguration[YEOMAN_CONFIG_NAMESPACE];
  }

  return parsedConfiguration;
}

/**
 * Resolves and deep merges config files recursivly.
 * 
 * @param {String} dir Directory to search.
 * @param {String[]} fileNames Array of file names of configurations to search for in the directory.
 * @param {Object} collector Object to store the configuration in and return when done.
 * @returns {Object} The merged configuration object.
 */
export const conf = async function conf (dir, fileNames, collector = {}) {
  const file = await findFirstFile(dir, fileNames);
  const fileConfig = parseConfig(file?.contents, file?.ext);
  
  collector = deepmerge(fileConfig, collector);

  // Stop recursive merge when { root: true } is found.
  if (collector.root === true) {
    return Promise.resolve(collector);
  }

  const parentDir = getParentDir(dir);

  // We are at root when parentDir is the same as current dir.
  if (parentDir === dir) {
    return Promise.resolve(collector);
  }

  // Return recursive merge.
  return await conf(getParentDir(dir), fileNames, collector);
};

/**
 * Injects custom configuration object in the instance under the key: 'conf'.
 * 
 * @param {Generator} instance Yeoman generator instance.
 * @param {Object} defaults Default configuration to always merge in.
 * @returns {void}
 */
export const injectConf = async function injectConf (instance, defaults = {}) {
  instance.conf = deepmerge.all([
    {
      type: '',
      author: false,
      ...defaults,
    },
    await conf(instance.contextRoot, [ CUSTOM_CONFIG_FILE_NAME ], {}),
    instance.config.getAll(),
  ]);
}

export { deepmerge };
export default conf;

