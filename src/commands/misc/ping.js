import { Command } from 'discord.js-commando';

class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      memberName: 'ping',
      group: 'misc',
      description: 'Responds with Pong.',
      examples: [`${client.commandPrefix}ping`],
      guildOnly: true,
      argsType: 'multiple'
    });
  }

  run(message, args) {
    message.reply(`Pong! - ${args[0]}`);
  }
}

export default PingCommand;
