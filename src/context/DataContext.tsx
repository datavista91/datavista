import { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextProps {
  data: any[];
  setData: (data: any[]) => void;
  hasData: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<any[]>([]);

  const value = {
    data,
    setData,
    hasData: data.length > 0,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
