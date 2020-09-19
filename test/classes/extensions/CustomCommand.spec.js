import logger from '@greencoast/logger';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { messageMock } from '../../../__mocks__/discordMocks';

let command;

const loggerInfoMock = jest.spyOn(logger, 'info');

describe('Classes - Extensions - CustomCommand', () => {
  beforeEach(() => {
    messageMock.reply.mockClear();
    loggerInfoMock.mockClear();

    command = new CustomCommand({}, {
      name: 'command',
      group: 'group',
      memberName: 'group',
      description: 'desc'
    });
  });

  describe('onError()', () => {
    it('should call message.reply with the proper message.', () => {
      command.onError(new Error(), messageMock);
      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Something wrong happened when executing this command.');
    });
  });

  describe('run()', () => {
    it('should call logger.info with the proper message.', () => {
      command.run(messageMock);
      expect(loggerInfoMock.mock.calls.length).toBe(1);
      expect(loggerInfoMock.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
    });
  });
});
