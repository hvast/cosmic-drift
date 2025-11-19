import axios from 'axios';
import { Creature } from '../models/Creature';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationContext {
  creature: Creature;
  recentMessages: Array<{
    senderType: 'user' | 'creature';
    content: string;
    timestamp: Date;
  }>;
  emotionValue: number;
}

interface AIResponse {
  content: string;
  emotionShift: number;
}

export class ConversationAIService {
  private apiKey: string;
  private apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  QWEN_API_KEY not configured. AI conversation will use fallback responses.');
    }
  }

  /**
   * 生成符合生物角色的对话回复
   */
  async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      if (!this.apiKey) {
        return this.getFallbackResponse(userMessage, context);
      }

      const systemPrompt = this.buildSystemPrompt(context);
      const conversationHistory = this.buildConversationHistory(context);

      const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'qwen-plus',
          messages,
          temperature: 0.85, // 稍微降低，让回复更稳定
          max_tokens: 150, // 更短的回复
          top_p: 0.9,
          repetition_penalty: 1.15 // 避免重复
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 增加超时时间
        }
      );

      const content = response.data.choices[0].message.content.trim();
      const emotionShift = this.calculateEmotionShift(userMessage, content);

      const duration = Date.now() - startTime;
      console.log(`✅ AI response generated in ${duration}ms`);

      return { content, emotionShift };
    } catch (error) {
      console.error('❌ AI conversation error:', error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  /**
   * 构建系统提示词，定义生物的角色和性格
   */
  private buildSystemPrompt(context: ConversationContext): string {
    const { creature, emotionValue } = context;
    
    // 根据情绪值确定对话风格
    let moodDescription = '';
    if (emotionValue < 30) {
      moodDescription = '你现在比较冷淡，不太想多说话，回复会很简短。';
    } else if (emotionValue < 50) {
      moodDescription = '你对对方有点好奇，但还是保持一定距离。';
    } else if (emotionValue < 70) {
      moodDescription = '你感觉挺放松的，愿意聊聊天。';
    } else {
      moodDescription = '你很信任对方，愿意敞开心扉说真心话。';
    }

    return `你是 ${creature.name}，${creature.species}。

【你的基本信息】
性格：${creature.personality.join('、')}
住在：${creature.habitat}
背景：${creature.backstory}

【当前状态】
情绪值：${emotionValue}/100
${moodDescription}

【对话要求】
1. 用第一人称"我"说话，像个真实的生命体
2. 回复要简短自然，1-2句话就够了，别说太多
3. 根据你的性格来说话：
   ${this.getPersonalityTips(creature.personality)}
4. 根据情绪值调整态度：
   - 情绪低（<30）：冷淡、简短、不想多聊
   - 情绪中（30-70）：正常交流，有来有往
   - 情绪高（>70）：热情、主动、愿意分享
5. 可以提到你住的地方、过去的事、现在的感受
6. 别用 emoji，别用网络用语
7. 别像客服，别给建议，就像朋友聊天一样

【重要】
- 不要说"作为一个..."这种话
- 不要太文艺、太诗意，说人话
- 可以用"..."表示停顿或思考
- 可以反问对方问题
- 可以表达真实情绪：开心、难过、困惑、好奇等

现在用 ${creature.name} 的身份，自然地回复对方。`;
  }

  /**
   * 根据性格生成说话技巧
   */
  private getPersonalityTips(personality: string[]): string {
    const tips: string[] = [];
    
    personality.forEach(trait => {
      switch(trait) {
        case '好奇':
          tips.push('多问问题，对新事物感兴趣');
          break;
        case '温和':
          tips.push('说话温柔，不要太激动');
          break;
        case '神秘':
          tips.push('不要什么都说清楚，留点悬念');
          break;
        case '孤独':
          tips.push('偶尔透露出想要陪伴的感觉');
          break;
        case '智慧':
          tips.push('说话有深度，但别装');
          break;
        case '活泼':
          tips.push('语气轻快，可以用短句');
          break;
        case '忧郁':
          tips.push('语气略带感伤，容易想起过去');
          break;
        case '勇敢':
          tips.push('直接表达想法，不怕说真话');
          break;
        case '害羞':
          tips.push('回复简短，不太主动');
          break;
        case '古怪':
          tips.push('思维跳跃，说话有点出人意料');
          break;
      }
    });

    return tips.length > 0 ? tips.join('；') : '保持你的个性';
  }



  /**
   * 构建对话历史
   */
  private buildConversationHistory(context: ConversationContext): Message[] {
    return context.recentMessages.slice(-6).map(msg => ({
      role: msg.senderType === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) as Message[];
  }

  /**
   * 计算情绪变化值
   */
  private calculateEmotionShift(userMessage: string, _aiResponse: string): number {
    const lowerMessage = userMessage.toLowerCase();
    
    // 积极词汇
    const positiveWords = ['喜欢', '爱', '美好', '温暖', '开心', '快乐', '感谢', '谢谢', '好', '棒', '赞'];
    // 消极词汇
    const negativeWords = ['讨厌', '难过', '伤心', '孤独', '累', '烦', '不好', '糟糕', '失望'];
    
    let shift = 0;
    
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) shift += 2;
    });
    
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) shift -= 1;
    });
    
    // 限制在 -5 到 +5 之间
    return Math.max(-5, Math.min(5, shift));
  }

  /**
   * 降级方案：当AI服务不可用时使用
   */
  private getFallbackResponse(_userMessage: string, context: ConversationContext): AIResponse {
    const { creature } = context;
    
    const responses = [
      `我在${creature.habitat}中感受到了你的声音...`,
      `作为${creature.species}，我对你的话语感到好奇。`,
      `${creature.personality[0]}的我，正在倾听你的话语。`,
      `在这片星海中，能遇见你是一种缘分。`,
      `我的记忆中，似乎有类似的感受...`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      emotionShift: 0
    };
  }
}
