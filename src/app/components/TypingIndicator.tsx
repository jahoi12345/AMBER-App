export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div
        className="px-4 py-3 rounded-[20px] flex items-center gap-1"
        style={{
          backgroundColor: '#F0E4CC',
          borderRadius: '20px 20px 20px 6px',
        }}
      >
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: '#C4601A',
            animationDelay: '0ms',
            animationDuration: '1s',
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: '#C4601A',
            animationDelay: '150ms',
            animationDuration: '1s',
          }}
        />
        <div
          className="w-2 h-2 rounded-full animate-bounce"
          style={{
            backgroundColor: '#C4601A',
            animationDelay: '300ms',
            animationDuration: '1s',
          }}
        />
      </div>
    </div>
  );
}