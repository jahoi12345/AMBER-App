import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { playSound } from "../lib/soundUtils";

interface WordSearchProps {
  onClose: () => void;
}

interface GameSession {
  gameNumber: number;
  timeSeconds: number;
  wordsFound: number;
  date: string;
}

interface ProgressStats {
  gamesPlayed: number;
  averageTimeSeconds: number;
  bestTimeSeconds: number;
  totalWordsFound: number;
  sessionHistory: GameSession[];
}

interface Cell {
  row: number;
  col: number;
}

interface Direction {
  dr: number;
  dc: number;
}

interface WordPlacement {
  word: string;
  cells: Cell[];
}

// Thematic word sets - cycle through in order
const wordSets = [
  ['GARDEN', 'SUNLIGHT', 'MORNING', 'PEACEFUL', 'BIRDS', 'WARMTH', 'BLOSSOM', 'GENTLE'],
  ['FAMILY', 'MEMORY', 'LAUGHTER', 'STORIES', 'TOGETHER', 'EMBRACE', 'BELOVED', 'TENDER'],
  ['AUTUMN', 'HARVEST', 'GOLDEN', 'CRISP', 'MAPLE', 'TWILIGHT', 'AMBER', 'SEASON'],
  ['MUSIC', 'DANCING', 'MELODIES', 'RHYTHM', 'JOYFUL', 'SINGING', 'HARMONY', 'WALTZ'],
  ['OCEAN', 'WAVES', 'SHORELINE', 'BREEZE', 'SAILING', 'HORIZON', 'SERENE', 'TIDAL'],
  ['READING', 'STORIES', 'CHAPTER', 'LIBRARY', 'NOVELS', 'WISDOM', 'POETRY', 'PAGES'],
];

// All 8 directions for word placement
const DIRECTIONS: Direction[] = [
  { dr: 0,  dc: 1  }, // right
  { dr: 0,  dc: -1 }, // left (reverse horizontal)
  { dr: 1,  dc: 0  }, // down
  { dr: -1, dc: 0  }, // up (reverse vertical)
  { dr: 1,  dc: 1  }, // diagonal down-right
  { dr: 1,  dc: -1 }, // diagonal down-left
  { dr: -1, dc: 1  }, // diagonal up-right
  { dr: -1, dc: -1 }, // diagonal up-left
];

const GRID_SIZE = 10;

export function WordSearchGame({ onClose }: WordSearchProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [wordPlacements, setWordPlacements] = useState<Map<string, Cell[]>>(new Map());
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [currentPath, setCurrentPath] = useState<Cell[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState<Cell | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [puzzleKey, setPuzzleKey] = useState<number>(0);
  const [wordSetIndex, setWordSetIndex] = useState<number>(0);
  const [showInvalidFeedback, setShowInvalidFeedback] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    gamesPlayed: 0,
    averageTimeSeconds: 0,
    bestTimeSeconds: Infinity,
    totalWordsFound: 0,
    sessionHistory: [],
  });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateNewPuzzle();
  }, []);

  const generateNewPuzzle = () => {
    const currentWords = wordSets[wordSetIndex];
    
    // Keep trying until we get a grid with at least 2 diagonal words
    let attempts = 0;
    let validGrid = false;
    let generatedGrid: string[][] = [];
    let placements = new Map<string, Cell[]>();
    
    while (!validGrid && attempts < 10) {
      const result = generateGrid(currentWords, GRID_SIZE);
      generatedGrid = result.grid;
      placements = result.wordPlacements;
      
      // Count diagonal placements
      let diagonalCount = 0;
      placements.forEach((cells) => {
        if (cells.length >= 2) {
          const isDiagonal = 
            cells[0].row !== cells[1].row && 
            cells[0].col !== cells[1].col;
          if (isDiagonal) diagonalCount++;
        }
      });
      
      // Require at least 2 diagonal words
      if (diagonalCount >= 2) {
        validGrid = true;
      }
      attempts++;
    }
    
    setGrid(generatedGrid);
    setWords(currentWords);
    setWordPlacements(placements);
  };

  const generateGrid = (words: string[], gridSize: number) => {
    // Initialize empty grid
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    const wordPlacements = new Map<string, Cell[]>();
    
    // Sort words longest-first — harder to place long words, do them first
    const sorted = [...words].sort((a, b) => b.length - a.length);
    
    for (const word of sorted) {
      const cells = placeWord(grid, word.toUpperCase(), gridSize);
      if (cells) {
        wordPlacements.set(word.toUpperCase(), cells);
      }
    }
    
    // Fill remaining empty cells with random uppercase letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] === '') {
          grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    
    return { grid, wordPlacements };
  };

  const placeWord = (grid: string[][], word: string, gridSize: number): Cell[] | null => {
    const maxAttempts = 100;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Pick a random direction from ALL 8
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      
      // Calculate valid starting row range based on direction
      const minRow = dir.dr === -1 ? word.length - 1 : 0;
      const maxRow = dir.dr === 1  ? gridSize - word.length : gridSize - 1;
      const minCol = dir.dc === -1 ? word.length - 1 : 0;
      const maxCol = dir.dc === 1  ? gridSize - word.length : gridSize - 1;
      
      // If the word can't fit in this direction, skip
      if (minRow > maxRow || minCol > maxCol) continue;
      
      const startRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
      
      // Check if all cells are empty or already have the correct letter
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir.dr * i;
        const c = startCol + dir.dc * i;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (!canPlace) continue;
      
      // Place the word
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir.dr * i;
        const c = startCol + dir.dc * i;
        grid[r][c] = word[i];
      }
      
      // Return the cells this word occupies
      return Array.from({ length: word.length }, (_, i) => ({
        row: startRow + dir.dr * i,
        col: startCol + dir.dc * i
      }));
    }
    
    return null; // failed to place after maxAttempts
  };

  // Pointer event handlers - unified for touch and mouse
  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (completionTime) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStartCell({ row, col });
    setCurrentPath([{ row, col }]);
    
    // Capture pointer to keep receiving events even if pointer leaves cell
    if (gridRef.current) {
      gridRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartCell || completionTime) return;

    // Find which cell is under the pointer
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    const rowAttr = element.getAttribute('data-row');
    const colAttr = element.getAttribute('data-col');
    
    if (rowAttr === null || colAttr === null) return;

    const currentCell = {
      row: parseInt(rowAttr),
      col: parseInt(colAttr)
    };

    // Calculate direction vector from start to current
    const dr = currentCell.row - dragStartCell.row;
    const dc = currentCell.col - dragStartCell.col;

    // Normalize to one of 8 directions
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);  // -1, 0, or 1
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);  // -1, 0, or 1

    // Walk from start to current, collecting cells along the path
    const path: Cell[] = [];
    let r = dragStartCell.row;
    let c = dragStartCell.col;

    // Add cells until we reach the current cell or exceed reasonable distance
    const maxSteps = GRID_SIZE * 2; // Safety limit
    let steps = 0;

    while (steps < maxSteps) {
      path.push({ row: r, col: c });
      
      // Check if we've reached the target
      if (r === currentCell.row && c === currentCell.col) {
        break;
      }

      // Move one step in the direction
      r += stepR;
      c += stepC;

      // Boundary check
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {
        break;
      }

      steps++;
    }

    setCurrentPath(path);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;

    // Release pointer capture
    if (gridRef.current) {
      gridRef.current.releasePointerCapture(e.pointerId);
    }

    checkForWord();
    setIsDragging(false);
    setDragStartCell(null);
    setCurrentPath([]);
  };

  const cellsMatch = (cells1: Cell[], cells2: Cell[]): boolean => {
    if (cells1.length !== cells2.length) return false;
    
    // Check forward direction
    const forwardMatch = cells1.every((cell, idx) => 
      cell.row === cells2[idx].row && cell.col === cells2[idx].col
    );
    
    if (forwardMatch) return true;
    
    // Check reverse direction
    const reversed = [...cells2].reverse();
    return cells1.every((cell, idx) => 
      cell.row === reversed[idx].row && cell.col === reversed[idx].col
    );
  };

  const checkForWord = () => {
    if (currentPath.length < 2) return;

    // Check if the current path matches any word placement
    let matchedWord: string | null = null;
    
    wordPlacements.forEach((cells, word) => {
      if (cellsMatch(currentPath, cells)) {
        matchedWord = word;
      }
    });

    if (matchedWord && !foundWords.includes(matchedWord)) {
      // Found a valid word!
      const newFoundWords = [...foundWords, matchedWord];
      setFoundWords(newFoundWords);
      
      // Add cells to permanent foundCells set
      const newFoundCells = new Set(foundCells);
      currentPath.forEach(({ row, col }) => {
        newFoundCells.add(`${row}-${col}`);
      });
      setFoundCells(newFoundCells);

      // Check if all words are found
      if (newFoundWords.length === words.length) {
        const timeSeconds = Math.round((Date.now() - startTime) / 1000);
        setCompletionTime(timeSeconds);

        // Update progress stats
        const newHistory: GameSession = {
          gameNumber: progressStats.gamesPlayed + 1,
          timeSeconds,
          wordsFound: words.length,
          date: new Date().toISOString(),
        };

        const newBestTime =
          progressStats.bestTimeSeconds === Infinity
            ? timeSeconds
            : Math.min(progressStats.bestTimeSeconds, timeSeconds);

        const newStats = {
          gamesPlayed: progressStats.gamesPlayed + 1,
          bestTimeSeconds: newBestTime,
          totalWordsFound: progressStats.totalWordsFound + words.length,
          sessionHistory: [...progressStats.sessionHistory, newHistory].slice(-5),
          averageTimeSeconds: 0,
        };

        // Calculate average
        const totalTime = newStats.sessionHistory.reduce(
          (sum, session) => sum + session.timeSeconds,
          0
        );
        newStats.averageTimeSeconds = Math.round(
          totalTime / newStats.sessionHistory.length
        );

        setProgressStats(newStats);
      }
    } else if (currentPath.length >= 2) {
      // Invalid word - flash red feedback
      setShowInvalidFeedback(true);
      setTimeout(() => setShowInvalidFeedback(false), 300);
    }
  };

  const handlePlayAnother = () => {
    playSound("navSelect");
    // Increment word set index and wrap around
    const nextIndex = (wordSetIndex + 1) % wordSets.length;
    setWordSetIndex(nextIndex);
    
    // Force full unmount/remount by incrementing key
    setPuzzleKey((prev) => prev + 1);
    
    // Reset all state
    setFoundWords([]);
    setFoundCells(new Set());
    setCurrentPath([]);
    setIsDragging(false);
    setDragStartCell(null);
    setStartTime(Date.now());
    setCompletionTime(null);
    setWordPlacements(new Map());
    
    // Generate new puzzle with next word set
    setTimeout(() => {
      const currentWords = wordSets[nextIndex];
      
      // Keep trying until we get a grid with at least 2 diagonal words
      let attempts = 0;
      let validGrid = false;
      let generatedGrid: string[][] = [];
      let placements = new Map<string, Cell[]>();
      
      while (!validGrid && attempts < 10) {
        const result = generateGrid(currentWords, GRID_SIZE);
        generatedGrid = result.grid;
        placements = result.wordPlacements;
        
        // Count diagonal placements
        let diagonalCount = 0;
        placements.forEach((cells) => {
          if (cells.length >= 2) {
            const isDiagonal = 
              cells[0].row !== cells[1].row && 
              cells[0].col !== cells[1].col;
            if (isDiagonal) diagonalCount++;
          }
        });
        
        // Require at least 2 diagonal words
        if (diagonalCount >= 2) {
          validGrid = true;
        }
        attempts++;
      }
      
      setGrid(generatedGrid);
      setWords(currentWords);
      setWordPlacements(placements);
    }, 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Modal Header Banner - New redesigned hero */}
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
          onClick={onClose}
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
            🧩
          </span>

          {/* Activity Title - Cormorant Garamond italic, NOT bold */}
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
            Try a word search
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

      <div className="flex-1 overflow-y-auto p-5" style={{ paddingTop: "20px" }}>
        <p
          className="mb-4"
          style={{
            fontSize: "14px",
            color: "var(--amber-text-muted)",
            fontFamily: "Lato, sans-serif",
          }}
        >
          Find these words in the grid by dragging across the letters:
        </p>

        {/* Words to find */}
        <div className="flex flex-wrap gap-2 mb-6">
          {words.map((word) => (
            <div
              key={word}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                backgroundColor: foundWords.includes(word)
                  ? "var(--amber-primary)"
                  : "#F2E8D8",
                color: foundWords.includes(word) ? "white" : "var(--amber-text-dark)",
                fontFamily: "Lato, sans-serif",
                fontSize: "13px",
              }}
            >
              {word}
              {foundWords.includes(word) && " ✓"}
            </div>
          ))}
        </div>

        {/* Word search grid */}
        <div
          key={puzzleKey}
          ref={gridRef}
          className="inline-block mx-auto"
          style={{
            touchAction: "none",
            userSelect: "none",
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((letter, colIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const isInCurrentPath = currentPath.some(
                  ({ row, col }) => row === rowIndex && col === colIndex
                );
                const isFound = foundCells.has(cellKey);

                return (
                  <div
                    key={cellKey}
                    data-row={rowIndex}
                    data-col={colIndex}
                    className="w-9 h-9 flex items-center justify-center border border-amber-200 cursor-pointer transition-colors"
                    style={{
                      userSelect: "none",
                      touchAction: "none",
                      backgroundColor: isFound
                        ? "#E8873A"
                        : isInCurrentPath && showInvalidFeedback
                        ? "#C45A3A"
                        : isInCurrentPath
                        ? "#F5C784"
                        : "var(--amber-background)",
                      color: isFound || isInCurrentPath ? "white" : "var(--amber-text-dark)",
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "16px",
                    }}
                    onPointerDown={(e) => handlePointerDown(e, rowIndex, colIndex)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Completion Card */}
        {completionTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 p-6 rounded-3xl"
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
              Well done! 🎯
            </p>
            <p
              className="text-center mb-6"
              style={{
                fontFamily: "Lato, sans-serif",
                fontSize: "14px",
                color: "var(--amber-text-muted)",
              }}
            >
              Completed in {formatTime(completionTime)}
            </p>

            <button
              onClick={handlePlayAnother}
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
              Play another →
            </button>
          </motion.div>
        )}

        {/* Progress Tracking */}
        {progressStats.gamesPlayed > 0 && (
          <div
            className="mt-8 p-5 rounded-2xl"
            style={{
              backgroundColor: "#FFFAF3",
              border: "1px solid #E8D0B0",
            }}
          >
            <h3
              className="mb-4"
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "20px",
                color: "#2C1A0E",
              }}
            >
              Your Progress
            </h3>

            <div className="space-y-2 mb-4">
              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "14px",
                  color: "var(--amber-text-muted)",
                }}
              >
                Games played this session: <strong>{progressStats.gamesPlayed}</strong>
              </p>
              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "14px",
                  color: "var(--amber-text-muted)",
                }}
              >
                Best time:{" "}
                <strong>
                  {progressStats.bestTimeSeconds !== Infinity
                    ? formatTime(progressStats.bestTimeSeconds)
                    : "—"}
                </strong>
              </p>
              <p
                style={{
                  fontFamily: "Lato, sans-serif",
                  fontSize: "14px",
                  color: "var(--amber-text-muted)",
                }}
              >
                Average time:{" "}
                <strong>
                  {progressStats.averageTimeSeconds > 0
                    ? formatTime(progressStats.averageTimeSeconds)
                    : "—"}
                </strong>
              </p>
            </div>

            {/* Sparkline Chart */}
            {progressStats.sessionHistory.length > 0 && (
              <div>
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "Lato, sans-serif",
                    fontSize: "12px",
                    color: "var(--amber-text-muted)",
                  }}
                >
                  Recent completion times:
                </p>
                <div className="flex items-end gap-1 h-16">
                  {progressStats.sessionHistory.map((session, idx) => {
                    const maxTime = Math.max(
                      ...progressStats.sessionHistory.map((s) => s.timeSeconds)
                    );
                    const height = (session.timeSeconds / maxTime) * 100;

                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-t"
                        style={{
                          height: `${height}%`,
                          minHeight: "8px",
                          backgroundColor: "#E8873A",
                          opacity: 0.5 + idx * 0.1,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
