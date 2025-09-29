import React from 'react';
import { Message as MessageType } from '../../types';
import { User, Bot } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { sender, content, timestamp } = message;
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

  const messageTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div 
      className={`flex gap-3 mb-4 animate-fadeIn ${isAi ? 'bg-[#25252d]/70 py-4 px-6 -mx-6 border-y border-[#3a3a45]/50' : ''}`}
    >
      <div className="flex-shrink-0">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center
          ${isAi ? 'bg-gradient-to-br from-[#cbd5e1] to-[#94a3b8]' : 'bg-[#2d2d36]'}
        `}>
          {isAi ? (
            <Bot className="w-4 h-4 text-gray-900" />
          ) : (
            <User className="w-4 h-4 text-[#e2e8f0]" />
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-1">
          <h4 className={`text-sm font-medium ${isAi ? 'text-[#cbd5e1]' : 'text-[#e2e8f0]'}`}>
            {isAi ? 'Decyphers AI' : 'You'}
          </h4>
          <span className="text-xs text-gray-500 ml-2">
            {messageTime}
          </span>
        </div>
        
        <div 
          className={`prose prose-sm max-w-none ${isAi ? 'prose-invert' : 'text-[#e2e8f0]'}`}
          dangerouslySetInnerHTML={{ __html: formatContent(content) }} 
        />
      </div>
    </div>
  );
};

export default Message;