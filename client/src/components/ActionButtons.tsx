import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameState, Player } from '../types';
import { formatINR } from '../utils/cards';

interface Props {
  game: GameState;
  myPlayer: Player;
  isMyTurn: boolean;
  onAction: (action: string, amount?: number) => void;
}

export default function ActionButtons({ game, myPlayer, isMyTurn, onAction }: Props) {
  const [raiseAmount, setRaiseAmount] = useState(game.raiseMin || game.currentBet * 2);
  const [showRaiseInput, setShowRaiseInput] = useState(false);

  const actions = game.availableActions || [];

  const actionConfig: Record<string, { label: string; color: string; shortcut: string }> = {
    fold: { label: 'Fold - Bhag', color: 'bg-red-600 hover:bg-red-700', shortcut: 'F' },
    check: { label: 'Check - Chup', color: 'bg-gray-600 hover:bg-gray-700', shortcut: 'C' },
    call: { label: `Call - ${formatINR(game.callAmount)}`, color: 'bg-blue-600 hover:bg-blue-700', shortcut: 'V' },
    raise: { label: 'Raise - Badao', color: 'bg-poker-gold hover:bg-yellow-500 text-poker-black', shortcut: 'R' },
    allin: { label: 'All-In - Sab Laga', color: 'bg-purple-600 hover:bg-purple-700', shortcut: 'A' },
  };

  if (!game) return null;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mt-4 flex flex-col items-center gap-3"
    >
      <div className="flex gap-2">
        {actions.map((action) => {
          const config = actionConfig[action];
          if (!config) return null;
          return (
            <motion.button
              key={action}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!isMyTurn}
              onClick={() => {
                if (action === 'raise') {
                  setShowRaiseInput(true);
                } else {
                  onAction(action);
                }
              }}
              className={`
                px-6 py-3 rounded-xl font-semibold text-sm transition-all
                ${config.color}
                ${!isMyTurn ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span>{config.label}</span>
              <span className="ml-2 text-xs opacity-60">[{config.shortcut}]</span>
            </motion.button>
          );
        })}
      </div>

      {showRaiseInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <input
            type="range"
            min={game.raiseMin}
            max={game.raiseMax}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-48 accent-poker-gold"
          />
          <span className="text-poker-gold font-semibold min-w-[60px] text-center">
            {raiseAmount}
          </span>
          <button
            onClick={() => {
              onAction('raise', raiseAmount);
              setShowRaiseInput(false);
            }}
            className="px-4 py-2 bg-poker-gold text-poker-black rounded-xl font-semibold text-sm"
          >
            Pakka 🌶️
          </button>
          <button
            onClick={() => setShowRaiseInput(false)}
            className="px-4 py-2 glass rounded-xl text-sm text-gray-400"
          >
            Ruk Ja
          </button>
        </motion.div>
      )}

      {isMyTurn && actions.length > 0 && (
        <p className="text-xs text-poker-gold animate-pulse">
          Tera number aaya hai! 🔥
        </p>
      )}
    </motion.div>
  );
}
