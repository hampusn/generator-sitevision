import Generator from 'yeoman-generator';
import { readFile } from 'node:fs/promises';
import { findUpSync } from 'find-up';
import { dirname, resolve, parse } from 'path';
import { YEOMAN_CONFIG_FILE_NAME } from './const.js';

const READ_FILE_OPTS = { encoding: 'utf8' };

/**
 * Gets the file contents for filePath.
 * 
 * @param {String} filePath 
 * @returns {String} File contents or empty string.
 */
export const fileContents = async function fileContents (filePath) {
  try {
    return await readFile(filePath, READ_FILE_OPTS);
  } catch (e) { /* ... */ }

  return '';
}

/**
 * Parse contents as JSON and always return an literal object.
 * 
 * @param {String} contents 
 * @returns {Object} Literal object of JSON contents.
 */
export const parseJson = function parseJson (contents) {
  try {
    return JSON.parse(contents);
  } catch (e) { /* ... */ }

  return {};
}

/**
 * Returns the parent dir of fromDir.
 * 
 * @param {String} fromDir 
 * @returns {String} The parent directory's path.
 */
export const getParentDir = function getParentDir (fromDir) {
  return resolve(fromDir, '..');
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * 
 * @typedef {Object} File
 * @property {String} fileName The name of the file.
 * @property {String} absolutePath The absolute path to the file.
 * @property {String} contents The file's content.
 * @property {String} ext The file's extension including the leading dot (e.g. ".js").
 */

/**
 * Return the first found file from fileNames located in dir.
 * 
 * @param {String} dir The directory to search in.
 * @param {String[]} fileNames An array of file names to search for.
 * @returns {(File|null)} A file object or null if not found.
 */
export const findFirstFile = async function findFirstFile (dir, fileNames) {
  for (const fileName of fileNames) {
    const absolutePath = resolve(dir, fileName);
    const contents = await fileContents(absolutePath);

    if (contents) {
      const { ext } = parse(absolutePath);

      return {
        fileName,
        absolutePath,
        contents,
        ext,
      };
    }
  }

  return null;
};

/**
 * Injects a correct destinationRoot into the generator instance based on 
 * where the closest .yo-rc.json file is found.
 * 
 * @param {Generator} instance 
 * @returns {void}
 */
export const setupDestinationRoot = function setupDestinationRoot (instance) {
  const rootPath = findUpSync(YEOMAN_CONFIG_FILE_NAME, {
    cwd: instance.destinationRoot()
  });

  if (rootPath) {
    instance.destinationRoot(dirname(rootPath));
  }
};

/**
 * Remove empty keys from array. Will remove null, undefined, '' and {}.
 * 
 * @param {Object} obj 
 * @returns {Object} Cleaned object.
 */
export const removeEmpty = function removeEmpty (obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') {
      delete obj[key];
    } else if (typeof value === 'object') {
      removeEmpty(value);
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  }

  return obj;
};
