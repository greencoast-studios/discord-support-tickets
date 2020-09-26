const numberRegexMatch = /[^0-9]+/gi;

export const parseMention = (store, mention) => {
  const mentionedID = mention.replace(numberRegexMatch, '');
  return store.cache.find((item) => item.id === mentionedID) || null;
};

// Can't find a better name for this. :p
export const isThisTheDiscordError = (error, expected) => {
  return error.name === expected.name && error.message === expected.message;
};
