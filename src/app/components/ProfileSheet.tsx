import { Camera } from "lucide-react";
import { playSound } from "../lib/soundUtils";

interface ProfileSheetProps {
  name: string;
  initial: string;
  gradient: string;
  relationship: string;
  onClose: () => void;
}

export function ProfileSheet({ name, initial, gradient, relationship, onClose }: ProfileSheetProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
        onClick={() => { playSound("pageBackChime"); onClose(); }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center px-6 pb-12"
        style={{
          height: '60%',
          backgroundColor: '#FFFAF3',
          borderTopLeftRadius: '32px',
          borderTopRightRadius: '32px',
          boxShadow: '0px -8px 32px rgba(160, 80, 20, 0.12)',
        }}
      >
        {/* Drag handle */}
        <div
          className="mt-3 mb-8 rounded-full"
          style={{
            width: '48px',
            height: '4px',
            backgroundColor: 'rgba(44, 26, 14, 0.1)',
          }}
        />

        {/* Avatar with gradient */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white mb-4"
          style={{
            background: gradient,
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '36px',
            fontWeight: 600,
          }}
        >
          {initial}
        </div>

        {/* Name */}
        <h2
          className="mb-2"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px',
            fontWeight: 600,
            color: '#2C1A0E',
          }}
        >
          {name}
        </h2>

        {/* Relationship */}
        <p
          className="mb-8"
          style={{
            fontFamily: 'Libre Baskerville, serif',
            fontSize: '14px',
            fontStyle: 'italic',
            color: '#9A7A60',
          }}
        >
          {relationship}
        </p>

        {/* Add photo button */}
        <button
          className="w-20 h-20 rounded-full flex flex-col items-center justify-center gap-1"
          style={{
            border: '2px dashed #E8873A',
            color: '#E8873A',
          }}
        >
          <Camera size={24} />
          <span
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '11px',
            }}
          >
            Add photo
          </span>
        </button>
      </div>
    </>
  );
}
