import { useEffect } from "react";
import { TEXTURE_LABELS, TEXTURE_EMOJIS } from "../lib/timeTexture/textureStates";
import { playSound } from "../lib/soundUtils";
type MemoryAnchor = {
  id?: string;
  date: string;
  score?: number;
  state?: keyof typeof TEXTURE_LABELS;
  note?: string;
  photo?: string;
  voiceTranscript?: string;
};

type Props = {
  anchor: MemoryAnchor | null;
  onClose: () => void;
};

export function MemoryAnchorModal({ anchor, onClose }: Props) {
  // close with ESC key — must be before any early return to satisfy Rules of Hooks
  useEffect(() => {
    if (!anchor) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("pageBackChime");
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [anchor, onClose]);

  if (!anchor) return null;

  const stateLabel = anchor.state ? TEXTURE_LABELS[anchor.state] : null;
  const stateEmoji = anchor.state ? TEXTURE_EMOJIS[anchor.state] : null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => { playSound("pageBackChime"); onClose(); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl p-6 w-[340px]"
        style={{
          backgroundColor: "var(--amber-card)",
          boxShadow: "0px 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div className="mb-4">
          <h3
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "26px",
              color: "var(--amber-text-dark)",
            }}
          >
            Memory Anchor
          </h3>

          <p
            style={{
              fontSize: "13px",
              color: "var(--amber-text-muted)",
            }}
          >
            {anchor.date}
          </p>
        </div>

        {/* Texture score */}
        {anchor.score !== undefined && (
          <div
            className="flex items-center justify-between mb-4"
            style={{
              borderRadius: "16px",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.5)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--amber-text-muted)",
                }}
              >
                Texture
              </p>

              {stateLabel && (
                <p
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "20px",
                    color: "var(--amber-primary)",
                  }}
                >
                  {stateLabel} {stateEmoji}
                </p>
              )}
            </div>

            <div
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "28px",
                color: "var(--amber-primary)",
              }}
            >
              {anchor.score}
            </div>
          </div>
        )}

        {/* Photo */}
        {anchor.photo && (
          <div className="mb-4">
            <img
              src={anchor.photo}
              alt="Memory"
              className="rounded-2xl"
              style={{
                width: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Reflection text */}
        {anchor.note && (
          <div className="mb-3">
            <p
              style={{
                fontSize: "13px",
                color: "var(--amber-text-muted)",
                marginBottom: "4px",
              }}
            >
              Reflection
            </p>

            <p
              style={{
                fontSize: "15px",
                color: "var(--amber-text-dark)",
                lineHeight: 1.4,
              }}
            >
              {anchor.note}
            </p>
          </div>
        )}

        {/* Voice transcript */}
        {anchor.voiceTranscript && (
          <div className="mb-3">
            <p
              style={{
                fontSize: "13px",
                color: "var(--amber-text-muted)",
                marginBottom: "4px",
              }}
            >
              Voice reflection
            </p>

            <p
              style={{
                fontSize: "15px",
                color: "var(--amber-text-dark)",
                lineHeight: 1.4,
              }}
            >
              {anchor.voiceTranscript}
            </p>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={() => { playSound("pageBackChime"); onClose(); }}
          className="mt-4 w-full"
          style={{
            borderRadius: "14px",
            padding: "10px",
            backgroundColor: "var(--amber-primary)",
            color: "white",
            fontSize: "14px",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
