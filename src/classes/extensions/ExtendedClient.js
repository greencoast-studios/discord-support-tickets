import { CommandoClient } from 'discord.js-commando';
import logger from '@greencoast/logger';
import { presenceStatus, activityType, guildSettingKeys } from '../../common/constants';

class ExtendedClient extends CommandoClient {
  updatePresence() {
    const numberOfGuilds = this.guilds.cache.array().length;
    const numberOfTickets = this.guilds.cache.reduce((total, guild) => {
      return total + this.provider.get(guild, guildSettingKeys.currentTickets, []).length;
    }, 0);

    const presenceMessage = numberOfGuilds === 1 ?
      `${numberOfTickets} tickets open!` :
      `${numberOfTickets} tickets open across ${numberOfGuilds} servers!`;

    return this.user.setPresence({
      status: presenceStatus.online,
      afk: false,
      activity: {
        name: presenceMessage,
        type: activityType.watching
      }
    }).then(() => {
      logger.info(`Presence updated to: ${presenceMessage}`);
    }).catch((error) => {
      logger.error(error);
    });
  }
}

export default ExtendedClient;
