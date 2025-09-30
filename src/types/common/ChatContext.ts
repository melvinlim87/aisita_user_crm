export interface Message {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    modelId?: string;
    isLoading?: boolean;
  }
  
  export interface Conversation {
    id: string;
    analysisId: string;
    messages: Message[];
  }
  