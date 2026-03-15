import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "akwantuo-reading-prefs";

export type ReadingTheme = "light" | "sepia" | "dark";

interface ReadingPrefs {
  fontSize: number;
  theme: ReadingTheme;
}

const DEFAULT_PREFS: ReadingPrefs = { fontSize: 18, theme: "light" };

export function useReadingMode() {
  const [isReading, setIsReading] = useState(false);
  const [prefs, setPrefs] = useState<ReadingPrefs>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const updateProgress = useCallback(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const rect = el.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const total = el.scrollHeight - window.innerHeight;
    setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
  }, []);

  useEffect(() => {
    if (!isReading) return;
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, [isReading, updateProgress]);

  const setFontSize = useCallback((size: number) => {
    setPrefs((p) => ({ ...p, fontSize: Math.max(14, Math.min(28, size)) }));
  }, []);

  const setTheme = useCallback((theme: ReadingTheme) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const enterReading = useCallback(() => {
    setIsReading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const exitReading = useCallback(() => {
    setIsReading(false);
  }, []);

  return {
    isReading,
    enterReading,
    exitReading,
    fontSize: prefs.fontSize,
    theme: prefs.theme,
    setFontSize,
    setTheme,
    progress,
    contentRef,
  };
}
