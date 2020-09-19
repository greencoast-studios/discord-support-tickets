import { parseMention } from '../../../src/common/utils/helpers';
import { messageMock, channelMock } from '../../../__mocks__/discordMocks';

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
});
