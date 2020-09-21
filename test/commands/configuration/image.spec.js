import logger from '@greencoast/logger';
import { MessageAttachment } from 'discord.js';
import ImageCommand from '../../../src/commands/configuration/image';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';
import { getImageFile, saveImage, removeImage } from '../../../src/common/utils/data';

let command, runPromise;

jest.mock('@greencoast/logger');
jest.mock('../../../src/common/utils/data');

describe('Commands - Image', () => {
  beforeEach(() => {
    getImageFile.mockResolvedValue(null);
    messageMock.reply.mockClear();
    messageMock.say.mockClear();
    logger.info.mockClear();
  });

  afterEach(() => {
    getImageFile.mockClear();
  });

  it('should be instance of CustomCommand.', () => {
    command = new ImageCommand(clientMock);
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    runPromise = command.run(messageMock, []);
    expect(logger.info.mock.calls.length).toBe(1);
    expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  describe('Arg: No args', () => {
    afterEach(() => {
      getImageFile.mockClear();
    });

    it('should call message.reply when the image was not found with the proper message.', () => {
      getImageFile.mockResolvedValue(null);
      command = new ImageCommand(clientMock);
      runPromise = command.run(messageMock, []);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('There is no image saved for this guild.');
        });
    });

    it('should call message.say when the image was found with the proper message.', () => {
      getImageFile.mockResolvedValue('file');
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
      saveImage.mockResolvedValue(null);
      command = new ImageCommand(clientMock);
    });
    
    afterEach(() => {
      saveImage.mockClear();
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
      removeImage.mockClear();
    });

    it('should reply with non existing image message if image did not exist.', () => {
      removeImage.mockResolvedValue(false);
      runPromise = command.run(messageMock, ['remove']);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('There was no image to remove.');
        });
    });

    it('should reply with the image removed if image existed.', () => {
      removeImage.mockResolvedValue(true);
      runPromise = command.run(messageMock, ['remove']);

      return runPromise
        .then(() => {
          expect(messageMock.reply.mock.calls.length).toBe(1);
          expect(messageMock.reply.mock.calls[0][0]).toBe('Image has been removed.');
        });
    });
  });
});
