import fs from 'fs';
import path from 'path';

export const dataFolder = path.join(__dirname, '../../../data');
export const dbFilePath = path.join(__dirname, '../../../data/guild-data.sqlite');

export const dbFileExists = () => {
  return fs.existsSync(dbFilePath);
};

export const createDatabaseFile = () => {
  fs.mkdirSync(dataFolder);
  fs.writeFileSync(dbFilePath, '');
};
