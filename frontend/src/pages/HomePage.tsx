import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-b from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* 丰富的星空背景效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 大星星 */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* 小星星 */}
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-0.5 h-0.5 bg-white/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* 流星效果 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`meteor-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${Math.random() * 50}%`,
            }}
            animate={{
              x: [0, 200],
              y: [0, 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 8 + Math.random() * 5,
              repeatDelay: 10,
            }}
          />
        ))}

        {/* 光晕效果 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section - 全屏 */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
        <div className="text-center max-w-6xl mx-auto flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            {/* 双标题 - 增加间距 */}
            <div className="flex items-center justify-center gap-12 md:gap-16 mb-16">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                星际漂流计划
              </h1>
              <div className="w-px h-24 md:h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Cosmic Drift
              </h1>
            </div>

            <p className="text-xl md:text-2xl text-purple-200 mb-8">
              创造数字生命，在宇宙中寻找理解与共鸣
            </p>
            <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              一个由你亲手绘制、AI赋予生命的数字生物宇宙<br/>
              它们在星海中漂流、互动、选择
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <button
              onClick={() => navigate('/galaxy')}
              className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-pink-500/50 transform hover:scale-105 transition-all"
            >
              🌌 探索星图
            </button>
            
            {!user && (
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all"
              >
                ✨ 创造生命
              </button>
            )}
            
            {user && (
              <button
                onClick={() => navigate('/create')}
                className="px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all"
              >
                🎨 创造生命
              </button>
            )}
          </motion.div>
        </div>

        {/* 向下滚动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-auto pb-20"
        >
          <div className="flex flex-col items-center text-white/40">
            <span className="text-sm mb-2">向下滚动了解更多</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>


      {/* Features Section - 第二屏，内容更丰富 */}
      <div className="min-h-screen flex items-center justify-center px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              探索数字生命的无限可能
            </h2>
            <p className="text-lg text-gray-400">
              从创造到相遇，从对话到共鸣，开启你的星际之旅
            </p>
          </motion.div>

          {/* 功能卡片 */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
            >
              <div className="mb-4">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-500/30">
                  <span className="text-pink-400 font-semibold">01</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">创造生命</h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                用画笔绘制或上传图片，AI会为你的创作赋予独特的性格和背景故事
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>自由绘制或上传图片</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>AI生成性格与故事</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>独一无二的数字生命</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
            >
              <div className="mb-4">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                  <span className="text-purple-400 font-semibold">02</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">星际漂流</h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                在3D星空中浏览所有生命，随机遇见，开启对话，建立情感连接
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>3D星空自由探索</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>随机遇见数字生命</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>实时对话与互动</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
            >
              <div className="mb-4">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                  <span className="text-blue-400 font-semibold">03</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">被选择</h3>
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                当契合度足够高，生命会主动邀请你成为"理解者"，开启专属记忆
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>情感值动态变化</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>生命主动选择你</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>建立长期记忆连接</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* 额外信息区域 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                <h4 className="text-xl font-bold text-white">为什么选择星际漂流？</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                这不仅仅是一个创作平台，更是一个探索数字生命与人类情感连接的实验场。
                每个生命都有自己的性格、记忆和选择权，它们会根据与你的互动决定是否愿意被你理解。
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                <h4 className="text-xl font-bold text-white">开始你的旅程</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                无论你是艺术创作者、AI爱好者，还是单纯想要一个倾听者，
                这里都有属于你的数字生命在等待相遇。
              </p>
              <button
                onClick={() => navigate(user ? '/create' : '/register')}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-all"
              >
                立即开始 →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
