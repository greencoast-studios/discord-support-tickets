export const commandMock = {
  name: 'command',
  description: 'description'
};

export const commandGroupMock = {
  name: 'group name',
  commands: [commandMock, commandMock]
};

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
  ],
  handleError: jest.fn(),
  updatePresence: jest.fn(),
  registry: {
    groups: [commandGroupMock, commandGroupMock]
  }
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

export const memberMock = {
  displayName: 'member name'
};

export const messageMock = {
  reply: jest.fn(),
  id: '123',
  content: 'content',
  member: memberMock,
  guild: guildMock,
  say: jest.fn(),
  channel: {
    id: '345',
    messages: {
      fetch: jest.fn()
    }
  },
  react: jest.fn(() => Promise.resolve()),
  embed: jest.fn(),
  createdAt: new Date(1601255082895) // "9/27/2020, 8:04:42 PM"
};

export const channelMock = {
  name: 'name',
  id: '123',
  manageable: true,
  viewable: true,
  delete: jest.fn(() => Promise.resolve(channelMock)),
  messages: {
    fetch: jest.fn(() => Promise.resolve({
      array: () => [messageMock, messageMock, messageMock]
    }))
  },
  parent: {
    name: 'parent name'
  },
  guild: guildMock,
  createdAt: new Date(1601255082895), // "9/27/2020, 8:04:42 PM"
  members: [memberMock, memberMock]
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
