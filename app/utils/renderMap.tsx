"use client";

import { useState } from "react";
import L from "leaflet";

export const onEachFeature = (feature: any, layer: any) => {
  if (feature.properties && feature.properties.value) {
    // console.log(feature.properties.Maakond, feature.geometry)
    // const centerCoordinates = calculateMultiPolygonCenter(feature.geometry);
    // console.log("Center coordinates", centerCoordinates)
    layer.bindPopup(feature.properties.value.toString());
    // layer
    //   .bindTooltip(feature.properties.value.toString(), centerCoordinates, {
    //     permanent: true,
    //     direction: "center",
    //   });
  }
};

const calculateMultiPolygonCenter = (multiPolygon: any) => {
  // // Ensure the input is a MultiPolygon
  // if (multiPolygon.type !== 'MultiPolygon' || !multiPolygon.coordinates) {
  //   throw new Error('Invalid MultiPolygon geometry');
  // }

  let totalVertices = 0;
  let sumLng = 0;
  let sumLat = 0;

  // Iterate through the polygons and their vertices
  multiPolygon.coordinates.forEach((polygon: any) => {
    polygon.forEach((ring: any) => {
      ring.forEach((point: any) => {
        sumLng += point[0];
        sumLat += point[1];
        totalVertices++;
      });
    });
  });

  // Calculate the average coordinates
  const centerLng = sumLng / totalVertices;
  const centerLat = sumLat / totalVertices;
  try {
    return L.latLng(centerLng, centerLat)
  } catch(err) {
    return undefined
  }
  
  //return [centerLng, centerLat];
};
