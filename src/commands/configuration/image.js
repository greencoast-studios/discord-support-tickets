import logger from '@greencoast/logger';
import { MessageAttachment } from 'discord.js';
import CustomCommand from '../../classes/extensions/CustomCommand';
import { saveImage, getImageFile, removeImage } from '../../common/utils/data';

class ImageCommand extends CustomCommand {
  constructor(client) {
    super(client, {
      name: 'image',
      emoji: ':frame_photo:',
      memberName: 'image',
      group: 'configuration',
      description: 'Set the image that will be sent to the newly created channel.',
      examples: [`${client.commandPrefix}image set <image_attachment>`, `${client.commandPrefix}image remove`, `${client.commandPrefix}image`],
      guildOnly: true,
      argsType: 'multiple',
      userPermissions: ['MANAGE_MESSAGES']
    });
  }

  handleSet(message, imageURL) {
    return saveImage(message.guild, imageURL)
      .then(() => {
        message.reply('The image has been updated.');
        logger.info(`Image updated for ${message.guild.name}.`);
      }).catch((error) => {
        this.onError(error, message);
      });
  }

  handleRemove(message) {
    return removeImage(message.guild)
      .then((fileExisted) => {
        if (!fileExisted) {
          message.reply('There was no image to remove.');
          return;
        }

        message.reply('Image has been removed.');
        logger.info(`Image has been removed for ${message.guild.name}.`);
      })
      .catch((error) => {
        this.onError(error, message);
      });
  }

  handleShowCurrent(message) {
    return getImageFile(message.guild)
      .then((image) => {
        if (!image) {
          message.reply('There is no image saved for this guild.');
          return;
        }
        const attachment = new MessageAttachment(image);
        message.say('', attachment);
      })
      .catch((error) => {
        this.onError(error, message);
      });
  }

  run(message, [option]) {
    super.run(message);

    if (option === 'set') {
      const imageURL = message.attachments.first()?.url;

      if (!imageURL) {
        message.reply('You need to attach an image to set it.');
        return;
      }

      return this.handleSet(message, imageURL);
    }

    if (option === 'remove') {
      return this.handleRemove(message);
    }

    return this.handleShowCurrent(message);
  }
}

export default ImageCommand;
