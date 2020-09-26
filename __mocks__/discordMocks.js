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
    },
    create: jest.fn(() => Promise.resolve)
  },
  roles: {
    cache: {
      find: jest.fn(),
      map: jest.fn()
    }
  },
  id: '123',
  name: 'guildName'
};

export const messageMock = {
  reply: jest.fn(),
  id: '123',
  content: 'content',
  member: {
    displayName: 'user'
  },
  guild: guildMock,
  say: jest.fn(),
  channel: {
    id: '345',
    messages: {
      fetch: jest.fn()
    }
  },
  react: jest.fn(() => Promise.resolve())
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

export const userMock = {
  id: '123',
  username: 'user'
};
