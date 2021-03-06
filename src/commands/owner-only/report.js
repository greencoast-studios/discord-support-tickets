import logger from '@greencoast/logger';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys } from '../../common/constants';

class ReportCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'report',
      emoji: ':bug:',
      memberName: 'report',
      group: 'owner-only',
      description: 'Enable or disable the reporting of errors to the owner.',
      examples: [`${client.commandPrefix}report enable`, `${client.commandPrefix}report disable`],
      guildOnly: false,
      ownerOnly: true,
      argsType: 'multiple'
    });
  }

  handleEnable(message) {
    const previousValue = this.client.provider.get(message.guild, guildSettingKeys.report);

    if (previousValue) {
      message.reply('Error reporting is already enabled.');
      return;
    }

    this.client.provider.set(message.guild, guildSettingKeys.report, true);
    message.reply('Error reporting is now enabled. Error stacks will be sent to you via DM.');
    logger.info(`Error reporting has been enabled for ${message.guild.name}.`);
  }

  handleDisable(message) {
    const previousValue = this.client.provider.get(message.guild, guildSettingKeys.report);

    if (!previousValue) {
      message.reply('Error reporting is already disabled.');
      return;
    }

    this.client.provider.set(message.guild, guildSettingKeys.report, false);
    message.reply('Error reporting is now disabled. You will not receive error stacks anymore.');
    logger.info(`Error reporting has been disabled for ${message.guild.name}.`);
  }

  run(message, [option]) {
    super.run(message);

    if (option === 'enable') {
      return this.handleEnable(message);
    }

    if (option === 'disable') {
      return this.handleDisable(message);
    }

    message.reply('Invalid argument, please use either: **enable** or **disable**.');
  }
}

export default ReportCommand;
