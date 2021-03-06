import logger from '@greencoast/logger';
import ReportCommand from '../../../src/commands/owner-only/report';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';

let command;

jest.mock('@greencoast/logger');

describe('Commands - Report', () => {
  beforeEach(() => {
    messageMock.reply.mockClear();
    clientMock.provider.get.mockClear();
    clientMock.provider.set.mockClear();
    logger.info.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new ReportCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock, []);
    expect(logger.info.mock.calls.length).toBe(1);
    expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('Arg: No args', () => {
    beforeEach(() => {
      command = new ReportCommand(clientMock);
      command.run(messageMock, []);
    });

    it('should call message.reply once.', () => {
      expect(messageMock.reply.mock.calls.length).toBe(1);
    });

    it('should reply with the invalid argument message.', () => {
      expect(messageMock.reply.mock.calls[0][0]).toBe('Invalid argument, please use either: **enable** or **disable**.');
    });
  });

  describe('Arg: enable', () => {
    it('should reply with the already enabled message if already enabled.', () => {
      clientMock.provider.get.mockImplementation(() => true);
      command = new ReportCommand(clientMock);
      command.run(messageMock, ['enable']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Error reporting is already enabled.');
    });

    it('should set the log setting to true.', () => {
      clientMock.provider.get.mockImplementation(() => false);
      command = new ReportCommand(clientMock);
      command.run(messageMock, ['enable']);
      
      expect(clientMock.provider.set.mock.calls.length).toBe(1);
      expect(clientMock.provider.set.mock.calls[0][2]).toBe(true);
    });

    it('should reply with the enabled message if enabled.', () => {
      clientMock.provider.get.mockImplementation(() => false);
      command = new ReportCommand(clientMock);
      command.run(messageMock, ['enable']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Error reporting is now enabled. Error stacks will be sent to you via DM.');
    });
  });

  describe('Arg: disable', () => {
    it('should reply with the already disabled message if already disabled.', () => {
      clientMock.provider.get.mockImplementation(() => false);
      command = new ReportCommand(clientMock);
      command.run(messageMock, ['disable']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Error reporting is already disabled.');
    });

    it('should set the log setting to false.', () => {
      clientMock.provider.get.mockImplementation(() => true);
      command = new ReportCommand(clientMock);
      command.run(messageMock, ['disable']);

      expect(clientMock.provider.set.mock.calls.length).toBe(1);
      expect(clientMock.provider.set.mock.calls[0][2]).toBe(false);
    });

    it('should reply with the disabled message if disabled.', () => {
      clientMock.provider.get.mockImplementation(() => true);
      command = new ReportCommand(clientMock);
      command.run(messageMock, ['disable']);
      
      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Error reporting is now disabled. You will not receive error stacks anymore.');
    });
  });
});
