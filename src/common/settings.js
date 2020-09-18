import config from '../../config/settings.json';

export const discordToken = process.env.DISCORD_TOKEN || config.discord_token;
export const prefix = process.env.PREFIX || config.prefix || '$';
export const ownerID = process.env.OWNER_ID || config.owner_id || null;
export const inviteURL = process.env.INVITE_URL || config.invite_url || null;
