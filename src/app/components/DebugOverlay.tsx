/**
 * Debug Overlay
 *
 * A floating panel that lets developers switch between persons
 * and dates to see how the app reacts to different data.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, User, Calendar, Activity, Brain, Heart, Footprints, MessageCircle, Sparkles, BookOpen } from "lucide-react";
import { useDebug } from "../lib/debugContext";
import { scoreTimeTexture } from "../lib/timeTexture/scoreTimeTexture";
import { TEXTURE_LABELS, TEXTURE_EMOJIS } from "../lib/timeTexture/textureStates";
import { format, parseISO, addDays, subDays } from "date-fns";

export function DebugOverlay() {
  const {
    isOverlayOpen,
    setIsOverlayOpen,
    selectedPersonId,
    setSelectedPersonId,
    selectedDate,
    setSelectedDate,
    persons,
    availableDates,
    currentPerson,
    currentSignals,
    currentBaseline,
  } = useDebug();

  const [activeTab, setActiveTab] = useState<"person" | "date" | "signals">("person");

  const result = useMemo(() => {
    if (!currentSignals) return null;
    return scoreTimeTexture(currentSignals);
  }, [currentSignals]);

  const handlePrevDay = () => {
    const idx = availableDates.indexOf(selectedDate);
    if (idx > 0) {
      setSelectedDate(availableDates[idx - 1]);
    }
  };

  const handleNextDay = () => {
    const idx = availableDates.indexOf(selectedDate);
    if (idx < availableDates.length - 1) {
      setSelectedDate(availableDates[idx + 1]);
    }
  };

  const handleJumpToDate = (offset: number) => {
    try {
      const current = parseISO(selectedDate);
      const target = offset > 0 ? addDays(current, offset) : subDays(current, Math.abs(offset));
      const targetStr = format(target, "yyyy-MM-dd");
      // Find the closest available date
      const closest = availableDates.reduce((prev, curr) =>
        Math.abs(new Date(curr).getTime() - target.getTime()) <
        Math.abs(new Date(prev).getTime() - target.getTime())
          ? curr
          : prev
      );
      setSelectedDate(closest);
    } catch {}
  };

  const dateIdx = availableDates.indexOf(selectedDate);
  const formattedDate = (() => {
    try {
      return format(parseISO(selectedDate), "EEE, MMM d, yyyy");
    } catch {
      return selectedDate;
    }
  })();

  const dayOfYear = dateIdx + 1;
  const totalDays = availableDates.length;

  return (
    <>
      {/* Toggle Button — always visible */}
      <motion.button
        onClick={() => setIsOverlayOpen(!isOverlayOpen)}
        whileTap={{ scale: 0.9 }}
        className="fixed z-[9999] flex items-center justify-center"
        style={{
          bottom: 110,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: "50%",
          backgroundColor: isOverlayOpen ? "#C4601A" : "rgba(44, 26, 14, 0.85)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          border: "2px solid rgba(255,255,255,0.15)",
          color: "white",
        }}
      >
        {isOverlayOpen ? <X size={18} /> : <User size={18} />}
      </motion.button>

      {/* Score badge on toggle */}
      {!isOverlayOpen && result && (
        <div
          className="fixed z-[9999] flex items-center justify-center"
          style={{
            bottom: 150,
            right: 16,
            width: 32,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#E8873A",
            fontSize: 11,
            color: "white",
            pointerEvents: "none",
          }}
        >
          {result.score}
        </div>
      )}

      {/* Overlay Panel */}
      <AnimatePresence>
        {isOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-[9998] overflow-hidden"
            style={{
              bottom: 170,
              right: 12,
              left: 12,
              maxWidth: 420,
              marginLeft: "auto",
              borderRadius: 20,
              backgroundColor: "rgba(44, 26, 14, 0.94)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-2">
                <User size={14} style={{ color: "#E8873A" }} />
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "Lato, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  DEBUG OVERLAY
                </span>
              </div>

              {/* Score pill */}
              {result && (
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(232, 135, 58, 0.2)",
                    border: "1px solid rgba(232, 135, 58, 0.3)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#E8873A" }}>
                    {TEXTURE_EMOJIS[result.state]}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: "#E8873A",
                      fontFamily: "Cormorant Garamond, serif",
                    }}
                  >
                    {result.score}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    {TEXTURE_LABELS[result.state]}
                  </span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div
              className="flex px-4 pt-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {(["person", "date", "signals"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-2 capitalize"
                  style={{
                    fontSize: 12,
                    color: activeTab === tab ? "#E8873A" : "rgba(255,255,255,0.4)",
                    borderBottom: activeTab === tab ? "2px solid #E8873A" : "2px solid transparent",
                    fontFamily: "Lato, sans-serif",
                    marginBottom: -1,
                  }}
                >
                  {tab === "person" && <User size={12} className="inline mr-1" />}
                  {tab === "date" && <Calendar size={12} className="inline mr-1" />}
                  {tab === "signals" && <Activity size={12} className="inline mr-1" />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div
              className="p-4 overflow-y-auto"
              style={{ maxHeight: 340 }}
            >
              {/* Person Tab */}
              {activeTab === "person" && (
                <div className="flex flex-col gap-2">
                  {persons.map((person) => {
                    const isSelected = person.personId === selectedPersonId;
                    return (
                      <button
                        key={person.personId}
                        onClick={() => setSelectedPersonId(person.personId)}
                        className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: isSelected
                            ? "rgba(232, 135, 58, 0.15)"
                            : "rgba(255,255,255,0.03)",
                          border: isSelected
                            ? "1px solid rgba(232, 135, 58, 0.4)"
                            : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-full shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            backgroundColor: isSelected
                              ? "#E8873A"
                              : "rgba(255,255,255,0.08)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: isSelected ? "white" : "rgba(255,255,255,0.5)",
                              fontFamily: "Lato, sans-serif",
                            }}
                          >
                            {person.personId.replace("P00", "")}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p
                            style={{
                              fontSize: 14,
                              color: isSelected ? "#E8873A" : "rgba(255,255,255,0.8)",
                              fontFamily: "Lato, sans-serif",
                            }}
                          >
                            {person.name}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.35)",
                              fontFamily: "Lato, sans-serif",
                            }}
                          >
                            Age {person.age} &middot; {person.profile}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Date Tab */}
              {activeTab === "date" && (
                <div className="flex flex-col gap-3">
                  {/* Date Navigator */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevDay}
                      disabled={dateIdx <= 0}
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: dateIdx <= 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="text-center">
                      <p
                        style={{
                          fontSize: 16,
                          color: "#E8873A",
                          fontFamily: "Cormorant Garamond, serif",
                        }}
                      >
                        {formattedDate}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.35)",
                          fontFamily: "Lato, sans-serif",
                        }}
                      >
                        Day {dayOfYear} of {totalDays}
                      </p>
                    </div>

                    <button
                      onClick={handleNextDay}
                      disabled={dateIdx >= totalDays - 1}
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        color: dateIdx >= totalDays - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Scrubber Slider */}
                  <div>
                    <input
                      type="range"
                      min={0}
                      max={totalDays - 1}
                      value={dateIdx >= 0 ? dateIdx : 0}
                      onChange={(e) => {
                        const idx = parseInt(e.target.value, 10);
                        if (availableDates[idx]) {
                          setSelectedDate(availableDates[idx]);
                        }
                      }}
                      className="w-full"
                      style={{
                        accentColor: "#E8873A",
                        height: 4,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                        Jan 1
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                        Dec 31
                      </span>
                    </div>
                  </div>

                  {/* Quick Jump Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "-30d", offset: -30 },
                      { label: "-7d", offset: -7 },
                      { label: "-1d", offset: -1 },
                      { label: "+1d", offset: 1 },
                      { label: "+7d", offset: 7 },
                      { label: "+30d", offset: 30 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleJumpToDate(btn.offset)}
                        className="px-3 py-1.5 rounded-full"
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.6)",
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          fontFamily: "Lato, sans-serif",
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Month Quick Select */}
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                      Jump to month
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (month, i) => {
                          const monthStr = String(i + 1).padStart(2, "0");
                          const target = `2024-${monthStr}-15`;
                          const isCurrentMonth = selectedDate.startsWith(`2024-${monthStr}`);
                          return (
                            <button
                              key={month}
                              onClick={() => {
                                const closest = availableDates.reduce((prev, curr) =>
                                  Math.abs(new Date(curr).getTime() - new Date(target).getTime()) <
                                  Math.abs(new Date(prev).getTime() - new Date(target).getTime())
                                    ? curr
                                    : prev
                                );
                                setSelectedDate(closest);
                              }}
                              className="px-2 py-1 rounded-lg"
                              style={{
                                fontSize: 10,
                                color: isCurrentMonth ? "#E8873A" : "rgba(255,255,255,0.4)",
                                backgroundColor: isCurrentMonth
                                  ? "rgba(232, 135, 58, 0.15)"
                                  : "rgba(255,255,255,0.04)",
                                border: isCurrentMonth
                                  ? "1px solid rgba(232, 135, 58, 0.3)"
                                  : "1px solid transparent",
                              }}
                            >
                              {month}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Signals Tab */}
              {activeTab === "signals" && currentSignals && (
                <div className="flex flex-col gap-2">
                  {/* Current Person Badge */}
                  <div
                    className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl"
                    style={{
                      backgroundColor: "rgba(232, 135, 58, 0.1)",
                      border: "1px solid rgba(232, 135, 58, 0.2)",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#E8873A" }}>
                      {currentPerson?.name}
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                      &middot; {formattedDate}
                    </span>
                  </div>

                  {/* Signal Rows */}
                  {[
                    { icon: Footprints, label: "Steps", value: currentSignals.steps, baseline: currentBaseline?.steps, unit: "" },
                    { icon: Heart, label: "Heart Rate Activity", value: currentSignals.heartRateActivity, baseline: currentBaseline?.heartRateActivity, unit: "min" },
                    { icon: Sparkles, label: "Time Outside", value: currentSignals.timeOutside, baseline: currentBaseline?.timeOutside, unit: "min" },
                    { icon: Brain, label: "Games Played", value: currentSignals.gamesPlayed, baseline: currentBaseline?.gamesPlayed, unit: "" },
                    { icon: Activity, label: "New Activities", value: currentSignals.newActivities, baseline: currentBaseline?.newActivities, unit: "" },
                    { icon: MessageCircle, label: "Messages Sent", value: currentSignals.messagesSent, baseline: currentBaseline?.messagesSent, unit: "" },
                    { icon: User, label: "In-Person", value: currentSignals.inPersonInteractions, baseline: currentBaseline?.inPersonInteractions, unit: "" },
                    { icon: BookOpen, label: "Reflections", value: currentSignals.reflections, baseline: currentBaseline?.reflections, unit: "" },
                  ].map((signal) => {
                    const Icon = signal.icon;
                    const diff = signal.baseline != null
                      ? signal.value - signal.baseline
                      : null;
                    const diffColor =
                      diff == null
                        ? "transparent"
                        : diff > 0
                        ? "rgba(74, 222, 128, 0.8)"
                        : diff < 0
                        ? "rgba(251, 113, 133, 0.8)"
                        : "rgba(255,255,255,0.3)";

                    return (
                      <div
                        key={signal.label}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <Icon size={14} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                        <span
                          className="flex-1"
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.6)",
                            fontFamily: "Lato, sans-serif",
                          }}
                        >
                          {signal.label}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            color: "rgba(255,255,255,0.9)",
                            fontFamily: "Lato, sans-serif",
                            minWidth: 40,
                            textAlign: "right",
                          }}
                        >
                          {signal.value}
                          {signal.unit && (
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>
                              {signal.unit}
                            </span>
                          )}
                        </span>
                        {diff != null && (
                          <span
                            style={{
                              fontSize: 10,
                              color: diffColor,
                              minWidth: 36,
                              textAlign: "right",
                            }}
                          >
                            {diff > 0 ? "+" : ""}
                            {typeof signal.baseline === "number" && signal.baseline % 1 !== 0
                              ? diff.toFixed(1)
                              : Math.round(diff)}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Score Breakdown */}
                  {result && (
                    <div
                      className="mt-3 p-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(232, 135, 58, 0.08)",
                        border: "1px solid rgba(232, 135, 58, 0.15)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          marginBottom: 8,
                        }}
                      >
                        Score Breakdown
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Movement", value: result.breakdown.movement, weight: 0.25 },
                          { label: "Novelty", value: result.breakdown.novelty, weight: 0.30 },
                          { label: "Engagement", value: result.breakdown.engagement, weight: 0.30 },
                          { label: "Memory", value: result.breakdown.memory, weight: 0.15 },
                        ].map((dim) => (
                          <div key={dim.label} className="flex items-center justify-between">
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                              {dim.label}
                            </span>
                            <div className="flex items-center gap-1">
                              <div
                                style={{
                                  width: 40,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: "rgba(255,255,255,0.08)",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    width: `${Math.min(100, (dim.value / dim.weight) * 100 / 100)}%`,
                                    height: "100%",
                                    backgroundColor: "#E8873A",
                                    borderRadius: 2,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 11, color: "#E8873A", minWidth: 24, textAlign: "right" }}>
                                {Math.round(dim.value / dim.weight)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "signals" && !currentSignals && (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 20 }}>
                  No data available for this person/date combination.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
