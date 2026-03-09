import { useState } from 'react';
import { Settings } from './Settings';
import { playSound } from '../lib/soundUtils';

interface SettingsButtonProps {
  isActivityModalOpen?: boolean;
}

export function SettingsButton({ isActivityModalOpen = false }: SettingsButtonProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {!showSettings && !isActivityModalOpen && (
        <div
          onClick={() => { playSound("navSelect"); setShowSettings(true); }}
          className="pop-on-press"
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 100,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(253,246,236,0.92)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0px 2px 10px rgba(160,80,20,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(196,96,26,0.12)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 256 256"
            fill="none"
          >
            <path
              d="M128 80a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm109.94-52.79a8 8 0 0 0-3.89-5.4l-29.83-17-.12-33.62a8 8 0 0 0-2.83-6.08 111.91 111.91 0 0 0-36.72-20.67 8 8 0 0 0-6.46.59L128 41.85 97.88 25a8 8 0 0 0-6.47-.6A111.92 111.92 0 0 0 54.73 45.15a8 8 0 0 0-2.83 6.07l-.15 33.65-29.83 17a8 8 0 0 0-3.89 5.4 106.47 106.47 0 0 0 0 41.56 8 8 0 0 0 3.89 5.4l29.83 17 .12 33.63a8 8 0 0 0 2.83 6.08 111.91 111.91 0 0 0 36.72 20.67 8 8 0 0 0 6.46-.59L128 214.15 158.12 231a7.91 7.91 0 0 0 3.9 1 8.09 8.09 0 0 0 2.57-.42 111.92 111.92 0 0 0 36.68-20.73 8 8 0 0 0 2.83-6.07l.15-33.65 29.83-17a8 8 0 0 0 3.89-5.4 106.47 106.47 0 0 0-.03-41.52zm-15 34.91-28.57 16.25a8 8 0 0 0-3.89 5.17l-.11 32.14a95.93 95.93 0 0 1-25.37 14.3L134.08 204a8 8 0 0 0-6.16 0l-26.94 15.91a95.93 95.93 0 0 1-25.37-14.3l-.11-32.14a8 8 0 0 0-3.89-5.17L43.04 152a90.71 90.71 0 0 1 0-24.08l28.57-16.25a8 8 0 0 0 3.89-5.17l.11-32.14a95.93 95.93 0 0 1 25.37-14.3L121.92 76a8 8 0 0 0 6.16 0l26.94-15.91a95.93 95.93 0 0 1 25.37 14.3l.11 32.14a8 8 0 0 0 3.89 5.17l28.57 16.25a90.71 90.71 0 0 1 .02 24.08z"
              fill="#8A6A50"
            />
          </svg>
        </div>
      )}
      
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
}