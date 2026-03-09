import { useState } from "react";
import { X } from "lucide-react";
import { playSound } from "../lib/soundUtils";

interface ImageMessageBubbleProps {
  imageUrl: string;
  type: "sent" | "received";
}

export function ImageMessageBubble({ imageUrl, type }: ImageMessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        onClick={() => { playSound("lightSwitch"); setIsExpanded(true); }}
        className="cursor-pointer overflow-hidden relative"
        style={{
          maxWidth: '240px',
          height: 'auto',
          borderRadius: '16px',
          border: '2px solid rgba(196,96,26,0.18)',
          boxShadow: '0px 4px 16px rgba(160,80,20,0.15)',
        }}
      >
        <img
          src={imageUrl}
          alt="Shared image"
          className="w-full h-full object-cover"
          style={{
            display: 'block',
          }}
        />
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: '#FDF6EC',
          }}
          onClick={() => { playSound("pageBackChime"); setIsExpanded(false); }}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(44, 26, 14, 0.1)',
              color: '#2C1A0E',
            }}
            onClick={() => { playSound("pageBackChime"); setIsExpanded(false); }}
          >
            <X size={24} />
          </button>
          <img
            src={imageUrl}
            alt="Expanded view"
            className="max-w-[90%] max-h-[90%] object-contain"
            style={{
              borderRadius: '16px',
            }}
          />
        </div>
      )}
    </>
  );
}