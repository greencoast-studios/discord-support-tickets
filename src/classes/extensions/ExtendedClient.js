import { CommandoClient } from 'discord.js-commando';
import { Permissions } from 'discord.js';
import logger from '@greencoast/logger';
import { presenceStatus, activityType, guildSettingKeys, SUPPORT_CHANNEL_PERMISSIONS } from '../../common/constants';

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
      this.handleError(error);
    });
  }

  createSupportChannel(guild, user) {
    return new Promise((resolve, reject) => {
      const staffRoleID = this.provider.get(guild, guildSettingKeys.staffRole, null);
      if (!staffRoleID) {
        reject(new Error('Role does not exist in database.'));
        return;
      }

      const channelCategoryID = this.provider.get(guild, guildSettingKeys.channelCategory, null);
      if (!channelCategoryID) {
        reject(new Error('Channel category does not exist in database.'));
        return;
      }

      const permissions = guild.roles.cache.map((role) => {
        const overwrite = {
          id: role.id,
          type: 'role'
        };

        if (role.id === staffRoleID) {
          overwrite.allow = new Permissions().add(...SUPPORT_CHANNEL_PERMISSIONS);
        } else {
          overwrite.deny = Permissions.ALL;
        }

        return overwrite;
      });
      permissions.push({
        id: user.id,
        type: 'member',
        allow: new Permissions().add(...SUPPORT_CHANNEL_PERMISSIONS)
      }, {
        id: this.user.id,
        type: 'member',
        allow: new Permissions().add(...SUPPORT_CHANNEL_PERMISSIONS)
      });

      guild.channels.create(`ticket-${user.username}`, {
        type: 'text',
        topic: `Support channel for **${user.username}**`,
        parent: channelCategoryID,
        permissionOverwrites: permissions,
        reason: `Support channel for **${user.username}**`
      })
        .then((channel) => {
          resolve({ channel, staffRoleID });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  handleError(error, guild = null, info = null) {
    logger.error(error);

    if (!guild) {
      return;
    }

    if (this.provider.get(guild, guildSettingKeys.report, false)) {
      const messageToOwner = info ? `${info} \`\`\`${error.stack}\`\`\`` : `An error has ocurred: \`\`\`${error.stack}\`\`\``;
      this.owners.forEach((owner) => {
        owner.send(messageToOwner);
      });
    }
  }
}

export default ExtendedClient;
