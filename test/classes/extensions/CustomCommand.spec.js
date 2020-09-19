import CustomCommand from '../../../src/classes/extensions/CustomCommand';

const messageMock = {
  reply: jest.fn()
};

describe('Classes - Extensions - CustomCommand', () => {
  beforeEach(() => {
    messageMock.reply.mockClear();
  });

  describe('onError()', () => {
    it('should call message.reply with the proper message.', () => {
      const command = new CustomCommand({}, {
        name: 'command',
        group: 'group',
        memberName: 'group',
        description: 'desc'
      });
      command.onError(new Error(), messageMock);
      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('Something wrong happened when executing this command.');
    });
  });
});
