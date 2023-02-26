import Generator from 'yeoman-generator';
import deepmerge from 'deepmerge';
import { findFirstFile, getParentDir, parseJson } from './utils.js';
import { CUSTOM_CONFIG_FILE_NAME } from './const.js';

/**
 * 
 * @param {*} contents 
 * @param {*} ext 
 * @returns {Object}
 */
const parseConfig = function parseConfig (contents, ext) {
  switch (ext) {
    case '.json':
      return parseJson(contents);
    default:
  }

  return {};
}

/**
 * 
 * @param {*} dir 
 * @param {*} fileNames 
 * @param {*} collector 
 * @returns {Object}
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
 * @param {Generator} instance 
 * @param {Object} defaults 
 * @returns {void}
 */
export const injectConf = async function injectConf (instance, defaults = {}) {
  instance.conf = deepmerge.all([
    {
      type: '',
      author: {
        name: instance.user.git.name(),
        email: instance.user.git.email(),
      },
      ...defaults,
    },
    await conf(instance.contextRoot, [ CUSTOM_CONFIG_FILE_NAME ], {}),
    instance.config.getAll(),
  ]);
}

export { deepmerge };
export default conf;

