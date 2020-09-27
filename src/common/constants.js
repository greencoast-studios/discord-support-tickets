export const guildSettingKeys = {
  log: 'log',
  report: 'report',
  channelCategory: 'channel-category',
  staffRole: 'staff-role',
  ticketMessage: 'ticket-message',
  currentTickets: 'current-tickets'
};

export const discordErrors = {
  unknownMessage: {
    name: 'DiscordAPIError',
    message: 'Unknown Message'
  },
  unknownChannelCategory: {
    name: 'DiscordAPIError',
    message: 'Invalid Form Body\nparent_id: Category does not exist'
  },
  missingPermissions: {
    name: 'DiscordAPIError',
    message: 'Missing Permissions'
  }
};

export const presenceStatus = {
  online: 'online',
  idle: 'idle',
  invisible: 'invisible',
  dnd: 'dnd'
};

export const activityType = {
  playing: 'PLAYING',
  streaming: 'STREAMING',
  listening: 'LISTENING',
  watching: 'WATCHING'
};

export const SUPPORT_CHANNEL_PERMISSIONS = ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS'];

export const SUPPORT_EMOJI = '❗';
