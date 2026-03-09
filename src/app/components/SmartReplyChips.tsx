import { useState, useEffect } from "react";
import { playSound } from "../lib/soundUtils";

interface SmartReplyChipsProps {
  lastMessage: string;
  onSelectReply: (reply: string) => void;
}

export function SmartReplyChips({ lastMessage, onSelectReply }: SmartReplyChipsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-generated replies
    setIsLoading(true);
    setTimeout(() => {
      // Generate contextual replies based on last message
      const replies = generateReplies(lastMessage);
      setSuggestions(replies);
      setIsLoading(false);
    }, 800);
  }, [lastMessage]);

  const generateReplies = (message: string): string[] => {
    // Simple rule-based reply generation
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('weekend') || lowerMessage.includes('seeing you')) {
      return [
        "That sounds lovely 💛",
        "I'll call you tomorrow",
        "Can't wait to see you!"
      ];
    } else if (lowerMessage.includes('how') && lowerMessage.includes('day')) {
      return [
        "It was wonderful!",
        "Pretty good, thanks 😊",
        "Tell me about yours"
      ];
    } else if (lowerMessage.includes('beautiful') || lowerMessage.includes('lovely')) {
      return [
        "That sounds lovely 💛",
        "I'm so glad!",
        "Miss you too!"
      ];
    } else {
      return [
        "That sounds lovely 💛",
        "I'll call you tomorrow",
        "Miss you too!"
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 px-6 py-3 overflow-x-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 rounded-full animate-pulse"
            style={{
              width: `${100 + i * 20}px`,
              backgroundColor: 'rgba(232, 135, 58, 0.2)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-6 py-3 overflow-x-auto">
      {suggestions.map((reply, i) => (
        <button
          key={i}
          onClick={() => { playSound("navSelect"); onSelectReply(reply); }}
          className="px-[18px] whitespace-nowrap flex-shrink-0 transition-transform active:scale-96 chip"
          style={{
            height: '40px',
            borderRadius: '999px',
            backgroundColor: '#F0E4CC',
            border: '1px solid rgba(196,96,26,0.18)',
            boxShadow: '0px 2px 6px rgba(160,80,20,0.08)',
            color: '#7A5A3A',
            fontFamily: 'Lato, sans-serif',
            fontSize: '13px',
            fontWeight: 400,
          }}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}