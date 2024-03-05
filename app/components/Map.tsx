"use client";

import React, { useRef } from "react";

import { onEachFeature, bounds } from "../utils/renderMap";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import {
  StylingProperties,
  GeometriesContextProps,
  BreaksContextProps,
} from "../utils/interfaces";
import { useGeometries } from "../hooks/useGeometriesContext";

import Legend from "./Legend";

import { useBreaks } from "../hooks/useBreaksContext";

// TODO null väärtusega omavalitsused on praegue buggised

const Map = () => {
  const { renderedGeometries }: GeometriesContextProps = useGeometries();

  // Get the map instance using useRef:
  const mapRef = useRef(null);

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

  const getColor = (value: string | number | null): string => {
    if (value === null) {
      return "#fff";
    }
    const stringValue = value.toString();
    for (let i = 0; i < breaks.length - 1; i++) {
      if (stringValue >= breaks[i] && stringValue <= breaks[i + 1]) {
        return ["#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026"][i];
      }
    }
    return "#fff";
  };

  return (
    <>
      <MapContainer
        style={{
          height: "90vh",
          width: "75vw",
        }}
        center={[58.86, 25.56]}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={0.9}
        zoom={8}
        scrollWheelZoom={true}
        minZoom={8}
        maxZoom={12}
        ref={mapRef}
      >
        <TileLayer
          attribution="&copy; Maa-amet 2024"
          url="https://tiles.maaamet.ee/tm/wmts/1.0.0/hallkaart/default/{TileMatrixSet}/{z}/{y}/{x}.png"
          // @ts-ignore
          TileMatrixSet="GMC"
        />

        {renderedGeometries !== null && (
          <>
            <GeoJSON
              data={renderedGeometries}
              onEachFeature={onEachFeature}
              style={getStyle}
            />
            <Legend map={mapRef.current} breaks={breaks} getColor={getColor} />
          </>
        )}
      </MapContainer>
    </>
  );
};

export default Map;
