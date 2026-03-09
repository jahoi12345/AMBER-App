import { useEffect, useMemo, useState } from "react";
import { playSound } from "../lib/soundUtils";
interface SudokuGameProps {
  onClose?: () => void;
  onMarkAsTried?: () => void;
}

type Difficulty = "easy" | "medium" | "hard";
type Board = number[][];

const SIZE = 9;
const BOX_SIZE = 3;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const BOARD_BACKGROUND = "#FFFAF3";
const INPUT_BACKGROUND = "#FFFAF3";

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => 0));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function isPlacementValid(board: Board, row: number, col: number, value: number): boolean {
  for (let index = 0; index < SIZE; index++) {
    if (index !== col && board[row][index] === value) return false;
    if (index !== row && board[index][col] === value) return false;
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;

  for (let r = startRow; r < startRow + BOX_SIZE; r++) {
    for (let c = startCol; c < startCol + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

function findNextEmptyCell(board: Board): [number, number] | null {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }

  return null;
}

function fillBoard(board: Board): boolean {
  const emptyCell = findNextEmptyCell(board);

  if (!emptyCell) {
    return true;
  }

  const [row, col] = emptyCell;

  for (const value of shuffle(DIGITS)) {
    if (!isPlacementValid(board, row, col, value)) continue;

    board[row][col] = value;

    if (fillBoard(board)) {
      return true;
    }

    board[row][col] = 0;
  }

  return false;
}

function generateSolvedBoard(): Board {
  const board = createEmptyBoard();
  fillBoard(board);
  return board;
}

function countSolutions(board: Board, limit = 2): number {
  const emptyCell = findNextEmptyCell(board);

  if (!emptyCell) {
    return 1;
  }

  const [row, col] = emptyCell;
  let solutions = 0;

  for (const value of DIGITS) {
    if (!isPlacementValid(board, row, col, value)) continue;

    board[row][col] = value;
    solutions += countSolutions(board, limit);
    board[row][col] = 0;

    if (solutions >= limit) {
      return solutions;
    }
  }

  return solutions;
}

function getTargetClues(difficulty: Difficulty): number {
  if (difficulty === "easy") return 40;
  if (difficulty === "medium") return 32;
  return 26;
}

function createPuzzleFromSolution(solution: Board, difficulty: Difficulty): Board {
  const puzzle = cloneBoard(solution);
  const cells = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, index) => [
      Math.floor(index / SIZE),
      index % SIZE,
    ] as [number, number]),
  );
  const targetClues = getTargetClues(difficulty);
  let cluesRemaining = SIZE * SIZE;

  for (const [row, col] of cells) {
    if (cluesRemaining <= targetClues) {
      break;
    }

    const previousValue = puzzle[row][col];
    puzzle[row][col] = 0;

    const solutionCount = countSolutions(cloneBoard(puzzle), 2);

    if (solutionCount !== 1) {
      puzzle[row][col] = previousValue;
      continue;
    }

    cluesRemaining -= 1;
  }

  return puzzle;
}

function generateGame(difficulty: Difficulty) {
  const solution = generateSolvedBoard();
  const puzzle = createPuzzleFromSolution(solution, difficulty);
  const board = cloneBoard(puzzle);
  const givens = puzzle.map((row) => row.map((value) => value !== 0));

  return { solution, puzzle, board, givens };
}

function isBoardComplete(board: Board): boolean {
  return board.every((row) => row.every((value) => value !== 0));
}

function isBoardSolved(board: Board): boolean {
  if (!isBoardComplete(board)) return false;

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col];
      if (value === 0 || !isPlacementValid(board, row, col, value)) {
        return false;
      }
    }
  }

  return true;
}

function getCellConflict(board: Board, row: number, col: number): boolean {
  const value = board[row][col];
  if (!value) return false;
  return !isPlacementValid(board, row, col, value);
}

export function SudokuGame({ onClose, onMarkAsTried }: SudokuGameProps = {}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameState, setGameState] = useState(() => generateGame("easy"));
  const [message, setMessage] = useState(
    "Fill every row, column, and 3×3 box with the numbers 1 through 9.",
  );
  const [hasMarkedAsTried, setHasMarkedAsTried] = useState(false);
  const [focusedCell, setFocusedCell] = useState<[number, number] | null>(null);

  const isSolved = useMemo(() => isBoardSolved(gameState.board), [gameState.board]);

  useEffect(() => {
    if (isSolved) {
      setMessage("Beautifully done. The puzzle is solved.");
      return;
    }

    if (isBoardComplete(gameState.board)) {
      setMessage("A few numbers still conflict. Adjust the highlighted cells.");
      return;
    }

    setMessage("Fill every row, column, and 3×3 box with the numbers 1 through 9.");
  }, [gameState.board, isSolved]);

  function reset(nextDifficulty: Difficulty) {
    playSound(nextDifficulty !== difficulty ? "navSelect" : "lightSwitch");
    setDifficulty(nextDifficulty);
    setGameState(generateGame(nextDifficulty));
    setMessage("Fill every row, column, and 3×3 box with the numbers 1 through 9.");
    setHasMarkedAsTried(false);
    setFocusedCell(null);
  }

  function updateCell(row: number, col: number, rawValue: string) {
    if (gameState.givens[row][col]) return;

    const cleanedValue = rawValue.replace(/[^1-9]/g, "").slice(-1);
    const nextValue = cleanedValue ? Number(cleanedValue) : 0;

    setGameState((current) => {
      const nextBoard = cloneBoard(current.board);
      nextBoard[row][col] = nextValue;
      return {
        ...current,
        board: nextBoard,
      };
    });
  }

  function handleMarkAsTried() {
    playSound("correctAnswer");
    setHasMarkedAsTried(true);
    onMarkAsTried?.();
  }

  return (
    <div className="flex justify-center items-center h-full" style={{ transform: "scale(0.9)" }}>
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div
          style={{
            background: BOARD_BACKGROUND,
            borderRadius: 24,
            padding: 20,
            boxShadow: "0 8px 24px rgba(160,80,20,0.1)",
          }}
        >
          <p
            style={{
              textAlign: "center",
              margin: "0 0 14px 0",
              color: "#7E624D",
              fontFamily: "Lato, sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => reset(level)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: difficulty === level ? "none" : "1px solid #E8873A",
                  background: difficulty === level ? "#E8873A" : "transparent",
                  color: difficulty === level ? "white" : "#E8873A",
                  fontFamily: "Lato, sans-serif",
                  textTransform: "capitalize",
                }}
              >
                {level}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(9, 1fr)",
              gap: 0,
              border: "3px solid #C4601A",
              borderRadius: 16,
              overflow: "hidden",
              background: BOARD_BACKGROUND,
            }}
          >
            {gameState.board.map((row, rowIndex) =>
              row.map((value, colIndex) => {
                const isGiven = gameState.givens[rowIndex][colIndex];
                const isFocused =
                  focusedCell?.[0] === rowIndex && focusedCell?.[1] === colIndex;
                const hasConflict = getCellConflict(gameState.board, rowIndex, colIndex);
                const sameRow = focusedCell?.[0] === rowIndex;
                const sameCol = focusedCell?.[1] === colIndex;
                const sameBox =
                  focusedCell !== null &&
                  Math.floor(focusedCell[0] / BOX_SIZE) ===
                    Math.floor(rowIndex / BOX_SIZE) &&
                  Math.floor(focusedCell[1] / BOX_SIZE) ===
                    Math.floor(colIndex / BOX_SIZE);

                let backgroundColor = INPUT_BACKGROUND;

                if (sameRow || sameCol || sameBox) {
                  backgroundColor = "#FFF3E5";
                }

                if (isFocused) {
                  backgroundColor = "#FBE7D0";
                }

                if (hasConflict) {
                  backgroundColor = "#FCE3DD";
                }

                return (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    inputMode="numeric"
                    pattern="[1-9]*"
                    maxLength={1}
                    value={value || ""}
                    readOnly={isGiven}
                    onFocus={() => setFocusedCell([rowIndex, colIndex])}
                    onBlur={() =>
                      setFocusedCell((current) => {
                        if (current?.[0] === rowIndex && current?.[1] === colIndex) {
                          return null;
                        }
                        return current;
                      })
                    }
                    onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" || event.key === "Delete") {
                        updateCell(rowIndex, colIndex, "");
                      }
                    }}
                    style={{
                      width: 44,
                      height: 44,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: isGiven ? 700 : 500,
                      fontFamily: "Lato, sans-serif",
                      color: isGiven ? "#2C1A0E" : "#7E624D",
                      borderTop:
                        rowIndex % 3 === 0 ? "2px solid #C4601A" : "1px solid #E8D0B0",
                      borderLeft:
                        colIndex % 3 === 0 ? "2px solid #C4601A" : "1px solid #E8D0B0",
                      borderRight:
                        colIndex === 8 ? "2px solid #C4601A" : "1px solid #E8D0B0",
                      borderBottom:
                        rowIndex === 8 ? "2px solid #C4601A" : "1px solid #E8D0B0",
                      backgroundColor,
                      outline: "none",
                      boxShadow: "none",
                      appearance: "textfield",
                      WebkitAppearance: "none",
                      borderRadius: 0,
                      padding: 0,
                    }}
                  />
                );
              }),
            )}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            <button
              onClick={() => reset(difficulty)}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                background: "#E8873A",
                color: "white",
                border: "none",
                fontFamily: "Lato, sans-serif",
              }}
            >
              New Puzzle
            </button>
          </div>

          <button
            onClick={handleMarkAsTried}
            disabled={hasMarkedAsTried}
            style={{
              width: "70%",
              minHeight: 52,
              marginTop: 14,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 999,
              border: hasMarkedAsTried ? "none" : "1px solid #E8873A",
              background: hasMarkedAsTried ? "#E8873A" : "transparent",
              color: hasMarkedAsTried ? "#FFFFFF" : "#E8873A",
              fontFamily: "Lato, sans-serif",
              fontSize: 16,
              fontWeight: 600,
              cursor: hasMarkedAsTried ? "default" : "pointer",
              display: "block",
            }}
          >
            {hasMarkedAsTried ? "✦ Added to your day" : "Mark as tried"}
          </button>
        </div>
      </div>
    </div>
  );
}