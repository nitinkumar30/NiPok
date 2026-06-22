import { v4 as uuidv4 } from 'uuid';
import {
  Player, GameState, Phase, Action, PokerTable, Card
} from './types';
import {
  createDeck, shuffleDeck, dealCards, evaluateHand, compareHands,
  getAvailableActions, getCallAmount, getRaiseMin, getRaiseMax
} from './game-engine';

const BLIND_MULTIPLIERS = [100, 50, 25, 10]; // for 9, 6, 4, 2 player tables

export function createTable(name: string, maxPlayers: number): PokerTable {
  const blinds = maxPlayers === 2 ? 50 : maxPlayers === 4 ? 100 : maxPlayers === 6 ? 200 : 500;
  return {
    id: uuidv4(),
    name,
    maxPlayers,
    blinds,
    players: [],
    game: null
  };
}

export function createInitialGameState(table: PokerTable): GameState {
  return {
    id: uuidv4(),
    tableId: table.id,
    players: table.players.map(p => ({ ...p })),
    communityCards: [],
    pot: 0,
    currentPlayerIndex: 0,
    dealerIndex: 0,
    phase: 'preflop',
    minRaise: table.blinds,
    currentBet: 0,
    lastAction: '',
    winner: null,
    winningHand: '',
    winningHandCards: [],
    started: false,
    deck: [],
    availableActions: [],
    callAmount: 0,
    raiseMin: 0,
    raiseMax: 0
  };
}

export function startHand(table: PokerTable): GameState {
  const game = createInitialGameState(table);
  const deck = shuffleDeck(createDeck());

  game.deck = deck;
  game.started = true;
  game.phase = 'preflop';

  const numPlayers = game.players.length;
  game.dealerIndex = Math.floor(Math.random() * numPlayers);

  game.players.forEach((p, i) => {
    p.holeCards = [];
    p.currentBet = 0;
    p.totalBet = 0;
    p.folded = false;
    p.isAllIn = false;
  });

  const { cards: holeCards1, remaining: deck1 } = dealCards(deck, 2 * numPlayers);
  for (let i = 0; i < numPlayers; i++) {
    game.players[i].holeCards = [holeCards1[i * 2], holeCards1[i * 2 + 1]];
  }
  game.deck = deck1;

  const smallBlindIndex = (game.dealerIndex + 1) % numPlayers;
  const bigBlindIndex = (game.dealerIndex + 2) % numPlayers;

  postBlind(game, smallBlindIndex, Math.floor(table.blinds / 2));
  postBlind(game, bigBlindIndex, table.blinds);

  game.currentBet = table.blinds;
  game.minRaise = table.blinds;

  game.currentPlayerIndex = (bigBlindIndex + 1) % numPlayers;

  updateAvailableActions(game);

  return game;
}

function postBlind(game: GameState, index: number, amount: number) {
  const player = game.players[index];
  const actualAmount = Math.min(amount, player.chips);
  player.chips -= actualAmount;
  player.currentBet = actualAmount;
  player.totalBet = actualAmount;
  game.pot += actualAmount;
  if (player.chips === 0) player.isAllIn = true;
}

export function processAction(
  game: GameState,
  playerId: string,
  action: Action,
  amount?: number
): { game: GameState; error?: string } {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return { game, error: 'Player not found' };

  const player = game.players[playerIndex];
  if (player.folded || player.isAllIn) return { game, error: 'Player cannot act' };

  if (playerIndex !== game.currentPlayerIndex) return { game, error: 'Not your turn' };

  const callAmount = getCallAmount(game.currentBet, player.currentBet);

  switch (action) {
    case 'fold':
      player.folded = true;
      game.lastAction = `${player.name} folds`;
      break;

    case 'check':
      if (callAmount > 0) return { game, error: 'Cannot check, must call or raise' };
      game.lastAction = `${player.name} checks`;
      break;

    case 'call':
      const callChips = Math.min(callAmount, player.chips);
      player.chips -= callChips;
      player.currentBet += callChips;
      player.totalBet += callChips;
      game.pot += callChips;
      if (player.chips === 0) {
        player.isAllIn = true;
        game.lastAction = `${player.name} calls (all-in)`;
      } else {
        game.lastAction = `${player.name} calls`;
      }
      break;

    case 'raise':
      if (!amount || amount <= game.currentBet) return { game, error: 'Invalid raise amount' };
      const raiseAmount = Math.min(amount, player.chips + player.currentBet);
      const actualRaise = raiseAmount - player.currentBet;
      player.chips -= actualRaise;
      player.currentBet = raiseAmount;
      player.totalBet += actualRaise;
      game.pot += actualRaise;
      game.currentBet = raiseAmount;
      game.minRaise = raiseAmount - game.currentBet + game.minRaise;
      if (player.chips === 0) {
        player.isAllIn = true;
        game.lastAction = `${player.name} raises to ${raiseAmount} (all-in)`;
      } else {
        game.lastAction = `${player.name} raises to ${raiseAmount}`;
      }
      break;

    case 'allin':
      const allInAmount = player.chips;
      player.currentBet += allInAmount;
      player.totalBet += allInAmount;
      game.pot += allInAmount;
      player.chips = 0;
      player.isAllIn = true;
      if (player.currentBet > game.currentBet) {
        game.currentBet = player.currentBet;
        game.minRaise = game.currentBet;
      }
      game.lastAction = `${player.name} goes all-in`;
      break;
  }

  advanceGame(game);
  updateAvailableActions(game);
  return { game };
}

function advanceGame(game: GameState) {
  const numPlayers = game.players.length;
  const activePlayers = game.players.filter(p => !p.folded);

  if (activePlayers.length === 1) {
    activePlayers[0].chips += game.pot;
    game.winner = activePlayers[0];
    game.winningHand = 'Last player standing';
    game.winningHandCards = [];
    game.phase = 'showdown';
    game.lastAction = `${activePlayers[0].name} wins the pot`;
    return;
  }

  const nextPlayerIndex = findNextActivePlayer(game, game.currentPlayerIndex);
  if (nextPlayerIndex === -1) {
    resolveShowdown(game);
    return;
  }

  const allDone = game.players.filter(p => !p.folded && !p.isAllIn).length === 0;
  if (allDone) {
    resolveShowdown(game);
    return;
  }

  const allActed = game.players.every((p, i) => {
    if (p.folded || p.isAllIn) return true;
    return p.currentBet === game.currentBet || i === nextPlayerIndex;
  });

  if (nextPlayerIndex === -1 || allActed) {
    advancePhase(game);
  } else {
    game.currentPlayerIndex = nextPlayerIndex;
  }
}

function findNextActivePlayer(game: GameState, fromIndex: number): number {
  const numPlayers = game.players.length;
  for (let i = 1; i < numPlayers; i++) {
    const idx = (fromIndex + i) % numPlayers;
    const p = game.players[idx];
    if (!p.folded && !p.isAllIn && p.currentBet < game.currentBet) return idx;
  }
  for (let i = 1; i < numPlayers; i++) {
    const idx = (fromIndex + i) % numPlayers;
    const p = game.players[idx];
    if (!p.folded && !p.isAllIn) return idx;
  }
  return -1;
}

function advancePhase(game: GameState) {
  const phases: Phase[] = ['preflop', 'flop', 'turn', 'river'];
  const currentIdx = phases.indexOf(game.phase);
  if (currentIdx === -1 || currentIdx >= 3) {
    resolveShowdown(game);
    return;
  }

  game.phase = phases[currentIdx + 1];
  game.currentBet = 0;
  game.minRaise = 0;

  game.players.forEach(p => { p.currentBet = 0; });

  if (game.phase === 'flop') {
    const { cards, remaining } = dealCards(game.deck, 3);
    game.communityCards = cards;
    game.deck = remaining;
  } else {
    const { cards, remaining } = dealCards(game.deck, 1);
    game.communityCards.push(cards[0]);
    game.deck = remaining;
  }

  const firstActive = findFirstActivePlayer(game);
  game.currentPlayerIndex = firstActive >= 0 ? firstActive : 0;
}

function findFirstActivePlayer(game: GameState): number {
  for (let i = 0; i < game.players.length; i++) {
    const p = game.players[i];
    if (!p.folded && !p.isAllIn) return i;
  }
  return -1;
}

function resolveShowdown(game: GameState) {
  game.phase = 'showdown';
  const activePlayers = game.players.filter(p => !p.folded);

  if (activePlayers.length === 1) {
    activePlayers[0].chips += game.pot;
    game.winner = activePlayers[0];
    game.winningHand = 'Last player standing';
    return;
  }

  let bestScore = null;
  let bestPlayer = null;

  for (const player of activePlayers) {
    const allCards = [...player.holeCards, ...game.communityCards];
    const score = evaluateHand(allCards);
    if (!bestScore || compareHands(bestScore, score) < 0) {
      bestScore = score;
      bestPlayer = player;
    }
  }

  if (bestPlayer && bestScore) {
    bestPlayer.chips += game.pot;
    game.winner = bestPlayer;
    game.winningHand = bestScore.name;
    game.winningHandCards = [...bestPlayer.holeCards];
  }
}

function updateAvailableActions(game: GameState) {
  const player = game.players[game.currentPlayerIndex];
  if (!player) {
    game.availableActions = [];
    return;
  }
  const callAmount = getCallAmount(game.currentBet, player.currentBet);
  game.callAmount = callAmount;
  game.raiseMin = Math.max(getRaiseMin(game.currentBet, game.minRaise), game.currentBet + game.minRaise);
  game.raiseMax = getRaiseMax(player.chips + (player.currentBet || 0));
  game.availableActions = getAvailableActions(
    player.chips, game.currentBet, player.currentBet, game.phase
  );
}
