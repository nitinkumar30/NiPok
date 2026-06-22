import { Card, Phase } from '../types';

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900'
};

export function getSuitSymbol(suit: string): string {
  return SUIT_SYMBOLS[suit] || '';
}

export function getSuitColor(suit: string): string {
  return SUIT_COLORS[suit] || '';
}

export function getCardDisplay(card: Card): { display: string; suit: string; color: string } {
  return {
    display: card.rank,
    suit: getSuitSymbol(card.suit),
    color: getSuitColor(card.suit)
  };
}

export function getPhaseLabel(phase: Phase): string {
  const labels: Record<Phase, string> = {
    waiting: 'Players aa rahe hain...',
    preflop: 'Pehla Round',
    flop: 'Teen Patti Khule',
    turn: 'Round Chaar',
    river: 'Aakhri Round',
    showdown: 'Shuru Ho Showdown'
  };
  return labels[phase];
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}
