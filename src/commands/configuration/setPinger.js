import logger from '@greencoast/logger';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys } from '../../common/constants';

class SetPingerCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'setpinger',
      emoji: ':pushpin:',
      memberName: 'setpinger',
      group: 'configuration',
      description: 'Set the pinging message template for whenever a ticket channel is created.',
      examples: [`${client.commandPrefix}setpinger <message>`],
      guildOnly: true,
      argsType: 'single',
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  handleUpdate(message, updated) {
    return this.client.provider.set(message.guild, guildSettingKeys.pingerMessage, updated)
      .then(() => {
        message.reply('Pinger message has been updated!');
        logger.info(`Pinger message for ${message.guild.name} has been set to: ${updated}`);
      })
      .catch((error) => {
        this.onError(error, message);
      });
  }

  run(message, updated) {
    super.run(message);

    if (!updated) {
      message.reply('The pinger message must not be empty!');
      return;
    }

    return this.handleUpdate(message, updated);
  }
}

export default SetPingerCommand;
