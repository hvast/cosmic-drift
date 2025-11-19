import { ConversationRepository } from '../repositories/ConversationRepository';
import CreatureRepository from '../repositories/CreatureRepository';
import { ConversationAIService } from './ConversationAIService';
import { Conversation, Message } from '../models/Conversation';

interface SendMessageRequest {
  userId: string;
  creatureId: string;
  content: string;
}

interface SendMessageResponse {
  userMessage: Message;
  creatureMessage: Message;
  conversation: Conversation;
  emotionValue: number;
}

export class ConversationService {
  private conversationRepo: ConversationRepository;
  private creatureRepo: typeof CreatureRepository;
  private aiService: ConversationAIService;

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.creatureRepo = CreatureRepository;
    this.aiService = new ConversationAIService();
  }

  /**
   * 发送消息并获取AI回复
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const { userId, creatureId, content } = request;

    // 1. 获取或创建对话
    let conversation = await this.conversationRepo.findByUserAndCreature(userId, creatureId);
    if (!conversation) {
      conversation = await this.conversationRepo.create({
        userId,
        creatureId,
        memoryType: 'temporary'
      });
    }

    // 2. 获取生物信息
    const creature = await this.creatureRepo.findById(creatureId);
    if (!creature) {
      throw new Error('Creature not found');
    }

    // 3. 保存用户消息
    const userMessage = await this.conversationRepo.createMessage({
      conversationId: conversation.id,
      senderId: userId,
      senderType: 'user',
      content
    });

    // 4. 获取最近的对话历史
    const recentMessages = await this.conversationRepo.getRecentMessages(conversation.id, 10);

    // 5. 生成AI回复
    const aiResponse = await this.aiService.generateResponse(content, {
      creature,
      recentMessages: recentMessages.map(msg => ({
        senderType: msg.senderType,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      emotionValue: creature.emotionValue
    });

    // 6. 更新生物情绪值
    const newEmotionValue = this.calculateNewEmotionValue(
      creature.emotionValue,
      aiResponse.emotionShift
    );

    await this.creatureRepo.update(creatureId, {
      emotionValue: newEmotionValue
    });

    // 7. 保存AI回复
    const creatureMessage = await this.conversationRepo.createMessage({
      conversationId: conversation.id,
      senderId: creatureId,
      senderType: 'creature',
      content: aiResponse.content
    });

    // 8. 更新对话信息
    const updatedConversation = await this.conversationRepo.findById(conversation.id);

    return {
      userMessage,
      creatureMessage,
      conversation: updatedConversation!,
      emotionValue: newEmotionValue
    };
  }

  /**
   * 获取对话历史
   */
  async getConversation(userId: string, creatureId: string): Promise<{
    conversation: Conversation | null;
    messages: Message[];
  }> {
    const conversation = await this.conversationRepo.findByUserAndCreature(userId, creatureId);
    
    if (!conversation) {
      return { conversation: null, messages: [] };
    }

    const messages = await this.conversationRepo.getMessages(conversation.id);

    return { conversation, messages };
  }

  /**
   * 获取用户的所有对话列表
   */
  async getUserConversations(userId: string): Promise<Array<{
    conversation: Conversation;
    creature: any;
    lastMessage: Message | null;
  }>> {
    const conversations = await this.conversationRepo.findByUserId(userId);

    const result = await Promise.all(
      conversations.map(async (conversation) => {
        const creature = await this.creatureRepo.findById(conversation.creatureId);
        const messages = await this.conversationRepo.getRecentMessages(conversation.id, 1);
        const lastMessage = messages.length > 0 ? messages[0] : null;

        return {
          conversation,
          creature,
          lastMessage
        };
      })
    );

    return result;
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepo.findById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized to delete this conversation');
    }

    await this.conversationRepo.delete(conversationId);
  }

  /**
   * 计算新的情绪值
   */
  private calculateNewEmotionValue(currentValue: number, shift: number): number {
    const newValue = currentValue + shift;
    return Math.max(0, Math.min(100, newValue));
  }
}
