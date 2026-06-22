import { Card, Action, Phase } from './types';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, code: `${rank}${suit[0].toUpperCase()}` });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], count: number): { cards: Card[]; remaining: Card[] } {
  return { cards: deck.slice(0, count), remaining: deck.slice(count) };
}

export function getAvailableActions(
  chips: number,
  currentBet: number,
  playerBet: number,
  phase: Phase
): Action[] {
  if (phase === 'showdown' || phase === 'waiting') return [];

  const actions: Action[] = [];
  const callAmount = currentBet - playerBet;

  if (callAmount === 0) {
    actions.push('check');
  } else {
    actions.push('call');
  }

  actions.push('fold');

  if (chips > 0) {
    actions.push('allin');
  }

  if (chips > callAmount) {
    actions.push('raise');
  }

  return actions;
}

export function getCallAmount(currentBet: number, playerBet: number): number {
  return currentBet - playerBet;
}

export function getRaiseMin(currentBet: number, minRaise: number): number {
  return currentBet + minRaise;
}

export function getRaiseMax(chips: number): number {
  return chips;
}

export interface HandScore {
  rank: number;
  kickers: number[];
  name: string;
}

export function evaluateHand(cards: Card[]): HandScore {
  const allCards = [...cards];
  const values = allCards.map(c => RANK_VALUES[c.rank]).sort((a, b) => b - a);
  const suits = allCards.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const valueCounts: Record<number, number> = {};
  for (const v of values) {
    valueCounts[v] = (valueCounts[v] || 0) + 1;
  }
  const counts = Object.entries(valueCounts).map(([v, c]) => ({ value: parseInt(v), count: c }));
  counts.sort((a, b) => b.count - a.count || b.value - a.value);

  const isStraight = checkStraight(values.map(v => v === 14 ? 1 : v));

  if (isFlush && isStraight) {
    const high = values.includes(14) && values.includes(13) && values.includes(12) &&
      values.includes(11) && values.includes(10) ? 14 : values[0];
    return { rank: 9, kickers: [high], name: `Royal Flush` };
  }

  if (counts[0].count === 4) {
    return { rank: 8, kickers: [counts[0].value, ...counts.slice(1).map(c => c.value)], name: `Four of a Kind` };
  }

  if (counts[0].count === 3 && counts[1]?.count === 2) {
    return { rank: 7, kickers: [counts[0].value, counts[1].value], name: `Full House` };
  }

  if (isFlush) {
    return { rank: 6, kickers: values, name: `Flush` };
  }

  if (isStraight) {
    return { rank: 5, kickers: [values[0]], name: `Straight` };
  }

  if (counts[0].count === 3) {
    return { rank: 4, kickers: [counts[0].value, ...counts.slice(1).map(c => c.value)], name: `Three of a Kind` };
  }

  if (counts[0].count === 2 && counts[1]?.count === 2) {
    return {
      rank: 3,
      kickers: [counts[0].value, counts[1].value, ...counts.slice(2).map(c => c.value)],
      name: `Two Pair`
    };
  }

  if (counts[0].count === 2) {
    return { rank: 2, kickers: counts.map(c => c.value), name: `One Pair` };
  }

  return { rank: 1, kickers: values, name: `High Card` };
}

function checkStraight(values: number[]): boolean {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  if (unique.length < 5) return false;

  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) return true;
  }

  if (unique.includes(14) && unique.includes(13) && unique.includes(12) &&
    unique.includes(11) && unique.includes(10)) return true;

  return false;
}

export function compareHands(a: HandScore, b: HandScore): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

export function getHandName(rank: number): string {
  const names = ['', 'High Card', 'One Pair', 'Two Pair', 'Three of a Kind',
    'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
  return names[rank] || '';
}
