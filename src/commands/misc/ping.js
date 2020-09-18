import CustomCommand from '../../classes/extensions/CustomCommand';

class PingCommand extends CustomCommand {
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
    throw new Error('Oops!');
  }
}

export default PingCommand;
