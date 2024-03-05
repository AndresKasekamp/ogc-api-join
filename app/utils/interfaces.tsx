import { ReactNode } from "react";

export interface StylingProperties {
  fillColor: string;
  opacity: number;
  color: string;
  fillOpacity: number;
}

export interface MainStatVariables {
  code: string;
  text: number;
  valueTexts: Array<string>;
  values: Array<string>;
}

export interface RegionStatVariables {
  code: string;
  values: Array<string>;
}

export interface MapProps {
  countySSR: Array<string>;
  ovSSR: Array<string>;
}

export interface GeometriesProviderProps {
  children: ReactNode;
}

export interface GeometriesContextProps {
  renderedGeometries: any; // Change 'any' to the specific type you're using
  setRenderedGeometries: React.Dispatch<React.SetStateAction<any>>;
}

export interface BreaksProviderProps {
  children: ReactNode;
}

export interface BreaksContextProps {
  breaks: any; // Change 'any' to the specific type you're using
  setBreaks: React.Dispatch<React.SetStateAction<any>>;
}

export interface LegendProps {
  map: any;
  breaks: number[];
  getColor: any;
}
