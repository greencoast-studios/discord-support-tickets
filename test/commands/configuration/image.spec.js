import logger from '@greencoast/logger';
import { MessageAttachment } from 'discord.js';
import ImageCommand from '../../../src/commands/configuration/image';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';
import * as data from '../../../src/common/utils/data';

let command, runPromise;

const loggerInfoMock = jest.spyOn(logger, 'info');
const getImageMock = jest.spyOn(data, 'getImageFile');
const saveImageMock = jest.spyOn(data, 'saveImage');
const removeImageMock = jest.spyOn(data, 'removeImage');

describe('Commands - Image', () => {
  beforeEach(() => {
    getImageMock.mockResolvedValue(null);
    messageMock.reply.mockClear();
    messageMock.say.mockClear();
  });

  afterEach(() => {
    getImageMock.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new ImageCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    runPromise = command.run(messageMock, []);
    expect(loggerInfoMock.mock.calls.length).toBe(1);
    expect(loggerInfoMock.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('Arg: No args', () => {
    afterEach(() => {
      getImageMock.mockClear();
    });

    it('should call message.reply when the image was not found with the proper message.', () => {
      getImageMock.mockResolvedValue(null);
      command = new ImageCommand(clientMock);
      runPromise = command.run(messageMock, []);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('There is no image saved for this guild.');
        });
    });

    it('should call message.say when the image was found with the proper message.', () => {
      getImageMock.mockResolvedValue('file');
      command = new ImageCommand(clientMock);
      runPromise = command.run(messageMock, []);

      return runPromise
        .then(() => {
          expect(messageMock.say.mock.calls.length).toBe(1);
          expect(messageMock.say.mock.calls[0][0]).toBe('');
          expect(messageMock.say.mock.calls[0][1]).toBeInstanceOf(MessageAttachment);
        });
    });
  });

  describe('Arg: set', () => {
    const messageWithAttachment = (url) => ({
      ...messageMock,
      attachments: {
        first: () => ({
          url
        })
      }
    });

    beforeEach(() => {
      saveImageMock.mockResolvedValue(null);
      command = new ImageCommand(clientMock);
    });
    
    afterEach(() => {
      saveImageMock.mockClear();
    });

    it('should reply with the attachment required message if no attachment is sent.', () => {
      runPromise = command.run(messageWithAttachment(null), ['set']);

      expect(messageMock.reply.mock.calls.length).toBe(1);
      expect(messageMock.reply.mock.calls[0][0]).toBe('You need to attach an image to set it.');
    });

    it('should save the image if valid attachment is sent.', () => {
      runPromise = command.run(messageWithAttachment('image_url'), ['set']);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('The image has been updated.');
        });
    });
  });

  describe('Arg: remove', () => {
    beforeEach(() => {
      command = new ImageCommand(clientMock);
    });
    
    afterEach(() => {
      removeImageMock.mockClear();
    });

    it('should reply with non existing image message if image did not exist.', () => {
      removeImageMock.mockResolvedValue(false);
      runPromise = command.run(messageMock, ['remove']);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('There was no image to remove.');
        });
    });

    it('should reply with the image removed if image existed.', () => {
      removeImageMock.mockResolvedValue(true);
      runPromise = command.run(messageMock, ['remove']);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('Image has been removed.');
        });
    });
  });
});
