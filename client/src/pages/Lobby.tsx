import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { socketManager } from '../utils/socket';

export default function Lobby() {
  const tables = useGameStore((s) => s.tables);
  const playerName = useGameStore((s) => s.playerName);
  const sessionId = useGameStore((s) => s.sessionId);
  const setTutorialComplete = useGameStore((s) => s.setTutorialComplete);
  const tutorialComplete = useGameStore((s) => s.tutorialComplete);

  const handleJoin = (tableId: string) => {
    socketManager.joinTable(tableId, playerName, sessionId);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-poker-gold">
              🥜 NiPok
            </h1>
            <p className="text-gray-400 text-sm mt-1">Namaste, {playerName} ji!</p>
          </div>
          <div className="flex gap-3">
            {!tutorialComplete && (
              <button
                onClick={() => setTutorialComplete(true)}
                className="px-4 py-2 text-sm glass rounded-xl text-gray-300 hover:text-white transition-colors"
              >
                Chod De Ye Sab
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map((table) => (
            <motion.button
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleJoin(table.id)}
              className="glass rounded-2xl p-6 text-left group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-poker-gold transition-colors">
                    {table.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {table.playerCount}/{table.maxPlayers} log
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-poker-gold font-semibold">₹{table.blinds}</div>
                  <div className="text-xs text-gray-500">Andhi (Blind)</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-poker-gold rounded-full transition-all"
                    style={{ width: `${(table.playerCount / table.maxPlayers) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {table.playerCount >= table.maxPlayers ? 'BHAR GYA' : table.playerCount >= 2 ? 'CHAL RHA HAI' : 'KHAALI'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
