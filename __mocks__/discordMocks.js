export const clientMock = {
  commandPrefix: '$',
  provider: {
    set: jest.fn(),
    get: jest.fn()
  }
};

export const messageMock = {
  reply: jest.fn(),
  guild: 'guild'
};
