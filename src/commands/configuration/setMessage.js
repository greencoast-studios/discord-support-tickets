import logger from '@greencoast/logger';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys, discordErrors, SUPPORT_EMOJI } from '../../common/constants';
import { isThisTheDiscordError } from '../../common/utils/helpers';

class SetMessageCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'setmessage',
      emoji: ':loudspeaker:',
      memberName: 'setmessage',
      group: 'configuration',
      description: 'Set the message that will be used to handle ticket creation.',
      examples: [`${client.commandPrefix}setmessage <message_id>`],
      guildOnly: true,
      argsType: 'multiple',
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  updateMessage(message, newMessage) {
    const previousValue = this.client.provider.get(message.guild, guildSettingKeys.ticketMessage);

    if (previousValue?.message === newMessage.id) {
      message.reply('This message is already the ticket message.');
      return;
    }

    const newTicket = { channel: newMessage.channel.id, message: newMessage.id };
    this.client.provider.set(message.guild, guildSettingKeys.ticketMessage, newTicket);
    newMessage.react(SUPPORT_EMOJI)
      .catch((error) => {
        this.onError(error, message);
      });
    message.reply('The ticket message has been updated.');
    logger.info(`Changed ticket message for ${message.guild.name}.`);
  }

  run(message, [messageID]) {
    super.run(message);

    if (!messageID) {
      message.reply('A message ID must be provided to this command.');
      return;
    }

    return message.channel.messages.fetch(messageID)
      .then((fetchedMessage) => {
        this.updateMessage(message, fetchedMessage);
      })
      .catch((error) => {
        if (isThisTheDiscordError(error, discordErrors.unknownMessage)) {
          message.reply("I couldn't find the message you specified. Make sure you're running this command from the same channel the message is in.");
          return;
        }
        this.onError(error, message);
      });
  }
}

export default SetMessageCommand;
