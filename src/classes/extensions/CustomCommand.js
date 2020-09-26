/* eslint-disable no-unused-vars */
/* eslint-disable max-params */
import { Command } from 'discord.js-commando';
import logger from '@greencoast/logger';
import { guildSettingKeys } from '../../common/constants';

class CustomCommand extends Command {
  onError(err, message, args, fromPattern, result) {
    logger.error(err);

    if (this.client.provider.get(message.guild, guildSettingKeys.report, false)) {
      this.client.owners.forEach((owner) => {
        owner.send(`An error occurred when running the command **${this.name}** in **${message.guild.name}**. Triggering message: **${message.content}** \`\`\`${err.stack}\`\`\``);
      });
    }

    return message.reply('Something wrong happened when executing this command.');
  }

  run(message, args, fromPattern, result) {
    logger.info(`User ${message.member.displayName} executed ${this.name} from ${message.guild.name}.`);
  }
}

export default CustomCommand;
