import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { socketManager } from './utils/socket';
import Lobby from './pages/Lobby';
import GameTable from './pages/GameTable';
import Tutorial from './components/Tutorial';
import HandRankings from './components/HandRankings';

export default function App() {
  const currentTable = useGameStore((s) => s.currentTable);
  const playerName = useGameStore((s) => s.playerName);
  const tutorialComplete = useGameStore((s) => s.tutorialComplete);

  useEffect(() => {
    socketManager.connect();

    const unsubTables = socketManager.onTables((tables) => {
      useGameStore.getState().setTables(tables);
    });

    const unsubState = socketManager.onTableState((state) => {
      useGameStore.getState().setCurrentTable(state);
    });

    const unsubError = socketManager.onError((err) => {
      console.error('Server error:', err.message);
    });

    return () => {
      unsubTables();
      unsubState();
      unsubError();
      socketManager.disconnect();
    };
  }, []);

  if (!playerName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-poker-black via-poker-dark to-poker-black flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🃏🇮🇳</div>
            <h1 className="text-3xl font-display font-bold text-poker-gold mb-2">NiPok 🥜</h1>
            <p className="text-gray-400">Texas Hold'em • Desi Andaaz</p>
          </div>
          <input
            autoFocus
            placeholder="Enter your nickname"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-poker-gold/50 transition-colors mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                useGameStore.getState().setPlayerName((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
          <p className="text-sm text-gray-500 text-center">Enter dabao aur khelo! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-black via-poker-dark to-poker-black">
      {!currentTable ? <Lobby /> : <GameTable />}
      {!tutorialComplete && <Tutorial />}
      <HandRankings />
    </div>
  );
}
