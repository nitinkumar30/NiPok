import { create } from 'zustand';
import { TableInfo, TableState, Card } from '../types';

interface GameStore {
  playerName: string;
  sessionId: string;
  tables: TableInfo[];
  currentTable: TableState | null;
  myPlayerId: string | null;
  tutorialComplete: boolean;
  tutorialStep: number;
  showHandRankings: boolean;
  coachingMessages: string[];

  setPlayerName: (name: string) => void;
  setSessionId: (id: string) => void;
  setTables: (tables: TableInfo[]) => void;
  setCurrentTable: (table: TableState | null) => void;
  setMyPlayerId: (id: string | null) => void;
  setTutorialComplete: (complete: boolean) => void;
  nextTutorialStep: () => void;
  setTutorialStep: (step: number) => void;
  toggleHandRankings: () => void;
  addCoachingMessage: (msg: string) => void;
  clearCoachingMessages: () => void;
}

const SESSION_KEY = 'poker_session_id';
const NAME_KEY = 'poker_player_name';
const TUTORIAL_KEY = 'poker_tutorial_complete';

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getStoredName(): string {
  return localStorage.getItem(NAME_KEY) || '';
}

export const useGameStore = create<GameStore>((set, get) => ({
  playerName: getStoredName(),
  sessionId: getOrCreateSessionId(),
  tables: [],
  currentTable: null,
  myPlayerId: null,
  tutorialComplete: localStorage.getItem(TUTORIAL_KEY) === 'true',
  tutorialStep: 0,
  showHandRankings: false,
  coachingMessages: [],

  setPlayerName: (name) => {
    localStorage.setItem(NAME_KEY, name);
    set({ playerName: name });
  },
  setSessionId: (id) => set({ sessionId: id }),
  setTables: (tables) => set({ tables }),
  setCurrentTable: (table) => set({ currentTable: table }),
  setMyPlayerId: (id) => set({ myPlayerId: id }),
  setTutorialComplete: (complete) => {
    localStorage.setItem(TUTORIAL_KEY, String(complete));
    set({ tutorialComplete: complete, tutorialStep: 0 });
  },
  nextTutorialStep: () => set((s) => ({ tutorialStep: s.tutorialStep + 1 })),
  setTutorialStep: (step) => set({ tutorialStep: step }),
  toggleHandRankings: () => set((s) => ({ showHandRankings: !s.showHandRankings })),
  addCoachingMessage: (msg) => set((s) => ({
    coachingMessages: [...s.coachingMessages.slice(-4), msg]
  })),
  clearCoachingMessages: () => set({ coachingMessages: [] }),
}));
