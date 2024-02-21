"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";

export interface GeometriesContextProps {
  renderedGeometries: any; // Change 'any' to the specific type you're using
  setRenderedGeometries: React.Dispatch<React.SetStateAction<any>>;
}

interface GeometriesProviderProps {
  children: ReactNode;
}

const GeometriesContext = createContext<GeometriesContextProps | undefined>(
  undefined
);

export const useGeometries = () => {
  const context = useContext(GeometriesContext);
  if (!context) {
    throw new Error("useGeometries must be used within a GeometriesProvider");
  }
  return context;
};

export const GeometriesProvider: React.FC<GeometriesProviderProps> = ({
  children,
}) => {
  const [renderedGeometries, setRenderedGeometries] = useState<any>(null);

  return (
    <GeometriesContext.Provider
      value={{ renderedGeometries, setRenderedGeometries }}
    >
      {children}
    </GeometriesContext.Provider>
  );
};
