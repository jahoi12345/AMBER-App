import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "../lib/soundUtils";

interface WordleGameProps {
  onClose?: () => void;
  onMarkAsTried?: () => void;
}

type TileState = "correct" | "present" | "absent";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const WORD_BANK = [
  "APPLE",
  "GRACE",
  "SHINE",
  "BRAVE",
  "LIGHT",
  "HEART",
  "PEACE",
  "SMILE",
  "CLOUD",
  "WATER",
  "STONE",
  "PLANT",
  "SWEET",
  "DREAM",
  "SOUND",
  "CHAIR",
  "TABLE",
  "BREAD",
  "PLANE",
  "SHEEP",
  "CRANE",
  "BRICK",
  "GRASS",
  "STORM",
  "SHORE",
  "FIELD",
  "FLAME",
  "CROWN",
  "ROUTE",
  "FRAME",
  "THINK",
  "TRUTH",
  "FAITH",
  "QUEST",
  "RIVER",
  "OCEAN",
  "WHALE",
  "TIGER",
  "EAGLE",
  "HORSE",
  "PLAIN",
  "SOLAR",
  "LUNAR",
  "BLOOM",
  "ALIVE",
  "BLEND",
  "FOCUS",
  "SOLVE",
  "CLIMB",
  "DRIVE",
  "BRUSH",
  "LAUGH",
  "CHEER",
  "DANCE",
  "SPEAK",
  "WRITE",
  "WATCH",
  "BUILD",
  "CRAFT",
  "SPARK",
  "EMBER",
  "GLASS",
  "METAL",
  "BRASS",
  "SHARP",
  "ROUND",
  "POINT",
  "TRACK",
  "TRAIN",
  "CABLE",
  "RADIO",
  "PHONE",
  "VOICE",
  "SONIC",
  "STAND",
  "MUSIC",
  "NOTES",
  "RHYME",
  "VERSE",
  "CHOIR",
  "FAIRY",
  "MAGIC",
  "SPELL",
  "PIXEL",
  "MODEL",
  "GRAPH",
  "LOGIC",
  "BRAIN",
  "IDEAL",
];

function getRandomWord(): string {
  const index = Math.floor(Math.random() * WORD_BANK.length);
  return WORD_BANK[index];
}

function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill("absent");
  const answerLetters = answer.split("");
  const guessLetters = guess.split("");
  const used = Array(WORD_LENGTH).fill(false);

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;

    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessLetters[i] === answerLetters[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

function getTileColor(state?: TileState) {
  if (state === "correct") return "#E8873A";
  if (state === "present") return "#F3D6A6";
  if (state === "absent") return "#E8E0D5";
  return "#FFFDFC";
}

export function WordleGame({ onClose, onMarkAsTried }: WordleGameProps = {}) {
  const [answer, setAnswer] = useState(getRandomWord());
  const [attempts, setAttempts] = useState<string[]>([]);
  const [results, setResults] = useState<TileState[][]>([]);
  const [guess, setGuess] = useState(Array(WORD_LENGTH).fill(""));
  const [message, setMessage] = useState("Guess the five-letter word.");
  const [hasMarkedAsTried, setHasMarkedAsTried] = useState(false);

  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const isSolved = useMemo(
    () => attempts[attempts.length - 1] === answer,
    [attempts, answer],
  );
  const isGameOver = isSolved || attempts.length >= MAX_GUESSES;

  useEffect(() => {
    if (!isGameOver) return;

    if (isSolved) {
      setMessage("Correct! You found the word.");
      return;
    }

    setMessage(`All 6 guesses used. The word was ${answer}.`);
  }, [answer, isGameOver, isSolved]);

  useEffect(() => {
    if (!isGameOver) {
      const firstEmptyIndex = guess.findIndex((letter) => !letter);
      const focusIndex = firstEmptyIndex === -1 ? WORD_LENGTH - 1 : firstEmptyIndex;
      inputs.current[focusIndex]?.focus();
    }
  }, [guess, isGameOver]);

  function updateLetter(index: number, value: string) {
    if (isGameOver) return;

    const cleanedValue = value.replace(/[^a-z]/gi, "").toUpperCase().slice(-1);
    const nextGuess = [...guess];
    nextGuess[index] = cleanedValue;
    setGuess(nextGuess);

    if (cleanedValue && index < WORD_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleBackspace(index: number) {
    if (isGameOver) return;

    if (guess[index]) {
      const nextGuess = [...guess];
      nextGuess[index] = "";
      setGuess(nextGuess);
      return;
    }

    if (index > 0) {
      const nextGuess = [...guess];
      nextGuess[index - 1] = "";
      setGuess(nextGuess);
      inputs.current[index - 1]?.focus();
    }
  }

  function submitGuess() {
    if (isGameOver) return;
    playSound("navSelect");

    const word = guess.join("");

    if (word.length !== WORD_LENGTH) {
      setMessage("Enter all 5 letters.");
      return;
    }

    const evaluation = evaluateGuess(word, answer);
    const nextAttempts = [...attempts, word];
    const nextResults = [...results, evaluation];

    setAttempts(nextAttempts);
    setResults(nextResults);

    if (word === answer) {
      setMessage("Correct! You found the word.");
      setGuess(Array(WORD_LENGTH).fill(""));
      return;
    }

    if (nextAttempts.length >= MAX_GUESSES) {
      setMessage(`All 6 guesses used. The word was ${answer}.`);
      setGuess(Array(WORD_LENGTH).fill(""));
      return;
    }

    setGuess(Array(WORD_LENGTH).fill(""));
    setMessage(`${MAX_GUESSES - nextAttempts.length} guesses left.`);
  }

  function resetGame() {
    playSound("lightSwitch");
    setAnswer(getRandomWord());
    setAttempts([]);
    setResults([]);
    setGuess(Array(WORD_LENGTH).fill(""));
    setMessage("Guess the five-letter word.");
    setHasMarkedAsTried(false);
  }

  function handleMarkAsTried() {
    playSound("correctAnswer");
    setHasMarkedAsTried(true);
    onMarkAsTried?.();
  }

  return (
    <div className="flex justify-center items-center h-full">
      <div style={{ maxWidth: 380, width: "100%" }}>
        <div
          style={{
            background: "#FFFAF3",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 8px 24px rgba(160,80,20,0.1)",
          }}
        >
          <p
            style={{
              textAlign: "center",
              marginBottom: 20,
              color: "#7E624D",
              fontFamily: "Lato, sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>

          <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
              const word = attempts[rowIndex] ?? "";
              const rowResults = results[rowIndex] ?? [];
              const isCurrentRow = rowIndex === attempts.length && !isGameOver;

              return (
                <div
                  key={rowIndex}
                  style={{ display: "flex", gap: 8, justifyContent: "center" }}
                >
                  {Array.from({ length: WORD_LENGTH }).map((__, colIndex) => {
                    const currentLetter = word
                      ? word[colIndex]
                      : isCurrentRow
                        ? guess[colIndex]
                        : "";

                    return (
                      <input
                        key={`${rowIndex}-${colIndex}`}
                        ref={(element) => {
                          if (isCurrentRow) {
                            inputs.current[colIndex] = element;
                          }
                        }}
                        value={currentLetter}
                        readOnly={!isCurrentRow}
                        maxLength={1}
                        onChange={(event) => updateLetter(colIndex, event.target.value)}
                        onKeyDown={(event) => {
                          if (!isCurrentRow) return;

                          if (event.key === "Backspace") {
                            event.preventDefault();
                            handleBackspace(colIndex);
                          }

                          if (event.key === "ArrowLeft" && colIndex > 0) {
                            event.preventDefault();
                            inputs.current[colIndex - 1]?.focus();
                          }

                          if (event.key === "ArrowRight" && colIndex < WORD_LENGTH - 1) {
                            event.preventDefault();
                            inputs.current[colIndex + 1]?.focus();
                          }

                          if (event.key === "Enter") {
                            event.preventDefault();
                            submitGuess();
                          }
                        }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          background: getTileColor(rowResults[colIndex]),
                          color: rowResults[colIndex] ? "#FFFFFF" : "#2C1A0E",
                          fontWeight: 700,
                          fontSize: 20,
                          fontFamily: "Lato, sans-serif",
                          border: "1px solid rgba(196,96,26,0.14)",
                          outline: "none",
                          boxShadow: "none",
                          textTransform: "uppercase",
                          cursor: isCurrentRow ? "text" : "default",
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
            <button
              onClick={submitGuess}
              disabled={isGameOver}
              style={{
                background: isGameOver ? "#E8E0D5" : "#E8873A",
                color: "white",
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                minWidth: 96,
                cursor: isGameOver ? "default" : "pointer",
                fontFamily: "Lato, sans-serif",
              }}
            >
              Check
            </button>

            <button
              onClick={resetGame}
              style={{
                border: "1px solid #E8873A",
                color: "#E8873A",
                padding: "10px 18px",
                borderRadius: 999,
                background: "transparent",
                fontFamily: "Lato, sans-serif",
              }}
            >
              New Word
            </button>
          </div>

          {(isGameOver || hasMarkedAsTried) && (
            <button
              onClick={handleMarkAsTried}
              disabled={hasMarkedAsTried}
              style={{
                width: "100%",
                minHeight: 52,
                borderRadius: 999,
                border: hasMarkedAsTried ? "none" : "1px solid #E8873A",
                background: hasMarkedAsTried ? "#E8873A" : "transparent",
                color: hasMarkedAsTried ? "#FFFFFF" : "#E8873A",
                fontFamily: "Lato, sans-serif",
                fontSize: 16,
                fontWeight: 600,
                cursor: hasMarkedAsTried ? "default" : "pointer",
              }}
            >
              {hasMarkedAsTried ? "✦ Added to your day" : "Mark as tried"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}