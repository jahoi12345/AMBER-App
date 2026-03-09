import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { playSound } from "../lib/soundUtils";

interface JokeOfTheDayProps {
  onClose: () => void;
  onMarkAsTried: () => void;
}

interface Joke {
  setup: string;
  punchline: string;
}

const jokeEmojis = ["😄", "🤣", "😂", "😆", "🙈", "🥁", "👀", "😅"];

export function JokeOfTheDay({ onClose, onMarkAsTried }: JokeOfTheDayProps) {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [showPunchline, setShowPunchline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emojiScale, setEmojiScale] = useState(1);
  const emojiIndexRef = useRef(0);
  const [currentEmoji, setCurrentEmoji] = useState(jokeEmojis[0]);

  const fetchJoke = async () => {
    playSound("navSelect");
    setLoading(true);
    setShowPunchline(false);
    setEmojiScale(1);

    try {
      const response = await fetch(
        "https://official-joke-api.appspot.com/random_joke"
      );

      const data = await response.json();

      setJoke({
        setup: data.setup,
        punchline: data.punchline,
      });

      const nextEmoji = jokeEmojis[emojiIndexRef.current % jokeEmojis.length];
      setCurrentEmoji(nextEmoji);
      emojiIndexRef.current++;

    } catch (error) {
      setJoke({
        setup: "Why don't scientists trust atoms?",
        punchline: "Because they make up everything!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoke();
  }, []);

  const handleRevealPunchline = () => {
    playSound("lightSwitch");
    setShowPunchline(true);
    setEmojiScale(1.4);
    setTimeout(() => setEmojiScale(1), 300);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">

        <div
          className="w-full max-w-md rounded-3xl p-8 relative z-10"
          style={{
            backgroundColor: "#FFFAF3",
            boxShadow: "0px 8px 24px rgba(160, 80, 20, 0.10)",
          }}
        >
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div
                className="h-6 rounded w-3/4 mx-auto"
                style={{ backgroundColor: "#F2E8D8" }}
              />
              <div
                className="h-6 rounded w-full mx-auto"
                style={{ backgroundColor: "#F2E8D8" }}
              />
              <div
                className="h-14 rounded-full mt-8"
                style={{ backgroundColor: "#F2E8D8" }}
              />
            </div>
          ) : (
            <>
              {/* Setup */}
              <p
                className="text-center mb-6 italic"
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "22px",
                  color: "#2C1A0E",
                  lineHeight: 1.5,
                }}
              >
                {joke?.setup}
              </p>

              {/* Reveal Button */}
              {!showPunchline ? (
                <button
                  onClick={handleRevealPunchline}
                  className="w-full rounded-full transition-all"
                  style={{
                    minHeight: "56px",
                    backgroundColor: "#E8873A",
                    color: "white",
                    fontFamily: "Lato, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  Reveal the punchline
                </button>
              ) : (
                <>
                  {/* Punchline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                    }}
                    className="mb-6"
                  >
                    <p
                      className="text-center"
                      style={{
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "22px",
                        color: "#C4601A",
                        lineHeight: 1.5,
                      }}
                    >
                      {joke?.punchline}
                    </p>

                    <motion.div
                      className="text-center mt-4"
                      animate={{ scale: emojiScale }}
                      transition={{ duration: 0.3 }}
                      style={{ fontSize: "32px" }}
                    >
                      {currentEmoji}
                    </motion.div>
                  </motion.div>

                  {/* Another one button */}
                  <button
                    onClick={fetchJoke}
                    className="w-full py-3 rounded-full border-2 transition-colors"
                    style={{
                      borderColor: "#E8873A",
                      color: "#E8873A",
                      backgroundColor: "transparent",
                      fontFamily: "Lato, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Another one →
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mark as tried button */}
        <button
          onClick={onMarkAsTried}
          className="w-full max-w-md mt-6 py-4 rounded-full"
          style={{
            background: "linear-gradient(135deg, #E8873A 0%, #C4601A 100%)",
            color: "white",
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "20px",
            border: "none",
            minHeight: "56px",
          }}
        >
          Mark as tried
        </button>

      </div>
    </div>
  );
}