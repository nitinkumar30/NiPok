export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  code: string;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  currentBet: number;
  totalBet: number;
  folded: boolean;
  isAllIn: boolean;
  seatIndex: number;
  isConnected: boolean;
  sessionId: string;
}

export type Phase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type Action = 'fold' | 'check' | 'call' | 'raise' | 'allin';

export interface GameState {
  id: string;
  tableId: string;
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  phase: Phase;
  minRaise: number;
  currentBet: number;
  lastAction: string;
  winner: Player | null;
  winningHand: string;
  winningHandCards: Card[];
  started: boolean;
  deck: Card[];
  availableActions: Action[];
  callAmount: number;
  raiseMin: number;
  raiseMax: number;
}

export interface PokerTable {
  id: string;
  name: string;
  maxPlayers: number;
  blinds: number;
  players: Player[];
  game: GameState | null;
}

export interface JoinTableRequest {
  tableId: string;
  playerName: string;
  sessionId: string;
}

export interface PlayerActionRequest {
  tableId: string;
  sessionId: string;
  action: Action;
  amount?: number;
}
