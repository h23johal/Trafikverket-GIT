import { createContext, useContext, useState } from 'react';
import type { TrafikverketResult } from '../type/trafikverket';
import type { PathInputs } from '../type/electron-api';

const defaultPaths: PathInputs = {
  testedPath: '',
  untestedPath: '',
  planPath: '',
};

type StatusDataContextType = {
  data: TrafikverketResult[] | null;
  reloadData: () => Promise<void>;
  paths: PathInputs;
  setPaths: (paths: PathInputs) => void;
};

const StatusDataContext = createContext<StatusDataContextType | undefined>(undefined);

export const StatusDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [paths, setPathsState] = useState<PathInputs>(() => {
    const cached = localStorage.getItem('cachedPaths');
    return cached ? JSON.parse(cached) : defaultPaths;
  });

  const [data, setData] = useState<TrafikverketResult[] | null>(null);

  const reloadData = async () => {
    const result = await window.electronAPI.getAllStatuses(paths);
    if ('error' in result) throw new Error(result.error);
    setData(result);
  };

  const setPaths = (newPaths: PathInputs) => {
    localStorage.setItem('cachedPaths', JSON.stringify(newPaths));
    setPathsState(newPaths);
  };

  return (
    <StatusDataContext.Provider value={{ data, reloadData, paths, setPaths }}>
      {children}
    </StatusDataContext.Provider>
  );
};

export const useStatusData = () => {
  const ctx = useContext(StatusDataContext);
  if (!ctx) throw new Error('useStatusData must be used inside StatusDataProvider');
  return ctx;
};
