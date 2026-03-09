import { Play, Trash2 } from "lucide-react";
import { playSound } from "../lib/soundUtils";

interface VoiceRecordingPreviewProps {
  duration: string;
  onSend: () => void;
  onDelete: () => void;
}

export function VoiceRecordingPreview({ duration, onSend, onDelete }: VoiceRecordingPreviewProps) {
  // Generate static waveform
  const barHeights = Array.from({ length: 20 }, () => Math.random() * 20 + 10);

  return (
    <div className="px-6 pb-3">
      <div
        className="p-4 rounded-3xl"
        style={{
          backgroundColor: '#FFFAF3',
          border: '1px solid rgba(196, 96, 26, 0.08)',
          boxShadow: '0px 4px 14px rgba(160, 80, 20, 0.08)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#E8873A',
            }}
          >
            <Play size={16} color="white" fill="white" />
          </div>
          
          <div className="flex-1 flex items-center gap-0.5 h-5">
            {barHeights.map((height, i) => (
              <div
                key={i}
                className="w-0.5"
                style={{
                  height: `${height}px`,
                  backgroundColor: '#E8873A',
                }}
              />
            ))}
          </div>
          
          <span
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '11px',
              color: '#9A7A60',
            }}
          >
            {duration}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { playSound("pageBackChime"); onDelete(); }}
            className="flex-1 py-3 rounded-full"
            style={{
              backgroundColor: 'transparent',
              color: '#9A7A60',
              fontFamily: 'Lato, sans-serif',
              fontSize: '14px',
              border: '1px solid rgba(154, 122, 96, 0.2)',
            }}
          >
            <Trash2 size={16} className="inline mr-2" />
            Delete
          </button>
          <button
            onClick={() => { playSound("correctAnswer"); onSend(); }}
            className="flex-1 py-3 rounded-full"
            style={{
              background: 'linear-gradient(to right, #D4601A, #E8873A)',
              color: 'white',
              fontFamily: 'Lato, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
