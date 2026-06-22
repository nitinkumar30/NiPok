import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { formatINR } from '../utils/cards';

export default function PotDisplay() {
  const currentTable = useGameStore((s) => s.currentTable);
  const game = currentTable?.game;

  if (!game || game.pot === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={game.pot}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="glass-strong rounded-xl px-5 py-2 text-center">
          <div className="text-xs text-gray-400 uppercase tracking-wider">POT - मटका</div>
          <div className="text-xl font-bold text-poker-gold">
            {formatINR(game.pot)}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
