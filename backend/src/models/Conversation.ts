export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'creature';
  content: string;
  timestamp: Date;
  sentiment?: {
    score: number;
    tone: 'positive' | 'neutral' | 'negative';
  };
}

export interface Conversation {
  id: string;
  userId: string;
  creatureId: string;
  memoryType: 'temporary' | 'longterm';
  affinityScore: number;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  isPublished: boolean;
}

export interface CreateConversationData {
  userId: string;
  creatureId: string;
  memoryType?: 'temporary' | 'longterm';
}

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'creature';
  content: string;
  sentiment?: {
    score: number;
    tone: 'positive' | 'neutral' | 'negative';
  };
}
