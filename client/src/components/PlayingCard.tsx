import { motion } from 'framer-motion';
import { Card as CardType } from '../types';
import { getCardDisplay } from '../utils/cards';

interface Props {
  card: CardType;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  delay?: number;
}

export default function PlayingCard({ card, size = 'md', faceDown = false, delay = 0 }: Props) {
  const { display, suit, color } = getCardDisplay(card);

  const sizeClasses = {
    sm: 'w-10 h-14 text-xs',
    md: 'w-14 h-20 text-sm',
    lg: 'w-16 h-24 text-base'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30, rotateX: 90 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className={`${sizeClasses[size]} rounded-xl card-shadow relative select-none`}
    >
      {faceDown ? (
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-400/30 flex items-center justify-center">
          <div className="text-2xl text-blue-300/50">🃏</div>
        </div>
      ) : (
        <div className="w-full h-full rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center">
          <div className={`absolute top-1 left-1.5 flex flex-col items-start leading-none ${color}`}>
            <span className="font-bold">{display}</span>
            <span className="text-xs">{suit}</span>
          </div>
          <span className={`text-2xl ${color}`}>{suit}</span>
          <div className={`absolute bottom-1 right-1.5 flex flex-col items-end leading-none ${color} rotate-180`}>
            <span className="font-bold">{display}</span>
            <span className="text-xs">{suit}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
