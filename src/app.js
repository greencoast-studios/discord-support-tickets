import { CommandoClient, SQLiteProvider } from 'discord.js-commando';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import logger from '@greencoast/logger';
import path from 'path';
import { discordToken, prefix, ownerID, inviteURL } from './common/settings';
import { dbFilePath, dbFileExists, createDatabaseFile } from './common/utils/data';
import { guildSettingKeys } from './common/constants';

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: ownerID,
  invite: inviteURL
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['misc', 'Miscellaneous Commands'],
    ['owner-only', 'Owner-only Commands'],
    ['configuration', 'Configuration Commands']
  ])
  .registerCommandsIn(path.join(__dirname, 'commands'));

if (process.argv[2] === '--debug') {
  client.on('debug', (info) => {
    logger.debug(info);
  });
}

client.on('error', (error) => {
  logger.error(error);
});

client.on('guildCreate', (guild) => {
  logger.info(`Joined ${guild.name} guild!`);
});

client.on('guildDelete', (guild) => {
  logger.info(`Left ${guild.name} guild!`);
});

client.on('guildUnavailable', (guild) => {
  logger.warn(`The guild ${guild.name} is unavailable!`);
});

client.on('invalidated', () => {
  logger.fatal('The client has been invalidated. Exiting with code 1.');
  process.exit(1);
});

client.on('rateLimit', (info) => {
  logger.warn(info);
});

client.on('ready', () => {
  logger.info('Connected to Discord! - Ready!');

  if (!dbFileExists()) {
    logger.warn('Database file not found, creating...');
    createDatabaseFile();
    logger.info('Database file created!');
  }

  open({
    filename: dbFilePath,
    driver: sqlite3.Database
  }).then((db) => {
    client.setProvider(new SQLiteProvider(db));
    logger.info('Database loaded.');
  });
});

client.on('warn', (info) => {
  logger.warn(info);
});

client.on('commandError', (command, error, message) => {
  logger.error(error);

  if (client.provider.get(message.guild, guildSettingKeys.report, false)) {
    client.owners.forEach((owner) => {
      owner.send(`An error occurred when running the command **${command.name}** in **${message.guild.name}**. Triggering message: **${message.content}** \`\`\`${error.stack}\`\`\``);
    });
  }
});

client.login(discordToken);
