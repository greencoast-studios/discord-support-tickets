import CustomCommand from '../../classes/extensions/CustomCommand';
import { guildSettingKeys } from '../../common/constants';
import { parseMention } from '../../common/utils/helpers';

class SetStaffCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'setstaff',
      memberName: 'setstaff',
      group: 'configuration',
      description: 'Set the staff role that will be pinged when starting a ticket.',
      examples: [`${client.commandPrefix}setstaff <staff_mention>`],
      guildOnly: true,
      argsType: 'multiple'
    });
  }

  updateRole(message, role) {
    const previousValue = this.client.provider.get(message.guild, guildSettingKeys.staffRole);

    if (previousValue === role.id) {
      message.reply('This role has been already set.');
      return;
    }

    if (!role.mentionable) {
      message.reply('I am not allowed to ping this role. Please change my permissions to ping it or choose another role.');
      return;
    }

    this.client.provider.set(message.guild, guildSettingKeys.staffRole, role.id);
    message.reply(`I will now ping **${role.name}** when creating the ticket channels.`);
  }

  run(message, [roleMention]) {
    if (!roleMention) {
      message.reply('You need to mention a role along with this command.');
      return;
    }

    const role = parseMention(message.guild.roles, roleMention);
    
    if (!role) {
      message.reply("I couldn't find the role you specified.");
      return;
    }

    this.updateRole(message, role);
  }
}

export default SetStaffCommand;
