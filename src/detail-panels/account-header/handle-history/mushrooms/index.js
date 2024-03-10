export const mushrooms = [
  'inkcap', 'enoki', 'porcini', 'morel', 'shimeji', 'puffball',
  'oyster', 'amanita', 'lionsmane', 'shiitake', 'hydnum',
  'conocybe', 'russula', 'verpa', 'blewit', 'maitake',
  'chaga', 'lepista', 'agaric', 'boletus'
];

/**
 * @param {string | undefined | null} pds
 */
export function getPdsMushroom(pds) {
  if (!pds) return;
  const pdsLowercase = pds.toLowerCase();
  for (const mush of mushrooms) {
    if (pdsLowercase.indexOf(mush) >= 0) return mush;
  }
}
