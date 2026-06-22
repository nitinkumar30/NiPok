import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

const TUTORIAL_STEPS = [
  {
    title: '🥜 Desi Poker Mein Swagat Hai!',
    content: 'Texas Hold\'em ab Hindustani style mein! Goal simple hai — do gupchup cards aur 5 public cards milake sabse strong 5-card ki jodi banao. Pot jeeto, ya sabko fold karwake akela cricket khelo! No need to go to Goa, gamble from your chai tapri.'
  },
  {
    title: 'Tere Cards, Tera Khel',
    content: 'Har khelne wale ko 2 private cards milte hain (hole cards) — sirf tu dekh sakta hai. Bech mein 5 community cards sab ke saamne khulte hain jaise TV serial ke episodes. Best 5-card jodi banani hai — baaki sab "Chalta Hai".'
  },
  {
    title: 'Kaise Khelein? Action Samjho',
    content: 'Fold - Haath jodke nikal lo. Check - Jab koi daav na ho toh chup raho. Call - Jo daav hai, utna lagao. Raise - Daav badao, pressure daalo. All-In - Saari rupaiya ek saath laga do! Sab kuch daav par lagta hai yahan.'
  },
  {
    title: 'Haathon ki Ranking - Yaad Rakho',
    content: 'Sabse upar: Royal Flush → Straight Flush → Char ki Godi → Full House → Flush (ek suit) → Seedha → Teen Tika → Do Jodi → Ek Jodi → High Card. Side mein "Hath Dekh" dabake kabhi bhi dekh sakte ho. Koi sharam nahi!'
  }
];

export default function Tutorial() {
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const setTutorialComplete = useGameStore((s) => s.setTutorialComplete);
  const nextTutorialStep = useGameStore((s) => s.nextTutorialStep);

  const step = TUTORIAL_STEPS[tutorialStep];
  if (!step) return null;

  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          key={tutorialStep}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="glass-strong rounded-2xl p-6 md:p-8 max-w-md w-full"
        >
          <div className="flex items-center gap-2 mb-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= tutorialStep ? 'bg-poker-gold' : 'bg-white/10'}`}
              />
            ))}
          </div>

          <h2 className="text-xl font-display font-bold text-poker-gold mb-3">
            {step.title}
          </h2>
          <p className="text-gray-300 leading-relaxed mb-6 text-sm">
            {step.content}
          </p>

          <div className="flex justify-between">
            <button
              onClick={() => setTutorialComplete(true)}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Chod De
            </button>
            <button
              onClick={isLastStep ? () => setTutorialComplete(true) : nextTutorialStep}
              className="px-6 py-2 bg-poker-gold text-poker-black font-semibold rounded-xl hover:bg-yellow-400 transition-colors"
            >
              {isLastStep ? 'Khelna Shuru Kar! 🚀' : 'Aage Chalo →'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
