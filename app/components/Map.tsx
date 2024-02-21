"use client";

import React from "react";

import { onEachFeature, bounds } from "../utils/renderMap";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

import {
  useGeometries,
  GeometriesContextProps,
} from "../hooks/useGeometriesContext";

import { useBreaks, BreaksContextProps } from "../hooks/useBreaksContext";


interface StylingProperties {
  fillColor: string;
  opacity: number;
  color: string;
  fillOpacity: number;
}

// FIXME bug on sama tabeli päring regiooniga, state ei muutu ja koodid jäävad samaks, aasta ka miskipärast
// TODO päringu ebaõnnestumine kommunikeerida
// TODO kas rendered geometries deafult võiks olla null?

const Map = () => {
  const { renderedGeometries }: GeometriesContextProps = useGeometries();

  const { breaks }: BreaksContextProps = useBreaks();

  const getStyle = (feature: any): StylingProperties => {
    const value = feature.properties.value;
    const fillColor = getColor(value);
    return {
      fillColor,
      opacity: 1,
      color: "white",
      fillOpacity: 0.7,
    };
  };

  const getColor = (value: string): string => {
    for (let i = 0; i < breaks.length - 1; i++) {
      if (value >= breaks[i] && value <= breaks[i + 1]) {
        return [
          "#FED976",
          "#FEB24C",
          "#FD8D3C",
          "#FC4E2A",
          "#E31A1C",
          "#BD0026",
        ][i];
      }
    }
    return "#fff";
  };

  return (
    <>
      <MapContainer
        style={{
          height: "75vh",
          width: "65vw",
        }}
        center={[58.86, 25.56]}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={0.9}
        zoom={8}
        scrollWheelZoom={true}
        minZoom={8}
        maxZoom={12}
      >
        <TileLayer
          attribution="&copy; Maa-amet 2024"
          url="https://tiles.maaamet.ee/tm/wmts/1.0.0/hallkaart/default/{TileMatrixSet}/{z}/{y}/{x}.png"
          // @ts-ignore
          TileMatrixSet="GMC"
        />

        {renderedGeometries !== false && (
          <>
            <GeoJSON
              data={renderedGeometries}
              onEachFeature={onEachFeature}
              style={getStyle}
            />
          </>
        )}
      </MapContainer>
    </>
  );
};

export default Map;
