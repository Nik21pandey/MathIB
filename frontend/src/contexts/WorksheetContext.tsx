import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// The worksheet "basket": question ids picked anywhere on the site, kept in this browser.

interface WorksheetState {
  ids: string[];
  title: string;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  addMany: (ids: string[]) => void;
  remove: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  clear: () => void;
  setTitle: (title: string) => void;
}

const KEY = 'genib.worksheet.v1';
const DEFAULT_TITLE = 'Practice worksheet';

const WorksheetContext = createContext<WorksheetState | null>(null);

function readStored(): { ids: string[]; title: string } {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.ids)) return { ids: parsed.ids, title: parsed.title || DEFAULT_TITLE };
    }
  } catch {
    // ignore unreadable storage
  }
  return { ids: [], title: DEFAULT_TITLE };
}

export const WorksheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ ids, title }, setData] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ids, title }));
    } catch {
      // storage unavailable: the worksheet lasts for this visit only
    }
  }, [ids, title]);

  const toggle = useCallback((id: string) => {
    setData((d) => ({ ...d, ids: d.ids.includes(id) ? d.ids.filter((x) => x !== id) : [...d.ids, id] }));
  }, []);
  const addMany = useCallback((more: string[]) => {
    setData((d) => ({ ...d, ids: [...d.ids, ...more.filter((x) => !d.ids.includes(x))] }));
  }, []);
  const remove = useCallback((id: string) => setData((d) => ({ ...d, ids: d.ids.filter((x) => x !== id) })), []);
  const move = useCallback((id: string, direction: -1 | 1) => {
    setData((d) => {
      const from = d.ids.indexOf(id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= d.ids.length) return d;
      const next = d.ids.slice();
      [next[from], next[to]] = [next[to], next[from]];
      return { ...d, ids: next };
    });
  }, []);
  const clear = useCallback(() => setData((d) => ({ ...d, ids: [] })), []);
  const setTitle = useCallback((t: string) => setData((d) => ({ ...d, title: t })), []);

  const value = useMemo<WorksheetState>(
    () => ({ ids, title, has: (id) => ids.includes(id), toggle, addMany, remove, move, clear, setTitle }),
    [ids, title, toggle, addMany, remove, move, clear, setTitle],
  );
  return <WorksheetContext.Provider value={value}>{children}</WorksheetContext.Provider>;
};

export function useWorksheet(): WorksheetState {
  const ctx = useContext(WorksheetContext);
  if (!ctx) throw new Error('useWorksheet must be used inside WorksheetProvider');
  return ctx;
}
