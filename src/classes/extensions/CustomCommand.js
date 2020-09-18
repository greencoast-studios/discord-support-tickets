/* eslint-disable no-unused-vars */
/* eslint-disable max-params */
import { Command } from 'discord.js-commando';

class CustomCommand extends Command {
  onError(err, message, args, fromPattern, result) {
    return message.reply('Something wrong happened when executing this command.');
  }
}

export default CustomCommand;
