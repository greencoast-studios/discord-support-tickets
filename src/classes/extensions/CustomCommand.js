/* eslint-disable no-unused-vars */
/* eslint-disable max-params */
import { Command } from 'discord.js-commando';
import logger from '@greencoast/logger';

class CustomCommand extends Command {
  constructor(client, options) {
    super(client, options);
    this.emoji = options.emoji;
  }

  onError(err, message, args, fromPattern, result) {
    this.client.handleError(err, message.guild, `An error occurred when running the command **${this.name}** in **${message.guild.name}**. Triggering message: **${message.content}**`);
    return message.reply('Something wrong happened when executing this command.');
  }

  run(message, args, fromPattern, result) {
    logger.info(`User ${message.member.displayName} executed ${this.name} from ${message.guild.name}.`);
  }
}

export default CustomCommand;
