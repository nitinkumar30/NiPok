import { Server, Socket } from 'socket.io';
import { createTable, startHand, processAction } from './game-manager';
import { PokerTable, JoinTableRequest, PlayerActionRequest } from './types';
import { v4 as uuidv4 } from 'uuid';

const tables: Map<string, PokerTable> = new Map();
const playerSockets: Map<string, string> = new Map();

const TABLE_NAMES = ['Chai Pe Charcha Table', 'Sasta Casino', 'Bada Paisa Table', 'Gully Boys']; const STARTING_CHIPS = 349;

function getOrCreateTables() {
  if (tables.size === 0) {
    [2, 4, 6, 9].forEach((max, i) => {
      const table = createTable(TABLE_NAMES[i] || `Table ${i + 1}`, max);
      tables.set(table.id, table);
    });
  }
  return tables;
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.emit('tables', Array.from(getOrCreateTables().values()).map(t => ({
      id: t.id,
      name: t.name,
      maxPlayers: t.maxPlayers,
      blinds: t.blinds,
      playerCount: t.players.length
    })));

    socket.on('joinTable', (data: JoinTableRequest) => {
      const { tableId, playerName, sessionId } = data;
      const table = tables.get(tableId);
      if (!table) {
        socket.emit('error', { message: 'Table not found' });
        return;
      }

      if (table.players.length >= table.maxPlayers) {
        socket.emit('error', { message: 'Table is full' });
        return;
      }

      const existingPlayer = table.players.find(p => p.sessionId === sessionId);
      let player;
      if (existingPlayer) {
        player = existingPlayer;
        player.isConnected = true;
      } else {
        player = {
          id: uuidv4(),
          name: playerName,
          chips: STARTING_CHIPS,
          holeCards: [],
          currentBet: 0,
          totalBet: 0,
          folded: false,
          isAllIn: false,
          seatIndex: table.players.length,
          isConnected: true,
          sessionId
        };
        table.players.push(player);
      }

      playerSockets.set(sessionId, socket.id);
      socket.join(tableId);
      socket.data.tableId = tableId;
      socket.data.sessionId = sessionId;

      io.to(tableId).emit('tableState', getTableState(table));

      if (table.players.length >= 2 && !table.game?.started) {
        setTimeout(() => {
          if (table.players.length >= 2 && !table.game?.started) {
            startNewHand(io, table);
          }
        }, 2000);
      }
    });

    socket.on('playerAction', (data: PlayerActionRequest) => {
      const { tableId, sessionId, action, amount } = data;
      const table = tables.get(tableId);
      if (!table || !table.game) {
        socket.emit('error', { message: 'No active game' });
        return;
      }

      const player = table.game.players.find(p => p.sessionId === sessionId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      const result = processAction(table.game, player.id, action, amount);
      if (result.error) {
        socket.emit('error', { message: result.error });
        return;
      }

      table.game = result.game;
      io.to(tableId).emit('tableState', getTableState(table));

      if (table.game.phase === 'showdown') {
        setTimeout(() => {
          startNewHand(io, table);
        }, 4000);
      }
    });

    socket.on('leaveTable', () => {
      handleLeave(socket, io);
    });

    socket.on('disconnect', () => {
      const tableId = socket.data.tableId;
      const sessionId = socket.data.sessionId;
      if (tableId && sessionId) {
        const table = tables.get(tableId);
        if (table) {
          const player = table.players.find(p => p.sessionId === sessionId);
          if (player) {
            player.isConnected = false;
            if (table.game && table.game.phase !== 'showdown' && table.game.phase !== 'waiting') {
              const playerInGame = table.game.players.find(p => p.sessionId === sessionId);
              if (playerInGame) {
                playerInGame.folded = true;
                processAction(table.game, playerInGame.id, 'fold');
                io.to(tableId).emit('tableState', getTableState(table));
              }
            }
          }
        }
      }
      console.log(`Player disconnected: ${socket.id}`);
    });

    socket.on('startGame', (data: { tableId: string; sessionId: string }) => {
      const table = tables.get(data.tableId);
      if (table && !table.game?.started && table.players.length >= 2) {
        const isHost = table.players[0]?.sessionId === data.sessionId;
        if (isHost) {
          startNewHand(io, table);
        }
      }
    });
  });
}

function startNewHand(io: Server, table: PokerTable) {
  const connectedPlayers = table.players.filter(p => p.isConnected);
  if (connectedPlayers.length < 2) return;

  table.players = connectedPlayers;
  const game = startHand(table);
  table.game = game;

  io.to(table.id).emit('tableState', getTableState(table));
}

function getTableState(table: PokerTable) {
  const game = table.game;
  if (!game) {
    return {
      id: table.id,
      name: table.name,
      maxPlayers: table.maxPlayers,
      blinds: table.blinds,
      players: table.players.map(p => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        currentBet: p.currentBet,
        folded: p.folded,
        isAllIn: p.isAllIn,
        seatIndex: p.seatIndex,
        isConnected: p.isConnected,
        holeCards: p.holeCards,
        totalBet: p.totalBet
      })),
      game: null
    };
  }

  return {
    id: table.id,
    name: table.name,
    maxPlayers: table.maxPlayers,
    blinds: table.blinds,
    players: game.players.map(p => ({
      id: p.id,
      name: p.name,
      chips: p.chips,
      currentBet: p.currentBet,
      folded: p.folded,
      isAllIn: p.isAllIn,
      seatIndex: p.seatIndex,
      isConnected: p.isConnected,
      holeCards: p.holeCards,
      totalBet: p.totalBet
    })),
    game: {
      id: game.id,
      pot: game.pot,
      communityCards: game.communityCards,
      phase: game.phase,
      currentBet: game.currentBet,
      lastAction: game.lastAction,
      currentPlayerIndex: game.currentPlayerIndex,
      dealerIndex: game.dealerIndex,
      minRaise: game.minRaise,
      winner: game.winner ? {
        id: game.winner.id,
        name: game.winner.name
      } : null,
      winningHand: game.winningHand,
      winningHandCards: game.winningHandCards,
      started: game.started,
      callAmount: game.callAmount,
      raiseMin: game.raiseMin,
      raiseMax: game.raiseMax,
      availableActions: game.availableActions
    }
  };
}

function handleLeave(socket: Socket, io: Server) {
  const tableId = socket.data.tableId;
  const sessionId = socket.data.sessionId;
  if (tableId && sessionId) {
    const table = tables.get(tableId);
    if (table) {
      table.players = table.players.filter(p => p.sessionId !== sessionId);
      if (table.game) {
        table.game.players = table.game.players.filter(p => p.sessionId !== sessionId);
        if (table.game.players.length < 2) {
          table.game = null;
        }
      }
      io.to(tableId).emit('tableState', getTableState(table));
    }
    socket.leave(tableId);
    delete socket.data.tableId;
  }
}
