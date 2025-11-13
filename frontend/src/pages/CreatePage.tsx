import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreatureCanvas from '../components/CreatureCanvas';
import ImageUploader from '../components/ImageUploader';
import CreatureProfileCard from '../components/CreatureProfileCard';
import creatureService from '../services/creatureService';
import { CreatureProfile } from '../types/creature';

type CreationStep = 'method' | 'draw' | 'upload' | 'preview' | 'generating' | 'edit';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<CreationStep>('method');
  const [imageData, setImageData] = useState<string>('');
  const [createdProfile, setCreatedProfile] = useState<CreatureProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExported, setHasExported] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleMethodSelect = (method: 'draw' | 'upload') => {
    setStep(method);
    setError(null);
    setHasExported(false);
  };

  const handleCanvasExport = (data: string) => {
    setImageData(data);
    setHasExported(true);
    setHasUnsavedChanges(false); // 导出后清除未保存标记
  };

  const handleImageSelect = (data: string) => {
    setImageData(data);
  };

  // 提交证件照，进入预览步骤
  const handleSubmitPhoto = () => {
    if (!imageData) {
      setError('请先绘制或上传图片');
      return;
    }
    if ((!hasExported || hasUnsavedChanges) && step === 'draw') {
      // 不显示错误，黄色警告框已经足够明显
      return;
    }
    setStep('preview');
    setError(null);
  };

  // 用户选择自己编辑 - 跳过AI生成，直接进入编辑
  const handleManualEdit = () => {
    setStep('edit');
    // 创建一个空的档案模板，让用户填写
    setCreatedProfile({
      id: 'temp-' + Date.now(),
      name: '',
      species: '',
      personality: [],
      habitat: '',
      backstory: '',
      imageUrl: imageData,
      creatorId: 'test-user-id',
      emotionValue: 50,
      status: 'drifting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as CreatureProfile);
  };

  // 用户选择AI生成设定
  const handleAIGenerate = async () => {
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
        userCustomization: undefined,
      });

      setCreatedProfile(profile);
      setStep('edit');
    } catch (err: any) {
      console.error('Failed to create creature:', err);
      // 提供更详细的错误信息
      let errorMessage = '创建生物失败，请重试';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查后端服务是否运行';
      }
      
      setError(errorMessage);
      setStep('preview'); // 失败后回到预览页
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<CreatureProfile>) => {
    if (!createdProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      // 如果是临时ID（手动编辑模式），需要先创建生物
      if (createdProfile.id.startsWith('temp-')) {
        const profile = await creatureService.createCreature({
          imageData,
          userCustomization: {
            name: updates.name,
            species: updates.species,
            personality: updates.personality,
            habitat: updates.habitat,
            story: updates.backstory,
            emotionValue: updates.emotionValue,
          },
        });
        setCreatedProfile(profile);
      } else {
        // 否则更新现有生物
        const updated = await creatureService.updateCreature(createdProfile.id, {
          name: updates.name,
          backstory: updates.backstory,
          emotionValue: updates.emotionValue,
        });
        setCreatedProfile(updated);
      }
    } catch (err: any) {
      console.error('Failed to update creature:', err);
      // 提供更详细的错误信息
      let errorMessage = '更新档案失败，请重试';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查后端服务是否运行';
      }
      
      setError(errorMessage);
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
      setImageData(''); // 清除图片数据
      setHasExported(false);
    } else if (step === 'preview') {
      // 回到绘制页面，保留图片继续编辑
      setHasExported(false); // 重置导出状态，要求重新导出
      setStep('draw');
    } else if (step === 'edit') {
      setStep('preview'); // 从编辑回到预览
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
            <CreatureCanvas 
              onExport={handleCanvasExport} 
              onDrawingChange={() => setHasUnsavedChanges(true)}
              initialImage={imageData} 
            />
            {(!hasExported || hasUnsavedChanges) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-center"
              >
                ⚠️ 请点击"导出图片"保存您的绘制
              </motion.div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                返回
              </button>
              <button
                onClick={handleSubmitPhoto}
                disabled={!imageData || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交证件照 📸
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
                onClick={handleSubmitPhoto}
                disabled={!imageData || isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交证件照 📸
              </button>
            </div>
          </motion.div>
        )}

        {/* Preview Photo Card */}
        {step === 'preview' && imageData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            {/* Photo Card */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-500/50 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                📸 你的数字生命证件照
              </h2>
              
              {/* Image Preview */}
              <div className="relative mb-8">
                <div className="aspect-square rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
                  <img 
                    src={imageData} 
                    alt="Creature" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg">
                  <span className="text-lg font-bold">✨ 已就绪</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-black/30 rounded-xl p-6 mb-6">
                <p className="text-purple-200 text-center text-lg mb-2">
                  现在，为这个生命赋予灵魂吧！
                </p>
                <p className="text-purple-300 text-center text-sm">
                  你可以选择自己编写背景故事，或者让 AI 为你创造
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualEdit}
                  className="p-6 bg-gradient-to-br from-blue-600/40 to-cyan-600/40 backdrop-blur-sm rounded-xl border-2 border-blue-400/50 hover:border-blue-300 transition-all"
                >
                  <div className="text-4xl mb-2">✍️</div>
                  <h3 className="text-xl font-bold text-white mb-1">自己编写</h3>
                  <p className="text-blue-200 text-sm">发挥你的想象力</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAIGenerate}
                  disabled={isLoading}
                  className="p-6 bg-gradient-to-br from-purple-600/40 to-pink-600/40 backdrop-blur-sm rounded-xl border-2 border-purple-400/50 hover:border-purple-300 transition-all disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">🤖</div>
                  <h3 className="text-xl font-bold text-white mb-1">AI 生成</h3>
                  <p className="text-purple-200 text-sm">让 AI 为你创作</p>
                </motion.button>
              </div>

              {/* Back Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 text-purple-300 hover:text-white transition-colors"
                >
                  ← 重新绘制
                </button>
              </div>
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
            <CreatureProfileCard
              profile={createdProfile}
              onUpdate={handleUpdateProfile}
              onPublish={handlePublish}
              isLoading={isLoading}
              isEditing={createdProfile.id.startsWith('temp-')}
            />
            <div className="flex justify-center">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-mono"
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
