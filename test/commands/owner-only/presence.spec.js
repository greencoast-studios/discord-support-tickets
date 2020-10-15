import logger from '@greencoast/logger';
import PresenceCommand from '../../../src/commands/owner-only/presence';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';
import { globalSettingKeys } from '../../../src/common/constants';

let command;

jest.mock('@greencoast/logger');

describe('Commands - Presence', () => {
  beforeEach(() => {
    logger.info.mockClear();
    logger.error.mockClear();
    messageMock.reply.mockClear();
    clientMock.provider.set.mockClear();
    clientMock.provider.set.mockResolvedValue();
    clientMock.handleError.mockClear();
    clientMock.updatePresence.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new PresenceCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock, []);
    expect(logger.info.mock.calls.length).toBe(1);
    expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('Arg: No args', () => {
    beforeEach(() => {
      command = new PresenceCommand(clientMock);
      command.run(messageMock, '');
    });

    it('should call message.reply once.', () => {
      expect(messageMock.reply.mock.calls.length).toBe(1);
    });

    it('should reply with the invalid argument message.', () => {
      expect(messageMock.reply.mock.calls[0][0]).toBe('The presence message must not be empty!');
    });
  });

  describe('Arg: Valid message', () => {
    beforeAll(() => {
      command = new PresenceCommand(clientMock);
    });

    it('should call provider.set with the correct arguments.', () => {
      command.run(messageMock, 'message');
      expect(clientMock.provider.set.mock.calls.length).toBe(1);
      expect(clientMock.provider.set.mock.calls[0][0]).toBe('global');
      expect(clientMock.provider.set.mock.calls[0][1]).toBe(globalSettingKeys.presence);
      expect(clientMock.provider.set.mock.calls[0][2]).toBe('message');
    });

    it('should handle error if provider.set rejects.', () => {
      const error = new Error('oops');
      clientMock.provider.set.mockRejectedValueOnce(error);
      clientMock.handleError.mockImplementationOnce((error) => logger.error(error));
      expect.assertions(4);

      return command.run(messageMock, 'message')
        .then(() => {
          expect(logger.error.mock.calls.length).toBe(1);
          expect(logger.error.mock.calls[0][0]).toBe(error);
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('Something wrong happened when executing this command.');
        });
    });

    it('should reply and log when presence has been updated.', () => {
      return command.run(messageMock, 'message')
        .then(() => {
          expect(logger.info.mock.calls.length).toBe(2);
          expect(logger.info.mock.calls[1][0]).toBe('Presence template has been set to: message');
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('Presence has been updated!');
        });
    });

    it('should trigger a presence update.', () => {
      return command.run(messageMock, 'message')
        .then(() => {
          expect(clientMock.updatePresence.mock.calls.length).toBe(1);
        });
    });
  });
});
