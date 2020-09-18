import { CommandoClient } from 'discord.js-commando';
import logger from '@greencoast/logger';
import path from 'path';
import { discordToken, prefix, ownerID, inviteURL } from './common/settings';

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: ownerID,
  invite: inviteURL
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['misc', 'Miscellaneous Commands']
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
});

client.on('warn', (info) => {
  logger.warn(info);
});

client.login(discordToken);
