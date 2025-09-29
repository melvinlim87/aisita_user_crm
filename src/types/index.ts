export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ChartAnalysis {
  id: string;
  userId: string;
  chartUrl: string;
  title: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  analysisId: string;
  messages: Message[];
}

export type TechnicalIndicator = 
  | 'RSI' 
  | 'MACD' 
  | 'Moving Average' 
  | 'Bollinger Bands'
  | 'Fibonacci Retracement'
  | 'Volume Profile';

export interface ChartPattern {
  name: string;
  description: string;
  significance: string;
}