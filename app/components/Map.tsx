"use client";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { useState } from "react";

interface MapProps {
    geoJsonData: any;
  }

const Map: React.FC<MapProps> = ({geoJsonData}) => {
  console.log("GJ", geoJsonData);

  return (
    <>
      <MapContainer
        style={{
          height: "75vh",
          width: "65vw",
        }}
        center={[58.86, 25.56]}
        zoom={8}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData !== false && (
          <GeoJSON data={geoJsonData} />
        )}
      </MapContainer>
    </>
  );
};

export default Map;
