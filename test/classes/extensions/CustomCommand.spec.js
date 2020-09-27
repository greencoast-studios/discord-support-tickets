import { Command } from 'discord.js-commando';
import logger from '@greencoast/logger';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';

let command;

jest.mock('@greencoast/logger');

describe('Classes - Extensions - CustomCommand', () => {
  beforeEach(() => {
    messageMock.reply.mockClear();
    logger.info.mockClear();
    clientMock.handleError.mockClear();

    command = new CustomCommand(clientMock, {
      name: 'command',
      group: 'group',
      memberName: 'group',
      description: 'desc'
    });
  });

  it('should be instance of Command.', () => {
    expect(command).toBeInstanceOf(Command);
  });

  describe('onError()', () => {
    it('should call message.reply with the proper message.', () => {
      command.onError(new Error(), messageMock);
      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Something wrong happened when executing this command.');
    });

    it('should call client.handleError with the proper parameters.', () => {
      const error = new Error();
      command.onError(error, messageMock);

      expect(clientMock.handleError.mock.calls.length).toBe(1);
      expect(clientMock.handleError.mock.calls[0][0]).toBe(error);
      expect(clientMock.handleError.mock.calls[0][1]).toBe(messageMock.guild);
      expect(clientMock.handleError.mock.calls[0][2]).toBe(`An error occurred when running the command **${command.name}** in **${messageMock.guild.name}**. Triggering message: **${messageMock.content}**`);
    });
  });

  describe('run()', () => {
    it('should call logger.info with the proper message.', () => {
      command.run(messageMock);
      expect(logger.info.mock.calls.length).toBe(1);
      expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
    });
  });
});
