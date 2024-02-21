"use client";

import { LatLngBoundsExpression } from "leaflet";

export const onEachFeature = (feature: any, layer: any) => {
  if (feature.properties && feature.properties.value) {
    layer.bindPopup(`${feature.properties.name_geographicalname_spelling_spellingofname_text}<br />Väärtus: ${feature.properties.value.toString()}`);
  }
};

export const bounds: LatLngBoundsExpression = [
  [57.538569, 20.909516],
  [59.724195, 29.625813],
];