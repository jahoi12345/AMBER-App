import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Gamepad2, Sparkles } from "lucide-react";
import { playSound } from "../../lib/soundUtils";
import { BackToHomeButton } from "../../components/BackToHomeButton";
import { GreetingHeader } from "../../components/GreetingHeader";
import { NavBar } from "../../components/NavBar";
import { SettingsButton } from "../../components/SettingsButton";
import { StepsTracker } from "../../components/StepsTracker";
import { TimeTextureGraph } from "../../components/TimeTextureGraph";
import { TimeTextureHero } from "../../components/TimeTextureHero";
import { useTimeTexture } from "../../lib/useTimeTexture";
import {
  TEXTURE_EMOJIS,
  TEXTURE_ICONS,
  TEXTURE_LABELS,
} from "../../lib/timeTexture/textureStates";

export function UserHome() {
  const navigate = useNavigate();
  const { score, state, signals, personName, weekSignals, date } = useTimeTexture();

  const TextureIcon = TEXTURE_ICONS[state];

  const ideaSuggestion = useMemo(() => {
    const noveltyIdeas = [
      { text: "Take a different walking route today", type: "novelty" as const },
      { text: "Notice three sounds you usually ignore", type: "novelty" as const },
      { text: "Try a tea, snack, or fruit you don’t usually choose", type: "novelty" as const },
      { text: "Sit somewhere new for your morning pause", type: "novelty" as const },
      { text: "Write down one detail you want to remember tonight", type: "novelty" as const },
      { text: "Listen to a genre you haven’t played in a long time", type: "novelty" as const },
      { text: "Call someone you haven’t spoken to recently", type: "novelty" as const },
      { text: "Look at the sky for one full minute", type: "novelty" as const },
    ];

    const gameIdeas = [
      { text: "Try Wordle for a fresh language challenge", type: "game" as const },
      { text: "Do a quick Sudoku to wake up your brain", type: "game" as const },
      { text: "Play today’s trivia challenge", type: "game" as const },
      { text: "Try a word search for a gentle reset", type: "game" as const },
    ];

    const combined = [...noveltyIdeas, ...gameIdeas];
    return combined[Math.floor(Math.random() * combined.length)];
  }, [date]);

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--amber-background)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <SettingsButton />
      <BackToHomeButton />

      <div className="px-6 pt-14" style={{ paddingBottom: "24px" }}>
        <GreetingHeader name={personName.split(" ")[0]} subtitle="Your time companion" />

        <TimeTextureHero />

        <div
          className="rounded-3xl p-4 mb-4 flex items-center"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
          }}
        >
          <div className="flex items-center justify-center mr-4">
            <TextureIcon size={28} style={{ color: "var(--amber-primary)" }} />
          </div>

          <div className="flex-1 flex items-center">
            <p
              className="italic"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "var(--font-subtitle, 22px)",
                color: "var(--amber-primary)",
                margin: 0,
              }}
            >
              {TEXTURE_LABELS[state]}
              <span style={{ marginLeft: "10px" }}>{TEXTURE_EMOJIS[state]}</span>
            </p>
          </div>

          <div
            className="flex items-center"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "34px",
              color: "var(--amber-primary)",
              minWidth: "48px",
              textAlign: "right",
            }}
          >
            {score}
          </div>
        </div>

        <div className="mb-4">
          <TimeTextureGraph
            weekSignals={weekSignals}
            title="Your Week"
            onClick={() => { playSound("navSelect"); navigate("/user/time-landscape"); }}
            compact={true}
            showToggle={false}
            defaultRange="week"
            referenceDate={date}
          />
        </div>

        <div className="mb-4">
          <StepsTracker todaySteps={signals.steps} />
        </div>

        <div
          className="rounded-3xl p-4 border-l-4 cursor-pointer active:scale-[0.98] transition-transform flex items-start gap-3"
          style={{
            backgroundColor: "var(--amber-card)",
            borderLeftColor: "var(--amber-primary)",
            boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
          }}
          onClick={() => {
            playSound("navSelect");
            navigate("/user/novelty-ideas");
          }}
        >
          {ideaSuggestion.type === "game" ? (
            <Gamepad2 size={20} style={{ color: "var(--amber-primary)", marginTop: "2px" }} />
          ) : (
            <Sparkles size={20} style={{ color: "var(--amber-primary)", marginTop: "2px" }} />
          )}

          <div className="flex-1">
            <p
              className="mb-1"
              style={{
                fontSize: "var(--font-card-text, 16px)",
                color: "var(--amber-text-dark)",
                marginTop: 0,
              }}
            >
              {ideaSuggestion.text}
            </p>

            <p
              className="italic"
              style={{
                fontSize: "var(--font-caption, 13px)",
                color: "var(--amber-text-muted)",
                margin: 0,
              }}
            >
              {ideaSuggestion.type === "game"
                ? "Open Try Something New to play"
                : "Suggested idea for today"}
            </p>
          </div>
        </div>
      </div>

      <NavBar type="user" />
    </div>
  );
}