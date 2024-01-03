// @ts-check

import Fuse from 'fuse.js';
import { breakFeedUri } from '../../../api';

/**
 * @param {string | undefined} searchText
 * @param {PostDetails[]} posts
 */
export function applySearch(searchText, posts) {
  const searchTextLowercase = searchText?.toLowerCase().trim();

  if (!searchText || !searchTextLowercase) return posts.map(post => ({ post, rank: 0, textHighlights: undefined, textLightHighlights: undefined }));

  const postEntries = posts.map(post => {
    const text = post.text;
    let alt;
    const images = /** @type {import('@atproto/api').AppBskyEmbedImages.Image[]}*/(post.embed?.images);
    if (images?.length) {
      for (const img of images) {
        if (img.alt) {
          if (alt) alt.push(img.alt);
          else alt = [img.alt];
        }
      }
    }
    const postUri = breakFeedUri(post.uri);
    let refs = [postUri?.postID];
    const replyUri = breakFeedUri(/** @type {string} */(post.reply?.uri));
    if (replyUri) refs.push(replyUri.postID);
    if (replyUri && replyUri.shortDID !== postUri?.shortDID) refs.push(replyUri.shortDID);
    const rootUri = breakFeedUri(post.reply?.root?.uri);
    if (rootUri) refs.push(rootUri.postID);
    if (rootUri && rootUri.shortDID !== postUri?.shortDID && rootUri.shortDID !== replyUri?.shortDID) refs.push(rootUri.shortDID);

    return { text, alt, refs, post };
  });

  const searchWordsLowercase = searchTextLowercase.split(/\s+/).filter(w => w.length);
  const smallestWordLength = searchWordsLowercase.reduce((smallest, w) => Math.min(smallest, w.length), 3);

  const fuseSearcher = new Fuse(postEntries, {
    keys: ['text', 'alt', 'refs'],
    ignoreLocation: true,
    threshold: 0.15,

    fieldNormWeight: 0.1,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: smallestWordLength,
    findAllMatches: true,
    shouldSort: false
  });

  const searchEntries = fuseSearcher.search(searchText);
  const matches = [];
  for (const entry of searchEntries) {
    const rank = entry.score;
    if (typeof rank !== 'number' || rank > 0.4) continue;
    const post = entry.item.post;

    /** @type {string[] | undefined} */
    let textHighlights;
    let textLightHighlights;
    if (entry.matches?.length) {
      for (const match of entry.matches) {
        if (match.key === 'text') {
          if (!textLightHighlights) {
            textHighlights = [...entry.item.text].map(ch => ' ');
            textLightHighlights = textHighlights.slice();
          }

          for (const [start, end] of match.indices) {
            const highlightChunk = entry.item.text.slice(start, end + 1).trim();
            const strongHighlight =
              highlightChunk.toLowerCase().indexOf(searchTextLowercase) >= 0 ||
              searchWordsLowercase.indexOf(highlightChunk.toLowerCase()) >= 0;

            for (let i = start; i <= end; i++) {
              textLightHighlights[i] = entry.item.text[i];
              if (strongHighlight) /** @type {string[]} */(textHighlights)[i] = textLightHighlights[i];
            }
          }
        }
      }
    }

    matches.push({
      rank,
      post,
      textHighlights: textHighlights && textHighlights.join(''),
      textLightHighlights: textLightHighlights && textLightHighlights.join('')
    });
  }

  console.log('matches: ', matches, ' searchEntries: ', searchEntries);

  return matches;
}