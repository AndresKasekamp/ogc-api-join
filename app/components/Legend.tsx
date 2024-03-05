import { useEffect } from "react";
import L from "leaflet";

import { LegendProps } from "../utils/interfaces";

function Legend({ map, breaks, getColor }: LegendProps) {
  useEffect(() => {
    if (map) {
      // @ts-ignore
      const legend = L.control({ position: "bottomleft" });

      legend.onAdd = () => {
        const div = L.DomUtil.create(
          "div",
          "p-2  text-base leading-normal bg-white rounded-md text-left leading-3 text-gray-700"
        );
        div.innerHTML =
          "<h4 class='mb-5'>Legend</h4>" +
          "<ul class='list-none'>" +
          breaks
            .map(
              (breakValue: number, index: number) =>
                "<li class='mb-3' key='" +
                index +
                "'>" +
                "<span class='inline-block w-4 h-4 mr-2' style='background-color: " +
                getColor(breakValue) +
                ";'></span>" +
                breakValue +
                " - " +
                breaks[index + 1] +
                "</li>"
            )
            .join("") +
          "</ul>";
        return div;
      };

      legend.addTo(map);

      // Clean up the legend on component unmount (optional):
      return () => {
        if (legend) {
          legend.remove();
        }
      };
    }
  }, [breaks]);
  return null;
}

export default Legend;
