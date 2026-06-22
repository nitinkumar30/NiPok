import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { socketManager } from '../utils/socket';
import PlayingCard from '../components/PlayingCard';
import PlayerSeat from '../components/PlayerSeat';
import ActionButtons from '../components/ActionButtons';
import PotDisplay from '../components/PotDisplay';
import { getPhaseLabel, formatINR } from '../utils/cards';
import { useEffect } from 'react';

export default function GameTable() {
  const currentTable = useGameStore((s) => s.currentTable);
  const playerName = useGameStore((s) => s.playerName);
  const sessionId = useGameStore((s) => s.sessionId);
  const toggleHandRankings = useGameStore((s) => s.toggleHandRankings);
  const addCoachingMessage = useGameStore((s) => s.addCoachingMessage);
  const myPlayerId = useGameStore((s) => s.myPlayerId);
  const setMyPlayerId = useGameStore((s) => s.setMyPlayerId);

  const game = currentTable?.game;
  const myPlayer = currentTable?.players.find((p) => p.name === playerName);
  const isMyTurn = game && myPlayer && game.currentPlayerIndex === currentTable?.players.indexOf(myPlayer);

  useEffect(() => {
    if (myPlayer) {
      setMyPlayerId(myPlayer.id);
    }
  }, [myPlayer?.id]);

  useEffect(() => {
    if (game?.lastAction) {
      addCoachingMessage(game.lastAction);
    }
  }, [game?.lastAction]);

  const handleAction = (action: string, amount?: number) => {
    if (!currentTable) return;
    socketManager.playerAction(
      currentTable.id,
      sessionId,
      action as any,
      amount
    );
  };

  const handleLeave = () => {
    socketManager.leaveTable();
    useGameStore.getState().setCurrentTable(null);
  };

  if (!currentTable) return null;

  const mySeatIndex = myPlayer?.seatIndex ?? 0;
  const reorderedPlayers = [
    ...currentTable.players.slice(mySeatIndex),
    ...currentTable.players.slice(0, mySeatIndex)
  ];

  return (
    <div className="min-h-screen p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleLeave}
          className="px-4 py-2 glass rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Nikal le
        </button>
        <div className="text-center">
          <h2 className="text-lg font-display font-semibold text-poker-gold">
            {currentTable.name}
          </h2>
          {game && (
            <span className="text-xs text-gray-400">{getPhaseLabel(game.phase)}</span>
          )}
        </div>
        <button
          onClick={toggleHandRankings}
          className="px-4 py-2 glass rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
        >
          Hath Dekh
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-4xl aspect-[16/9]">
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-b from-felt-dark via-felt to-felt-dark felt-texture card-shadow overflow-hidden">
            <div className="absolute inset-0 rounded-[3rem] border border-white/5" />

            <PotDisplay />

            <AnimatePresence>
              {game && game.communityCards.length > 0 && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-3"
                >
                  {game.communityCards.map((card, i) => (
                    <motion.div
                      key={card.code + i}
                      initial={{ opacity: 0, rotateY: 180 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                    >
                      <PlayingCard card={card} size="md" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {!game?.started && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-gray-400 text-lg">Aur log aa rhe hain...</p>
                {currentTable.players.length >= 2 && (
                  <button
                    onClick={() => socketManager.startGame(currentTable.id, sessionId)}
                    className="mt-4 px-8 py-3 bg-poker-gold text-poker-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors"
                  >
                    Shuru Kar 🌶️
                  </button>
                )}
              </div>
            )}

            {game?.winner && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center"
              >
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-2xl font-bold text-poker-gold">{game.winner.name}</div>
                <div className="text-sm text-gray-400 mt-1">Wins with {game.winningHand}</div>
                <div className="text-lg text-poker-gold mt-1">{formatINR(game.pot)}</div>
              </motion.div>
            )}
          </div>

          {reorderedPlayers.map((player, idx) => {
            const actualIndex = currentTable.players.indexOf(player);
            return (
              <PlayerSeat
                key={player.id}
                player={player}
                index={idx}
                total={reorderedPlayers.length}
                isCurrentTurn={game?.currentPlayerIndex === actualIndex}
                isDealer={game?.dealerIndex === actualIndex}
                isMe={player.name === playerName}
                phase={game?.phase || 'waiting'}
              />
            );
          })}
        </div>
      </div>

      {game && myPlayer && (
        <ActionButtons
          game={game}
          myPlayer={myPlayer}
          isMyTurn={!!isMyTurn}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
