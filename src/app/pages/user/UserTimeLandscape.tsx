import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { NavBar } from '../../components/NavBar';
import { SettingsButton } from '../../components/SettingsButton';
import { TimeTextureGraph } from "../../components/TimeTextureGraph";
import { useTimeTexture } from "../../lib/useTimeTexture";
import { useDebug } from "../../lib/debugContext";
import { scoreTimeTexture } from "../../lib/timeTexture/scoreTimeTexture";
import { format, parseISO } from "date-fns";
import { dailyAnchors, getTempAnchors, subscribe } from "../../lib/sharedAnchors";
import { ChevronLeft } from "lucide-react";
import { playSound } from "../../lib/soundUtils";
import {
  Phone,
  Headphones,
  Coffee,
  PersonSimpleWalk,
  BookOpen,
  Bird,
  PencilLine,
  Flower,
  Image as ImageIcon,
  Users,
  Sun,
  ForkKnife,
  MusicNote,
  House,
  Sparkle
} from "phosphor-react";

export function UserTimeLandscape() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState<"day" | "week" | "month" | "year">("week");
  const { weekSignals, score, state } = useTimeTexture();
  const { selectedDate } = useDebug();

  const returnTo =
    typeof location.state?.returnTo === "string" ? location.state.returnTo : "/user";

  const todayIndex = new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const baseAnchors = dailyAnchors[todayIndex];

  const [tempAnchors, setTempAnchors] = useState(getTempAnchors());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setTempAnchors(getTempAnchors());
    });
    setTempAnchors(getTempAnchors());
    return unsubscribe;
  }, []);

  const anchors = useMemo(() => [...baseAnchors, ...tempAnchors], [baseAnchors, tempAnchors]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'phone': return Phone;
      case 'headphones': return Headphones;
      case 'coffee': return Coffee;
      case 'person-simple-walk': return PersonSimpleWalk;
      case 'book-open': return BookOpen;
      case 'bird': return Bird;
      case 'pencil-line': return PencilLine;
      case 'flower': return Flower;
      case 'image': return ImageIcon;
      case 'users': return Users;
      case 'sun': return Sun;
      case 'fork-knife': return ForkKnife;
      case 'music-note': return MusicNote;
      case 'house': return House;
      case 'sparkle': return Sparkle;
      default: return Phone;
    }
  };

  const dateRange = useMemo(() => {
    if (weekSignals.length === 0) {
      try {
        const d = parseISO(selectedDate);
        const start = new Date(d);
        start.setDate(start.getDate() - 6);
        return `${format(start, "MMM d")} – ${format(d, "MMM d")}`;
      } catch {
        return "This week";
      }
    }
    try {
      const first = format(parseISO(weekSignals[0].date), "MMM d");
      const last = format(parseISO(weekSignals[weekSignals.length - 1].date), "MMM d");
      return `${first} – ${last}`;
    } catch {
      return "This week";
    }
  }, [weekSignals, selectedDate]);

  const weekSummary = useMemo(() => {
    if (weekSignals.length < 2) return "Explore your week's time texture.";
    const scores = weekSignals.map((d) => {
      return scoreTimeTexture(d.signals).score;
    });
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 55) return "This week felt fuller than usual ↑";
    if (avg >= 35) return "This week had a steady, balanced rhythm.";
    return "This week felt quieter than usual.";
  }, [weekSignals]);

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--amber-background)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <SettingsButton />

      <div className="px-6 pt-16">
        <div className="mb-6">
          <button
            onClick={() => { playSound("pageBackChime"); navigate(returnTo); }}
            className="mb-4 flex items-center gap-2"
            style={{ color: "var(--amber-primary)" }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1
            className="mb-1"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "var(--font-title, 28px)",
              color: "var(--amber-text-dark)",
            }}
          >
            Your Time Landscape
          </h1>
          <p style={{ fontSize: "var(--font-body, 15px)", color: "var(--amber-text-muted)" }}>
            {dateRange}
          </p>
        </div>

        <div className="mb-6">
          <TimeTextureGraph
            weekSignals={weekSignals}
            showToggle={true}
            defaultRange="week"
            referenceDate={selectedDate}
          />
        </div>

        <div className="mb-6">
          <p
            className="mb-3"
            style={{
              fontSize: "14px",
              color: "var(--amber-text-muted)",
              fontFamily: "Lato, sans-serif",
            }}
          >
            Memory Anchors
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {anchors.map((anchor, i) => {
              const IconComponent = getIconComponent(anchor.icon);
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 14px",
                    background: "#F2E8D8",
                    border: "1px solid rgba(196,96,26,0.20)",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontFamily: "Lato, sans-serif",
                    color: "#7A5A3A",
                  }}
                >
                  <IconComponent size={16} color="#C4601A" weight="regular" />
                  <span>{anchor.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-3xl p-4"
          style={{
            backgroundColor: "var(--amber-card)",
            boxShadow: "0px 8px 32px rgba(200, 120, 40, 0.10)",
          }}
        >
          <p
            className="italic text-center"
            style={{
              fontSize: "15px",
              color: "var(--amber-text-muted)",
              fontFamily: "Lato, sans-serif",
            }}
          >
            {weekSummary}
          </p>
        </div>
      </div>

      <NavBar type="user" />
    </div>
  );
}