interface MessageBubbleProps {
  type: "sent" | "received";
  content: string;
  timestamp?: string;
}

export function MessageBubble({ type, content, timestamp }: MessageBubbleProps) {
  const isSent = type === "sent";
  
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[75%]">
        <div 
          className="px-[18px] py-[14px]"
          style={{
            borderRadius: isSent ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
            background: isSent 
              ? '#C4783A'
              : '#EDE4D0',
            color: isSent ? 'white' : '#1C1008',
            fontFamily: 'Lato, sans-serif',
            fontSize: 'var(--font-body, 16px)',
            lineHeight: '1.55',
            fontWeight: 400,
            boxShadow: isSent 
              ? '0px 2px 8px rgba(140,60,20,0.15)'
              : '0px 3px 10px rgba(160,80,20,0.09), inset 0px 1px 3px rgba(160,80,20,0.08)',
            border: isSent ? 'none' : '1px solid rgba(196,96,26,0.10)',
            cursor: 'default',
          }}
        >
          {content}
        </div>
        {timestamp && (
          <p 
            className={`px-2 ${isSent ? 'text-right' : 'text-left'}`}
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '11px',
              fontWeight: 300,
              color: '#B09070',
              opacity: 0.55,
              marginTop: '4px',
            }}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}