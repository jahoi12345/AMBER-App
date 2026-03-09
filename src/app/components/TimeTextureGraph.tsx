import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppContext } from "../lib/appContext";
import { playSound } from "../lib/soundUtils";
import { scoreTimeTexture } from "../lib/timeTexture/scoreTimeTexture";
import { getTextureState, TEXTURE_LABELS } from "../lib/timeTexture/textureStates";
import type { SignalSet } from "../lib/timeTexture/types";

type TimeRange = "day" | "week" | "month" | "year";

interface TimeTextureGraphProps {
  weekSignals: { date: string; signals: SignalSet }[];
  showToggle?: boolean;
  defaultRange?: TimeRange;
  title?: string;
  onClick?: () => void;
  compact?: boolean;
  referenceDate?: string;
}

interface DataPoint {
  id: string;
  label: string;
  fullLabel: string;
  score: number;
  state: string;
}

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_ABBREVS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDayViewData(refDate: Date): DataPoint[] {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6);
  const seed = refDate.getDate() + refDate.getMonth() * 31;

  return hours.map((h, i) => {
    const raw = (seed * 13 + i * 17 + 7) % 60 + 18;
    const score = Math.min(95, Math.max(18, raw));
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;

    return {
      id: `hour-${h}`,
      label: `${hour12}${ampm === "PM" ? "p" : "a"}`,
      fullLabel: `${hour12}:00 ${ampm}`,
      score,
      state: TEXTURE_LABELS[getTextureState(score)],
    };
  });
}

function getWeekViewData(weekSignals: { date: string; signals: SignalSet }[], refDate: Date): DataPoint[] {
  const days: DataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);

    const dayName = DAY_ABBREVS[d.getDay()];
    const dateStr = d.toISOString().slice(0, 10);

    const match = weekSignals.find((ws) => ws.date === dateStr);
    const score = match
      ? scoreTimeTexture(match.signals).score
      : 30 + ((i * 19 + d.getDay() * 7 + d.getDate()) % 38);

    days.push({
      id: `day-${dateStr}`,
      label: dayName,
      fullLabel: `${dayName}, ${MONTH_ABBREVS[d.getMonth()]} ${d.getDate()}`,
      score,
      state: TEXTURE_LABELS[getTextureState(score)],
    });
  }

  return days;
}

function getMonthViewData(weekSignals: { date: string; signals: SignalSet }[], refDate: Date): DataPoint[] {
  const points: DataPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);

    const dateStr = d.toISOString().slice(0, 10);
    const match = weekSignals.find((ws) => ws.date === dateStr);
    const score = match
      ? scoreTimeTexture(match.signals).score
      : 28 + ((i * 13 + d.getDate() * 5 + d.getDay()) % 42);

    const showLabel = i % 6 === 0 || i === 0;

    points.push({
      id: `month-day-${dateStr}`,
      label: showLabel ? `${MONTH_ABBREVS[d.getMonth()]} ${d.getDate()}` : "",
      fullLabel: `${DAY_ABBREVS[d.getDay()]}, ${MONTH_ABBREVS[d.getMonth()]} ${d.getDate()}`,
      score,
      state: TEXTURE_LABELS[getTextureState(score)],
    });
  }

  return points;
}

function getYearViewData(refDate: Date): DataPoint[] {
  const points: DataPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    const seed = d.getMonth() * 13 + d.getFullYear();
    const score = 32 + ((seed * 19 + 7) % 44);

    points.push({
      id: `month-${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_ABBREVS[d.getMonth()],
      fullLabel: `${MONTH_ABBREVS[d.getMonth()]} ${d.getFullYear()}`,
      score,
      state: TEXTURE_LABELS[getTextureState(score)],
    });
  }

  return points;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;

  const { fullLabel, score, state } = payload[0].payload as DataPoint;

  return (
    <div
      style={{
        background: "#FFFAF3",
        border: "1px solid rgba(196,96,26,0.18)",
        borderRadius: "14px",
        padding: "10px 14px",
        boxShadow: "0px 8px 24px rgba(200,120,40,0.15)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-graph-tooltip, 13px)",
          color: "var(--amber-text-dark)",
          margin: 0,
          marginBottom: 4,
          fontFamily: "Cormorant Garamond, serif",
        }}
      >
        {fullLabel}
      </p>
      <p style={{ fontSize: "var(--font-graph-tooltip, 13px)", color: "var(--amber-text-muted)", margin: 0 }}>
        Texture Score: <span style={{ color: "var(--amber-primary)" }}>{score}</span>
      </p>
      <p style={{ fontSize: "var(--font-graph-tooltip, 13px)", color: "var(--amber-text-muted)", margin: 0 }}>
        State: <span style={{ color: "var(--amber-primary)" }}>{state}</span>
      </p>
    </div>
  );
}

function ActiveDot(props: any) {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="rgba(232,135,58,0.18)" />
      <circle cx={cx} cy={cy} r={5} fill="#E8873A" stroke="#FFFAF3" strokeWidth={2} />
    </g>
  );
}

export function TimeTextureGraph({
  weekSignals,
  showToggle = true,
  defaultRange = "week",
  title,
  onClick,
  compact = false,
  referenceDate,
}: TimeTextureGraphProps) {
  const { settings } = useAppContext();
  const [activeRange, setActiveRange] = useState<TimeRange>(defaultRange);
  const [showInfo, setShowInfo] = useState(false);

  const data = useMemo(() => {
    const refDate = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date();

    switch (activeRange) {
      case "day":
        return getDayViewData(refDate);
      case "week":
        return getWeekViewData(weekSignals, refDate);
      case "month":
        return getMonthViewData(weekSignals, refDate);
      case "year":
        return getYearViewData(refDate);
      default:
        return [];
    }
  }, [activeRange, referenceDate, weekSignals]);

  const chartHeight = compact ? 160 : 220;
  const animate = settings.animationsEnabled;
  const ranges: TimeRange[] = ["day", "week", "month", "year"];

  if (!data.length) {
    return (
      <div
        className="rounded-3xl p-4"
        style={{
          backgroundColor: "var(--amber-card)",
          boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
        }}
      >
        <p
          className="text-center italic"
          style={{
            fontSize: "var(--font-card-text, 16px)",
            color: "var(--amber-text-muted)",
            fontFamily: "Lato, sans-serif",
            padding: "40px 0",
            margin: 0,
          }}
        >
          No texture data available yet.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-3xl p-4"
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        backgroundColor: "var(--amber-card)",
        boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
      }}
    >
      <button
        type="button"
        aria-label="Explain time texture graph axes"
        onClick={(e) => {
          e.stopPropagation();
          playSound("lightSwitch");
          setShowInfo((prev) => !prev);
        }}
        className="flex items-center justify-center rounded-full"
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 28,
          height: 28,
          border: "1px solid rgba(196,96,26,0.20)",
          backgroundColor: "rgba(255,255,255,0.78)",
          color: "var(--amber-primary)",
          fontFamily: "Cormorant Garamond, serif",
          fontSize: "16px",
          lineHeight: 1,
          zIndex: 3,
          cursor: "pointer",
          boxShadow: "0px 4px 12px rgba(200,120,40,0.10)",
        }}
      >
        i
      </button>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={animate ? { opacity: 0, y: -6, scale: 0.98 } : false}
            animate={animate ? { opacity: 1, y: 0, scale: 1 } : undefined}
            exit={animate ? { opacity: 0, y: -6, scale: 0.98 } : undefined}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 48,
              right: 14,
              width: "min(320px, calc(100% - 28px))",
              backgroundColor: "#FFFAF3",
              border: "1px solid rgba(196,96,26,0.18)",
              borderRadius: "16px",
              padding: "12px 14px",
              boxShadow: "0px 12px 28px rgba(200,120,40,0.14)",
              zIndex: 3,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.5,
                color: "var(--amber-text-dark)",
                fontFamily: "Lato, sans-serif",
              }}
            >
              The x-axis shows each day in the current week. The y-axis shows Amber’s time texture score from 0 to 100. Higher values reflect a stronger mix of movement, novelty, engagement, and memory signals on that day.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {title && (
        <h3
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "var(--font-subtitle, 22px)",
            color: "var(--amber-text-dark)",
            margin: 0,
            marginBottom: "8px",
            paddingRight: "36px",
          }}
        >
          {title}
        </h3>
      )}

      {showToggle && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {ranges.map((range) => (
            <motion.button
              key={range}
              onClick={(e) => {
                e.stopPropagation();
                playSound("navSelect");
                setActiveRange(range);
              }}
              whileTap={animate ? { scale: 0.97 } : undefined}
              className="px-4 py-2 rounded-full capitalize transition-all"
              style={{
                minHeight: "40px",
                backgroundColor: activeRange === range ? "var(--amber-primary)" : "transparent",
                color: activeRange === range ? "white" : "var(--amber-text-muted)",
                border: activeRange === range ? "none" : "1px solid var(--amber-text-muted)",
                fontFamily: "Lato, sans-serif",
                fontSize: "var(--font-caption, 13px)",
              }}
            >
              {range}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeRange}
          initial={animate ? { opacity: 0, y: 6 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          exit={animate ? { opacity: 0, y: -4 } : undefined}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8873A" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#E8873A" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,96,26,0.08)" vertical={false} />

              <XAxis
                dataKey="label"
                tick={{
                  fontSize: "var(--font-graph-tick, 12px)",
                  fill: "var(--amber-text-muted)",
                  fontFamily: "Lato, sans-serif",
                }}
                tickLine={false}
                axisLine={{ stroke: "rgba(196,96,26,0.12)" }}
                interval={0}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: "var(--font-graph-tick, 12px)",
                  fill: "var(--amber-text-muted)",
                  fontFamily: "Lato, sans-serif",
                }}
                tickLine={false}
                axisLine={false}
                tickCount={5}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--amber-primary)",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#E8873A"
                strokeWidth={2.5}
                fill="url(#amberGradient)"
                isAnimationActive={animate}
                animationDuration={900}
                animationEasing="ease-out"
                dot={{
                  r: 4,
                  fill: "#FFFAF3",
                  stroke: "#E8873A",
                  strokeWidth: 2,
                }}
                activeDot={<ActiveDot />}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}