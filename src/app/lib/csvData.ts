/**
 * CSV Data Parser for Amber Time Texture Dataset
 *
 * Imports the raw CSV and parses it into typed data structures
 * for use across the app, especially the debug overlay.
 */

import csvRaw from "../../imports/amber_time_texture_elderly_dataset_with_names_plus_5_emergency_cases.csv?raw";
import type { SignalSet } from "./timeTexture/types";

export interface PersonRecord {
  personId: string;
  name: string;
  age: number;
  profile: string;
  date: string; // YYYY-MM-DD
  signals: SignalSet;
}

export interface PersonInfo {
  personId: string;
  name: string;
  age: number;
  profile: string;
}

/** All parsed rows from the CSV */
let _allRecords: PersonRecord[] | null = null;

function parseCSV(): PersonRecord[] {
  if (_allRecords) return _allRecords;

  const lines = csvRaw.trim().split("\n");
  // Skip header row
  const records: PersonRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(",");
    if (cols.length < 13) continue;

    records.push({
      personId: cols[0],
      name: cols[1],
      age: parseInt(cols[2], 10),
      profile: cols[3],
      date: cols[4],
      signals: {
        steps: parseInt(cols[5], 10) || 0,
        heartRateActivity: parseInt(cols[6], 10) || 0,
        timeOutside: parseInt(cols[7], 10) || 0,
        gamesPlayed: parseInt(cols[8], 10) || 0,
        newActivities: parseInt(cols[9], 10) || 0,
        messagesSent: parseInt(cols[10], 10) || 0,
        inPersonInteractions: parseInt(cols[11], 10) || 0,
        reflections: parseInt(cols[12], 10) || 0,
      },
    });
  }

  _allRecords = records;
  return records;
}

/** Get all records */
export function getAllRecords(): PersonRecord[] {
  return parseCSV();
}

/** Get unique persons from the dataset */
export function getPersons(): PersonInfo[] {
  const records = parseCSV();
  const seen = new Map<string, PersonInfo>();

  for (const r of records) {
    if (!seen.has(r.personId)) {
      seen.set(r.personId, {
        personId: r.personId,
        name: r.name,
        age: r.age,
        profile: r.profile,
      });
    }
  }

  return Array.from(seen.values());
}

/** Get all available dates for a given person */
export function getDatesForPerson(personId: string): string[] {
  const records = parseCSV();
  return records
    .filter((r) => r.personId === personId)
    .map((r) => r.date);
}

/** Get signals for a specific person on a specific date */
export function getSignalsForDate(
  personId: string,
  date: string
): SignalSet | null {
  const records = parseCSV();
  const record = records.find(
    (r) => r.personId === personId && r.date === date
  );
  return record ? record.signals : null;
}

/** Get a week of signal data ending on the given date (inclusive) */
export function getWeekSignals(
  personId: string,
  endDate: string
): { date: string; signals: SignalSet }[] {
  const records = parseCSV();
  const personRecords = records.filter((r) => r.personId === personId);

  // Find the index of the end date
  const endIdx = personRecords.findIndex((r) => r.date === endDate);
  if (endIdx === -1) return [];

  // Get up to 7 days ending at endDate
  const startIdx = Math.max(0, endIdx - 6);
  return personRecords.slice(startIdx, endIdx + 1).map((r) => ({
    date: r.date,
    signals: r.signals,
  }));
}

/** Compute the 14-day baseline for a person up to (but not including) the given date */
export function getBaseline(
  personId: string,
  date: string
): SignalSet | null {
  const records = parseCSV();
  const personRecords = records.filter((r) => r.personId === personId);
  const dateIdx = personRecords.findIndex((r) => r.date === date);

  if (dateIdx < 1) return null;

  // Use up to 14 previous days
  const startIdx = Math.max(0, dateIdx - 14);
  const window = personRecords.slice(startIdx, dateIdx);

  if (window.length === 0) return null;

  const sum: SignalSet = {
    steps: 0,
    heartRateActivity: 0,
    timeOutside: 0,
    gamesPlayed: 0,
    newActivities: 0,
    messagesSent: 0,
    inPersonInteractions: 0,
    reflections: 0,
  };

  for (const r of window) {
    sum.steps += r.signals.steps;
    sum.heartRateActivity += r.signals.heartRateActivity;
    sum.timeOutside += r.signals.timeOutside;
    sum.gamesPlayed += r.signals.gamesPlayed;
    sum.newActivities += r.signals.newActivities;
    sum.messagesSent += r.signals.messagesSent;
    sum.inPersonInteractions += r.signals.inPersonInteractions;
    sum.reflections += r.signals.reflections;
  }

  const n = window.length;
  return {
    steps: Math.round(sum.steps / n),
    heartRateActivity: Math.round(sum.heartRateActivity / n),
    timeOutside: Math.round(sum.timeOutside / n),
    gamesPlayed: +(sum.gamesPlayed / n).toFixed(2),
    newActivities: +(sum.newActivities / n).toFixed(2),
    messagesSent: +(sum.messagesSent / n).toFixed(2),
    inPersonInteractions: +(sum.inPersonInteractions / n).toFixed(2),
    reflections: +(sum.reflections / n).toFixed(2),
  };
}

/** Get person info by ID */
export function getPersonById(personId: string): PersonInfo | null {
  const persons = getPersons();
  return persons.find((p) => p.personId === personId) ?? null;
}
