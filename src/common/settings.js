import fs from 'fs';
import path from 'path';

const configFilePath = path.join(__dirname, '../../config/settings.json');
const configFromFile = fs.existsSync(configFilePath) ? JSON.parse(fs.readFileSync(configFilePath)) : {};

export const discordToken = process.env.DISCORD_TOKEN || configFromFile.discord_token || null;
export const prefix = process.env.PREFIX || configFromFile.prefix || '$';
export const ownerID = process.env.OWNER_ID || configFromFile.owner_id || null;
export const inviteURL = process.env.INVITE_URL || configFromFile.invite_url || null;
