import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatInterface } from '../components/ChatInterface';
import { conversationService } from '../services/conversationService';
import { creatureService } from '../services/creatureService';
import { Message } from '../types/conversation';
import { motion } from 'framer-motion';

const ChatPage: React.FC = () => {
  const { creatureId } = useParams<{ creatureId: string }>();
  const navigate = useNavigate();
  
  const [creature, setCreature] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [emotionValue, setEmotionValue] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载生物信息和对话历史
  useEffect(() => {
    const loadData = async () => {
      if (!creatureId) return;

      try {
        setIsInitializing(true);
        
        // 加载生物信息
        const creatureData = await creatureService.getCreatureById(creatureId);
        setCreature(creatureData);
        setEmotionValue(creatureData.emotionValue || 50);

        // 加载对话历史
        const conversationData = await conversationService.getConversation(creatureId);
        if (conversationData.messages) {
          setMessages(conversationData.messages);
        }
      } catch (err: any) {
        console.error('Failed to load chat data:', err);
        setError(err.response?.data?.error || '加载失败');
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, [creatureId]);

  // 发送消息
  const handleSendMessage = async (content: string) => {
    if (!creatureId) return;

    try {
      setIsLoading(true);
      
      const response = await conversationService.sendMessage({
        creatureId,
        content
      });

      // 添加用户消息和AI回复到列表
      setMessages(prev => [...prev, response.userMessage, response.creatureMessage]);
      
      // 更新情绪值
      setEmotionValue(response.emotionValue);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.error || '发送失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">正在连接...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !creature) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-400 mb-4">{error || '生物不存在'}</p>
          <button
            onClick={() => navigate('/galaxy')}
            className="px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
          >
            返回星图
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface
        creatureId={creature.id}
        creatureName={creature.name}
        creatureImage={creature.imageUrl}
        messages={messages}
        emotionValue={emotionValue}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatPage;
