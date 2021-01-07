import logger from '@greencoast/logger';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys, discordErrors } from '../../common/constants';
import { isThisTheDiscordError, serializeChannel } from '../../common/utils/helpers';
import { saveChannelLog } from '../../common/utils/data';

class FinishCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'finish',
      emoji: ':tada:',
      memberName: 'finish',
      group: 'tickets',
      description: 'Finish the current ticket',
      examples: [`${client.commandPrefix}finish`],
      guildOnly: true
    });
  }

  async handleFinish(message, ticket, currentTickets) {
    const channel = message.guild.channels.cache.find((channel) => channel.id === ticket.channel);
    
    if (!channel) {
      throw new Error('I was supposed to find the ticket channel but I could not.');
    }

    const isLoggingEnabled = this.client.provider.get(message.guild, guildSettingKeys.log, false);
    // We have to serialize the channel before removing, otherwise we lose the data we need.
    const serializedChannel = isLoggingEnabled ? await serializeChannel(channel) : null;

    return channel.delete()
      .then((deleted) => {
        logger.info(`Ticket ${deleted.name} has been finished. Channel removed in ${message.guild.name}.`);
  
        if (serializedChannel) {
          saveChannelLog(serializedChannel, channel)
            .then(() => {
              logger.info(`The log for ${channel.name} from ${channel.guild.name} has been saved.`);
            })
            .catch((error) => {
              this.onError(error, message);
            });
        }

        const newTickets = currentTickets.filter(({ channel }) => channel !== ticket.channel);
        this.client.provider.set(message.guild, guildSettingKeys.currentTickets, newTickets);
        this.client.updatePresence();
      })
      .catch((error) => {
        if (isThisTheDiscordError(error, discordErrors.missingPermissions)) {
          message.reply("I couldn't finish this ticket because I have no permissions to delete this channel.");
          return;
        }

        this.onError(error, message);
      });
  }

  run(message) {
    super.run(message);
    const currentTickets = this.client.provider.get(message.guild, guildSettingKeys.currentTickets, []);
    const ticket = currentTickets.find(({ channel }) => channel === message.channel.id);

    if (!ticket) {
      message.reply('You may only execute this command from a ticket channel.');
      return;
    }

    // Since ticket channel can only be accessed by staff and ticket author, we can assume that this command may be only used by these users.
    return this.handleFinish(message, ticket, currentTickets);
  }
}

export default FinishCommand;
