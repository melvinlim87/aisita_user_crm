export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isLoading?: boolean;
    isError?: boolean;
    historyId?: number;
}

export interface Model {
    id: string;
    name: string;
    description: string;
    premium: boolean;
    creditCost: number;
    beta: boolean;
}