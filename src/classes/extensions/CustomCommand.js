/* eslint-disable no-unused-vars */
/* eslint-disable max-params */
import { Command } from 'discord.js-commando';
import logger from '@greencoast/logger';

class CustomCommand extends Command {
  onError(err, message, args, fromPattern, result) {
    return message.reply('Something wrong happened when executing this command.');
  }

  run(message, args, fromPattern, result) {
    logger.info(`User ${message.member.displayName} executed ${this.name} from ${message.guild.name}.`);
  }
}

export default CustomCommand;
