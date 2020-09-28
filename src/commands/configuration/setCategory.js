import logger from '@greencoast/logger';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys } from '../../common/constants';

class SetCategoryCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'setcategory',
      emoji: ':inbox_tray:',
      memberName: 'setcategory',
      group: 'configuration',
      description: 'Set the category under which the channels will be created.',
      examples: [`${client.commandPrefix}setcategory <channel_id>`],
      guildOnly: true,
      argsType: 'multiple',
      userPermissions: ['MANAGE_CHANNELS']
    });
  }

  updateCategory(message, category) {
    const previousValue = this.client.provider.get(message.guild, guildSettingKeys.channelCategory);

    if (previousValue === category.id) {
      message.reply('This channel category was already set.');
      return;
    }

    if (!category.manageable) {
      message.reply("I don't have the required permissions to manage this channel category. Please change my permissions to access it or use another channel category.");
      return;
    }

    this.client.provider.set(message.guild, guildSettingKeys.channelCategory, category.id);
    message.reply(`The channel category has been changed to **${category.name}**.`);
    logger.info(`Changed channel category for ${message.guild.name} to ${category.name}.`);
  }

  run(message, [categoryID]) {
    super.run(message);
    
    if (!categoryID) {
      message.reply('A channel ID must be provided to this command.');
      return;
    }

    const category = message.guild.channels.cache.find((channel) => channel.id === categoryID);

    if (!category) {
      message.reply("I couldn't find the channel category you specified.");
      return;
    }

    this.updateCategory(message, category);
  }
}

export default SetCategoryCommand;
