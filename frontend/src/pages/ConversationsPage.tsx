import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { conversationService } from '../services/conversationService';
import { ConversationListItem } from '../types/conversation';

const ConversationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await conversationService.getUserConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm('确定要删除这段对话吗？')) return;

    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.conversation.id !== conversationId));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('删除失败，请重试');
    }
  };

  const getEmotionColor = (value: number) => {
    if (value < 30) return 'from-blue-500 to-purple-500';
    if (value < 70) return 'from-purple-500 to-pink-500';
    return 'from-pink-500 to-rose-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-light text-white mb-2">我的对话</h1>
          <p className="text-white/60">与数字生命的连接记录</p>
        </motion.div>

        {conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/40 mb-6">还没有开始任何对话</p>
            <button
              onClick={() => navigate('/galaxy')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              探索星图
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {conversations.map((item, index) => (
              <motion.div
                key={item.conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/chat/${item.creature.id}`)}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* 生物头像 */}
                  <img
                    src={item.creature.imageUrl}
                    alt={item.creature.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-white/40 transition-all"
                  />

                  {/* 对话信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-light text-white">{item.creature.name}</h3>
                      <span className="text-xs text-white/40">
                        {new Date(item.conversation.lastMessageAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>

                    <p className="text-sm text-white/60 mb-3">{item.creature.species}</p>

                    {/* 最后一条消息 */}
                    {item.lastMessage && (
                      <p className="text-sm text-white/70 truncate">
                        {item.lastMessage.senderType === 'user' ? '你: ' : ''}
                        {item.lastMessage.content}
                      </p>
                    )}

                    {/* 情绪值和统计 */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getEmotionColor(item.creature.emotionValue)}`}
                            style={{ width: `${item.creature.emotionValue}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">
                          {item.creature.emotionValue}
                        </span>
                      </div>

                      <span className="text-xs text-white/40">
                        {item.conversation.messageCount} 条消息
                      </span>

                      {item.conversation.memoryType === 'longterm' && (
                        <span className="text-xs text-pink-400">已认养</span>
                      )}
                    </div>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDeleteConversation(item.conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-full"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
