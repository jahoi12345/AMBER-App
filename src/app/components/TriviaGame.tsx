import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "../lib/soundUtils";

interface TriviaGameProps {
  onClose: () => void;
  onMarkAsTried: () => void;
}

interface TriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
}

export function TriviaGame({ onClose, onMarkAsTried }: TriviaGameProps) {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [showMiniResults, setShowMiniResults] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  
  // Question queue and recent tracking to prevent repeats
  const questionQueueRef = useRef<TriviaQuestion[]>([]);
  const recentQuestionsRef = useRef<string[]>([]);

  const fetchQuestionBatch = async () => {
    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple"
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Filter out questions that were recently shown
        const newQuestions = data.results.filter(
          (q: TriviaQuestion) => !recentQuestionsRef.current.includes(q.question)
        );
        
        // Add to queue
        questionQueueRef.current = [...questionQueueRef.current, ...newQuestions];
      }
    } catch (error) {
      console.error("Error fetching trivia batch:", error);
      // Add a fallback question if fetch fails
      if (questionQueueRef.current.length === 0) {
        questionQueueRef.current.push({
          question: "What is the capital of France?",
          correct_answer: "Paris",
          incorrect_answers: ["London", "Berlin", "Madrid"],
          category: "Geography",
        });
      }
    }
  };

  const getNextQuestion = async () => {
    // If queue is running low, fetch more
    if (questionQueueRef.current.length <= 1) {
      await fetchQuestionBatch();
    }

    // Pop question from queue
    const nextQuestion = questionQueueRef.current.shift();
    
    if (!nextQuestion) {
      // Fallback if queue is somehow empty
      return {
        question: "What is the largest ocean on Earth?",
        correct_answer: "Pacific Ocean",
        incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
        category: "Geography",
      };
    }

    // Add to recent questions list (keep last 5)
    recentQuestionsRef.current.push(nextQuestion.question);
    if (recentQuestionsRef.current.length > 5) {
      recentQuestionsRef.current.shift();
    }

    return nextQuestion;
  };

  const loadQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setShowConfetti(false);
    setSlideDirection("right");

    const questionData = await getNextQuestion();
    setQuestion(questionData);
    setCorrectAnswer(questionData.correct_answer);

    // Shuffle answers
    const allAnswers = [
      ...questionData.incorrect_answers,
      questionData.correct_answer,
    ].sort(() => Math.random() - 0.5);
    setAnswers(allAnswers);

    setLoading(false);
  };

  useEffect(() => {
    // Initialize: fetch first batch and load first question
    const initialize = async () => {
      await fetchQuestionBatch();
      await loadQuestion();
    };
    initialize();
  }, []);

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
      setShowConfetti(true);
      setCorrectCount(prev => prev + 1);
    }

    // Auto-fetch new question after 1200ms
    setTimeout(() => {
      // Check if we need to show mini results (every 5 questions)
      if (questionNumber % 5 === 0) {
        setShowMiniResults(true);
      } else {
        setSlideDirection("left");
        setQuestionNumber(prev => prev + 1);
        loadQuestion();
      }
    }, 1200);
  };

  const handleContinueQuiz = () => {
    playSound("navSelect");
    setShowMiniResults(false);
    setSlideDirection("left");
    setQuestionNumber(prev => prev + 1);
    // Reset correct count for next batch
    setCorrectCount(0);
    loadQuestion();
  };

  const decodeHTML = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center mx-auto">
      {showMiniResults ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl p-8 relative z-10"
          style={{
            backgroundColor: "#FFFAF3",
            boxShadow: "0px 8px 24px rgba(160, 80, 20, 0.10)",
          }}
        >
          <p
            className="text-center mb-2"
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "28px",
              color: "#E8873A",
            }}
          >
            Great progress! 🎯
          </p>
          <p
            className="text-center mb-6"
            style={{
              fontFamily: "Lato, sans-serif",
              fontSize: "18px",
              color: "#2C1A0E",
            }}
          >
            You got <strong>{correctCount}</strong> out of 5 correct
          </p>
          <p
            className="text-center mb-6 italic"
            style={{
              fontFamily: "Libre Baskerville, serif",
              fontSize: "14px",
              color: "#9A7A60",
            }}
          >
            {correctCount >= 4 ? "Wonderful work!" : correctCount >= 3 ? "You're doing well!" : "Keep trying!"}
          </p>
          <button
            onClick={handleContinueQuiz}
            className="w-full py-4 rounded-full"
            style={{
              background: "linear-gradient(135deg, #E8873A 0%, #C4601A 100%)",
              color: "white",
              fontFamily: "Lato, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              border: "none",
              minHeight: "56px",
            }}
          >
            Keep going →
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={questionNumber}
            initial={{ x: slideDirection === "right" ? 300 : -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDirection === "left" ? -300 : 300, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md rounded-3xl p-6 relative z-10"
            style={{
              backgroundColor: "#FFFAF3",
              boxShadow: "0px 8px 24px rgba(160, 80, 20, 0.10)",
            }}
          >
            {/* Question counter and score */}
            <div className="flex justify-between mb-4">
              <span
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "12px",
                  color: "#E8873A",
                }}
              >
                {correctCount} correct
              </span>
              <span
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "12px",
                  color: "var(--amber-text-muted)",
                }}
              >
                Question {questionNumber}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div
                  className="h-6 rounded"
                  style={{ backgroundColor: "#F2E8D8" }}
                />
                <div
                  className="h-6 rounded w-3/4"
                  style={{ backgroundColor: "#F2E8D8" }}
                />
                <div className="space-y-2 mt-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-14 rounded-2xl"
                      style={{ backgroundColor: "#F2E8D8" }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Question */}
                <p
                  className="text-center mb-8"
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "22px",
                    color: "#2C1A0E",
                    lineHeight: 1.4,
                  }}
                >
                  {question ? decodeHTML(question.question) : ""}
                </p>

                {/* Answers */}
                <div className="space-y-3 mb-6">
                  {answers.map((answer, index) => {
                    const isSelected = selectedAnswer === answer;
                    const isCorrect = answer === correctAnswer;
                    const showAsCorrect = selectedAnswer && isCorrect;
                    const showAsWrong = isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerClick(answer)}
                        disabled={!!selectedAnswer}
                        className="w-full rounded-2xl transition-all relative overflow-hidden"
                        style={{
                          minHeight: "56px",
                          padding: "16px",
                          backgroundColor: showAsCorrect
                            ? "#6AAF6A"
                            : showAsWrong
                            ? "#C45A3A"
                            : "#F2E8D8",
                          color: showAsCorrect || showAsWrong ? "white" : "#2C1A0E",
                          fontFamily: "Lato, sans-serif",
                          fontSize: "16px",
                          border: "none",
                          cursor: selectedAnswer ? "default" : "pointer",
                        }}
                        whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                      >
                        {decodeHTML(answer)}
                        {showAsCorrect && (
                          <span className="ml-2 text-xl">✓</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Confetti */}
                <AnimatePresence>
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: "#E8873A",
                            left: "50%",
                            top: "50%",
                          }}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: Math.cos((i * Math.PI * 2) / 8) * 100,
                            y: Math.sin((i * Math.PI * 2) / 8) * 100,
                          }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.6 }}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Mark as tried button */}
      {!showMiniResults && (
        <button
          onClick={() => {
            playSound("correctAnswer");
            onMarkAsTried();
          }}
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
      )}
    </div>
  );
}
