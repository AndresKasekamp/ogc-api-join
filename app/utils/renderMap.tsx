"use client";


import { useState } from "react";

export const onEachFeature = (feature: any, layer: any) => {
  if (feature.properties && feature.properties.value) {
    layer.bindPopup(feature.properties.value.toString());
    //layer.bindTooltip(feature.properties.Maakond, { permanent: true, direction: 'center' }); // Use "name" property as the label
  }
};





