import logger from '@greencoast/logger';
import SetMessageCommand from '../../../src/commands/configuration/setMessage';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';
import { discordErrors, guildSettingKeys } from '../../../src/common/constants';

let command;

jest.mock('@greencoast/logger');

describe('Commands - SetMessage', () => {
  beforeEach(() => {
    messageMock.reply.mockClear();
    logger.info.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new SetMessageCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock, []);
    expect(logger.info.mock.calls.length).toBe(1);
    expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('Arg: No args', () => {
    beforeEach(() => {
      command = new SetMessageCommand(clientMock);
      command.run(messageMock, []);
    });

    it('should call message.reply once.', () => {
      expect(messageMock.reply.mock.calls.length).toBe(1);
    });

    it('should reply required argument message.', () => {
      expect(messageMock.reply.mock.calls[0][0]).toBe('A message ID must be provided to this command.');
    });
  });

  describe('Arg: First argument exists', () => {
    describe('Valid message ID', () => {
      beforeEach(() => {
        messageMock.channel.messages.fetch.mockClear();
        messageMock.channel.messages.fetch.mockResolvedValue(messageMock);
        command = new SetMessageCommand(clientMock);
      });

      it('should reply with message already set if value was already saved.', () => {
        clientMock.provider.get.mockImplementation(() => ({ message: messageMock.id }));
        return command.run(messageMock, [messageMock.id])
          .then(() => {
            expect(messageMock.reply.mock.calls.length).toBe(1);
            expect(messageMock.reply.mock.calls[0][0]).toBe('This message is already the ticket message.');
          });
      });

      it('should save the channel and message id to the db if a new value was provided.', () => {
        clientMock.provider.get.mockImplementation(() => 'old id');
        return command.run(messageMock, [messageMock.id])
          .then(() => {
            expect(clientMock.provider.set.mock.calls.length).toBe(1);
            expect(clientMock.provider.set.mock.calls[0][0]).toBe(messageMock.guild);
            expect(clientMock.provider.set.mock.calls[0][1]).toBe(guildSettingKeys.ticketMessage);
            expect(clientMock.provider.set.mock.calls[0][2]).toStrictEqual({
              channel: messageMock.channel.id, message: messageMock.id
            });
          });
      });

      it('should reply with the message changed message if a new value was provided.', () => {
        clientMock.provider.get.mockImplementation(() => ({ channel: 'old id', message: 'old id' }));
        return command.run(messageMock, [messageMock.id])
          .then(() => {
            expect(messageMock.reply.mock.calls.length).toBe(1);
            expect(messageMock.reply.mock.calls[0][0]).toBe('The ticket message has been updated.');
          });
      });
    });

    describe('Invalid message ID', () => {
      let error;

      beforeEach(() => {
        error = new Error();
        error.name = discordErrors.unknownMessage.name;
        error.message = discordErrors.unknownMessage.message;

        messageMock.channel.messages.fetch.mockClear();
        logger.error.mockClear();
        clientMock.handleError.mockClear();
        messageMock.channel.messages.fetch.mockRejectedValue(error);
        command = new SetMessageCommand(clientMock);
      });

      it('should reply with message not found if rejected is unknown channel discord error.', () => {
        expect.assertions(2);
        return command.run(messageMock, [messageMock.id])
          .then(() => {
            expect(messageMock.reply.mock.calls.length).toBe(1);
            expect(messageMock.reply.mock.calls[0][0]).toBe("I couldn't find the message you specified. Make sure you're running this command from the same channel the message is in.");
          });
      });

      it('should errorLog with error if the rejected error was not unknown channel discord error.', () => {
        error.name = 'Unknown Error';
        clientMock.handleError.mockImplementationOnce((error) => logger.error(error));
        expect.assertions(2);
        return command.run(messageMock, [messageMock.id])
          .then(() => {
            expect(logger.error.mock.calls.length).toBe(1);
            expect(logger.error.mock.calls[0][0]).toBe(error);
          });
      });
    });
  });
});
