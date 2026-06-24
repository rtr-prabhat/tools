'use client';

import { createContext, useContext, useState } from 'react';

const ToolStateContext = createContext(null);

export function ToolStateProvider({ children }) {
  const [state, setState] = useState({});

  const updateState = (key, value) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolStateContext.Provider value={{ state, updateState }}>
      {children}
    </ToolStateContext.Provider>
  );
}

export function useToolState() {
  const ctx = useContext(ToolStateContext);
  if (!ctx) return { state: {}, updateState: () => {} };
  return ctx;
}
