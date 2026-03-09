import { useState } from "react";
import { Footprints, X, TrendingUp, Calendar, CheckCircle, Target, Edit2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "../lib/soundUtils";
interface StepsTrackerProps {
  todaySteps: number;
  /** When true, the card fills its container height (e.g. in a grid with another card). */
  fillHeight?: boolean;
}

type Tab = "weekly" | "monthly" | "habits" | "goals";

export function StepsTracker({ todaySteps, fillHeight }: StepsTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("weekly");
  
  // Editable goals state
  const [dailyStepsGoal, setDailyStepsGoal] = useState(8000);
  const [activeDaysGoal, setActiveDaysGoal] = useState(7);
  const [isEditingDailySteps, setIsEditingDailySteps] = useState(false);
  const [isEditingActiveDays, setIsEditingActiveDays] = useState(false);
  const [tempDailySteps, setTempDailySteps] = useState(8000);
  const [tempActiveDays, setTempActiveDays] = useState(7);

  // Mock data for demonstration
  const weeklyData = [
    { day: "Mon", steps: 7234 },
    { day: "Tue", steps: 8912 },
    { day: "Wed", steps: 6543 },
    { day: "Thu", steps: 9876 },
    { day: "Fri", steps: 8234 },
    { day: "Sat", steps: 10234 },
    { day: "Sun", steps: todaySteps },
  ];

  const monthlyData = [
    { week: "Week 1", avg: 7234 },
    { week: "Week 2", avg: 8456 },
    { week: "Week 3", avg: 7890 },
    { week: "Week 4", avg: 8234 },
  ];

  const habits = [
    { name: "Morning walk", streak: 12, goal: "Daily 15min walk" },
    { name: "Afternoon stretch", streak: 5, goal: "Move every 2 hours" },
    { name: "Evening stroll", streak: 8, goal: "After dinner walk" },
  ];

  const goals = [
    { name: "Daily Steps", current: todaySteps, target: dailyStepsGoal, unit: "steps" },
    { name: "Weekly Average", current: 7845, target: dailyStepsGoal, unit: "steps/day" },
    { name: "Active Days", current: 5, target: activeDaysGoal, unit: "days/week" },
  ];

  const weeklyAverage = Math.round(weeklyData.reduce((sum, d) => sum + d.steps, 0) / weeklyData.length);
  const maxWeeklySteps = Math.max(...weeklyData.map(d => d.steps));

  return (
    <>
      {/* Trigger Card */}
      <div
        className={`rounded-3xl p-4 flex flex-col text-left cursor-pointer active:scale-[0.98] transition-transform ${fillHeight ? "h-full w-full min-h-[172px] justify-between" : ""}`}
        style={{
          backgroundColor: "var(--amber-card)",
          boxShadow: "0px 8px 32px rgba(200,120,40,0.10)",
        }}
        onClick={() => { playSound("navSelect"); setIsOpen(true); }}
      >
        <div>
          <Footprints size={24} style={{ color: "var(--amber-primary)" }} className="mb-2" />
          <p
            style={{
              fontSize: "20px",
              color: "var(--amber-text-dark)",
              margin: 0,
              fontWeight: 700,
            }}
          >
            {todaySteps.toLocaleString()}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--amber-text-muted)",
              marginTop: "2px",
              marginBottom: "8px",
            }}
          >
            steps today
          </p>
        </div>
        {fillHeight && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--amber-primary)",
              margin: 0,
            }}
          >
            Avg this week {weeklyAverage.toLocaleString()}
          </p>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => { playSound("pageBackChime"); setIsOpen(false); }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 z-50 rounded-3xl overflow-hidden"
              style={{
                backgroundColor: "var(--amber-background)",
                boxShadow: "0px 16px 64px rgba(100,60,20,0.25)",
                maxWidth: "480px",
                margin: "0 auto",
                top: "80px",
                bottom: "120px", // Leave space for navbar (typically 80-100px) plus extra padding
              }}
            >
              {/* Header */}
              <div
                className="p-6 flex items-center justify-between"
                style={{
                  backgroundColor: "var(--amber-card)",
                  borderBottom: "1px solid rgba(196,96,26,0.12)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Footprints size={28} style={{ color: "var(--amber-primary)" }} />
                  <h2
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "24px",
                      color: "var(--amber-text-dark)",
                    }}
                  >
                    Steps & Activity
                  </h2>
                </div>
                <button
                  onClick={() => { playSound("pageBackChime"); setIsOpen(false); }}
                  className="p-2 rounded-full active:scale-95 transition-transform"
                  style={{
                    backgroundColor: "rgba(196,96,26,0.08)",
                  }}
                >
                  <X size={20} style={{ color: "var(--amber-primary)" }} />
                </button>
              </div>

              {/* Tabs */}
              <div
                className="flex gap-2 px-6 pt-4"
                style={{
                  borderBottom: "1px solid rgba(196,96,26,0.08)",
                }}
              >
                {[
                  { id: "weekly" as Tab, label: "Weekly", icon: Calendar },
                  { id: "monthly" as Tab, label: "Monthly", icon: TrendingUp },
                  { id: "habits" as Tab, label: "Habits", icon: CheckCircle },
                  { id: "goals" as Tab, label: "Goals", icon: Target },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { playSound("navSelect"); setActiveTab(tab.id); }}
                      className="flex-1 flex flex-col items-center gap-1 py-3 relative"
                    >
                      <Icon
                        size={20}
                        style={{
                          color: activeTab === tab.id ? "var(--amber-primary)" : "var(--amber-text-muted)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: activeTab === tab.id ? "var(--amber-primary)" : "var(--amber-text-muted)",
                          fontWeight: activeTab === tab.id ? 600 : 400,
                        }}
                      >
                        {tab.label}
                      </span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: "var(--amber-primary)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100% - 180px)" }}>
                {activeTab === "weekly" && (
                  <div>
                    <div className="mb-6 p-4 rounded-2xl" style={{ backgroundColor: "var(--amber-card)" }}>
                      <p style={{ fontSize: "14px", color: "var(--amber-text-muted)", marginBottom: "8px" }}>
                        Weekly Average
                      </p>
                      <p
                        style={{
                          fontFamily: "Cormorant Garamond, serif",
                          fontSize: "32px",
                          color: "var(--amber-primary)",
                        }}
                      >
                        {weeklyAverage.toLocaleString()}
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", fontStyle: "italic" }}>
                        steps per day
                      </p>
                    </div>
                    <div className="space-y-3">
                      {weeklyData.map((data, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-2xl"
                          style={{ backgroundColor: "var(--amber-card)" }}
                        >
                          <span
                            style={{
                              fontSize: "14px",
                              color: "var(--amber-text-muted)",
                              width: "40px",
                            }}
                          >
                            {data.day}
                          </span>
                          <div className="flex-1 relative h-6 rounded-full overflow-hidden" style={{ backgroundColor: "#FDF6EC" }}>
                            <div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                backgroundColor: "var(--amber-primary)",
                                width: `${(data.steps / maxWeeklySteps) * 100}%`,
                                opacity: 0.7,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "14px", color: "var(--amber-text-dark)", fontWeight: 500 }}>
                            {data.steps.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "monthly" && (
                  <div className="space-y-3">
                    {monthlyData.map((data, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl"
                        style={{ backgroundColor: "var(--amber-card)" }}
                      >
                        <p style={{ fontSize: "14px", color: "var(--amber-text-muted)", marginBottom: "8px" }}>
                          {data.week}
                        </p>
                        <p
                          style={{
                            fontFamily: "Cormorant Garamond, serif",
                            fontSize: "28px",
                            color: "var(--amber-primary)",
                          }}
                        >
                          {data.avg.toLocaleString()}
                        </p>
                        <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", fontStyle: "italic" }}>
                          avg steps/day
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "habits" && (
                  <div className="space-y-3">
                    {habits.map((habit, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl"
                        style={{ backgroundColor: "var(--amber-card)" }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p style={{ fontSize: "16px", color: "var(--amber-text-dark)", fontWeight: 500 }}>
                            {habit.name}
                          </p>
                          <div
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: "#FDF6EC" }}
                          >
                            <span style={{ fontSize: "13px", color: "var(--amber-primary)", fontWeight: 600 }}>
                              {habit.streak} day streak 🔥
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", fontStyle: "italic" }}>
                          {habit.goal}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "goals" && (
                  <div className="space-y-3">
                    {goals.map((goal, idx) => {
                      const progress = Math.min(100, (goal.current / goal.target) * 100);
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl"
                          style={{ backgroundColor: "var(--amber-card)" }}
                        >
                          <p style={{ fontSize: "16px", color: "var(--amber-text-dark)", marginBottom: "8px", fontWeight: 500 }}>
                            {goal.name}
                          </p>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span
                              style={{
                                fontFamily: "Cormorant Garamond, serif",
                                fontSize: "28px",
                                color: "var(--amber-primary)",
                              }}
                            >
                              {goal.current.toLocaleString()}
                            </span>
                            <span style={{ fontSize: "14px", color: "var(--amber-text-muted)" }}>
                              / {goal.target.toLocaleString()} {goal.unit}
                            </span>
                          </div>
                          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#FDF6EC" }}>
                            <div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{
                                backgroundColor: "var(--amber-primary)",
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", marginTop: "8px", fontStyle: "italic" }}>
                            {Math.round(progress)}% complete
                          </p>
                          {goal.name === "Daily Steps" && (
                            <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,96,26,0.08)" }}>
                              <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", marginRight: "auto" }}>
                                Edit goal:
                              </p>
                              {isEditingDailySteps ? (
                                <>
                                  <input
                                    type="number"
                                    value={tempDailySteps}
                                    onChange={(e) => setTempDailySteps(Number(e.target.value))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-2 rounded-full"
                                    style={{
                                      width: "120px",
                                      fontSize: "14px",
                                      border: "1px solid var(--amber-primary)",
                                      backgroundColor: "#FDF6EC",
                                      color: "var(--amber-text-dark)",
                                      outline: "none",
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDailyStepsGoal(tempDailySteps);
                                      setIsEditingDailySteps(false);
                                    }}
                                    className="p-2 rounded-full active:scale-95 transition-all"
                                    style={{
                                      backgroundColor: "var(--amber-primary)",
                                      minWidth: "40px",
                                      minHeight: "40px",
                                    }}
                                  >
                                    <Check size={18} style={{ color: "white" }} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTempDailySteps(dailyStepsGoal);
                                    setIsEditingDailySteps(true);
                                  }}
                                  className="px-4 py-2 rounded-full active:scale-95 transition-all flex items-center gap-2"
                                  style={{
                                    backgroundColor: "rgba(232,135,58,0.1)",
                                    color: "var(--amber-primary)",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    minHeight: "40px",
                                  }}
                                >
                                  <Edit2 size={14} />
                                  Edit Goal
                                </button>
                              )}
                            </div>
                          )}
                          {goal.name === "Active Days" && (
                            <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,96,26,0.08)" }}>
                              <p style={{ fontSize: "13px", color: "var(--amber-text-muted)", marginRight: "auto" }}>
                                Edit goal:
                              </p>
                              {isEditingActiveDays ? (
                                <>
                                  <input
                                    type="number"
                                    value={tempActiveDays}
                                    onChange={(e) => setTempActiveDays(Number(e.target.value))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-2 rounded-full"
                                    style={{
                                      width: "80px",
                                      fontSize: "14px",
                                      border: "1px solid var(--amber-primary)",
                                      backgroundColor: "#FDF6EC",
                                      color: "var(--amber-text-dark)",
                                      outline: "none",
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDaysGoal(tempActiveDays);
                                      setIsEditingActiveDays(false);
                                    }}
                                    className="p-2 rounded-full active:scale-95 transition-all"
                                    style={{
                                      backgroundColor: "var(--amber-primary)",
                                      minWidth: "40px",
                                      minHeight: "40px",
                                    }}
                                  >
                                    <Check size={18} style={{ color: "white" }} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTempActiveDays(activeDaysGoal);
                                    setIsEditingActiveDays(true);
                                  }}
                                  className="px-4 py-2 rounded-full active:scale-95 transition-all flex items-center gap-2"
                                  style={{
                                    backgroundColor: "rgba(232,135,58,0.1)",
                                    color: "var(--amber-primary)",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    minHeight: "40px",
                                  }}
                                >
                                  <Edit2 size={14} />
                                  Edit Goal
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}