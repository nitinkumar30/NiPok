import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { HAND_RANKINGS } from '../types';

export default function HandRankings() {
  const showHandRankings = useGameStore((s) => s.showHandRankings);
  const toggleHandRankings = useGameStore((s) => s.toggleHandRankings);

  return (
    <AnimatePresence>
      {showHandRankings && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-72 glass z-50 p-4 overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-semibold text-poker-gold">👑 Hath Ranking</h3>
            <button
              onClick={toggleHandRankings}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {HAND_RANKINGS.map((hand) => (
              <div
                key={hand.rank}
                className="glass rounded-lg p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{hand.name}</span>
                  <span className="text-xs text-poker-gold font-bold">#{hand.rank}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{hand.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
