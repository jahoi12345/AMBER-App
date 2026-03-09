import { useState, useRef, useEffect } from "react";
import { NavBar } from "../../components/NavBar";
import { SettingsButton } from "../../components/SettingsButton";
import { playSound } from "../../lib/soundUtils";
import { motion, AnimatePresence } from "motion/react";
import { WordSearchGame } from "../../components/WordSearchGame";
import { TriviaGame } from "../../components/TriviaGame";
import { JokeOfTheDay } from "../../components/JokeOfTheDay";
import { WordleGame } from "../../components/WordleGame";
import { SudokuGame } from "../../components/SudokuGame";
import { toast } from "sonner";
import { addTempAnchor } from "../../lib/sharedAnchors";

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: string;
  content: "video" | "wordsearch" | "trivia" | "joke" | "wordle" | "sudoku";
  videoUrl?: string;
  videoId?: string;
}

export function UserNoveltyIdeas() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [completedActivities, setCompletedActivities] = useState<Set<string>>(
    new Set()
  );

  const [memoryAnchors, setMemoryAnchors] = useState<Array<{
    id: number;
    activityKey: string;
    label: string;
    icon: string;
  }>>([]);

  const [embedError, setEmbedError] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  const ideas: Activity[] = [
    {
      id: "greeting-cards",
      title: "Make greeting cards for family",
      description: "A creative activity that connects you to the people you love",
      icon: "💌",
      content: "video",
      videoId: "G2fMapsrwIQ",
      videoUrl: "https://www.youtube.com/watch?v=G2fMapsrwIQ",
    },

    {
      id: "wordle",
      title: "Play Wordle",
      description: "A small language puzzle that wakes up attention and pattern recognition",
      icon: "🔤",
      content: "wordle",
    },

    {
      id: "word-search",
      title: "Try a word search",
      description: "Keeps the mind sharp and makes time feel purposeful",
      icon: "🧩",
      content: "wordsearch",
    },

    {
      id: "chair-yoga",
      title: "Chair yoga or stretching",
      description: "A short video to follow along at your own pace",
      icon: "🪷",
      content: "video",
      videoId: "1DYH5ud3zHo",
      videoUrl: "https://www.youtube.com/watch?v=1DYH5ud3zHo",
    },

    {
      id: "sudoku",
      title: "Solve a Sudoku puzzle",
      description: "A calm number puzzle that gently exercises the mind",
      icon: "🔢",
      content: "sudoku",
    },

    {
      id: "nature-sounds",
      title: "Listen to a nature soundscape",
      description: "Close your eyes and let your mind wander somewhere peaceful",
      icon: "🍃",
      content: "video",
      videoId: "1ZYbU82GVz4",
      videoUrl: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
    },

    {
      id: "daily-trivia",
      title: "Daily trivia challenge",
      description: "Test your knowledge with a new question every day",
      icon: "🎯",
      content: "trivia",
    },

    {
      id: "bird-watching",
      title: "Watch birds at the feeder",
      description: "A live bird feeder cam — peaceful and endlessly surprising",
      icon: "🐦",
      content: "video",
      videoId: "y9t1g8Ike6g",
      videoUrl: "https://www.youtube.com/watch?v=y9t1g8Ike6g",
    },

    {
      id: "joke-of-day",
      title: "Joke of the day",
      description: "A little laughter makes the whole day feel lighter",
      icon: "😄",
      content: "joke",
    },
  ];

  const handleMarkAsTried = (activityId?: string, activityTitle?: string) => {
    const activityKey = activityId || selectedActivity?.id;
    const activityLabel = activityTitle || selectedActivity?.title;

    if (!activityKey || !activityLabel || completedActivities.has(activityKey))
      return;
    playSound("correctAnswer");

    setCompletedActivities((prev) => new Set([...prev, activityKey]));

    setMemoryAnchors((prev) => [
      ...prev,
      {
        id: Date.now(),
        activityKey,
        label: activityLabel,
        icon: "💛",
      },
    ]);

    addTempAnchor({
      label: activityLabel,
      icon: "sparkle",
    });

    toast.success("Added to today's memories", {
      duration: 2500,
      style: {
        background: "var(--amber-primary)",
        color: "white",
        borderRadius: "100px",
        padding: "12px 20px",
      },
    });

    setSelectedActivity(null);
  };

  const isTried = (activityId: string) => completedActivities.has(activityId);

  const openYouTubeInNewTab = (url: string) => {
    playSound("navSelect");
    window.open(url, "_blank");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startYRef.current;

    if (diff > 100) {
      setSelectedActivity(null);
    }
  };

  useEffect(() => {}, []);

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--amber-background)",
        fontFamily: "Lato, sans-serif",
      }}
    >
      <SettingsButton isActivityModalOpen={!!selectedActivity} />

      <div className="px-6 pt-16">

        {/* HEADER */}
        <div className="mb-8">
          <h1
            className="mb-2 italic"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "var(--font-title, 32px)",
              color: "var(--amber-primary)",
            }}
          >
            Try Something New Today
          </h1>

          <p
            style={{
              fontFamily: "Libre Baskerville, serif",
              fontStyle: "italic",
              fontSize: "15px",
              color: "#9A7A60",
            }}
          >
            Your days have felt similar lately. Here are some gentle ideas.
          </p>
        </div>

        {/* CARDS */}
        <div className="flex flex-col gap-4 mb-8">

          {ideas.map((idea, i) => (

            <motion.div
              key={i}
              className="rounded-3xl p-5 border-l-4 flex gap-4 cursor-pointer"
              style={{
                backgroundColor: "var(--amber-card)",
                borderLeftColor: isTried(idea.id)
                  ? "#C4601A"
                  : "var(--amber-primary)",
                boxShadow: "0px 8px 32px rgba(200, 120, 40, 0.10)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playSound("navSelect");
                setEmbedError(false);
                setSelectedActivity(idea);
              }}
            >
              <div
                className="w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "#F2E8D8",
                }}
              >
                <span
                  style={{
                    fontSize: "26px",
                    lineHeight: 1,
                  }}
                >
                  {idea.icon}
                </span>
              </div>

              <div className="flex-1">
                <h3
                  className="mb-1"
                  style={{
                    fontSize: "var(--font-body, 18px)",
                    fontWeight: 700,
                    color: "var(--amber-text-dark)",
                  }}
                >
                  {idea.title}
                </h3>

                <p
                  className="mb-3"
                  style={{
                    fontSize: "var(--font-small, 14px)",
                    color: "var(--amber-text-muted)",
                  }}
                >
                  {idea.description}
                </p>

                <motion.button
                  className="px-5 py-2 rounded-full min-h-[40px]"
                  style={{
                    backgroundColor: isTried(idea.id)
                      ? "var(--amber-primary)"
                      : "transparent",
                    border: isTried(idea.id)
                      ? "none"
                      : "1px solid var(--amber-primary)",
                    color: isTried(idea.id) ? "white" : "var(--amber-primary)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsTried(idea.id, idea.title);
                  }}
                >
                  {isTried(idea.id)
                    ? "✦ Added to your day"
                    : "Mark as tried"}
                </motion.button>
              </div>

            </motion.div>

          ))}
        </div>
      </div>

      <NavBar type="user" />

      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            ref={modalRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 overflow-hidden"
            style={{
              backgroundColor: "#FDF6EC",
              borderTopLeftRadius: "32px",
              borderTopRightRadius: "32px",
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {selectedActivity.content === "wordsearch" ? (
              <WordSearchGame onClose={() => { playSound("pageBackChime"); setSelectedActivity(null); }} />
            ) : (
              <div className="flex flex-col h-full">
                {/* Header Banner */}
                <div
                  className="relative flex flex-col items-center justify-center"
                  style={{
                    height: "180px",
                    background: "radial-gradient(ellipse at center, rgba(245, 199, 132, 0.40) 0%, #FDF6EC 100%)",
                  }}
                >
                  {/* Grain texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      opacity: 0.04,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                  />

                  {/* Decorative arc line */}
                  <svg
                    className="absolute"
                    style={{
                      width: "200px",
                      height: "100px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <path
                      d="M 0 80 Q 100 20, 200 80"
                      fill="none"
                      stroke="#E8873A"
                      strokeWidth="0.5"
                      opacity="0.25"
                    />
                  </svg>

                  {/* Close button */}
                  <button
                    onClick={() => { playSound("pageBackChime"); setSelectedActivity(null); }}
                    className="absolute flex items-center justify-center rounded-full transition-all"
                    style={{
                      top: "14px",
                      right: "14px",
                      width: "34px",
                      height: "34px",
                      backgroundColor: "rgba(255, 250, 243, 0.90)",
                      fontSize: "16px",
                      color: "#C4601A",
                      boxShadow: "0px 2px 8px rgba(160, 80, 20, 0.15)",
                    }}
                  >
                    ×
                  </button>

                  {/* Content wrapper - centered emoji, title, and decorative rule */}
                  <div className="flex flex-col items-center justify-center relative z-10">
                    {/* Activity Icon with drop shadow */}
                    <span
                      style={{
                        fontSize: "44px",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        filter: "drop-shadow(0px 4px 12px rgba(160, 80, 20, 0.20))",
                      }}
                    >
                      {selectedActivity.icon}
                    </span>

                    {/* Activity Title */}
                    <h2
                      className="italic text-center px-4"
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "26px",
                        color: "#2C1A0E",
                        marginTop: "8px",
                        fontWeight: "normal",
                      }}
                    >
                      {selectedActivity.title}
                    </h2>

                    {/* Decorative rule */}
                    <div
                      style={{
                        width: "40px",
                        height: "1px",
                        backgroundColor: "#C4601A",
                        opacity: 0.3,
                        marginTop: "4px",
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: "0.5px",
                    backgroundColor: "#E8D0B0",
                  }}
                />

                {/* Scrollable Content Container */}
                {selectedActivity.content === "video" ? (
                  <div className="flex-1 overflow-y-auto p-5" style={{ paddingTop: "20px" }}>
                    <p
                      className="mb-4"
                      style={{
                        fontSize: "14px",
                        color: "var(--amber-text-muted)",
                        fontFamily: "Lato, sans-serif",
                      }}
                    >
                      {selectedActivity.description}
                    </p>

                    {embedError ? (
                      <div className="flex flex-col items-center gap-4 py-8">
                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--amber-text-muted)",
                            textAlign: "center",
                          }}
                        >
                          This video can't be embedded. Tap below to watch it on YouTube.
                        </p>
                        <button
                          onClick={() => openYouTubeInNewTab(selectedActivity.videoUrl!)}
                          className="px-5 py-3 rounded-full"
                          style={{
                            backgroundColor: "var(--amber-primary)",
                            color: "white",
                            border: "none",
                            fontSize: "16px",
                          }}
                        >
                          Open in YouTube
                        </button>
                      </div>
                    ) : (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedActivity.videoId}`}
                        title={selectedActivity.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          width: "100%",
                          height: "240px",
                          border: "none",
                          borderRadius: "12px",
                        }}
                        onError={() => setEmbedError(true)}
                      />
                    )}

                    <div className="flex justify-center mt-6">
                      <motion.button
                        className="px-5 py-2 rounded-full min-h-[40px]"
                        style={{
                          backgroundColor: isTried(selectedActivity.id)
                            ? "var(--amber-primary)"
                            : "transparent",
                          border: isTried(selectedActivity.id)
                            ? "none"
                            : "1px solid var(--amber-primary)",
                          color: isTried(selectedActivity.id) ? "white" : "var(--amber-primary)",
                        }}
                        onClick={() => handleMarkAsTried()}
                      >
                        {isTried(selectedActivity.id)
                          ? "✦ Added to your day"
                          : "Mark as tried"}
                      </motion.button>
                    </div>
                  </div>
                ) : selectedActivity.content === "wordle" || selectedActivity.content === "sudoku" ? (
                  <div
                    className="flex-1 overflow-y-auto"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {selectedActivity.content === "wordle" ? (
                      <WordleGame 
                        onClose={() => { playSound("pageBackChime"); setSelectedActivity(null); }} 
                        onMarkAsTried={() => handleMarkAsTried()}
                      />
                    ) : (
                      <SudokuGame 
                        onClose={() => { playSound("pageBackChime"); setSelectedActivity(null); }} 
                        onMarkAsTried={() => handleMarkAsTried()}
                      />
                    )}
                  </div>
                ) : selectedActivity.content === "trivia" ? (
                  <div
                    className="flex-1 overflow-y-auto p-5"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      paddingTop: "20px",
                      minHeight: 0,
                    }}
                  >
                    <TriviaGame
                      onClose={() => { playSound("pageBackChime"); setSelectedActivity(null); }}
                      onMarkAsTried={() => handleMarkAsTried()}
                    />
                  </div>
                ) : selectedActivity.content === "joke" ? (
                  <div className="flex-1 overflow-y-auto p-5" style={{ paddingTop: "20px" }}>
                    <JokeOfTheDay
                      onClose={() => { playSound("pageBackChime"); setSelectedActivity(null); }}
                      onMarkAsTried={() => handleMarkAsTried()}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}