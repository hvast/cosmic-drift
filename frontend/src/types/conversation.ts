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

export interface SendMessageRequest {
  creatureId: string;
  content: string;
}

export interface SendMessageResponse {
  userMessage: Message;
  creatureMessage: Message;
  conversation: Conversation;
  emotionValue: number;
}

export interface ConversationListItem {
  conversation: Conversation;
  creature: {
    id: string;
    name: string;
    species: string;
    imageUrl: string;
    emotionValue: number;
  };
  lastMessage: Message | null;
}
