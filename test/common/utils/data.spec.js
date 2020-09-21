/* eslint-disable prefer-destructuring */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Stream, { PassThrough } from 'stream';
import logger from '@greencoast/logger';
import {
  dbFilePath,
  dataFolder,
  imageFolder,
  dbFileExists,
  createDatabaseFile,
  imageDirectoryExists,
  createImageDirectory,
  downloadImage,
  saveImage,
  getImageFile,
  removeImage
} from '../../../src/common/utils/data';
import { guildMock } from '../../../__mocks__/discordMocks';

jest.mock('fs');
jest.mock('@greencoast/logger');

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
      fs.existsSync.mockReturnValueOnce(true);

      expect(dbFileExists()).toBe(true);
    });

    it('should return false if file does not exist.', () => {
      fs.existsSync.mockReturnValueOnce(false);
      
      expect(dbFileExists()).toBe(false);
    });
  });

  describe('imageDirectoryExists()', () => {
    it('should return true if directory exists.', () => {
      fs.existsSync.mockReturnValueOnce(true);

      expect(imageDirectoryExists()).toBe(true);
    });

    it('should return false if the directory does not exist.', () => {
      fs.existsSync.mockReturnValueOnce(false);
      
      expect(imageDirectoryExists()).toBe(false);
    });
  });

  describe('createDatabaseFile()', () => {
    beforeEach(() => {
      fs.mkdirSync.mockClear();
      fs.writeFileSync.mockClear();
    });

    it('should call fs.mkdirSync with dataFolder.', () => {
      createDatabaseFile();
      expect(fs.mkdirSync.mock.calls.length).toBe(1);
      expect(fs.mkdirSync.mock.calls[0][0]).toBe(dataFolder);
    });

    it('should call fs.writeFileSync with dbFilePath and empty string.', () => {
      createDatabaseFile();
      expect(fs.writeFileSync.mock.calls.length).toBe(1);
      expect(fs.writeFileSync.mock.calls[0][0]).toBe(dbFilePath);
      expect(fs.writeFileSync.mock.calls[0][1]).toBe('');
    });
  });

  describe('createImageDirectory()', () => {
    beforeEach(() => {
      fs.mkdirSync.mockClear();
    });

    it('should call fs.mkdirSync with imageFolder.', () => {
      createImageDirectory();
      expect(fs.mkdirSync.mock.calls.length).toBe(1);
      expect(fs.mkdirSync.mock.calls[0][0]).toBe(imageFolder);
    });
  });

  describe('downloadImage()', () => {
    beforeEach(() => {
      axios.get.mockClear();
      logger.debug.mockClear();
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
      expect.assertions(2);

      return downloadImage('invalid')
        .catch((rejected) => {
          expect(logger.debug.mock.calls.length).toBe(1);
          expect(logger.debug.mock.calls[0][0]).toBe(rejected.response);

          process.argv = oldArgv;
        });
    });
  });

  describe('saveImage()', () => {
    const implementStreamMockWithEvent = (event) => {
      fs.createWriteStream.mockImplementationOnce(() => {
        const stream = new PassThrough();
        setTimeout(() => {
          stream.emit(event);
        }, 500);
        return stream;
      });
    };

    beforeEach(() => {
      fs.createWriteStream.mockClear();
    });

    it('should return a Promise.', () => {
      implementStreamMockWithEvent('finish');
      expect(saveImage(guildMock, '')).toBeInstanceOf(Promise);
    });

    it('should call fs.createWriteStream with the proper arguments.', () => {
      implementStreamMockWithEvent('finish');
      return saveImage(guildMock, '')
        .then(() => {
          expect(fs.createWriteStream.mock.calls.length).toBe(1);
          expect(typeof fs.createWriteStream.mock.calls[0][0]).toBe('string');
        });
    });

    it('should reject on stream pipe error.', () => {
      implementStreamMockWithEvent('error');
      expect.assertions(2);

      return saveImage(guildMock, '')
        .catch(() => {
          expect(fs.createWriteStream.mock.calls.length).toBe(1);
          expect(typeof fs.createWriteStream.mock.calls[0][0]).toBe('string');
        });
    });
  });

  describe('getImageFile()', () => {
    beforeEach(() => {
      fs.readdir.mockClear();
    });

    it('should return a Promise.', () => {
      expect(getImageFile(guildMock)).toBeInstanceOf(Promise);
    });

    it('should call fs.readdir once with the path of the image folder.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));
      
      return getImageFile(guildMock)
        .then(() => {
          expect(fs.readdir.mock.calls.length).toBe(1);
          expect(fs.readdir.mock.calls[0][0]).toBe(imageFolder);
        });
    });

    it('should resolve with a filename if image is found.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));

      return getImageFile(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(path.resolve(imageFolder, `${guildMock.id}`));
        });
    });

    it('should resolve with null if image is not found.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, []));

      return getImageFile(guildMock)
        .then((resolved) => {
          expect(resolved).toBeNull();
        });
    });

    it('should reject if error was found in fs.readdir.', () => {
      const error = new Error();
      fs.readdir.mockImplementationOnce((path, cb) => cb(error, []));
      expect.assertions(1);

      return getImageFile(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(error);
        });
    });
  });

  describe('removeImage()', () => {
    beforeAll(() => {
      fs.unlink.mockImplementation(() => new Promise((resolve) => resolve()));
    });

    beforeEach(() => {
      fs.readdir.mockClear();
      fs.unlink.mockClear();
    });

    it('should return a Promise.', () => {
      expect(removeImage(guildMock)).toBeInstanceOf(Promise);
    });

    it('should call fs.readdir once with the path of the image folder.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, []));

      return removeImage(guildMock)
        .then(() => {
          expect(fs.readdir.mock.calls.length).toBe(1);
          expect(fs.readdir.mock.calls[0][0]).toBe(imageFolder);
        });
    });

    it('should resolve with false if image is not found.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`44${guildMock.id}`])); // not guildMock.id

      return removeImage(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(false);
        });
    });

    it('should resolve with true if image is found.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));
      fs.unlink.mockImplementationOnce((path, cb) => cb());

      return removeImage(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(true);
        });
    });

    it('should reject if error was found in fs.readdir.', () => {
      const error = new Error();
      fs.readdir.mockImplementationOnce((path, cb) => cb(error, []));
      expect.assertions(1);

      return removeImage(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(error);
        });
    });

    it('should call fs.unlink with the image path as first argument if image was found.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));
      fs.unlink.mockImplementationOnce((path, cb) => cb());

      return removeImage(guildMock)
        .then(() => {
          expect(fs.unlink.mock.calls.length).toBe(1);
          expect(fs.unlink.mock.calls[0][0]).toBe(path.join(imageFolder, `${guildMock.id}`));
        });
    });

    it('should not call fs.unlink if image was not found.', () => {
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`44${guildMock.id}`])); // not guildMock.id

      return removeImage(guildMock)
        .then(() => {
          expect(fs.unlink.mock.calls.length).toBe(0);
        });
    });

    it('should reject if error was found in fs.readdir.', () => {
      const error = new Error();
      fs.readdir.mockImplementationOnce((path, cb) => cb(null, [`${guildMock.id}`]));
      fs.unlink.mockImplementationOnce((path, cb) => cb(error));
      expect.assertions(1);

      return removeImage(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(error);
        });
    });
  });
});
