export const clientMock = {
  commandPrefix: '$',
  provider: {
    set: jest.fn(),
    get: jest.fn()
  },
  owners: [
    {
      send: jest.fn()
    }
  ]
};

export const guildMock = {
  channels: {
    cache: {
      find: jest.fn()
    }
  },
  roles: {
    cache: {
      find: jest.fn()
    }
  },
  id: '123'
};

export const messageMock = {
  reply: jest.fn(),
  content: 'content',
  member: {
    displayName: 'user'
  },
  guild: guildMock
};

export const channelMock = {
  name: 'name',
  id: '123',
  manageable: true,
  viewable: true
};

export const roleMock = {
  name: 'name',
  id: '123',
  mentionable: true
};
