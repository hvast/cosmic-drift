import api from './api';
import { SendMessageRequest, SendMessageResponse, ConversationListItem } from '../types/conversation';

export const conversationService = {
  /**
   * 发送消息并获取AI回复
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post<{ success: boolean; data: SendMessageResponse }>('/api/conversations/message', request);
    return response.data;
  },

  /**
   * 获取与特定生物的对话历史
   */
  async getConversation(creatureId: string) {
    const response = await api.get<{ success: boolean; data: any }>(`/api/conversations/${creatureId}`);
    return response.data;
  },

  /**
   * 获取用户的所有对话列表
   */
  async getUserConversations(): Promise<ConversationListItem[]> {
    const response = await api.get<{ success: boolean; data: ConversationListItem[] }>('/api/conversations');
    return response.data;
  },

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/api/conversations/${conversationId}`);
  }
};
