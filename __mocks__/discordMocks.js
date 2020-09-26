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
    messages: {
      fetch: jest.fn()
    }
  }
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
