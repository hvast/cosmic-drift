import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatureProfile } from '../types/creature';
import creatureService from '../services/creatureService';

interface RandomEncounterProps {
  onEncounter: (creature: CreatureProfile) => void;
}

const RandomEncounter: React.FC<RandomEncounterProps> = ({ onEncounter }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [encounteredCreature, setEncounteredCreature] = useState<CreatureProfile | null>(null);

  const handleRandomEncounter = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setShowResult(false);

    try {
      // Simulate suspense with animation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const creature = await creatureService.getRandomCreature();
      setEncounteredCreature(creature);
      setShowResult(true);
      
      // Auto-trigger the encounter callback after showing the result
      setTimeout(() => {
        onEncounter(creature);
        setShowResult(false);
        setIsAnimating(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to get random creature:', error);
      setIsAnimating(false);
    }
  };

  return (
    <div className="relative">
      {/* Random Encounter Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRandomEncounter}
        disabled={isAnimating}
        className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-all ${
          isAnimating
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
        }`}
      >
        {isAnimating ? (
          <span className="flex items-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>寻找中...</span>
          </span>
        ) : (
          '随机遇见'
        )}
      </motion.button>

      {/* Mystery Box Animation */}
      <AnimatePresence>
        {isAnimating && !showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-32 h-32 relative"
            >
              {/* Mystery Box */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">?</span>
              </div>
              
              {/* Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 8) * 60,
                    y: Math.sin((i * Math.PI * 2) / 8) * 60,
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full"
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal Animation */}
      <AnimatePresence>
        {showResult && encounteredCreature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-md shadow-2xl border-2 border-purple-500"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  你遇见了...
                </h3>
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-500">
                  <img
                    src={encounteredCreature.imageUrl}
                    alt={encounteredCreature.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-3xl font-bold text-white mb-2">
                  {encounteredCreature.name}
                </h4>
                <p className="text-gray-400">{encounteredCreature.species}</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RandomEncounter;
