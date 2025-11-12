import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatureProfile } from '../types/creature';

interface ProfileCardOverlayProps {
  creature: CreatureProfile | null;
  onClose: () => void;
  onStartChat: (creatureId: string) => void;
}

const ProfileCardOverlay: React.FC<ProfileCardOverlayProps> = ({
  creature,
  onClose,
  onStartChat,
}) => {
  if (!creature) return null;

  const getEmotionLabel = (value: number): string => {
    if (value <= 30) return '冷淡';
    if (value <= 70) return '好奇';
    return '热情';
  };

  const getEmotionColor = (value: number): string => {
    if (value <= 30) return 'text-blue-400';
    if (value <= 70) return 'text-teal-400';
    return 'text-pink-400';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Image */}
          <div className="relative h-64 bg-gradient-to-b from-gray-800 to-gray-900">
            <img
              src={creature.imageUrl}
              alt={creature.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center transition-all"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Emotion Badge */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-gray-800 bg-opacity-90 rounded-full px-4 py-2 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                <span className={`text-sm font-medium ${getEmotionColor(creature.emotionValue)}`}>
                  {getEmotionLabel(creature.emotionValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Name and Species */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {creature.name}
              </h2>
              <p className="text-gray-400 text-sm">{creature.species}</p>
            </div>

            {/* Personality Traits */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                性格特征
              </h3>
              <div className="flex flex-wrap gap-2">
                {creature.personality.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Habitat */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                栖息地
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {creature.habitat}
              </p>
            </div>

            {/* Backstory */}
            {creature.backstory && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  背景故事
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {creature.backstory}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">状态</span>
                <span className="text-gray-300">
                  {creature.status === 'drifting' ? '漂流中' : '已认养'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">情绪值</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${creature.emotionValue}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        creature.emotionValue <= 30
                          ? 'bg-blue-500'
                          : creature.emotionValue <= 70
                          ? 'bg-teal-500'
                          : 'bg-pink-500'
                      }`}
                    />
                  </div>
                  <span className="text-gray-300 font-medium">
                    {creature.emotionValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {creature.status === 'drifting' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartChat(creature.id)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-lg"
              >
                开始对话
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCardOverlay;
