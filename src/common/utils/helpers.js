const numberRegexMatch = /[^0-9]+/gi;

export const parseMention = (store, mention) => {
  const mentionedID = mention.replace(numberRegexMatch, '');
  return store.cache.find((item) => item.id === mentionedID) || null;
};
