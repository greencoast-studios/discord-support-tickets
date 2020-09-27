import { SQLiteProvider } from 'discord.js-commando';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import logger from '@greencoast/logger';
import path from 'path';
import { discordToken, prefix, ownerID, inviteURL } from './common/settings';
import { SUPPORT_EMOJI, guildSettingKeys, discordErrors } from './common/constants';
import { isThisTheDiscordError } from './common/utils/helpers';
import { dbFilePath, dbFileExists, createDatabaseFile, imageDirectoryExists, createImageDirectory } from './common/utils/data';
import ExtendedClient from './classes/extensions/ExtendedClient';

const client = new ExtendedClient({
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
  client.handleError(error);
});

client.on('guildCreate', (guild) => {
  logger.info(`Joined ${guild.name} guild!`);
  client.updatePresence();
});

client.on('guildDelete', (guild) => {
  logger.info(`Left ${guild.name} guild!`);
  client.updatePresence();
});

client.on('guildUnavailable', (guild) => {
  logger.warn(`The guild ${guild.name} is unavailable!`);
});

client.on('invalidated', () => {
  logger.fatal('The client has been invalidated. Exiting with code 1.');
  process.exit(1);
});

client.on('messageReactionAdd', async(reaction, user) => {
  const { guild } = reaction.message;
  const ticket = client.provider.get(guild.id, guildSettingKeys.ticketMessage, null);

  if (user.bot || ticket?.message !== reaction.message.id) {
    return;
  }

  if (reaction.partial) {
    await reaction.fetch();
  }

  reaction.users.remove(user)
    .catch((error) => {
      if (isThisTheDiscordError(error, discordErrors.missingPermissions)) {
        logger.warn(`I don't have enough permissions in ${guild.name} to remove reactions!`);
        return;
      }
      client.handleError(error, guild);
    });

  if (reaction.emoji.name !== SUPPORT_EMOJI) {
    return;
  }

  const currentTickets = client.provider.get(guild.id, guildSettingKeys.currentTickets, []);
  const userHasTicket = currentTickets.some((ticket) => ticket.user === user.id);

  if (userHasTicket) {
    user.send('You already have a pending ticket. Please wait for staff to assist you.');
    return;
  }

  client.createSupportChannel(guild, user)
    .then(({ channel, staffRoleID }) => {
      const newTickets = [...currentTickets, { channel: channel.id, user: user.id }];
      client.provider.set(guild.id, guildSettingKeys.currentTickets, newTickets);

      channel.send(`Please hang tight ${user.username}, <@&${staffRoleID}> will get to you shortly.`);
      logger.info(`Support channel ${channel.name} has been created in ${guild.name}.`);

      client.updatePresence();
    })
    .catch((error) => {
      if (error.message === 'Role does not exist in database.') {
        logger.warn(`Could not create support channel for ${user.username} in ${guild.name}, a staff role has not been assigned yet.`);
        return;
      }

      if (error.message === 'Channel category does not exist in database.') {
        logger.warn(`Could not create support channel for ${user.username} in ${guild.name}, a channel category has not been assigned yet.`);
        return;
      }

      if (isThisTheDiscordError(error, discordErrors.missingPermissions)) {
        logger.warn(`I don't have enough permissions in ${guild.name} to create channels!`);
        return;
      }

      logger.error(`There was an error creating the support channel for ${user.username} from ${guild.name}.`);
      client.handleError(error, guild, `There was an error creating the support channel for ${user.username} from ${guild.name}.`);
    });
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

  if (!imageDirectoryExists()) {
    logger.warn('Image directory not found, creating...');
    createImageDirectory();
    logger.info('Image directory created!');
  }

  open({
    filename: dbFilePath,
    driver: sqlite3.Database
  })
    .then((db) => {
      client.setProvider(new SQLiteProvider(db))
        .then(() => {
          logger.info('Database loaded.');
          client.updatePresence();

          client.guilds.cache.each((guild) => {
            const ticket = client.provider.get(guild.id, guildSettingKeys.ticketMessage, null);
            if (ticket) {
              guild.channels.cache.find((channel) => channel.id === ticket.channel).messages.fetch(ticket.message);
            }
          });
        })
        .catch((error) => {
          logger.fatal('Could not set database as provider!');
          logger.fatal(error);
        });
    })
    .catch((error) => {
      logger.fatal('Could not load the database!');
      logger.fatal(error);
    });
});

client.on('warn', (info) => {
  logger.warn(info);
});

client.login(discordToken);
