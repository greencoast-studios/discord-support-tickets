import logger from '@greencoast/logger';
import FinishCommand from '../../../src/commands/tickets/finish';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock, channelMock } from '../../../__mocks__/discordMocks';
import { guildSettingKeys, discordErrors } from '../../../src/common/constants';

let command;

jest.mock('@greencoast/logger');

describe('Commands - Finish', () => {
  beforeAll(() => {
    clientMock.provider.get.mockReturnValue([]);
  });

  beforeEach(() => {
    messageMock.reply.mockClear();
    logger.info.mockClear();
    clientMock.provider.get.mockClear();
    clientMock.provider.set.mockClear();
    clientMock.updatePresence.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new FinishCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock);
    expect(logger.info.mock.calls.length).toBe(1);
    expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  it('should reply with a message if message is not executed in ticket channel.', () => {
    command.run(messageMock);
    expect(messageMock.reply.mock.calls.length).toBe(1);
    expect(messageMock.reply.mock.calls[0][0]).toBe('You may only execute this command from a ticket channel.');
  });

  describe('Executed in ticket channel', () => {
    beforeAll(() => {
      clientMock.provider.get.mockReturnValue([
        { channel: messageMock.channel.id }
      ]);
      messageMock.guild.channels.cache.find.mockReturnValue(channelMock);
    });

    it('should throw if no channel was found in handleFinish.', () => {
      messageMock.guild.channels.cache.find.mockReturnValueOnce(null);
      expect(() => command.run(messageMock)).toThrowError(new Error('I was supposed to find the ticket channel but I could not.'));
    });

    it('should return a Promise if all is good.', () => {
      expect(command.run(messageMock)).toBeInstanceOf(Promise);
    });

    it('should log that the channel was deleted.', () => {
      return command.run(messageMock)
        .then(() => {
          expect(logger.info.mock.calls.length).toBe(2);
          expect(logger.info.mock.calls[1][0]).toBe(`Ticket ${channelMock.name} has been finished. Channel removed in ${messageMock.guild.name}.`);
        });
    });

    it('should remove the ticket from the database.', () => {
      clientMock.provider.get.mockReturnValueOnce([{ channel: 'other channel' }, { channel: messageMock.channel.id }]);

      return command.run(messageMock)
        .then(() => {
          expect(clientMock.provider.set.mock.calls.length).toBe(1);
          expect(clientMock.provider.set.mock.calls[0][0]).toBe(messageMock.guild);
          expect(clientMock.provider.set.mock.calls[0][1]).toBe(guildSettingKeys.currentTickets);
          expect(clientMock.provider.set.mock.calls[0][2]).toStrictEqual([{ channel: 'other channel' }]);
        });
    });

    it('should update the bot presence.', () => {
      return command.run(messageMock)
        .then(() => {
          expect(clientMock.updatePresence.mock.calls.length).toBe(1);
        });
    });

    it('should reply if bot has no permissions to delete channel.', () => {
      const rejectedError = new Error(discordErrors.missingPermissions.message);
      rejectedError.name = discordErrors.missingPermissions.name;
      channelMock.delete.mockRejectedValueOnce(rejectedError);

      return command.run(messageMock)
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe("I couldn't finish this ticket because I have no permissions to delete this channel.");
        });
    });

    it('should reply with onError reply if it rejects with any other error.', () => {
      const rejectedError = new Error('any other error');
      channelMock.delete.mockRejectedValueOnce(rejectedError);

      return command.run(messageMock)
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('Something wrong happened when executing this command.');
        });
    });
  });
});
