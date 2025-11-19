import { Request, Response } from 'express';
import { ConversationService } from '../services/ConversationService';

export class ConversationController {
  private conversationService: ConversationService;

  constructor() {
    this.conversationService = new ConversationService();
  }

  /**
   * 发送消息
   * POST /api/conversations/message
   */
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';
      
      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      const { creatureId, content } = req.body;

      if (!creatureId || !content) {
        res.status(400).json({ error: 'creatureId and content are required' });
        return;
      }

      if (content.trim().length === 0) {
        res.status(400).json({ error: 'Message content cannot be empty' });
        return;
      }

      if (content.length > 500) {
        res.status(400).json({ error: 'Message too long (max 500 characters)' });
        return;
      }

      const result = await this.conversationService.sendMessage({
        userId,
        creatureId,
        content: content.trim()
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        message: error.message 
      });
    }
  };

  /**
   * 获取对话历史
   * GET /api/conversations/:creatureId
   */
  getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';
      
      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      const { creatureId } = req.params;

      const result = await this.conversationService.getConversation(userId, creatureId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error getting conversation:', error);
      res.status(500).json({ 
        error: 'Failed to get conversation',
        message: error.message 
      });
    }
  };

  /**
   * 获取用户的所有对话列表
   * GET /api/conversations
   */
  getUserConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';
      
      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      const conversations = await this.conversationService.getUserConversations(userId);

      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error: any) {
      console.error('Error getting user conversations:', error);
      res.status(500).json({ 
        error: 'Failed to get conversations',
        message: error.message 
      });
    }
  };

  /**
   * 删除对话
   * DELETE /api/conversations/:conversationId
   */
  deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      // TEMPORARILY DISABLED AUTH - Use default test user
      const userId = req.user?.id || 'test-user-id';
      
      // if (!userId) {
      //   res.status(401).json({ error: 'Unauthorized' });
      //   return;
      // }

      const { conversationId } = req.params;

      await this.conversationService.deleteConversation(conversationId, userId);

      res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      
      if (error.message === 'Conversation not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      if (error.message === 'Unauthorized to delete this conversation') {
        res.status(403).json({ error: error.message });
        return;
      }

      res.status(500).json({ 
        error: 'Failed to delete conversation',
        message: error.message 
      });
    }
  };
}
