import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            星际漂流计划
          </h1>
          <p className="text-2xl text-purple-200 mb-4">
            创造数字生命，在宇宙中寻找理解与共鸣
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            一个由你亲手绘制、AI赋予生命的数字生物宇宙<br/>
            它们在星海中漂流、互动、选择被谁理解——而非被谁拥有
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
        >
          <button
            onClick={() => navigate('/galaxy')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all"
          >
            🌌 探索星图
          </button>
          
          {!user && (
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white/10 backdrop-blur-lg text-white text-lg font-semibold rounded-full border-2 border-purple-400 hover:bg-white/20 transform hover:scale-105 transition-all"
            >
              ✨ 开始创造
            </button>
          )}
          
          {user && (
            <button
              onClick={() => navigate('/create')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all"
            >
              🎨 创造生命
            </button>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-white mb-3">创造生命</h3>
            <p className="text-gray-300">
              用画笔绘制或上传图片，AI会为你的创作赋予独特的性格和背景故事
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all">
            <div className="text-5xl mb-4">🌌</div>
            <h3 className="text-2xl font-bold text-white mb-3">星际漂流</h3>
            <p className="text-gray-300">
              在3D星空中浏览所有生命，随机遇见，开启对话，建立情感连接
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all">
            <div className="text-5xl mb-4">💫</div>
            <h3 className="text-2xl font-bold text-white mb-3">被选择</h3>
            <p className="text-gray-300">
              当契合度足够高，生命会主动邀请你成为"理解者"，开启专属记忆
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
