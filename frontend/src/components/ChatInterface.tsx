import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types/conversation';

interface ChatInterfaceProps {
  creatureId: string;
  creatureName: string;
  creatureImage: string;
  messages: Message[];
  emotionValue: number;
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  onBack?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  creatureName,
  creatureImage,
  messages,
  emotionValue,
  onSendMessage,
  isLoading,
  onBack
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const content = inputValue.trim();
    setInputValue('');
    await onSendMessage(content);
  };

  const getEmotionColor = (value: number) => {
    if (value < 30) return 'from-blue-500/20 to-purple-500/20';
    if (value < 70) return 'from-purple-500/20 to-pink-500/20';
    return 'from-pink-500/20 to-rose-500/20';
  };

  const getEmotionLabel = (value: number) => {
    if (value < 30) return '冷淡';
    if (value < 70) return '平静';
    return '温暖';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black">
      {/* 头部 - 生物信息 */}
      <div className="flex items-center gap-4 p-6 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        {/* 返回按钮 */}
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
            aria-label="返回"
          >
            <svg 
              className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <img
          src={creatureImage}
          alt={creatureName}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20"
        />
        <div className="flex-1">
          <h2 className="text-xl font-light text-white">{creatureName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${getEmotionColor(emotionValue)}`}
                initial={{ width: 0 }}
                animate={{ width: `${emotionValue}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-white/60">{getEmotionLabel(emotionValue)}</span>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.senderType === 'user'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                    : 'bg-white/5 text-white/90 backdrop-blur-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-white/40 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 加载指示器 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-white/40 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white/40 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-white/40 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入你想说的话..."
            maxLength={500}
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">
          {inputValue.length}/500 字符
        </p>
      </form>
    </div>
  );
};
