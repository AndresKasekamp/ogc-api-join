"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";

import { BreaksProviderProps, BreaksContextProps } from "../utils/interfaces";

const BreaksContext = createContext<BreaksContextProps | undefined>(undefined);

export const useBreaks = () => {
  const context = useContext(BreaksContext);
  if (!context) {
    throw new Error("useBreaks must be used within a BreaksProvider");
  }
  return context;
};

export const BreaksProvider: React.FC<BreaksProviderProps> = ({ children }) => {
  const [breaks, setBreaks] = useState<any>(false);

  return (
    <BreaksContext.Provider value={{ breaks, setBreaks }}>
      {children}
    </BreaksContext.Provider>
  );
};
