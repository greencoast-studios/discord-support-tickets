import { CommandoClient } from 'discord.js-commando';
import { Permissions } from 'discord.js';
import logger from '@greencoast/logger';
import ExtendedClient from '../../../src/classes/extensions/ExtendedClient';
import { guildMock, userMock, channelMock } from '../../../__mocks__/discordMocks';
import { guildSettingKeys, SUPPORT_CHANNEL_PERMISSIONS } from '../../../src/common/constants';

jest.mock('@greencoast/logger');
jest.mock('discord.js-commando', () => ({
  CommandoClient: jest.fn()
}));

// Have to mock the client here for the time being. Implementing a manual mock in __mocks__ may be a better idea.
const client = new ExtendedClient();
client.user = {
  setPresence: jest.fn(() => Promise.resolve()),
  id: '472'
};
client.guilds = {
  cache: {
    array: jest.fn(() => [guildMock, guildMock, guildMock]),
    reduce: jest.fn((cb, init) => client.guilds.cache.array().reduce(cb, init))
  }
};
client.provider = {
  get: jest.fn()
};
client.owners = [
  {
    send: jest.fn()
  },
  {
    send: jest.fn()
  }
];

describe('Classes - Extensions - ExtendedClient', () => {
  beforeEach(() => {
    logger.info.mockClear();
    logger.error.mockClear();
  });

  it('should be instance of CommandoClient.', () => {
    expect(client).toBeInstanceOf(CommandoClient);
  });

  describe('updatePresence()', () => {
    beforeAll(() => {
      client.provider.get.mockReturnValue(['one item']);
    });

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

  describe('createSupportChannel()', () => {
    const staffID = '132456789';
    beforeAll(() => {
      client.provider.get.mockReturnValue(staffID);
      guildMock.channels.create.mockResolvedValue();
      guildMock.roles.cache.map.mockReturnValue([]);
    });

    beforeEach(() => {
      guildMock.channels.create.mockClear();
      guildMock.roles.cache.map.mockClear();
    });

    it('should return a Promise.', () => {
      expect(client.createSupportChannel(guildMock, userMock)).toBeInstanceOf(Promise);
    });

    it('should reject if no staff role is saved in database.', () => {
      client.provider.get.mockImplementationOnce(() => null);
      expect.assertions(1);

      return client.createSupportChannel(guildMock, userMock)
        .catch((error) => {
          expect(error.message).toBe('Role does not exist in database.');
        });
    });

    it('should reject if no channel category is saved in database.', () => {
      client.provider.get.mockImplementation((_, key) => {
        return key === guildSettingKeys.channelCategory ? null : true;
      });
      expect.assertions(1);

      return client.createSupportChannel(guildMock, userMock)
        .catch((error) => {
          expect(error.message).toBe('Channel category does not exist in database.');
        });
    });

    it('should resolve the newly created channel.', () => {
      client.provider.get.mockReturnValue(staffID);
      guildMock.channels.create.mockResolvedValueOnce(channelMock);

      return client.createSupportChannel(guildMock, userMock)
        .then(({ channel, staffRoleID }) => {
          expect(channel).toBe(channelMock);
          expect(staffRoleID).toBe(staffID);
        });
    });

    it('should resolve the channel with the correct name and parent.', () => {
      client.provider.get.mockReturnValue(staffID);
      guildMock.channels.create.mockImplementationOnce((name, options) => {
        return Promise.resolve({
          name,
          parent: options.parent
        });
      });

      return client.createSupportChannel(guildMock, userMock)
        .then(({ channel }) => {
          expect(channel.name).toBe(`ticket-${userMock.username}`);
          expect(channel.parent).toBe(staffID);
        });
    });

    it('should call guild.channels.create with the proper permissions.', () => {
      client.provider.get.mockReturnValue(staffID);
      guildMock.channels.create.mockResolvedValueOnce();
      guildMock.roles.cache.map.mockImplementation((cb) => {
        return [{ id: '666' }, { id: staffID }].map(cb);
      });

      return client.createSupportChannel(guildMock, userMock)
        .then(() => {
          const expectedPermissions = [{
            deny: Permissions.ALL,
            id: '666',
            type: 'role'
          }, {
            allow: new Permissions().add(...SUPPORT_CHANNEL_PERMISSIONS),
            id: staffID,
            type: 'role'
          }, {
            type: 'member',
            id: userMock.id,
            allow: new Permissions().add(...SUPPORT_CHANNEL_PERMISSIONS)
          }, {
            type: 'member',
            id: client.user.id,
            allow: new Permissions().add(...SUPPORT_CHANNEL_PERMISSIONS, 'MANAGE_CHANNELS')
          }];
          expect(guildMock.channels.create.mock.calls[0][1].permissionOverwrites).toStrictEqual(expectedPermissions);
        });
    });

    it('should reject if the channel creation rejected.', () => {
      const rejectedError = new Error();
      client.provider.get.mockReturnValue(staffID);
      guildMock.channels.create.mockRejectedValueOnce(rejectedError);
      expect.assertions(1);

      return client.createSupportChannel(guildMock, userMock)
        .catch((error) => {
          expect(error).toBe(rejectedError);
        });
    });
  });

  describe('handleError()', () => {
    beforeEach(() => {
      client.provider.get.mockClear();
      client.owners.forEach((owner) => {
        owner.send.mockClear();
      });
    });

    it('should log the error.', () => {
      const expectedError = new Error();
      client.handleError(expectedError);
      expect(logger.error.mock.calls.length).toBe(1);
      expect(logger.error.mock.calls[0][0]).toBe(expectedError);
    });

    it('should not call provider.get if no guild was specified.', () => {
      client.handleError(new Error());
      expect(client.provider.get.mock.calls.length).toBe(0);
    });

    it('should not call owners.send if reporting was disabled.', () => {
      client.provider.get.mockReturnValueOnce(false);
      client.handleError(new Error(), guildMock);
      client.owners.forEach((owner) => {
        expect(owner.send.mock.calls.length).toBe(0);
      });
    });

    it('should call owners.send once per owner if reporting was enabled.', () => {
      client.provider.get.mockReturnValueOnce(true);
      client.handleError(new Error(), guildMock);
      client.owners.forEach((owner) => {
        expect(owner.send.mock.calls.length).toBe(1);
      });
    });

    it('should send the message with info prepended if provided.', () => {
      const info = 'This is the information of the error';
      client.provider.get.mockReturnValueOnce(true);
      client.handleError(new Error(), guildMock, info);
      client.owners.forEach((owner) => {
        expect(owner.send.mock.calls[0][0].startsWith(info)).toBe(true);
      });
    });

    it('should send the generic message if info was not provided.', () => {
      client.provider.get.mockReturnValueOnce(true);
      client.handleError(new Error(), guildMock);
      client.owners.forEach((owner) => {
        expect(owner.send.mock.calls[0][0].startsWith('An error has ocurred:')).toBe(true);
      });
    });
  });
});
