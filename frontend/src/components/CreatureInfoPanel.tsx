import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatureProfile, ContourData } from '../types/creature';
import ParticleOutlineViewer from './ParticleOutlineViewer';
import { getCreatureContour } from '../services/creatures';

interface CreatureInfoPanelProps {
  creature: CreatureProfile | null;
  onClose: () => void;
  onStartChat: (creatureId: string) => void;
}

const CreatureInfoPanel: React.FC<CreatureInfoPanelProps> = ({
  creature,
  onClose,
  onStartChat,
}) => {
  const [isLoadingContour, setIsLoadingContour] = useState(false);
  const [contourError, setContourError] = useState<string | null>(null);
  const [contourData, setContourData] = useState<ContourData | null>(null);

  // Load contour data when creature changes
  useEffect(() => {
    console.log('=== CreatureInfoPanel useEffect triggered ===');
    console.log('Creature:', creature);
    
    if (!creature) {
      console.log('No creature, resetting contour data');
      setContourData(null);
      return;
    }

    console.log('Creature ID:', creature.id);
    console.log('Creature has contourData?', !!creature.contourData);
    
    // If creature already has contour data, use it
    if (creature.contourData && creature.contourData.points.length > 0) {
      console.log('Using existing contour data from creature:', creature.contourData.points.length, 'points');
      setContourData(creature.contourData);
      return;
    }

    console.log('No contour data in creature, fetching from API...');
    
    // Otherwise, fetch contour data from backend
    const fetchContour = async () => {
      setIsLoadingContour(true);
      setContourError(null);
      
      try {
        console.log(`🔄 Fetching contour data for creature ${creature.id}...`);
        const data = await getCreatureContour(creature.id);
        console.log(`✅ Contour data loaded: ${data.points.length} points`);
        console.log('Contour data:', data);
        setContourData(data);
      } catch (error) {
        console.error('❌ Failed to load contour data:', error);
        setContourError('无法加载轮廓数据');
      } finally {
        setIsLoadingContour(false);
      }
    };

    fetchContour();
  }, [creature]);

  if (!creature) return null;

  // Check if contour data is available
  const hasContourData = contourData && contourData.points.length > 0;

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

  // Extract dominant color from creature (assuming first color in visual features or default)
  const getCreatureColor = (): string => {
    // For now, use a default color based on emotion value
    // This can be enhanced later with actual color data from the creature
    if (creature.emotionValue <= 30) return '#60a5fa'; // blue
    if (creature.emotionValue <= 70) return '#2dd4bf'; // teal
    return '#f472b6'; // pink
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
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center transition-all z-10"
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

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row h-[600px]">
            {/* Left column - ID Card Style */}
            <div className="w-full lg:w-[420px] p-6 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative flex flex-col">
              {/* Image in top right corner */}
              <div className="absolute top-6 right-6 w-40 h-40 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
                <img
                  src={creature.imageUrl}
                  alt={creature.name}
                  className="w-full h-full object-contain"
                />
                {/* Emotion Badge */}
                <div className="absolute bottom-2 right-2">
                  <div className="bg-gray-900 bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span className={`text-xs font-medium ${getEmotionColor(creature.emotionValue)}`}>
                      {getEmotionLabel(creature.emotionValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info section */}
              <div className="space-y-4 pr-44">
                {/* Name */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-1">
                    名称 NAME
                  </h3>
                  <p className="text-xl font-medium text-white">
                    {creature.name}
                  </p>
                </div>

                {/* Species */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-1">
                    物种 SPECIES
                  </h3>
                  <p className="text-base text-gray-300">
                    {creature.species}
                  </p>
                </div>
              </div>

              {/* Full width sections below */}
              <div className="space-y-4 mt-6 flex-1">

                {/* Personality Traits */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                    性格特征 PERSONALITY
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {creature.personality.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-800 bg-opacity-60 text-cyan-300 rounded text-sm border border-cyan-900"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Habitat */}
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                    栖息地 HABITAT
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {creature.habitat}
                  </p>
                </div>

                {/* Backstory */}
                {creature.backstory && (
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                      背景故事 BACKSTORY
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {creature.backstory}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">状态</span>
                    <span className="text-gray-300">
                      {creature.status === 'drifting' ? '漂流中' : '已认养'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
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

              </div>

              {/* Action Buttons - Fixed at bottom */}
              <div className="flex gap-3 pt-6 mt-auto">
                {creature.status === 'drifting' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onStartChat(creature.id)}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg"
                  >
                    开始对话
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-all"
                >
                  关闭
                </motion.button>
              </div>
            </div>

            {/* Right column - Particle Outline */}
            <div className="flex-1 bg-gradient-to-br from-gray-950 to-black p-6 flex flex-col relative">
              {/* Title at top left */}
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-4 relative z-10">
                粒子轮廓 PARTICLE OUTLINE
              </h3>
              
              {/* Particle viewer - full size */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isLoadingContour ? (
                  // Loading state
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                    <p className="text-xs">加载轮廓数据中...</p>
                  </div>
                ) : contourError ? (
                  // Error state
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-12 h-12 text-red-500 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-xs text-center text-red-400 mb-1">轮廓数据加载失败</p>
                    <p className="text-xs text-center text-gray-500">{contourError}</p>
                  </div>
                ) : hasContourData ? (
                  // Success state - show particle viewer at full size
                  <ParticleOutlineViewer
                    contourPoints={contourData!.points}
                    color={getCreatureColor()}
                    emotionValue={creature.emotionValue}
                    width={450}
                    height={580}
                  />
                ) : (
                  // No contour data available
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-12 h-12 text-gray-600 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs text-center">暂无轮廓数据</p>
                    <p className="text-xs text-center text-gray-600 mt-1">
                      该生物尚未生成粒子轮廓
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatureInfoPanel;
