import { useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useAppContext } from "../lib/appContext";
import { playSound } from "../lib/soundUtils";
import { useTimeTexture } from "../lib/useTimeTexture";
import {
  FAMILY_VISIBLE_METRICS,
  getMobilityInsight,
  getTopSummary,
  getDailyBreakout,
} from "../lib/familyViewSummary";

interface SettingsProps {
  onClose: () => void;
}

type SettingKey =
  | "morning-greeting"
  | "evening-reminder"
  | "message-alerts"
  | "novelty-suggestions"
  | "app-sounds"
  | "animations"
  | "haptics"
  | "text-size"
  | "data-local"
  | "share-wellbeing"
  | "what-family-sees"
  | "learn-habits"
  | "delete-data"
  | "version"
  | "how-it-works"
  | "feedback";

const settingDescriptions: Record<SettingKey, string> = {
  "morning-greeting":
    "Amber will greet you each morning with a warm, personalised message to start your day gently.",
  "evening-reminder":
    "A soft nudge in the evening to reflect on your day and capture any memory anchors before bed.",
  "message-alerts":
    "Get notified when a family member sends you a new message through Amber.",
  "novelty-suggestions":
    "Amber will suggest gentle new activities throughout the day to add texture to your time.",
  "app-sounds":
    "Subtle sound effects when you tap buttons, complete activities, and navigate between screens.",
  animations:
    "Smooth transitions and calm graph animations as you move through the app.",
  haptics:
    "Gentle vibration feedback when you interact with buttons and controls.",
  "text-size":
    "Adjust how large text appears across the entire app, including this settings screen.",
  "data-local":
    "All your data stays on this device. Amber does not upload your information to external servers.",
  "share-wellbeing":
    "Share a simple wellbeing summary, like your weekly time texture score, with connected family members.",
  "learn-habits":
    "Allow Amber to notice patterns in your routine so it can suggest more relevant ideas over time.",
  "delete-data":
    "Permanently remove all your Time Texture history, messages, memory anchors, and settings. This cannot be undone.",
  version: "You are running the latest version of Amber.",
  "how-it-works":
    "Amber helps you enrich the texture of time through novelty, movement, connection, and memory anchors. Small changes can make days feel fuller and easier to remember.",
  feedback:
    "We’d love to hear what feels helpful, what feels confusing, and what you’d like Amber to do next.",
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={(e) => {
        e.stopPropagation();
        playSound("lightSwitch");
        onChange(!checked);
      }}
      style={{
        width: "50px",
        height: "30px",
        borderRadius: "999px",
        background: checked ? "var(--amber-primary)" : "#E8DDCC",
        position: "relative",
        border: "none",
        cursor: "pointer",
        transition: "all 180ms ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "3px",
          left: checked ? "23px" : "3px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0px 2px 8px rgba(0,0,0,0.10)",
          transition: "all 180ms ease",
        }}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        marginBottom: "10px",
        marginTop: "18px",
        fontFamily: "Lato, sans-serif",
        fontSize: "var(--font-settings-section, 12px)",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#A07A5B",
      }}
    >
      {title}
    </div>
  );
}

function ExpandableRow({
  label,
  description,
  expanded,
  onToggle,
  rightContent,
  rounded = "middle",
  expandedContent,
  expandedMaxHeight = "180px",
}: {
  label: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  rightContent?: React.ReactNode;
  rounded?: "top" | "middle" | "bottom" | "single";
  /** When set, renders this instead of description in the expanded area */
  expandedContent?: React.ReactNode;
  /** Max height of the expanded area (e.g. for "What family sees" preview) */
  expandedMaxHeight?: string;
}) {
  const radius =
    rounded === "single"
      ? "16px"
      : rounded === "top"
        ? "16px 16px 0 0"
        : rounded === "bottom"
          ? "0 0 16px 16px"
          : "0";

  return (
    <div
      style={{
        background: "#FFFAF3",
        borderBottom: rounded === "bottom" || rounded === "single" ? "none" : "0.5px solid rgba(196,96,26,0.10)",
        borderRadius: radius,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          minHeight: "58px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "12px",
        }}
      >
        <span
          style={{
            color: "#2C1A0E",
            fontFamily: "Lato, sans-serif",
            fontSize: "var(--font-settings-row, 16px)",
            lineHeight: 1.35,
            flex: 1,
          }}
        >
          {label}
        </span>

        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {rightContent}
          <ChevronDown
            size={16}
            style={{
              color: "#9A7A60",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 180ms ease",
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      <div
        style={{
          maxHeight: expanded ? expandedMaxHeight : "0px",
          opacity: expanded ? 1 : 0,
          transition: "all 200ms ease",
          overflow: expanded && expandedContent ? "auto" : "hidden",
          padding: expanded ? "0 18px 16px 18px" : "0 18px",
        }}
      >
        {expandedContent != null ? (
          expandedContent
        ) : (
          <p
            style={{
              margin: 0,
              color: "#7E624D",
              fontFamily: "Lato, sans-serif",
              fontSize: "var(--font-settings-description, 15px)",
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function Settings({ onClose }: SettingsProps) {
  const { settings, updateTextSize, toggleSound, toggleAnimations, toggleHaptics } = useAppContext();
  const { score, personName, weekSignals, baseline } = useTimeTexture();

  const [expandedRow, setExpandedRow] = useState<SettingKey | null>(null);
  const [morningGreeting, setMorningGreeting] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [noveltySuggestions, setNoveltySuggestions] = useState(true);
  const [shareWellbeing, setShareWellbeing] = useState(false);
  const [learnHabits, setLearnHabits] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [userName, setUserName] = useState("Anne");
  const [editingName, setEditingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const textChoices: Array<"A" | "AA" | "AAA"> = useMemo(() => ["A", "AA", "AAA"], []);

  const mobility = useMemo(
    () => getMobilityInsight(weekSignals, baseline),
    [weekSignals, baseline]
  );
  const firstName = personName.split(" ")[0];
  const heroSummary = useMemo(
    () => getTopSummary(score, mobility.level, firstName),
    [score, mobility.level, firstName]
  );
  const weekRows = useMemo(() => getDailyBreakout(weekSignals), [weekSignals]);

  const whatFamilySeesPreview = useMemo(
    () => (
      <div style={{ paddingTop: "4px" }}>
        <p
          style={{
            margin: "0 0 12px 0",
            color: "#2C1A0E",
            fontFamily: "Lato, sans-serif",
            fontSize: "var(--font-settings-description, 15px)",
            lineHeight: 1.55,
            fontWeight: 600,
          }}
        >
          You can see what family sees. No hidden metrics.
        </p>
        <p
          style={{
            margin: "0 0 10px 0",
            color: "#7E624D",
            fontFamily: "Lato, sans-serif",
            fontSize: "var(--font-settings-meta, 13px)",
            lineHeight: 1.5,
          }}
        >
          When sharing is on, family can see:
        </p>
        <ul
          style={{
            margin: "0 0 14px 0",
            paddingLeft: "20px",
            color: "#7E624D",
            fontFamily: "Lato, sans-serif",
            fontSize: "var(--font-settings-description, 15px)",
            lineHeight: 1.6,
          }}
        >
          {FAMILY_VISIBLE_METRICS.map((m) => (
            <li key={m.id}>{m.label}</li>
          ))}
        </ul>
        <p
          style={{
            margin: "0 0 6px 0",
            color: "#A07A5B",
            fontFamily: "Lato, sans-serif",
            fontSize: "var(--font-settings-section, 12px)",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          This week’s summary (same as family)
        </p>
        <p
          style={{
            margin: "0 0 8px 0",
            color: "#2C1A0E",
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "var(--font-settings-row, 16px)",
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          {heroSummary}
        </p>
        <p
          style={{
            margin: "0 0 8px 0",
            color: "#7E624D",
            fontFamily: "Lato, sans-serif",
            fontSize: "var(--font-settings-meta, 13px)",
            lineHeight: 1.45,
          }}
        >
          {mobility.title} — {mobility.summary}
        </p>
        <div
          style={{
            marginTop: "10px",
            borderTop: "1px solid rgba(196,96,26,0.12)",
            paddingTop: "10px",
          }}
        >
          <p
            style={{
              margin: "0 0 6px 0",
              color: "#A07A5B",
              fontFamily: "Lato, sans-serif",
              fontSize: "var(--font-settings-section, 12px)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            7-day breakdown
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {weekRows.map((row) => (
              <div
                key={row.date}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "var(--font-settings-meta, 13px)",
                  color: "#2C1A0E",
                }}
              >
                <span>{row.dayLabel}</span>
                <span style={{ color: "#7E624D" }}>
                  Score {row.score} · {row.steps.toLocaleString()} steps · {row.timeOutside} min outside
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    [heroSummary, mobility.title, mobility.summary, weekRows]
  );

  const toggleExpanded = (key: SettingKey) => {
    setExpandedRow((prev) => (prev === key ? null : key));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(String(event.target?.result ?? ""));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50"
      style={{
        backgroundColor: "#FDF6EC",
        overflowY: "auto",
        animation: "slideUpIn 280ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative px-6 pt-16 pb-32">
        <div className="relative mb-8">
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "var(--font-settings-title, 34px)",
              color: "#2C1A0E",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Settings
          </h1>

          <button
            onClick={() => { playSound("pageBackChime"); onClose(); }}
            className="absolute top-0 right-0 rounded-full flex items-center justify-center"
            style={{
              width: "36px",
              height: "36px",
              background: "#F2E8D8",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={18} style={{ color: "#C4601A" }} />
          </button>
        </div>

        <SectionHeader title="PROFILE" />
        <div style={{ display: "grid", gap: "1px", marginBottom: "20px" }}>
          <ExpandableRow
            label="Your name"
            description="This is the name Amber uses in greetings and gentle prompts."
            expanded={expandedRow === "how-it-works"}
            onToggle={() => toggleExpanded("how-it-works")}
            rounded="top"
            rightContent={
              editingName ? (
                <input
                  autoFocus
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                  style={{
                    width: "120px",
                    textAlign: "right",
                    fontFamily: "Lato, sans-serif",
                    fontSize: "var(--font-settings-row, 16px)",
                    border: "none",
                    borderBottom: "1px solid #C4601A",
                    outline: "none",
                    background: "transparent",
                    color: "#2C1A0E",
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingName(true);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#2C1A0E",
                    cursor: "pointer",
                    fontFamily: "Lato, sans-serif",
                    fontSize: "var(--font-settings-row, 16px)",
                  }}
                >
                  {userName} ✎
                </button>
              )
            }
          />

          <ExpandableRow
            label="Profile photo"
            description="Choose a picture to personalise the app and make it feel more familiar."
            expanded={expandedRow === "feedback"}
            onToggle={() => toggleExpanded("feedback")}
            rounded="bottom"
            rightContent={
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  photoInputRef.current?.click();
                }}
                style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #E8873A, #C4601A)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Lato, sans-serif",
                      fontSize: "var(--font-settings-row, 16px)",
                    }}
                  >
                    A
                  </div>
                )}
              </div>
            }
          />

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoSelect}
          />
        </div>

        <SectionHeader title="NOTIFICATIONS" />
        <div style={{ display: "grid", gap: "1px", marginBottom: "20px" }}>
          <ExpandableRow
            label="Morning greeting"
            description={settingDescriptions["morning-greeting"]}
            expanded={expandedRow === "morning-greeting"}
            onToggle={() => toggleExpanded("morning-greeting")}
            rounded="top"
            rightContent={<Toggle checked={morningGreeting} onChange={setMorningGreeting} />}
          />
          <ExpandableRow
            label="Evening reminder"
            description={settingDescriptions["evening-reminder"]}
            expanded={expandedRow === "evening-reminder"}
            onToggle={() => toggleExpanded("evening-reminder")}
            rightContent={<Toggle checked={eveningReminder} onChange={setEveningReminder} />}
          />
          <ExpandableRow
            label="Message alerts"
            description={settingDescriptions["message-alerts"]}
            expanded={expandedRow === "message-alerts"}
            onToggle={() => toggleExpanded("message-alerts")}
            rightContent={<Toggle checked={messageAlerts} onChange={setMessageAlerts} />}
          />
          <ExpandableRow
            label="Novelty suggestions"
            description={settingDescriptions["novelty-suggestions"]}
            expanded={expandedRow === "novelty-suggestions"}
            onToggle={() => toggleExpanded("novelty-suggestions")}
            rounded="bottom"
            rightContent={<Toggle checked={noveltySuggestions} onChange={setNoveltySuggestions} />}
          />
        </div>

        <SectionHeader title="ACCESSIBILITY & EXPERIENCE" />
        <div style={{ display: "grid", gap: "1px", marginBottom: "20px" }}>
          <ExpandableRow
            label="Text size"
            description={settingDescriptions["text-size"]}
            expanded={expandedRow === "text-size"}
            onToggle={() => toggleExpanded("text-size")}
            rounded="top"
            rightContent={
              <div style={{ display: "flex", gap: "8px" }}>
                {textChoices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound("navSelect");
                      updateTextSize(choice);
                    }}
                    style={{
                      minWidth: "42px",
                      height: "34px",
                      borderRadius: "999px",
                      border: settings.textSize === choice ? "none" : "1px solid rgba(196,96,26,0.18)",
                      background: settings.textSize === choice ? "var(--amber-primary)" : "#F8F1E7",
                      color: settings.textSize === choice ? "#fff" : "#9A7A60",
                      fontFamily: "Lato, sans-serif",
                      fontSize: "var(--font-settings-meta, 13px)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            }
          />

          <ExpandableRow
            label="App sounds"
            description={settingDescriptions["app-sounds"]}
            expanded={expandedRow === "app-sounds"}
            onToggle={() => toggleExpanded("app-sounds")}
            rightContent={<Toggle checked={settings.soundEnabled} onChange={toggleSound} />}
          />

          <ExpandableRow
            label="Animations"
            description={settingDescriptions.animations}
            expanded={expandedRow === "animations"}
            onToggle={() => toggleExpanded("animations")}
            rightContent={<Toggle checked={settings.animationsEnabled} onChange={toggleAnimations} />}
          />

          <ExpandableRow
            label="Haptics"
            description={settingDescriptions.haptics}
            expanded={expandedRow === "haptics"}
            onToggle={() => toggleExpanded("haptics")}
            rounded="bottom"
            rightContent={<Toggle checked={settings.hapticsEnabled} onChange={toggleHaptics} />}
          />
        </div>

        <SectionHeader title="PRIVACY & WELLBEING" />
        <div style={{ display: "grid", gap: "1px", marginBottom: "20px" }}>
          <ExpandableRow
            label="Keep data on this device"
            description={settingDescriptions["data-local"]}
            expanded={expandedRow === "data-local"}
            onToggle={() => toggleExpanded("data-local")}
            rounded="top"
            rightContent={<Toggle checked={true} onChange={() => {}} />}
          />
          <ExpandableRow
            label="Share wellbeing summary"
            description={settingDescriptions["share-wellbeing"]}
            expanded={expandedRow === "share-wellbeing"}
            onToggle={() => toggleExpanded("share-wellbeing")}
            rightContent={<Toggle checked={shareWellbeing} onChange={setShareWellbeing} />}
          />
          <ExpandableRow
            label="What family sees"
            description="Preview the same metrics and 7-day summary that family members see when you share your wellbeing."
            expanded={expandedRow === "what-family-sees"}
            onToggle={() => toggleExpanded("what-family-sees")}
            rounded="middle"
            expandedContent={whatFamilySeesPreview}
            expandedMaxHeight="420px"
          />
          <ExpandableRow
            label="Learn from my habits"
            description={settingDescriptions["learn-habits"]}
            expanded={expandedRow === "learn-habits"}
            onToggle={() => toggleExpanded("learn-habits")}
            rounded="bottom"
            rightContent={<Toggle checked={learnHabits} onChange={setLearnHabits} />}
          />
        </div>

        <SectionHeader title="ABOUT" />
        <div style={{ display: "grid", gap: "1px", marginBottom: "20px" }}>
          <ExpandableRow
            label="How Amber works"
            description={settingDescriptions["how-it-works"]}
            expanded={expandedRow === "version"}
            onToggle={() => toggleExpanded("version")}
            rounded="top"
          />
          <ExpandableRow
            label="Version"
            description={settingDescriptions.version}
            expanded={expandedRow === "delete-data"}
            onToggle={() => toggleExpanded("delete-data")}
            rightContent={
              <span
                style={{
                  color: "#9A7A60",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "var(--font-settings-meta, 13px)",
                }}
              >
                1.0.0
              </span>
            }
          />
          <ExpandableRow
            label="Feedback"
            description={settingDescriptions.feedback}
            expanded={expandedRow === "feedback-panel"}
            onToggle={() => setExpandedRow(expandedRow === "feedback-panel" ? null : ("feedback-panel" as SettingKey))}
            rounded="bottom"
          />
        </div>

        {expandedRow === ("feedback-panel" as SettingKey) && (
          <div
            style={{
              background: "#FFFAF3",
              borderRadius: "20px",
              padding: "16px",
              marginTop: "-8px",
              marginBottom: "20px",
              boxShadow: "0px 6px 18px rgba(200,120,40,0.08)",
            }}
          >
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share what feels lovely, confusing, or missing…"
              style={{
                width: "100%",
                minHeight: "120px",
                borderRadius: "16px",
                border: "1px solid rgba(196,96,26,0.14)",
                background: "#FFFDFC",
                padding: "14px",
                resize: "vertical",
                outline: "none",
                color: "#2C1A0E",
                fontFamily: "Lato, sans-serif",
                fontSize: "var(--font-settings-description, 15px)",
              }}
            />
            <button
              type="button"
              onClick={() => { playSound("correctAnswer"); setFeedbackText(""); }}
              style={{
                marginTop: "12px",
                height: "42px",
                padding: "0 18px",
                borderRadius: "999px",
                border: "none",
                background: "var(--amber-primary)",
                color: "#fff",
                fontFamily: "Lato, sans-serif",
                fontSize: "var(--font-settings-row, 16px)",
                cursor: "pointer",
              }}
            >
              Send feedback
            </button>
          </div>
        )}

        <SectionHeader title="DANGER ZONE" />
        <div
          style={{
            background: "#FFFAF3",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "0px 6px 18px rgba(200,120,40,0.08)",
          }}
        >
          <button
            type="button"
            onClick={() => setShowDeleteConfirm((prev) => !prev)}
            style={{
              width: "100%",
              minHeight: "48px",
              border: "none",
              borderRadius: "12px",
              background: showDeleteConfirm ? "rgba(196,96,26,0.12)" : "transparent",
              color: "#B5482A",
              textAlign: "left",
              fontFamily: "Lato, sans-serif",
              fontSize: "var(--font-settings-row, 16px)",
              cursor: "pointer",
            }}
          >
            Delete all data
          </button>

          {showDeleteConfirm && (
            <div style={{ marginTop: "12px" }}>
              <p
                style={{
                  margin: "0 0 12px 0",
                  color: "#7E624D",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "var(--font-settings-description, 15px)",
                  lineHeight: 1.5,
                }}
              >
                {settingDescriptions["delete-data"]}
              </p>

              <button
                type="button"
                onClick={() => { playSound("pageBackChime"); setShowDeleteConfirm(false); }}
                style={{
                  height: "42px",
                  padding: "0 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(181,72,42,0.24)",
                  background: "#fff",
                  color: "#B5482A",
                  fontFamily: "Lato, sans-serif",
                  fontSize: "var(--font-settings-meta, 13px)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}