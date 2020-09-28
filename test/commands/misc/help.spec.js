import logger from '@greencoast/logger';
import Discord from 'discord.js';
import HelpCommand from '../../../src/commands/misc/help';
import CustomCommand from '../../../src/classes/extensions/CustomCommand';
import { clientMock, messageMock } from '../../../__mocks__/discordMocks';
import { MESSAGE_EMBED } from '../../../src/common/constants';

let command;

jest.mock('@greencoast/logger');

jest.mock('discord.js', () => {
  const Discord = jest.requireActual('discord.js');

  Discord.MessageEmbed.prototype.setTitle = jest.fn();
  Discord.MessageEmbed.prototype.setColor = jest.fn();
  Discord.MessageEmbed.prototype.setThumbnail = jest.fn();
  Discord.MessageEmbed.prototype.addField = jest.fn();

  return Discord;
});

const embed = Discord.MessageEmbed.prototype;

describe('Commands - Help', () => {
  beforeEach(() => {
    messageMock.embed.mockClear();
    logger.info.mockClear();

    embed.setTitle.mockClear();
    embed.setColor.mockClear();
    embed.setThumbnail.mockClear();
    embed.addField.mockClear();

    command = new HelpCommand(clientMock);
  });
  
  it('should be instance of CustomCommand.', () => {
    expect(command).toBeInstanceOf(CustomCommand);
  });

  it('should call logger.info with the proper message.', () => {
    command.run(messageMock);
    expect(logger.info.mock.calls.length).toBe(1);
    expect(logger.info.mock.calls[0][0]).toBe(`User ${messageMock.member.displayName} executed ${command.name} from ${messageMock.guild.name}.`);
  });

  it('should create an embed with the correct information.', () => {
    command.run(messageMock);
    expect(embed.setTitle.mock.calls.length).toBe(1);
    expect(embed.setColor.mock.calls.length).toBe(1);
    expect(embed.setThumbnail.mock.calls.length).toBe(1);
    expect(embed.addField.mock.calls.length).toBe(clientMock.registry.groups.length + 2);

    expect(embed.setTitle.mock.calls[0][0]).toBe('Support Tickets Help Message');
    expect(embed.setColor.mock.calls[0][0]).toBe(MESSAGE_EMBED.color);
    expect(embed.setThumbnail.mock.calls[0][0]).toBe(MESSAGE_EMBED.thumbnail);

    embed.addField.mock.calls.forEach((call) => {
      expect(call[1].length).toBeLessThan(2048); // Discord max embed field length.
    });

    expect(embed.addField.mock.calls[clientMock.registry.groups.length][0]).toBe('Need more info?');
    expect(embed.addField.mock.calls[clientMock.registry.groups.length][1]).toBe(`You can access the bot's [wiki page](${MESSAGE_EMBED.wikiURL}) for more information on how to use this bot.`);
    expect(embed.addField.mock.calls[clientMock.registry.groups.length + 1][0]).toBe('Found a bug?');
    expect(embed.addField.mock.calls[clientMock.registry.groups.length + 1][1]).toBe(`This bot is far from perfect, so in case you found a bug, please report it [here](${MESSAGE_EMBED.issuesURL}).`);
  });

  it('should send an embed.', () => {
    command.run(messageMock);
    expect(messageMock.embed.mock.calls.length).toBe(1);
    expect(messageMock.embed.mock.calls[0][0]).toBeInstanceOf(Discord.MessageEmbed);
  });
});
