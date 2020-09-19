import logger from '@greencoast/logger';
import SetStaffCommand from '../../../src/commands/configuration/setStaff';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock, roleMock } from '../../../__mocks__/discordMocks';
import { guildSettingKeys } from '../../../src/common/constants';

let command;

const loggerInfoMock = jest.spyOn(logger, 'info');

describe('Commands - SetStaff', () => {
  beforeEach(() => {
    messageMock.reply.mockClear();
    loggerInfoMock.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new SetStaffCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock, []);
    expect(loggerInfoMock.mock.calls.length).toBe(1);
    expect(loggerInfoMock.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('Arg: No args', () => {
    beforeEach(() => {
      command = new SetStaffCommand(clientMock);
      command.run(messageMock, []);
    });

    it('should call message.reply once.', () => {
      expect(messageMock.reply.mock.calls.length).toBe(1);
    });

    it('should reply required argument message.', () => {
      expect(messageMock.reply.mock.calls[0][0]).toBe('You need to mention a role along with this command.');
    });
  });

  describe('Arg: First argument exists', () => {
    beforeEach(() => {
      command = new SetStaffCommand(clientMock);
      messageMock.reply.mockClear();
      clientMock.provider.set.mockClear();
    });

    it('should reply with role not found for id that does not exist.', () => {
      messageMock.guild.roles.cache.find.mockImplementation(() => null);
      command.run(messageMock, ['123']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe("I couldn't find the role you specified.");
    });

    it('should reply with role already set if value was already saved.', () => {
      messageMock.guild.roles.cache.find.mockImplementation(() => roleMock);
      clientMock.provider.get.mockImplementation(() => roleMock.id);
      command = new SetStaffCommand(clientMock);
      command.run(messageMock, [roleMock.id]);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('This role has been already set.');
    });

    it('should reply with not enough permissions if role is not mentionable.', () => {
      messageMock.guild.roles.cache.find.mockImplementation(() => (
        { ...roleMock, mentionable: false }
      ));
      clientMock.provider.get.mockImplementation(() => '123123');
      command = new SetStaffCommand(clientMock);
      command.run(messageMock, ['234']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('I am not allowed to ping this role. Please change my permissions to ping it or choose another role.');
    });

    it('should save the role id to the db if a new value was provided.', () => {
      messageMock.guild.roles.cache.find.mockImplementation(() => roleMock);
      clientMock.provider.get.mockImplementation(() => '123123'); // not what roleMock.id has.
      command = new SetStaffCommand(clientMock);
      command.run(messageMock, ['123']); // does not matter what I pass here since the find method is overridden.

      expect(clientMock.provider.set.mock.calls.length).toBe(1);
      expect(clientMock.provider.set.mock.calls[0][0]).toBe(messageMock.guild);
      expect(clientMock.provider.set.mock.calls[0][1]).toBe(guildSettingKeys.staffRole);
      expect(clientMock.provider.set.mock.calls[0][2]).toBe(roleMock.id);
    });

    it('should reply with the role changed message if a new value was provided.', () => {
      messageMock.guild.roles.cache.find.mockImplementation(() => roleMock);
      clientMock.provider.get.mockImplementation(() => '123123');
      command = new SetStaffCommand(clientMock);
      command.run(messageMock, ['234']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe(`I will now ping **${roleMock.name}** when creating the ticket channels.`);
    });
  });
});
