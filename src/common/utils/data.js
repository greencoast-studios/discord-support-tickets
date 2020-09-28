import fs from 'fs';
import path from 'path';
import axios from 'axios';
import logger from '@greencoast/logger';

export const dataFolder = path.join(__dirname, '../../../data');
export const imageFolder = path.join(dataFolder, 'images');
export const dbFilePath = path.join(__dirname, '../../../data/guild-data.sqlite');
export const logFolder = path.join(__dirname, '../../../log');

export const dbFileExists = () => {
  return fs.existsSync(dbFilePath);
};

export const imageDirectoryExists = () => {
  return fs.existsSync(imageFolder);
};

export const guildLogDirectoryExists = (guild) => {
  return new Promise((resolve, reject) => {
    fs.access(path.join(logFolder, guild.id), fs.constants.F_OK, (error) => {
      if (error) {
        if (error.code === 'ENOENT') {
          resolve(false);
          return;
        }
        reject(error);
        return;
      }
      resolve(true);
    });
  });
};

export const createDatabaseFile = () => {
  if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
  }
  
  fs.writeFileSync(dbFilePath, '');
};

export const createImageDirectory = () => {
  fs.mkdirSync(imageFolder);
};

export const createLogDirectoryForGuild = (guild) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path.join(logFolder, guild.id), { recursive: true }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

export const downloadImage = (imageURL) => {
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

export const saveChannelLog = (content, channel) => {
  return new Promise((resolve, reject) => {
    guildLogDirectoryExists(channel.guild)
      .then(async(exists) => {
        if (!exists) {
          await createLogDirectoryForGuild(channel.guild);
        }
        fs.writeFile(path.join(logFolder, channel.guild.id, `${Date.now()} - ${channel.name}.log`), content, { encoding: 'utf-8' }, (error) => {
          if (error) {
            throw error; // delegate to the promise rejection.
          }
          resolve();
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
