import logger from '@greencoast/logger';
import FinishCommand from '../../../src/commands/tickets/finish';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock, channelMock } from '../../../__mocks__/discordMocks';
import { guildSettingKeys, discordErrors } from '../../../src/common/constants';
import { serializeChannel } from '../../../src/common/utils/helpers';
import { saveChannelLog } from '../../../src/common/utils/data';

let command;

jest.mock('@greencoast/logger');
jest.mock('../../../src/common/utils/helpers', () => {
  return {
    ...jest.requireActual('../../../src/common/utils/helpers'),
    serializeChannel: jest.fn()
  };
});
jest.mock('../../../src/common/utils/data', () => {
  return {
    ...jest.requireActual('../../../src/common/utils/data'),
    saveChannelLog: jest.fn()
  };
});

describe('Commands - Finish', () => {
  beforeAll(() => {
    clientMock.provider.get.mockReturnValue([]);
    command = new FinishCommand(clientMock);
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
      clientMock.provider.get.mockImplementation((guild, key) => {
        if (key === guildSettingKeys.currentTickets) {
          return [
            { channel: messageMock.channel.id }
          ];
        }
        if (key === guildSettingKeys.log) {
          return true;
        }

        return null;
      });
      messageMock.guild.channels.cache.find.mockReturnValue(channelMock);
      serializeChannel.mockResolvedValue('message content');
      saveChannelLog.mockResolvedValue();
    });
    
    beforeEach(() => {
      saveChannelLog.mockClear();
      serializeChannel.mockClear();
    });

    it('should reject if no channel was found in handleFinish.', () => {
      messageMock.guild.channels.cache.find.mockReturnValueOnce(null);
      expect.assertions(1);

      return command.run(messageMock)
        .catch((error) => {
          expect(error.message).toBe('I was supposed to find the ticket channel but I could not.');
        });
    });

    it('should reject if serializeChannel rejects.', () => {
      const expectedError = new Error('serialization error');
      serializeChannel.mockRejectedValueOnce(expectedError);

      return command.run(messageMock)
        .catch((rejected) => {
          expect(rejected).toBe(expectedError);
        });
    });

    it('should return a Promise if all is good.', () => {
      expect(command.run(messageMock)).toBeInstanceOf(Promise);
    });

    it('should not serialize channel or save channel log if logging was disabled.', () => {
      const mockedImplementation = (guild, key) => {
        if (key === guildSettingKeys.currentTickets) {
          return [
            { channel: messageMock.channel.id }
          ];
        }
        if (key === guildSettingKeys.log) {
          return false;
        }

        return null;
      };
      // Twice since it gets executed 2 times per command run.
      clientMock.provider.get.mockImplementationOnce(mockedImplementation);
      clientMock.provider.get.mockImplementationOnce(mockedImplementation);

      return command.run(messageMock)
        .then(() => {
          expect(saveChannelLog.mock.calls.length).toBe(0);
          expect(serializeChannel.mock.calls.length).toBe(0);
        });
    });

    it('should log that the channel was deleted.', () => {
      return command.run(messageMock)
        .then(() => {
          expect(logger.info.mock.calls.length).toBe(3);
          expect(logger.info.mock.calls[1][0]).toBe(`Ticket ${channelMock.name} has been finished. Channel removed in ${messageMock.guild.name}.`);
        });
    });

    it('should log that the channel log was saved if successful.', () => {
      return command.run(messageMock)
        .then(() => {
          expect(logger.info.mock.calls.length).toBe(3);
          expect(logger.info.mock.calls[2][0]).toBe(`The log for ${channelMock.name} from ${channelMock.guild.name} has been saved.`);
        });
    });

    it('should reply something wrong happened if the channel save hit an error.', () => {
      saveChannelLog.mockRejectedValueOnce();

      return command.run(messageMock)
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('Something wrong happened when executing this command.');
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
