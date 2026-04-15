/**
 * LexoRank — string-based ordering system used by Jira/Trello.
 * Ranks are base-36 strings. Inserting between two ranks never
 * requires re-indexing any other item.
 *
 * Alphabet: 0-9 a-z  (36 chars, lexicographically ordered)
 */

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
const BASE = CHARS.length;
const MIN_CHAR = CHARS[0];
const DEFAULT_LEN = 6;

function charToVal(c: string): number {
  return CHARS.indexOf(c);
}

function valToChar(v: number): string {
  return CHARS[v];
}

function pad(s: string, len: number): string {
  return s.padEnd(len, MIN_CHAR);
}

/**
 * Calculate the lexicographic midpoint between two rank strings.
 * If `lo` is null, uses the minimum possible rank.
 * If `hi` is null, appends a mid character to `lo`.
 */
export function midRank(lo: string | null, hi: string | null): string {
  if (lo === null && hi === null) {
    return pad("n", DEFAULT_LEN);
  }

  if (lo === null) {
    lo = pad(MIN_CHAR, hi!.length);
  }

  if (hi === null) {
    return lo + valToChar(Math.floor(BASE / 2));
  }

  const len = Math.max(lo.length, hi.length);
  const loP = pad(lo, len);
  const hiP = pad(hi, len);

  const loNums = loP.split("").map(charToVal);
  const hiNums = hiP.split("").map(charToVal);

  const sumNums: number[] = new Array(len).fill(0);
  let carry = 0;
  for (let i = len - 1; i >= 0; i--) {
    const sum = loNums[i] + hiNums[i] + carry * BASE;
    sumNums[i] = Math.floor(sum / 2);
    carry = sum % 2;
  }

  const result = sumNums.map(valToChar).join("");

  if (result === loP) {
    return lo + valToChar(Math.floor(BASE / 2));
  }

  return result.replace(new RegExp(`${MIN_CHAR}+$`), "") || MIN_CHAR;
}

export function initialRank(): string {
  return pad("n", DEFAULT_LEN);
}

export function rankAfter(rank: string): string {
  return midRank(rank, null);
}

export function rankBefore(rank: string): string {
  return midRank(null, rank);
}

/**
 * Given a sorted array of existing ranks and a target index,
 * return the rank that should be placed at that index.
 */
export function getRankAtIndex(ranks: string[], targetIndex: number): string {
  if (ranks.length === 0) return initialRank();
  if (targetIndex <= 0) return rankBefore(ranks[0]);
  if (targetIndex >= ranks.length) return rankAfter(ranks[ranks.length - 1]);
  return midRank(ranks[targetIndex - 1], ranks[targetIndex]);
}
