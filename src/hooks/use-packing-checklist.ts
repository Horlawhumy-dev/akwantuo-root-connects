import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const STORAGE_KEY = "akwantuo-packing-checklist";

export function usePackingChecklist(categories: { category: string; items: string[] }[]) {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [tripDate, setTripDate] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from DB when user is logged in
  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("packing_checklists")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        const dbChecked = (data.checked_items as Record<string, boolean>) || {};
        // Merge: DB takes precedence, but also keep any localStorage items
        const localStored = (() => {
          try {
            const s = localStorage.getItem(STORAGE_KEY);
            return s ? JSON.parse(s) : {};
          } catch {
            return {};
          }
        })();
        const merged = { ...localStored, ...dbChecked };
        setChecked(merged);
        setReminderEnabled(data.reminder_enabled ?? false);
        setTripDate(data.trip_date ?? null);
      }
      setLoaded(true);
    })();
  }, [user]);

  // Persist to localStorage always
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  // Debounced save to DB
  const saveToDb = useCallback(
    (newChecked: Record<string, boolean>, newReminder?: boolean, newTripDate?: string | null) => {
      if (!user) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSyncing(true);
        try {
          const payload: any = {
            user_id: user.id,
            checked_items: newChecked,
            updated_at: new Date().toISOString(),
          };
          if (newReminder !== undefined) payload.reminder_enabled = newReminder;
          if (newTripDate !== undefined) payload.trip_date = newTripDate;

          const { data: existing } = await supabase
            .from("packing_checklists")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("packing_checklists")
              .update(payload)
              .eq("user_id", user.id);
          } else {
            await supabase
              .from("packing_checklists")
              .insert(payload);
          }
        } catch (e) {
          console.error("Failed to save checklist:", e);
        } finally {
          setSyncing(false);
        }
      }, 800);
    },
    [user]
  );

  const toggle = useCallback(
    (item: string) => {
      setChecked((prev) => {
        const next = { ...prev, [item]: !prev[item] };
        saveToDb(next);
        return next;
      });
    },
    [saveToDb]
  );

  const resetAll = useCallback(() => {
    setChecked({});
    saveToDb({});
  }, [saveToDb]);

  const updateReminder = useCallback(
    (enabled: boolean) => {
      setReminderEnabled(enabled);
      saveToDb(checked, enabled);
    },
    [checked, saveToDb]
  );

  const updateTripDate = useCallback(
    (date: string | null) => {
      setTripDate(date);
      saveToDb(checked, undefined, date);
    },
    [checked, saveToDb]
  );

  const getProgress = useCallback(
    (category: string) => {
      const cat = categories.find((c) => c.category === category);
      if (!cat) return { done: 0, total: 0 };
      const done = cat.items.filter((item) => checked[item]).length;
      return { done, total: cat.items.length };
    },
    [categories, checked]
  );

  const totalProgress = useCallback(() => {
    const all = categories.flatMap((c) => c.items);
    const done = all.filter((item) => checked[item]).length;
    return { done, total: all.length };
  }, [categories, checked]);

  return {
    checked,
    toggle,
    resetAll,
    getProgress,
    totalProgress,
    reminderEnabled,
    updateReminder,
    tripDate,
    updateTripDate,
    syncing,
    loaded,
    isLoggedIn: !!user,
  };
}
