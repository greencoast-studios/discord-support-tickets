const numberRegexMatch = /[^0-9]+/gi;

export const parseMention = (store, mention) => {
  const mentionedID = mention.replace(numberRegexMatch, '');
  return store.cache.find((item) => item.id === mentionedID) || null;
};

// Can't find a better name for this. :p
export const isThisTheDiscordError = (error, expected) => {
  return error.name === expected.name && error.message === expected.message;
};

export const serializeChannel = (channel) => {
  return channel.messages.fetch()
    .then((messages) => {
      // It looks ugly but this is how you avoid indents going inside the string. :/
      const initialText = `---#########---
Channel: ${channel.name}
Channel ID: ${channel.id}
Category Name: ${channel.parent.name}
Guild: ${channel.guild.name}
Date created: ${channel.createdAt.toLocaleString()}
Date deleted: ${new Date().toLocaleString()}
Members: ${channel.members.map((m) => m.displayName).join(', ')}
---#########---\n\n`;

      return messages.array().reverse().reduce((text, message) => {
        const messageText = `[${message.createdAt.toLocaleString()}] ${message.member.displayName}: ${message.content}`;
        return `${text}${messageText}\n`;
      }, initialText);
    });
};
