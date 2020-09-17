import { Command } from 'discord.js-commando';

class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      memberName: 'ping',
      group: 'misc',
      description: 'Responds with Pong.',
      examples: [`${client.commandPrefix}ping`],
      guildOnly: true
    });
  }

  run(message) {
    message.reply('Pong!');
  }
}

export default PingCommand;
