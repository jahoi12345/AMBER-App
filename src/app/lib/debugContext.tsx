/**
 * Debug Context
 *
 * Provides a global debug state that allows switching between
 * persons and dates to see how the app reacts to data changes.
 */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  getPersons,
  getDatesForPerson,
  getSignalsForDate,
  getWeekSignals,
  getBaseline,
  getPersonById,
  type PersonInfo,
} from "./csvData";
import type { SignalSet } from "./timeTexture/types";

interface DebugState {
  /** Whether the debug overlay is visible */
  isOverlayOpen: boolean;
  setIsOverlayOpen: (open: boolean) => void;

  /** Currently selected person ID */
  selectedPersonId: string;
  setSelectedPersonId: (id: string) => void;

  /** Currently selected date (YYYY-MM-DD) */
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  /** All available persons */
  persons: PersonInfo[];

  /** All available dates for the selected person */
  availableDates: string[];

  /** Current person info */
  currentPerson: PersonInfo | null;

  /** Signals for the selected person + date */
  currentSignals: SignalSet | null;

  /** 14-day baseline for comparison */
  currentBaseline: SignalSet | null;

  /** Week of signals ending on the selected date */
  weekSignals: { date: string; signals: SignalSet }[];
}

const DebugContext = createContext<DebugState | null>(null);

export function DebugProvider({ children }: { children: ReactNode }) {
  const persons = useMemo(() => getPersons(), []);

  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState(
    persons[0]?.personId ?? "P001"
  );
  const [selectedDate, setSelectedDate] = useState("2024-06-15");

  const availableDates = useMemo(
    () => getDatesForPerson(selectedPersonId),
    [selectedPersonId]
  );

  const currentPerson = useMemo(
    () => getPersonById(selectedPersonId),
    [selectedPersonId]
  );

  const currentSignals = useMemo(
    () => getSignalsForDate(selectedPersonId, selectedDate),
    [selectedPersonId, selectedDate]
  );

  const currentBaseline = useMemo(
    () => getBaseline(selectedPersonId, selectedDate),
    [selectedPersonId, selectedDate]
  );

  const weekSignals = useMemo(
    () => getWeekSignals(selectedPersonId, selectedDate),
    [selectedPersonId, selectedDate]
  );

  const value: DebugState = {
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
    weekSignals,
  };

  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  );
}

export function useDebug(): DebugState {
  const ctx = useContext(DebugContext);
  if (!ctx) {
    throw new Error("useDebug must be used within a DebugProvider");
  }
  return ctx;
}
