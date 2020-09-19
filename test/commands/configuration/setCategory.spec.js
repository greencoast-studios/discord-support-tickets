import SetCategoryCommand from '../../../src/commands/configuration/setCategory';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock, channelMock } from '../../../__mocks__/discordMocks';
import { guildSettingKeys } from '../../../src/common/constants';

let command;

describe('Commands - SetCategory', () => {
  afterAll(() => {
    messageMock.reply.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new SetCategoryCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  describe('Arg: No args', () => {
    beforeEach(() => {
      command = new SetCategoryCommand(clientMock);
      command.run(messageMock, []);
    });

    it('should call message.reply once.', () => {
      expect(messageMock.reply.mock.calls.length).toBe(1);
    });

    it('should reply required argument message.', () => {
      expect(messageMock.reply.mock.calls[0][0]).toBe('A channel ID must be provided to this command.');
    });
  });

  describe('Arg: First argument exists', () => {
    beforeEach(() => {
      command = new SetCategoryCommand(clientMock);
      messageMock.reply.mockClear();
      clientMock.provider.set.mockClear();
    });

    it('should reply with category not found for id that does not exist.', () => {
      messageMock.guild.channels.cache.find.mockImplementation(() => null);
      command.run(messageMock, [123]);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe("I couldn't find the channel category you specified.");
    });

    it('should reply with category already set if value was already saved.', () => {
      messageMock.guild.channels.cache.find.mockImplementation(() => channelMock);
      clientMock.provider.get.mockImplementation(() => channelMock.id);
      command = new SetCategoryCommand(clientMock);
      command.run(messageMock, [channelMock.id]);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('This channel category was already set.');
    });

    it('should reply with not enough permissions if category is not manageable.', () => {
      messageMock.guild.channels.cache.find.mockImplementation(() => (
        { ...channelMock, manageable: false }
      ));
      clientMock.provider.get.mockImplementation(() => 123123);
      command = new SetCategoryCommand(clientMock);
      command.run(messageMock, [234]);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe("I don't have the required permissions to manage this channel category. Please change my permissions to access it or use another channel category.");
    });

    it('should save the category id to the db if a new value was provided.', () => {
      messageMock.guild.channels.cache.find.mockImplementation(() => channelMock);
      clientMock.provider.get.mockImplementation(() => 123123); // not what channelMock.id has.
      command = new SetCategoryCommand(clientMock);
      command.run(messageMock, [123]); // does not matter what I pass here since the find method is overridden.

      expect(clientMock.provider.set.mock.calls.length).toBe(1);
      expect(clientMock.provider.set.mock.calls[0][0]).toBe(messageMock.guild);
      expect(clientMock.provider.set.mock.calls[0][1]).toBe(guildSettingKeys.channelCategory);
      expect(clientMock.provider.set.mock.calls[0][2]).toBe(channelMock.id);
    });

    it('should reply with the category changed message if a new value was provided.', () => {
      messageMock.guild.channels.cache.find.mockImplementation(() => channelMock);
      clientMock.provider.get.mockImplementation(() => 123123);
      command = new SetCategoryCommand(clientMock);
      command.run(messageMock, [234]);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe(`The channel category has been changed to **${channelMock.name}**.`);
    });
  });
});
