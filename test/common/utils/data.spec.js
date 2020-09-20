/* eslint-disable prefer-destructuring */
import fs from 'fs';
import path from 'path';
import logger from '@greencoast/logger';
import axios, { getResolvedMock, getRejectedMock } from 'axios';
import Stream from 'stream';
import { dbFilePath, dataFolder, imageFolder } from '../../../src/common/utils/data';
import { guildMock } from '../../../__mocks__/discordMocks';

let dbFileExists,
  createDatabaseFile,
  imageDirectoryExists,
  createImageDirectory,
  downloadImage,
  saveImage,
  getImageFile,
  removeImage;

const existsSyncMock = jest.spyOn(fs, 'existsSync');
const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync');
const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync');
const createWriteStreamMock = jest.spyOn(fs, 'createWriteStream');
const readdirMock = jest.spyOn(fs, 'readdir');
const unlinkMock = jest.spyOn(fs, 'unlink');

const loggerDebugMock = jest.spyOn(logger, 'debug');

describe('Common - Utils - Data', () => {
  describe('dataFolder', () => {
    it('should be a string.', () => {
      expect(typeof dataFolder).toBe('string');
    });
  });

  describe('imageFolder', () => {
    it('should be a string.', () => {
      expect(typeof imageFolder).toBe('string');
    });
  });

  describe('dbFilePath', () => {
    it('should be a string.', () => {
      expect(typeof dbFilePath).toBe('string');
    });

    it('should end with .sqlite.', () => {
      expect(dbFilePath.endsWith('.sqlite')).toBe(true);
    });
  });

  describe('dbFileExists()', () => {
    it('should return true if file exists.', () => {
      existsSyncMock.mockImplementation(() => true);
      jest.resetModules();
      dbFileExists = require('../../../src/common/utils/data').dbFileExists;

      expect(dbFileExists()).toBe(true);
    });

    it('should return false if file does not exist.', () => {
      existsSyncMock.mockImplementation(() => false);
      jest.resetModules();
      dbFileExists = require('../../../src/common/utils/data').dbFileExists;
      
      expect(dbFileExists()).toBe(false);
    });
  });

  describe('imageDirectoryExists()', () => {
    it('should return true if directory exists.', () => {
      existsSyncMock.mockImplementation(() => true);
      jest.resetModules();
      imageDirectoryExists = require('../../../src/common/utils/data').imageDirectoryExists;

      expect(imageDirectoryExists()).toBe(true);
    });

    it('should return false if the directory does not exist.', () => {
      existsSyncMock.mockImplementation(() => false);
      jest.resetModules();
      imageDirectoryExists = require('../../../src/common/utils/data').imageDirectoryExists;
      
      expect(imageDirectoryExists()).toBe(false);
    });
  });

  describe('createDatabaseFile()', () => {
    beforeAll(() => {
      mkdirSyncMock.mockImplementation();
      writeFileSyncMock.mockImplementation();

      jest.resetModules();
      createDatabaseFile = require('../../../src/common/utils/data').createDatabaseFile;
    });

    afterEach(() => {
      mkdirSyncMock.mockClear();
      writeFileSyncMock.mockClear();
    });

    it('should call fs.mkdirSync with dataFolder.', () => {
      createDatabaseFile();
      expect(mkdirSyncMock.mock.calls.length).toBe(1);
      expect(mkdirSyncMock.mock.calls[0][0]).toBe(dataFolder);
    });

    it('should call fs.writeFileSync with dbFilePath and empty string.', () => {
      createDatabaseFile();
      expect(writeFileSyncMock.mock.calls.length).toBe(1);
      expect(writeFileSyncMock.mock.calls[0][0]).toBe(dbFilePath);
      expect(writeFileSyncMock.mock.calls[0][1]).toBe('');
    });
  });

  describe('createImageDirectory()', () => {
    beforeAll(() => {
      mkdirSyncMock.mockImplementation();

      jest.resetModules();
      createImageDirectory = require('../../../src/common/utils/data').createImageDirectory;
    });

    beforeEach(() => {
      mkdirSyncMock.mockClear();
    });

    it('should call fs.mkdirSync with imageFolder.', () => {
      createImageDirectory();
      expect(mkdirSyncMock.mock.calls.length).toBe(1);
      expect(mkdirSyncMock.mock.calls[0][0]).toBe(imageFolder);
    });
  });

  describe('downloadImage()', () => {
    beforeAll(() => {
      jest.resetModules();
      downloadImage = require('../../../src/common/utils/data').downloadImage;
    });

    beforeEach(() => {
      axios.get.mockClear();
      loggerDebugMock.mockClear();
    });

    it('should return a Promise.', () => {
      expect(downloadImage('')).toBeInstanceOf(Promise);
    });

    it('should resolve an object with keys data and extension.', () => {
      return downloadImage('')
        .then((resolved) => {
          expect(resolved.data).not.toBeUndefined();
          expect(resolved.extension).not.toBeUndefined();
          expect(resolved.data).toBeInstanceOf(Stream);
          expect(typeof resolved.data.pipe).toBe('function');
          expect(typeof resolved.extension).toBe('string');
        });
    });

    it('should debug log if debug flag is enabled when rejected.', () => {
      const oldArgv = [...process.argv];
      process.argv = ['npm', 'start', '--debug'];
      axios.get.mockImplementationOnce(getRejectedMock);
      jest.resetModules();
      downloadImage = require('../../../src/common/utils/data').downloadImage;
      
      return downloadImage('')
        .catch((rejected) => {
          expect(loggerDebugMock.mock.calls.length).toBe(1);
          expect(loggerDebugMock.mock.calls[0][0]).toBe(rejected.response);

          process.argv = oldArgv;
          jest.resetModules();
          downloadImage = require('../../../src/common/utils/data').downloadImage;
        });
    });
  });

  describe('saveImage()', () => {
    const implementStreamMockWithEvent = (event) => {
      createWriteStreamMock.mockImplementationOnce((path) => {
        const stream = new fs.WriteStream(path);
        setTimeout(() => {
          stream.emit(event);
        }, 500);
        return stream;
      });
    };

    beforeAll(() => {
      jest.resetModules();
      saveImage = require('../../../src/common/utils/data').saveImage;
    });

    beforeEach(() => {
      createWriteStreamMock.mockClear();
    });

    it('should return a Promise.', () => {
      expect(saveImage(guildMock, '')).toBeInstanceOf(Promise);
    });

    it('should call fs.createWriteStream with the proper arguments.', () => {
      implementStreamMockWithEvent('finish');
      return saveImage(guildMock, '')
        .then(() => {
          expect(createWriteStreamMock.mock.calls.length).toBe(1);
          expect(typeof createWriteStreamMock.mock.calls[0][0]).toBe('string');
        });
    });
  });

  describe('getImageFile()', () => {
    beforeAll(() => {
      jest.resetModules();
      getImageFile = require('../../../src/common/utils/data').getImageFile;
    });

    beforeEach(() => {
      readdirMock.mockClear();
    });

    it('should return a Promise.', () => {
      expect(getImageFile(guildMock)).toBeInstanceOf(Promise);
    });

    it('should call fs.readdir once with the path of the image folder.', () => {
      readdirMock.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));
      return getImageFile(guildMock)
        .then(() => {
          expect(readdirMock.mock.calls.length).toBe(1);
          expect(readdirMock.mock.calls[0][0]).toBe(imageFolder);
        });
    });

    it('should resolve with a filename if image is found.', () => {
      readdirMock.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));

      return getImageFile(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(path.resolve(imageFolder, `${guildMock.id}`));
        });
    });

    it('should resolve with null if image is not found.', () => {
      readdirMock.mockImplementationOnce((path, cb) => cb(null, []));

      return getImageFile(guildMock)
        .then((resolved) => {
          expect(resolved).toBeNull();
        });
    });

    it('should reject if error was found in fs.readdir.', () => {
      const error = new Error();
      readdirMock.mockImplementationOnce((path, cb) => cb(error, []));

      return getImageFile(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(error);
        });
    });
  });

  describe('removeImage()', () => {
    beforeAll(() => {
      unlinkMock.mockImplementation(() => new Promise((resolve) => resolve()));

      jest.resetModules();
      removeImage = require('../../../src/common/utils/data').removeImage;
    });

    beforeEach(() => {
      readdirMock.mockClear();
      unlinkMock.mockClear();
    });

    it('should return a Promise.', () => {
      expect(removeImage(guildMock)).toBeInstanceOf(Promise);
    });

    it('should call fs.readdir once with the path of the image folder.', () => {
      readdirMock.mockImplementation((path, cb) => cb(null, ['999']));
      return removeImage(guildMock)
        .then(() => {
          expect(readdirMock.mock.calls.length).toBe(1);
          expect(readdirMock.mock.calls[0][0]).toBe(imageFolder);
        });
    });

    it('should resolve with false if image is not found.', () => {
      readdirMock.mockImplementation((path, cb) => cb(null, ['999'])); // not guildMock.id

      return removeImage(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(false);
        });
    });

    it('should resolve with true if image is found.', () => {
      readdirMock.mockImplementation((path, cb) => cb(null, [`${guildMock.id}`]));
      unlinkMock.mockImplementation((path, cb) => cb());

      return removeImage(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(true);
        });
    });

    it('should reject if error was found in fs.readdir.', () => {
      const error = new Error();
      readdirMock.mockImplementation((path, cb) => cb(error, []));

      return removeImage(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(error);
        });
    });

    it('should call fs.unlink with the image path as first argument if image was found.', () => {
      readdirMock.mockImplementation((path, cb) => cb(null, [`${guildMock.id}`]));
      unlinkMock.mockImplementation((path, cb) => cb());

      return removeImage(guildMock)
        .then(() => {
          expect(unlinkMock.mock.calls.length).toBe(1);
          expect(unlinkMock.mock.calls[0][0]).toBe(path.join(imageFolder, `${guildMock.id}`));
        });
    });

    it('should not call fs.unlink if image was not found.', () => {
      readdirMock.mockImplementation((path, cb) => cb(null, ['999'])); // not guildMock.id

      return removeImage(guildMock)
        .then(() => {
          expect(unlinkMock.mock.calls.length).toBe(0);
        });
    });

    it('should reject if error was found in fs.readdir.', () => {
      const error = new Error();
      unlinkMock.mockImplementation((path, cb) => cb(error));

      return removeImage(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(error);
        });
    });
  });
});
