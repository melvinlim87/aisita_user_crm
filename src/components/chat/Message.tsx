import React from 'react';
import { Message as MessageType } from '@/types/common/ChatContext';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { sender, content, timestamp, isLoading = false } = message;
  const isAi = sender === 'ai';
  
  const formatContent = (content: string) => {
    // Process markdown-like formatting
    // This is a simple implementation - in a real app you might use a markdown parser
    
    // Process code blocks
    let formattedText = content.replace(/```([^`]+)```/g, '<pre class="bg-[#16161c] p-3 rounded-md my-2 overflow-x-auto text-sm"><code>$1</code></pre>');
    
    // Process bold text
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Process italics
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Process numbered lists
    formattedText = formattedText.replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>');
    
    // Process bullet lists
    formattedText = formattedText.replace(/^-\s(.+)$/gm, '<li>$1</li>');
    
    // Wrap lists in ul or ol
    if (formattedText.includes('<li>')) {
      formattedText = formattedText.replace(/<li>(.+)<\/li>/g, '<ul class="list-disc pl-5 my-2">$&</ul>');
      // Remove nested uls
      formattedText = formattedText.replace(/<ul class="list-disc pl-5 my-2">(<ul class="list-disc pl-5 my-2">.*?<\/ul>)<\/ul>/g, '$1');
    }
    
    // Process paragraphs - split by new lines
    formattedText = formattedText.replace(/\n\n/g, '</p><p class="my-2">');
    
    // Wrap in paragraph if not already wrapped
    if (!formattedText.startsWith('<pre') && !formattedText.startsWith('<ul') && !formattedText.startsWith('<p')) {
      formattedText = `<p class="my-2">${formattedText}</p>`;
    }
    
    return formattedText;
  };

  // Format the timestamp for display
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex gap-3 py-4 ${isAi ? 'bg-[#1a1a24]' : ''}`}>
      <div className="flex-shrink-0">
        {isAi ? (
          <div className="w-8 h-8 rounded-full bg-[#3a3a45] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#94a3b8]" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#3a3a45] flex items-center justify-center">
            <User className="w-5 h-5 text-[#94a3b8]" />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            {isAi ? 'AI Assistant' : 'You'}
          </span>
          <span className="text-xs text-gray-500">
            {formattedTime}
          </span>
        </div>
        {isLoading && isAi ? (
          <div className="text-sm text-[#e2e8f0] leading-relaxed italic">
            Thinking
            <span className="inline-block animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '200ms' }}>.</span>
            <span className="inline-block animate-bounce" style={{ animationDelay: '400ms' }}>.</span>
          </div>
        ) : (
          <div 
            className={`prose prose-sm max-w-none ${isAi ? 'prose-invert' : 'text-[#e2e8f0]'}`}
            dangerouslySetInnerHTML={{ __html: formatContent(content) }} 
          />
        )}
      </div>
    </div>
  );
};

export default Message;