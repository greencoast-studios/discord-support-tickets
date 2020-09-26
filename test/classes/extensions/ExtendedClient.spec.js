import { CommandoClient } from 'discord.js-commando';
import logger from '@greencoast/logger';
import ExtendedClient from '../../../src/classes/extensions/ExtendedClient';
import { guildMock } from '../../../__mocks__/discordMocks';

jest.mock('@greencoast/logger');
jest.mock('discord.js-commando', () => ({
  CommandoClient: jest.fn()
}));

// Have to mock the client here for the time being. Implementing a manual mock in __mocks__ may be a better idea.
const client = new ExtendedClient();
client.user = {
  setPresence: jest.fn(() => Promise.resolve())
};
client.guilds = {
  cache: {
    array: jest.fn(() => [guildMock, guildMock, guildMock]),
    reduce: jest.fn((cb, init) => client.guilds.cache.array().reduce(cb, init))
  }
};
client.provider = {
  get: jest.fn(() => ['one item'])
};

describe('Classes - Extensions - ExtendedClient', () => {
  beforeEach(() => {
    logger.info.mockClear();
    logger.error.mockClear();
  });

  it('should be instance of CommandoClient.', () => {
    expect(client).toBeInstanceOf(CommandoClient);
  });

  describe('updatePresence()', () => {
    it('should return a Promise.', () => {
      expect(client.updatePresence()).toBeInstanceOf(Promise);
    });

    it('should should set the correct presence if client has more other than 1 guild.', () => {
      return client.updatePresence()
        .then(() => {
          const presenceMessage = '3 tickets open across 3 servers!';

          expect(logger.info.mock.calls.length).toBe(1);
          expect(logger.info.mock.calls[0][0]).toBe(`Presence updated to: ${presenceMessage}`);
        });
    });

    it('should should set the correct presence if client has only 1 guild.', () => {
      client.guilds.cache.array.mockReturnValueOnce([guildMock]);

      return client.updatePresence()
        .then(() => {
          const presenceMessage = '3 tickets open!';

          expect(logger.info.mock.calls.length).toBe(1);
          expect(logger.info.mock.calls[0][0]).toBe(`Presence updated to: ${presenceMessage}`);
        });
    });

    it('should log an error when rejected by setPresence().', () => {
      const errorToReject = new Error();
      client.user.setPresence.mockRejectedValueOnce(errorToReject);
      expect.assertions(2);

      return client.updatePresence()
        .then(() => {
          expect(logger.error.mock.calls.length).toBe(1);
          expect(logger.error.mock.calls[0][0]).toBe(errorToReject);
        });
    });
  });
});
