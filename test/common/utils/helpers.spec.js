import { parseMention, isThisTheDiscordError } from '../../../src/common/utils/helpers';
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
});
