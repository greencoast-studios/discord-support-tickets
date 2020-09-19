import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys } from '../../common/constants';

class SetCategoryCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'setcategory',
      memberName: 'setcategory',
      group: 'configuration',
      description: 'Set the category under which the channels will be created.',
      examples: [`${client.commandPrefix}setcategory <channel_id>`],
      guildOnly: true,
      argsType: 'multiple'
    });
  }

  updateCategory(message, category) {
    const previousValue = this.client.provider.get(message.guild, guildSettingKeys.channelCategory);

    if (previousValue === category.id) {
      message.reply('This channel category was already set.');
      return;
    }

    this.client.provider.set(message.guild, guildSettingKeys.channelCategory, category.id);
    message.reply(`The channel category has been changed to ${category.name}.`);
  }

  run(message, [categoryID]) {
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
