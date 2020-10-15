import logger from '@greencoast/logger';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { globalSettingKeys } from '../../common/constants';

class PresenceCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'presence',
      emoji: ':robot:',
      memberName: 'presence',
      group: 'owner-only',
      description: "Change the bot's presence message.",
      examples: [`${client.commandPrefix}presence <message>`],
      guildOnly: false,
      ownerOnly: true,
      argsType: 'single'
    });
  }

  handleUpdate(message, updated) {
    this.client.provider.set('global', globalSettingKeys.presence, updated)
      .then(() => {
        message.reply('Presence has been updated!');
        logger.info(`Presence template has been set to: ${updated}`);
        this.client.updatePresence();
      })
      .catch((error) => {
        throw error;
      });
  }

  run(message, updated) {
    super.run(message);

    if (!updated) {
      message.reply('The presence message must not be empty!');
      return;
    }

    this.handleUpdate(message, updated);
  }
}

export default PresenceCommand;
