import fs from 'fs';
import path from 'path';
import axios from 'axios';
import logger from '@greencoast/logger';

export const dataFolder = path.join(__dirname, '../../../data');
export const imageFolder = path.join(dataFolder, 'images');
export const dbFilePath = path.join(__dirname, '../../../data/guild-data.sqlite');

export const dbFileExists = () => {
  return fs.existsSync(dbFilePath);
};

export const imageDirectoryExists = () => {
  return fs.existsSync(imageFolder);
};

export const createDatabaseFile = () => {
  fs.mkdirSync(dataFolder);
  fs.writeFileSync(dbFilePath, '');
};

export const createImageDirectory = () => {
  fs.mkdirSync(imageFolder);
};

export const downloadImage = (imageURL) => {
  logger.debug('hi')
  return axios.get(imageURL, { responseType: 'stream' })
    .then((response) => {
      const urlAsArray = response.config.url.split('.');
      return {
        data: response.data,
        extension: urlAsArray[urlAsArray.length - 1]
      };
    })
    .catch((error) => {
      if (process.argv[2] === '--debug') {
        if (error.response) {
          logger.debug(error.response);
        }
      }
      throw error; // Delegate the error handling to the next catch.
    });
};

export const saveImage = (guild, imageURL) => {
  return downloadImage(imageURL)
    .then(({ data, extension }) => {
      const writer = fs.createWriteStream(path.join(imageFolder, `${guild.id}.${extension}`));
      data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    });
};

export const getImageFile = (guild) => {
  return new Promise((resolve, reject) => {
    fs.readdir(imageFolder, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const file = files.find((file) => file.startsWith(guild.id));
      resolve(file ? path.resolve(imageFolder, file) : null);
    });
  });
};

export const removeImage = (guild) => {
  return new Promise((resolve, reject) => {
    fs.readdir(imageFolder, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const file = files.find((file) => file.startsWith(guild.id));

      if (!file) {
        resolve(false);
        return;
      }

      fs.unlink(path.join(imageFolder, file), (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(true);
      });
    });
  });
};
