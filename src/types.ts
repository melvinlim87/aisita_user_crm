export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  modelId?: string;
}

export interface Conversation {
  id: string;
  analysisId: string;
  messages: Message[];
}
