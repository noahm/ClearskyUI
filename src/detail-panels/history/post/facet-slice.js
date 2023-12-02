const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function sliceFacet(text, byteStart, byteEnd) {
  if (!text) return '';
  if (isPlainASCII(text)) return text.slice(byteStart, byteEnd);

  const encoded = encoder.encode(text);
  const decoded = decoder.decode(encoded.slice(byteStart, byteEnd));
  return decoded;
}

export function facetByteLength(text) {
  if (!text) return 0;
  if (isPlainASCII(text)) return text.length;

  return encoder.encode(text).length;
}

function isPlainASCII(text) {
  if (!text) return true;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 127) return false;
  }
  return true;
}

/**
 * @param {string} line
 * @param {number} byteStart
 * @param {PostDetails['facets'] | undefined} orderedFacets
 * @param {string | undefined} textHighlights
 * @param {string | undefined} textLightHighlights
 * @returns {(string | {
 *    text: string,
 *    isHighlight: boolean,
 *    isLightHighlight: boolean,
 *    facet: PostDetails['facets'][number] | undefined
 * })[]}
 */
export function overlapFacetsAndHighlights(line, byteStart, orderedFacets, textHighlights, textLightHighlights) {
  if (!orderedFacets?.length && !textHighlights && !textLightHighlights) return [line];

  const facetOffsets = !orderedFacets ? undefined : isPlainASCII(line) ?
    orderedFacets.map(f => ({ from: f.index.byteStart, to: f.index.byteEnd, ...f })) :
    orderedFacets.map(f => {
      const toStart = sliceFacet(line, 0, f.index.byteStart);
      const toEnd = sliceFacet(line, 0, f.index.byteEnd);
      return { from: toStart.length, to: toEnd.length, ...f };
    });
  
  let offset = 0;
  let facetIndex = 0;

  let applyHighlight = false;
  let applyLightHighlight = false;
  let applyFacet = /** @type {NonNullable<typeof facetOffsets>[0] | undefined} */(undefined);

  /** @type {ReturnType<typeof overlapFacetsAndHighlights>} */
  const output = [];

  while (offset < line.length) {
    const nextHighlightChange = (applyHighlight ?
      nextHighlightEndAt(textHighlights, offset) :
      nextHighlightStartAt(textHighlights, offset)) ?? line.length;

    let nextLightHighlightChange = (applyLightHighlight ?
      nextHighlightEndAt(textLightHighlights, offset) :
      nextHighlightStartAt(textLightHighlights, offset)) ?? line.length;

    let nextFacet = facetOffsets?.find(f => f.from >= offset);
    let nextFacetChange =
      applyFacet ? applyFacet.to :
        nextFacet?.from ?? line.length;

    const nextChange = Math.min(nextHighlightChange, nextLightHighlightChange, nextFacetChange);

    if (nextChange > offset) {
      const text = line.slice(offset, nextChange);
      if (!applyHighlight && !applyLightHighlight && !applyFacet) {
        output.push(text);
      } else {
        output.push({
          text,
          isHighlight: applyHighlight,
          isLightHighlight: applyLightHighlight,
          facet: applyFacet
        });
      }
    }

    offset = nextChange;
    applyHighlight = nextHighlightChange > nextChange ? applyHighlight : !applyHighlight;
    applyLightHighlight = nextLightHighlightChange > nextChange ? applyLightHighlight : !applyLightHighlight;
    applyFacet = nextFacetChange > nextChange ? applyFacet :
      nextFacet?.from === nextChange ? nextFacet : undefined; 
  }

  return output;
}

/** @param {string | undefined} highlights @param {number} offset */
function nextHighlightStartAt(highlights, offset) {
  if (!highlights || offset >= highlights.length) return null;
  for (let i = offset; i < highlights.length; i++) {
    if (highlights.charCodeAt(i) !== 32) return i;
  }
  return null;
}

/** @param {string | undefined} highlights @param {number} offset */
function nextHighlightEndAt(highlights, offset) {
  if (!highlights || offset >= highlights.length) return -1;
  const pos = highlights.indexOf(' ', offset);
  return pos < 0 ? null : pos;
}