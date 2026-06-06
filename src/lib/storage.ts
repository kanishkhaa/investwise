// Lightweight localStorage-backed reactive store for user progress.
import { useEffect, useState } from "react";

export type Profile = {
  name: string;
  goal: string;        // why invest
  horizon: string;     // time horizon
  risk: string;        // risk tolerance
  amount: string;      // monthly capacity
  experience: string;
  onboarded: boolean;
};

export type ProgressState = {
  profile: Profile | null;
  xp: number;
  streak: number;
  lastActive: string | null;
  modulesDone: string[];
  badges: string[];
  quizBest: number;
  readinessScore: number;
  tourCompleted: boolean;
  portfolio: { cash: number; positions: Record<string, { qty: number; avg: number }>; history: { t: number; total: number }[] };
};

const KEY = "investo:v1";

const DEFAULT: ProgressState = {
  profile: null,
  xp: 0,
  streak: 0,
  lastActive: null,
  modulesDone: [],
  badges: [],
  quizBest: 0,
  readinessScore: 0,
  tourCompleted: false,
  portfolio: { cash: 100000, positions: {}, history: [] },
};

const listeners = new Set<() => void>();
let cache: ProgressState | null = null;

function read(): ProgressState {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch { cache = DEFAULT; }
  return cache!;
}

function write(next: ProgressState) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useProgress() {
  const [, set] = useState(0);
  useEffect(() => {
    const l = () => set((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return read();
}

export function updateProgress(fn: (p: ProgressState) => ProgressState) {
  write(fn(read()));
}

export function bumpStreak() {
  updateProgress((p) => {
    const today = new Date().toDateString();
    if (p.lastActive === today) return p;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const streak = p.lastActive === yesterday ? p.streak + 1 : 1;
    return { ...p, streak, lastActive: today };
  });
}

export function addXP(amount: number) {
  updateProgress((p) => ({ ...p, xp: p.xp + amount }));
}

export function awardBadge(badge: string) {
  updateProgress((p) => (p.badges.includes(badge) ? p : { ...p, badges: [...p.badges, badge] }));
}

export function completeModule(id: string, xp = 50) {
  updateProgress((p) => {
    if (p.modulesDone.includes(id)) return p;
    return { ...p, modulesDone: [...p.modulesDone, id], xp: p.xp + xp };
  });
}
