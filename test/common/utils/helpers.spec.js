import { parseMention, isThisTheDiscordError, serializeChannel, getTemplateAppliedMessage } from '../../../src/common/utils/helpers';
import { messageMock, channelMock } from '../../../__mocks__/discordMocks';
import { discordErrors } from '../../../src/common/constants';

const mentionMock = '<@!123456789>';
const innerStoreFindMock = jest.fn();

describe('Utils - Helpers', () => {
  describe('parseMention()', () => {
    beforeAll(() => {
      messageMock.guild.channels.cache.find.mockImplementation(innerStoreFindMock);
    });

    it('should return null if item was not found in store.', () => {
      innerStoreFindMock.mockImplementation(() => false);
      const result = parseMention(messageMock.guild.channels, mentionMock);
      
      expect(result).toBeNull();
    });

    it('should return an object if item was found in store.', () => {
      innerStoreFindMock.mockImplementation(() => channelMock);
      const result = parseMention(messageMock.guild.channels, mentionMock);
      
      expect(typeof result).toBe('object');
      expect(result).toBe(channelMock);
    });
  });

  describe('isThisTheDiscordError()', () => {
    let error;

    beforeEach(() => {
      error = new Error();
    });

    it('should return a boolean.', () => {
      expect(typeof isThisTheDiscordError(error, discordErrors.unknownMessage)).toBe('boolean');
    });

    it('should return false if error.name does not match expect.name.', () => {
      error.name = 'Whatever Error';
      expect(isThisTheDiscordError(error, discordErrors.unknownMessage)).toBe(false);
    });

    it('should return false if error.message does not match expect.message.', () => {
      error.message = 'Whatever Error Message';
      expect(isThisTheDiscordError(error, discordErrors.unknownMessage)).toBe(false);
    });

    it('should return true if error.name and error.message matches expect.name and expect.message.', () => {
      error.name = discordErrors.unknownMessage.name;
      error.message = discordErrors.unknownMessage.message;
      expect(isThisTheDiscordError(error, discordErrors.unknownMessage)).toBe(true);
    });
  });

  describe('serializeChannel()', () => {
    it('should return a Promise.', () => {
      expect(serializeChannel(channelMock)).toBeInstanceOf(Promise);
    });

    it('should resolve a string.', () => {
      return serializeChannel(channelMock)
        .then((result) => {
          expect(typeof result).toBe('string');
        });
    });

    it('should resolve a correctly formatted string.', () => {
      return serializeChannel(channelMock)
        .then((result) => {
          const lines = result.split('\n');
          expect(lines[0]).toBe('---#########---');
          expect(lines[1]).toBe(`Channel: ${channelMock.name}`);
          expect(lines[2]).toBe(`Channel ID: ${channelMock.id}`);
          expect(lines[3]).toBe(`Category Name: ${channelMock.parent.name}`);
          expect(lines[4]).toBe(`Guild: ${channelMock.guild.name}`);
          // 5 and 6 are skipped because I can't mock Date.toLocaleString :(
          expect(lines[7]).toBe(`Members: ${channelMock.members.map((m) => m.displayName).join(', ')}`);
          expect(lines[8]).toBe('---#########---');
        });
    });
  });

  describe('getTemplateAppliedMessage()', () => {
    const options = {
      tickets: 1,
      guilds: 5
    };

    it('should return a string.', () => {
      expect(typeof getTemplateAppliedMessage('', options) === 'string').toBe(true);
    });

    it('should apply {tickets} to the message.', () => {
      expect(getTemplateAppliedMessage('T:{tickets}-{tickets}', options)).toBe('T:1-1');
    });

    it('should apply {guilds} to the message.', () => {
      expect(getTemplateAppliedMessage('G:{guilds}-{guilds}', options)).toBe('G:5-5');
    });

    it('should apply multiple different templates.', () => {
      expect(getTemplateAppliedMessage('ALL:{guilds}-{tickets}', options)).toBe('ALL:5-1');
    });
  });
});
