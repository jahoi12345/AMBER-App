import { useRef } from "react";
import { Play, Pause, Loader } from "lucide-react";
import { playSound } from "../lib/soundUtils";

interface VoiceMemoBubbleProps {
  type: "sent" | "received";
  duration: string | number;
  audioUrl?: string | null;
  isLoading?: boolean;
  isPlaying?: boolean;
  playheadProgress?: number;
  onPlay?: () => void;
}

export function VoiceMemoBubble({ 
  type, 
  duration, 
  audioUrl, 
  isLoading = false,
  isPlaying = false,
  playheadProgress = 0,
  onPlay
}: VoiceMemoBubbleProps) {
  const isSent = type === "sent";

  // Format duration if it's a number
  const durationText = typeof duration === 'number' 
    ? `0:${duration.toString().padStart(2, '0')}`
    : duration;

  // Generate random bar heights for waveform (persistent) - 18 bars, heights 8-28px
  const barHeightsRef = useRef(Array.from({ length: 18 }, () => Math.random() * 20 + 8));

  const handlePlay = () => {
    if (isLoading) return;
    playSound("lightSwitch");
    if (onPlay) {
      onPlay();
    }
  };

  return (
    <div 
      className="flex items-center gap-3 px-3 py-2.5"
      style={{
        width: '220px',
        height: '64px',
        borderRadius: '20px',
        background: isSent 
          ? 'linear-gradient(135deg, #B85418, #C8601A)'
          : '#EDE4D0',
        boxShadow: isSent
          ? '0px 4px 14px rgba(120,50,10,0.25)'
          : '0px 3px 10px rgba(160,80,20,0.09), inset 0px 1px 3px rgba(160,80,20,0.08)',
        border: isSent ? 'none' : '1px solid rgba(196,96,26,0.10)',
      }}
    >
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: isSent ? 'white' : '#C4601A',
        }}
      >
        {isLoading ? (
          <Loader size={18} color={isSent ? '#C4601A' : 'white'} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={18} color={isSent ? '#C4601A' : 'white'} fill={isSent ? '#C4601A' : 'white'} />
        ) : (
          <Play size={18} color={isSent ? '#C4601A' : 'white'} fill={isSent ? '#C4601A' : 'white'} />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1.5 justify-center">
        <div className="flex items-center gap-[3px] h-7">
          {barHeightsRef.current.map((height, i) => {
            const barProgress = i / barHeightsRef.current.length;
            const isPast = barProgress < playheadProgress;
            
            return (
              <div
                key={i}
                style={{
                  width: '2px',
                  height: `${height}px`,
                  background: isPast
                    ? (isSent ? 'white' : '#C4601A')
                    : (isSent ? 'rgba(255,255,255,0.35)' : 'rgba(196,96,26,0.30)'),
                  borderRadius: '1px',
                  transition: 'background 0.1s',
                }}
              />
            );
          })}
        </div>
        <span 
          style={{
            fontFamily: 'Lato, sans-serif',
            fontSize: '11px',
            color: isSent ? 'rgba(255,255,255,0.9)' : '#7A5A3A',
          }}
        >
          {durationText}
        </span>
      </div>
    </div>
  );
}