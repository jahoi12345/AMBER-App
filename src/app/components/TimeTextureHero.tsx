import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TEXTURE_LABELS } from "../lib/timeTexture/textureStates";
import { playSound } from "../lib/soundUtils";
import type { TextureState } from "../lib/timeTexture/types";
import { useTimeTexture } from "../lib/useTimeTexture";

const texturePhrases: Record<TextureState, string[]> = {
  compressed: [
    "Today feels quieter and more routine than usual.",
    "The day is moving gently, with fewer memorable shifts.",
    "Today may feel a little compressed and familiar.",
  ],
  steady: [
    "Today feels calm and balanced.",
    "The day has a steady rhythm so far.",
    "Today feels grounded, with a few subtle bright spots.",
  ],
  expanding: [
    "Today has felt meaningfully different in small ways.",
    "There are signs this day may stand out a little more.",
    "Today feels like it could become a memorable one.",
  ],
  vivid: [
    "Today feels rich with movement, novelty, and connection.",
    "This day is unfolding with strong texture and energy.",
    "Today stands out as unusually vivid and full.",
  ],
};

const detailPhrases: Record<TextureState, string[]> = {
  compressed: [
    "Your routines, movement, and interactions were more familiar today. Amber reads this as a day that may pass quickly in memory.",
    "There were fewer changes in environment and activity today, which can make time feel more compressed.",
  ],
  steady: [
    "You had some variation in your day, but the rhythm stayed consistent. Amber reads this as balanced and stable.",
    "Today carried enough change to stay present, without becoming especially intense or unusual.",
  ],
  expanding: [
    "Amber noticed moments of novelty, movement, and engagement that make the day feel more distinct.",
    "A few meaningful shifts in your routine suggest this day may feel larger and easier to remember.",
  ],
  vivid: [
    "Strong signals across movement, novelty, and connection make this day feel especially textured.",
    "Amber detected a rich mix of experiences today, which often makes time feel fuller and more memorable.",
  ],
};

const emojiScale: Record<TextureState, string[]> = {
  compressed: ["😔"],
  steady: ["🙂"],
  expanding: ["😊"],
  vivid: ["😁"],
};

function pickPhrase(state: TextureState, source: Record<TextureState, string[]>) {
  return source[state][0];
}

type BubbleNode = {
  emoji: string;
  size: number;
  x: number;
  y: number;
  z: number;
  driftX: number;
  driftY: number;
  driftDuration: number;
  driftDelay: number;
};

type PhysicsNode = {
  emoji: string;
  size: number;
  x: number;
  y: number;
  fixed?: boolean;
  driftX?: number;
  driftY?: number;
  driftDuration?: number;
  driftDelay?: number;
};

export function TimeTextureHero() {
  const [open, setOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const { score, state, breakdown, signals } = useTimeTexture();

  const headline = pickPhrase(state, texturePhrases);
  const detail = pickPhrase(state, detailPhrases);
  const mainEmoji = emojiScale[state][0];

  const bubbleData = useMemo(() => {
    const bubbleCount = 8;
    const baseRadius = 78;
    const padding = 8;

    const signalStrength = {
      movement: breakdown.movement * 0.5,
      novelty: breakdown.novelty,
      engagement: breakdown.engagement,
      memory: breakdown.memory,
      steps: Math.min(signals.steps / 8000, 1),
      outside: Math.min(signals.timeOutside / 120, 1),
      attention: breakdown.engagement,
      sensory: breakdown.novelty,
    };

    const emojiSignals = [
      { emoji: "🚶", strength: signalStrength.movement, base: 38 },
      { emoji: "✨", strength: signalStrength.novelty, base: 40 },
      { emoji: "💬", strength: signalStrength.engagement, base: 39 },
      { emoji: "🧠", strength: signalStrength.memory, base: 40 },
      { emoji: "👟", strength: signalStrength.steps, base: 36 },
      { emoji: "🌳", strength: signalStrength.outside, base: 38 },
      { emoji: "🎧", strength: signalStrength.attention, base: 35 },
      { emoji: "🌟", strength: signalStrength.sensory, base: 36 },
    ];

    const outerBubbles: PhysicsNode[] = emojiSignals.map((item, i) => {
      const angle = (i / bubbleCount) * Math.PI * 2;
      const size = item.base + item.strength * 4.5;

      return {
        emoji: item.emoji,
        size,
        x: Math.cos(angle) * baseRadius,
        y: Math.sin(angle) * baseRadius,
        driftX: 2 + (i % 3),
        driftY: 2 + ((i + 1) % 3),
        driftDuration: 3.8 + i * 0.18,
        driftDelay: i * 0.12,
      };
    });

    const center: PhysicsNode = {
      emoji: mainEmoji,
      size: 84,
      x: 0,
      y: 0,
      fixed: true,
    };

    const allNodes: PhysicsNode[] = [center, ...outerBubbles];

    for (let iter = 0; iter < 40; iter++) {
      for (let i = 0; i < allNodes.length; i++) {
        for (let j = i + 1; j < allNodes.length; j++) {
          const a = allNodes[i];
          const b = allNodes[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const minDist = a.size / 2 + b.size / 2 + padding;

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            if (!a.fixed) {
              a.x -= nx * overlap * 0.5;
              a.y -= ny * overlap * 0.5;
            }

            if (!b.fixed) {
              b.x += nx * overlap * 0.5;
              b.y += ny * overlap * 0.5;
            }
          }
        }
      }
    }

    const maxExtent = Math.max(
      ...allNodes.map((node) =>
        Math.max(Math.abs(node.x) + node.size / 2, Math.abs(node.y) + node.size / 2)
      )
    );

    const cloudWidth = Math.max(280, Math.ceil(maxExtent * 2 + 36));
    const cloudHeight = Math.max(220, Math.ceil(maxExtent * 2 + 24));

    const bubbles: BubbleNode[] = outerBubbles.map((bubble) => ({
      emoji: bubble.emoji,
      size: bubble.size,
      x: bubble.x,
      y: bubble.y,
      z: 1,
      driftX: bubble.driftX ?? 3,
      driftY: bubble.driftY ?? 3,
      driftDuration: bubble.driftDuration ?? 4.2,
      driftDelay: bubble.driftDelay ?? 0,
    }));

    return { bubbles, cloudWidth, cloudHeight };
  }, [breakdown, signals, mainEmoji]);

  return (
    <div className="mb-5">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => {
          playSound("lightSwitch");
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 96,
            height: 96,
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85) 0%, var(--amber-glow) 25%, rgba(255,210,120,0.55) 45%, rgba(255,210,120,0.14) 72%, transparent 100%)",
            boxShadow: "0px 10px 28px rgba(200, 120, 40, 0.16)",
            fontSize: "44px",
            border: "none",
          }}
        >
          {mainEmoji}
        </motion.button>

        <div className="min-w-0">
          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.2,
              color: "var(--amber-text-dark)",
              fontFamily: "Cormorant Garamond, serif",
            }}
          >
            {headline}
          </p>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="mt-4 rounded-[28px] p-5"
              style={{
                backgroundColor: "var(--amber-card)",
                boxShadow: "0px 12px 36px rgba(200,120,40,0.12)",
              }}
            >
              <div className="flex justify-between mb-4">
                <p
                  style={{
                    fontSize: "22px",
                    color: "var(--amber-primary)",
                    fontFamily: "Cormorant Garamond, serif",
                  }}
                >
                  {TEXTURE_LABELS[state]}
                </p>

                <div
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                  }}
                >
                  Score {Math.round(score)}
                </div>
              </div>

              {/* Bubble Cloud */}
              <div
                className="relative mx-auto mb-5 cursor-pointer"
                style={{
                  width: bubbleData.cloudWidth,
                  height: bubbleData.cloudHeight,
                }}
                onClick={() => {
                  setShowLegend((v) => !v);
                }}
              >
                {bubbleData.bubbles.map((bubble, index) => (
                  <motion.div
                    key={`${bubble.emoji}-${index}`}
                    animate={{
                      x: bubble.x,
                      y: bubble.y,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                    style={{
                      width: bubble.size,
                      height: bubble.size,
                      border: "2px solid rgba(255,255,255,0.9)",
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.94) 0%, rgba(255,244,220,0.98) 100%)",
                      fontSize: bubble.size * 0.38,
                    }}
                  >
                    {bubble.emoji}
                  </motion.div>
                ))}

                <div
                  className="absolute left-1/2 top-1/2 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: 84,
                    height: 84,
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,232,182,0.95) 55%, rgba(255,210,120,0.82) 100%)",
                    fontSize: 36,
                  }}
                >
                  {mainEmoji}
                </div>
              </div>

              {/* Emoji legend */}
              <AnimatePresence>
                {showLegend && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4"
                  >
                    <div
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--amber-text-muted)",
                          marginBottom: 8,
                        }}
                      >
                        What the emojis represent
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <LegendItem emoji="🚶" label="Movement today" />
                        <LegendItem emoji="✨" label="Novel experiences" />
                        <LegendItem emoji="💬" label="Social engagement" />
                        <LegendItem emoji="🧠" label="Memory moments" />
                        <LegendItem emoji="👟" label="Step activity" />
                        <LegendItem emoji="🌳" label="Time outside" />
                        <LegendItem emoji="🎧" label="Attention or listening" />
                        <LegendItem emoji="🌟" label="Sensory richness" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <SignalPill label="Movement" value={`${Math.round(breakdown.movement / 0.25)}%`} />
                <SignalPill label="Novelty" value={`${Math.round(breakdown.novelty / 0.3)}%`} />
                <SignalPill label="Engagement" value={`${Math.round(breakdown.engagement / 0.3)}%`} />
                <SignalPill label="Memory" value={`${Math.round(breakdown.memory / 0.15)}%`} />
              </div>

              <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.55)" }}>
                <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", marginBottom: 6 }}>
                  Deeper explanation
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.5 }}>
                  {detail}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl px-3 py-3"
      style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
    >
      <p style={{ fontSize: "12px", color: "var(--amber-text-muted)", marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ fontSize: "15px", color: "var(--amber-text-dark)" }}>
        {value}
      </p>
    </div>
  );
}

function LegendItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ fontSize: "18px" }}>{emoji}</span>
      <span style={{ fontSize: "13px" }}>{label}</span>
    </div>
  );
}