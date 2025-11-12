import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreatureCanvas from '../components/CreatureCanvas';
import ImageUploader from '../components/ImageUploader';
import ProfileEditor from '../components/ProfileEditor';
import creatureService from '../services/creatureService';
import { CreatureProfile } from '../types/creature';

type CreationStep = 'method' | 'draw' | 'upload' | 'generating' | 'edit';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreationStep>('method');
  const [imageData, setImageData] = useState<string>('');
  const [createdProfile, setCreatedProfile] = useState<CreatureProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (method: 'draw' | 'upload') => {
    setStep(method);
    setError(null);
  };

  const handleCanvasExport = (data: string) => {
    setImageData(data);
  };

  const handleImageSelect = (data: string) => {
    setImageData(data);
  };

  const handleCreateCreature = async (customization?: { name?: string; story?: string }) => {
    if (!imageData) {
      setError('请先绘制或上传图片');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('generating');

    try {
      const profile = await creatureService.createCreature({
        imageData,
        userCustomization: customization,
      });

      setCreatedProfile(profile);
      setStep('edit');
    } catch (err: any) {
      console.error('Failed to create creature:', err);
      setError(err.response?.data?.error || '创建生物失败，请重试');
      setStep(step === 'generating' ? 'method' : step);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: { name?: string; backstory?: string }) => {
    if (!createdProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await creatureService.updateCreature(createdProfile.id, updates);
      setCreatedProfile(updated);
    } catch (err: any) {
      console.error('Failed to update creature:', err);
      setError(err.response?.data?.error || '更新档案失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    // Navigate to galaxy page to see the published creature
    navigate('/galaxy');
  };

  const handleBack = () => {
    if (step === 'draw' || step === 'upload') {
      setStep('method');
      setImageData('');
    } else if (step === 'edit') {
      setStep('method');
      setImageData('');
      setCreatedProfile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">创造你的数字生命</h1>
          <p className="text-xl text-purple-300">
            绘制或上传图片，让AI为你的创作赋予灵魂
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
          >
            {error}
          </motion.div>
        )}

        {/* Method Selection */}
        {step === 'method' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMethodSelect('draw')}
              className="p-12 bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-lg rounded-2xl border-2 border-blue-500/50 hover:border-blue-400 transition-all"
            >
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-2">画布绘制</h3>
              <p className="text-purple-200">使用画笔创作你的独特生物</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMethodSelect('upload')}
              className="p-12 bg-gradient-to-br from-purple-600/30 to-pink-600/30 backdrop-blur-lg rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 transition-all"
            >
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-2xl font-bold text-white mb-2">上传图片</h3>
              <p className="text-purple-200">上传已有的图片作品</p>
            </motion.button>
          </motion.div>
        )}

        {/* Drawing Canvas */}
        {step === 'draw' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <CreatureCanvas onExport={handleCanvasExport} />
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                返回
              </button>
              <button
                onClick={() => handleCreateCreature()}
                disabled={!imageData || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成档案
              </button>
            </div>
          </motion.div>
        )}

        {/* Image Upload */}
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ImageUploader onImageSelect={handleImageSelect} />
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                返回
              </button>
              <button
                onClick={() => handleCreateCreature()}
                disabled={!imageData || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成档案
              </button>
            </div>
          </motion.div>
        )}

        {/* Generating State */}
        {step === 'generating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block text-8xl mb-6"
            >
              ✨
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-4">AI正在创造生命...</h3>
            <p className="text-purple-300">这可能需要几秒钟，请耐心等待</p>
          </motion.div>
        )}

        {/* Profile Editor */}
        {step === 'edit' && createdProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <ProfileEditor
              profile={createdProfile}
              onUpdate={handleUpdateProfile}
              onPublish={handlePublish}
              isLoading={isLoading}
            />
            <div className="flex justify-center">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                创建新生物
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CreatePage;
