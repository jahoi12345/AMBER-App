import { useEffect, useState } from "react";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto dismiss after 3s
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full transition-all duration-300"
      style={{
        backgroundColor: '#E8873A',
        opacity: isVisible ? 1 : 0,
        transform: `translate(-50%, ${isVisible ? '0' : '-20px'})`,
        fontFamily: 'Lato, sans-serif',
        fontSize: '14px',
        color: 'white',
        boxShadow: '0px 8px 24px rgba(232, 135, 58, 0.3)',
      }}
    >
      {message}
    </div>
  );
}
