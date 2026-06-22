import { motion } from 'framer-motion';
import PlayingCard from './PlayingCard';
import { Player, Phase } from '../types';
import { formatINR } from '../utils/cards';

interface Props {
  player: Player;
  index: number;
  total: number;
  isCurrentTurn: boolean;
  isDealer: boolean;
  isMe: boolean;
  phase: Phase;
}

export default function PlayerSeat({ player, index, total, isCurrentTurn, isDealer, isMe, phase }: Props) {
  const angle = (index / total) * 360 - 90;
  const radius = 38;

  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

  const showCards = isMe || phase === 'showdown';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className={`flex flex-col items-center gap-1 ${isCurrentTurn ? 'z-10' : 'z-0'}`}>
        <div className="flex gap-1">
          {player.holeCards.length > 0 && player.holeCards.map((card, i) => (
            <PlayingCard
              key={i}
              card={card}
              size="sm"
              faceDown={!showCards}
              delay={i * 0.1}
            />
          ))}
        </div>

        <motion.div
          animate={isCurrentTurn ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`
            glass-strong rounded-xl px-3 py-1.5 text-center min-w-[80px]
            ${isCurrentTurn ? 'ring-2 ring-poker-gold' : ''}
            ${player.folded ? 'opacity-50' : ''}
          `}
        >
          <div className="flex items-center justify-center gap-1.5">
            {isDealer && (
              <span className="text-xs bg-poker-gold text-poker-black rounded-full w-4 h-4 flex items-center justify-center font-bold">
                D
              </span>
            )}
            <span className={`text-sm font-medium ${isMe ? 'text-poker-gold' : 'text-white'}`}>
              {player.name}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {formatINR(player.chips)}
          </div>
          {player.currentBet > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-poker-gold font-medium"
            >
              {formatINR(player.currentBet)}
            </motion.div>
          )}
          {player.folded && (
            <div className="text-xs text-red-400 font-medium">FOLD - BHAG GYA</div>
          )}
          {player.isAllIn && (
            <div className="text-xs text-yellow-400 font-medium">ALL-IN - SAB KHA PAKKA</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
