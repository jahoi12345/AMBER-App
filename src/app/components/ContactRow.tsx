import { Link } from "react-router";
import { playSound } from "../lib/soundUtils";

interface ContactRowProps {
  name: string;
  preview: string;
  unreadCount?: number;
  timestamp?: string;
  to: string;
}

// Avatar gradients per contact
const avatarGradients: Record<string, string> = {
  T: 'linear-gradient(135deg, #E8873A, #C4601A)',
  D: 'linear-gradient(135deg, #D4743A, #A84820)',
  E: 'linear-gradient(135deg, #F5A050, #D4601A)',
  M: 'linear-gradient(135deg, #C86028, #8A3A10)',
  G: 'linear-gradient(135deg, #E8873A, #C4601A)',
};

// Status ring colors
const getStatusRing = (timestamp?: string, unreadCount?: number) => {
  if (unreadCount && unreadCount > 0) {
    return '#6AAF6A'; // Active today
  }
  if (timestamp === 'Yesterday') {
    return 'rgba(232, 135, 58, 0.5)'; // Yesterday
  }
  return null; // Older - no ring
};

export function ContactRow({ name, preview, unreadCount, timestamp, to }: ContactRowProps) {
  const initial = name.charAt(0).toUpperCase();
  const gradient = avatarGradients[initial] || avatarGradients['T'];
  const statusRingColor = getStatusRing(timestamp, unreadCount);
  
  return (
    <Link 
      to={to}
      onClick={() => playSound("navSelect")}
      className="flex items-center gap-4 px-4 py-4"
      style={{
        height: '80px',
        borderRadius: '20px',
        backgroundColor: '#FFFAF3',
        border: '1px solid rgba(196, 96, 26, 0.08)',
        boxShadow: '0px 4px 14px rgba(160, 80, 20, 0.08)',
      }}
    >
      {/* Avatar with gradient and status ring */}
      <div className="relative flex-shrink-0">
        {statusRingColor && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              padding: '2px',
              background: statusRingColor,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: '#FFFAF3' }}
            />
          </div>
        )}
        <div 
          className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white relative"
          style={{
            background: gradient,
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '22px',
            fontWeight: 600,
          }}
        >
          {initial}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <p 
          className="mb-1"
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '22px',
            fontWeight: 600,
            color: '#2C1A0E',
          }}
        >
          {name}
        </p>
        {preview ? (
          <p 
            className="truncate"
            style={{
              fontFamily: 'Libre Baskerville, serif',
              fontSize: '13px',
              fontStyle: 'italic',
              color: '#9A7A60',
            }}
          >
            {preview}
          </p>
        ) : (
          <p 
            className="truncate"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '18px',
              fontStyle: 'italic',
              color: '#9A7A60',
            }}
          >
            Say hello 👋
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3 flex-shrink-0">
        {timestamp && (
          <span 
            style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: '11px',
              color: '#B09070',
            }}
          >
            {timestamp}
          </span>
        )}
        {unreadCount !== undefined && unreadCount !== null && unreadCount > 0 && (
          <div 
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#E8873A',
              fontFamily: 'Lato, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {unreadCount}
          </div>
        )}
      </div>
    </Link>
  );
}