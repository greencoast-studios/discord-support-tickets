/* eslint-disable prefer-destructuring */
import fs from 'fs';
import { dbFilePath, dataFolder } from '../../../src/common/utils/data';

let dbFileExists, createDatabaseFile;

const existsSyncMock = jest.spyOn(fs, 'existsSync');
const mkdirSyncMock = jest.spyOn(fs, 'mkdirSync');
const writeFileSyncMock = jest.spyOn(fs, 'writeFileSync');

describe('Common - Utils - Data', () => {
  describe('dataFolder', () => {
    it('should be a string.', () => {
      expect(typeof dataFolder).toBe('string');
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
});
