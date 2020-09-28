/* eslint-disable max-params */
/* eslint-disable max-lines */
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
  removeImage,
  logFolder,
  guildLogDirectoryExists,
  createLogDirectoryForGuild,
  saveChannelLog
} from '../../../src/common/utils/data';
import { guildMock, channelMock } from '../../../__mocks__/discordMocks';

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

  describe('logFolder', () => {
    it('should be a string.', () => {
      expect(typeof logFolder).toBe('string');
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

  describe('guildLogDirectoryExists()', () => {
    beforeEach(() => {
      fs.access.mockClear();
    });

    it('should return a Promise.', () => {
      expect(guildLogDirectoryExists(guildMock)).toBeInstanceOf(Promise);
    });

    it('should call fs.access with the proper path and code.', () => {
      fs.access.mockImplementationOnce((path, code, cb) => cb());

      return guildLogDirectoryExists(guildMock)
        .then(() => {
          expect(fs.access.mock.calls.length).toBe(1);
          expect(fs.access.mock.calls[0][0]).toBe(path.join(logFolder, guildMock.id));
          expect(fs.access.mock.calls[0][1]).toBe(fs.constants.F_OK);
        });
    });

    it('should reject if an fs.access had an error.', () => {
      const expectedError = new Error('fs access error');
      fs.access.mockImplementationOnce((path, code, cb) => cb(expectedError));
      expect.assertions(1);

      return guildLogDirectoryExists(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(expectedError);
        });
    });

    it('should resolve with false if the folder did not exist.', () => {
      const expectedError = new Error('fs access error');
      expectedError.code = 'ENOENT';
      fs.access.mockImplementationOnce((path, code, cb) => cb(expectedError));

      return guildLogDirectoryExists(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(false);
        });
    });

    it('should resolve with true if the folder exists.', () => {
      fs.access.mockImplementationOnce((path, code, cb) => cb());

      return guildLogDirectoryExists(guildMock)
        .then((resolved) => {
          expect(resolved).toBe(true);
        });
    });
  });

  describe('createDatabaseFile()', () => {
    beforeEach(() => {
      fs.existsSync.mockClear();
      fs.mkdirSync.mockClear();
      fs.writeFileSync.mockClear();
    });

    it('should call fs.mkdirSync with dataFolder if does not exist.', () => {
      fs.existsSync.mockReturnValueOnce(false);
      createDatabaseFile();
      expect(fs.mkdirSync.mock.calls.length).toBe(1);
      expect(fs.mkdirSync.mock.calls[0][0]).toBe(dataFolder);
    });

    it('should call not fs.mkdirSync if folder exists.', () => {
      fs.existsSync.mockReturnValueOnce(true);
      createDatabaseFile();
      expect(fs.mkdirSync.mock.calls.length).toBe(0);
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

  describe('createLogDirectoryForGuild()', () => {
    beforeAll(() => {
      fs.mkdir.mockImplementation((path, options, cb) => cb());
    });

    beforeEach(() => {
      fs.mkdir.mockClear();
    });

    it('should return a Promise.', () => {
      expect(createLogDirectoryForGuild(guildMock)).toBeInstanceOf(Promise);
    });

    it('should call fs.mkdir with the correct path and options.', () => {
      return createLogDirectoryForGuild(guildMock)
        .then(() => {
          expect(fs.mkdir.mock.calls.length).toBe(1);
          expect(fs.mkdir.mock.calls[0][0]).toBe(path.join(logFolder, guildMock.id));
          expect(fs.mkdir.mock.calls[0][1]).toStrictEqual({ recursive: true });
        });
    });

    it('should reject if fs.mkdir hits an error.', () => {
      const expectedError = new Error('fs mkdir error');
      fs.mkdir.mockImplementationOnce((path, options, cb) => cb(expectedError));
      expect.assertions(1);

      return createLogDirectoryForGuild(guildMock)
        .catch((rejected) => {
          expect(rejected).toBe(expectedError);
        });
    });

    it('should resolve if fs.mkdir does not hit an error.', () => {
      return createLogDirectoryForGuild(guildMock); // jest does the magic here.
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

  describe('saveChannelLog()', () => {
    const content = 'message content';

    beforeAll(() => {
      fs.access.mockImplementation((path, code, cb) => cb());
      fs.mkdir.mockImplementation((path, options, cb) => cb());
      fs.writeFile.mockImplementation((path, text, options, cb) => cb());
    });

    beforeEach(() => {
      fs.mkdir.mockClear();
      fs.writeFile.mockClear();
    });

    it('should return a Promise.', () => {
      expect(saveChannelLog(content, channelMock)).toBeInstanceOf(Promise);
    });

    it('should create the folder if it does not exist.', () => {
      const error = new Error();
      error.code = 'ENOENT';
      fs.access.mockImplementationOnce((path, code, cb) => cb(error));

      return saveChannelLog(content, channelMock)
        .then(() => {
          expect(fs.mkdir.mock.calls.length).toBe(1);
        });
    });

    it('should call fs.writeFile with the proper arguments.', () => {
      return saveChannelLog(content, channelMock)
        .then(() => {
          expect(fs.writeFile.mock.calls.length).toBe(1);
          expect(fs.writeFile.mock.calls[0][0].startsWith(path.join(logFolder, channelMock.guild.id))).toBe(true);
          expect(fs.writeFile.mock.calls[0][0].endsWith(`${channelMock.name}.log`)).toBe(true);
          expect(fs.writeFile.mock.calls[0][1]).toBe(content);
          expect(fs.writeFile.mock.calls[0][2]).toStrictEqual({ encoding: 'utf-8' });
        });
    });

    it('should reject if fs.writeFile hits an error.', () => {
      const expectedError = new Error('fs error');
      fs.writeFile.mockImplementationOnce((path, text, options, cb) => cb(expectedError));
      expect.assertions(1);

      return saveChannelLog(content, channelMock)
        .catch((rejected) => {
          expect(rejected).toBe(expectedError);
        });
    });

    it('should reject if fs.mkdir hits an error.', () => {
      const fileNotFoundError = new Error();
      fileNotFoundError.code = 'ENOENT';
      fs.access.mockImplementationOnce((path, code, cb) => cb(fileNotFoundError));

      const expectedError = new Error('fs error');
      fs.mkdir.mockImplementationOnce((path, options, cb) => cb(expectedError));
      expect.assertions(1);

      return saveChannelLog(content, channelMock)
        .catch((rejected) => {
          expect(rejected).toBe(expectedError);
        });
    });

    it('should reject if fs.access hits an error.', () => {
      const expectedError = new Error('fs error');
      fs.access.mockImplementationOnce((path, code, cb) => cb(expectedError));
      expect.assertions(1);

      return saveChannelLog(content, channelMock)
        .catch((rejected) => {
          expect(rejected).toBe(expectedError);
        });
    });

    it('should resolve if file was written.', () => {
      return saveChannelLog(content, channelMock); // jest checks if this resolved.
    });
  });
});
