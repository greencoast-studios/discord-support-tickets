export const clientMock = {
  commandPrefix: '$',
  provider: {
    set: jest.fn(),
    get: jest.fn()
  }
};

export const messageMock = {
  reply: jest.fn(),
  guild: {
    channels: {
      cache: {
        find: jest.fn()
      }
    }
  }
};

export const channelMock = {
  name: 'name',
  id: 123,
  manageable: true,
  viewable: true
};