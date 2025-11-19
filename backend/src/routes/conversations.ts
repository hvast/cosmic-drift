import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new ConversationController();

// TEMPORARILY DISABLED AUTH FOR TESTING - 暂时禁用认证以便测试
// TODO: Re-enable authentication after core features are working
// router.use(authenticateToken);

// 发送消息
router.post('/message', controller.sendMessage);

// 获取对话历史
router.get('/:creatureId', controller.getConversation);

// 获取用户的所有对话列表
router.get('/', controller.getUserConversations);

// 删除对话
router.delete('/:conversationId', controller.deleteConversation);

export default router;
