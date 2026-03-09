import { useState } from "react";
import { useNavigate } from "react-router";
import { playSound } from "../lib/soundUtils";

interface WritingPadProps {
  onClose: () => void;
}

export function WritingPad({ onClose }: WritingPadProps) {
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handlePrint = () => {
    playSound("correctAnswer");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Letter</title>
            <style>
              body {
                font-family: 'Cormorant Garamond', serif;
                font-size: 18px;
                line-height: 1.8;
                padding: 40px;
                color: #2C1A0E;
              }
            </style>
          </head>
          <body>
            <pre style="font-family: 'Cormorant Garamond', serif; white-space: pre-wrap;">${content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendAsMessage = () => {
    playSound("correctAnswer");
    // Store the letter content in localStorage for the Messages screen to pick up
    localStorage.setItem("draftMessage", content);
    onClose();
    navigate("/user/messages");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-amber-200">
        <h2
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "24px",
            color: "var(--amber-text-dark)",
          }}
        >
          Write a letter
        </h2>
        <button
          onClick={() => { playSound("pageBackChime"); onClose(); }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-amber-100 transition-colors"
          style={{
            fontSize: "28px",
            color: "var(--amber-primary)",
          }}
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dear..."
          className="w-full h-full resize-none outline-none border-none"
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "18px",
            lineHeight: "2",
            color: "var(--amber-text-dark)",
            backgroundColor: "#FDF6EC",
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 35px,
              rgba(200, 120, 40, 0.1) 35px,
              rgba(200, 120, 40, 0.1) 36px
            )`,
            backgroundAttachment: "local",
            padding: "20px",
            borderRadius: "12px",
          }}
        />
      </div>

      <div className="p-6 border-t border-amber-200 flex gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 rounded-full border min-h-[56px]"
          style={{
            borderColor: "var(--amber-primary)",
            color: "var(--amber-primary)",
            backgroundColor: "transparent",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Print
        </button>
        <button
          onClick={handleSendAsMessage}
          className="flex-1 py-3 rounded-full min-h-[56px]"
          style={{
            backgroundColor: "var(--amber-primary)",
            color: "white",
            border: "none",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Send as message
        </button>
      </div>
    </div>
  );
}
