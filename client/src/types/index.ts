export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  code: string;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  totalBet: number;
  folded: boolean;
  isAllIn: boolean;
  seatIndex: number;
  isConnected: boolean;
  holeCards: Card[];
}

export interface TableInfo {
  id: string;
  name: string;
  maxPlayers: number;
  blinds: number;
  playerCount: number;
}

export type Phase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type Action = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export interface GameState {
  id: string;
  pot: number;
  communityCards: Card[];
  phase: Phase;
  currentBet: number;
  lastAction: string;
  currentPlayerIndex: number;
  dealerIndex: number;
  minRaise: number;
  winner: { id: string; name: string } | null;
  winningHand: string;
  winningHandCards: Card[];
  started: boolean;
  callAmount: number;
  raiseMin: number;
  raiseMax: number;
  availableActions: Action[];
}

export interface TableState {
  id: string;
  name: string;
  maxPlayers: number;
  blinds: number;
  players: Player[];
  game: GameState | null;
}

export interface TutorialStep {
  id: number;
  title: string;
  content: string;
  target?: string;
}

export const HAND_RANKINGS = [
  { rank: 1, name: 'High Card (Badi Patti)', desc: 'Sabse uuncha card jeetega' },
  { rank: 2, name: 'One Pair (Ek Jodi)', desc: 'Ek jodidaar card' },
  { rank: 3, name: 'Two Pair (Do Jodi)', desc: 'Do alag jodiyaan' },
  { rank: 4, name: 'Three of a Kind (Teen Tika)', desc: '3 same rank ke cards' },
  { rank: 5, name: 'Straight (Seedha)', desc: '5 card lagataar' },
  { rank: 6, name: 'Flush (Ek Suit)', desc: '5 cards ek hi suit ke' },
  { rank: 7, name: 'Full House (Teen + Jodi)', desc: '3 of a kind + pair' },
  { rank: 8, name: 'Four of a Kind (Char ki Godi)', desc: '4 same rank ke cards' },
  { rank: 9, name: 'Straight Flush (Seedha Suit)', desc: 'Seedha + ek suit' },
  { rank: 10, name: 'Royal Flush (Baap)', desc: '10 se Ace ek hi suit mein' },
].reverse();

export const COACHING_TIPS: Record<string, string> = {
  check: 'Yahan check kar sakte ho — koi daav nahi hai.',
  call: 'Call matlab utna hi daav laga do jitna samne wala.',
  raise: 'Daav badao — dabaav daalo unpar!',
  fold: 'Fold kar do — aaj nahi to kal sahi.',
  allin: 'All-in? Bhai tu pakka pagal hai?',
};
