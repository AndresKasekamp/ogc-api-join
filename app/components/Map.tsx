"use client";

// @ts-ignore
import GeoStats from "geostats";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { onEachFeature } from "../utils/renderMap";
import L from "leaflet";
import { useLeafletContext } from "@react-leaflet/core";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import Loader from "./Loader";

interface MainStatVariables {
  code: string;
  text: number;
  valueTexts: Array<string>;
  values: Array<string>;
}

interface MapProps {
  countySSR: Array<string>;
  ovSSR: Array<string>;
}

// TODO countytables -> tableName
// TODO päringu ebaõnnestumine kommunikeerida

const Map = ({ countySSR, ovSSR }: MapProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const [statisticalSetup, setStatisticalSetup] = useState<MainStatVariables[]>(
    []
  );

  const [regionCodeValues, setRegionCodeValues] =
    useState<MainStatVariables | null>(null);
  const spatialRegionValue = watch("spatialRegion", "");
  const [renderedGeometries, setRenderedGeometries] = useState<any>(false);
  const [breaks, setBreaks] = useState<number[]>([]);

  const [submitClicked, setSubmitClicked] = useState(false);

  // TODO see migreeruda
  const bounds: LatLngBoundsExpression = [
    [57.538569, 20.909516],
    [59.724195, 29.625813],
  ];

  const maakondStatTables = ["", "PA119", "RV032", "RV0282U"];
  const omavalitsusStatTables = ["", "RV0282U"];

  const tablesBasedOnRegion = () => {
    switch (spatialRegionValue) {
      case "Maakond":
        return (
          <div>
            <label
              htmlFor="countyTables"
              className="block mb-2 text-l leading-6 text-white"
            >
              Maakonna tabelid
            </label>
            <select
              {...register("countyTables", { required: true })}
              onChange={(e) => {
                getStatisticalData(e.target.value);
              }}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            >
              {maakondStatTables.map((tbl) => (
                <option key={tbl} value={tbl}>
                  {tbl}
                </option>
              ))}
            </select>
          </div>
        );
      case "Omavalitsus":
        return (
          <div>
            <label
              htmlFor="countyTables"
              className="block mb-2 text-l leading-6 text-white"
            >
              Omavalitsuse tabelid
            </label>
            <select
              {...register("countyTables", { required: true })}
              onChange={(e) => {
                getStatisticalData(e.target.value);
              }}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            >
              {omavalitsusStatTables.map((tbl) => (
                <option key={tbl} value={tbl}>
                  {tbl}
                </option>
              ))}
            </select>
          </div>
        );
    }
  };

  const classifyValues = (data: any) => {
    const values = data.features.map(
      (feature: any) => feature.properties.value
    );
    const classifier = new GeoStats(values);
    classifier.getClassJenks(5);
    console.log("Classifier", classifier); // You can adjust the number of classes as needed
    setBreaks(classifier.bounds);
  };

  const getStyle = (feature: any) => {
    const value = feature.properties.value;
    const fillColor = getColor(value);
    return {
      fillColor,
      opacity: 1,
      color: "white",
      fillOpacity: 0.7,
    };
  };

  const getColor = (value: any) => {
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

  const onSubmit = async (data: any) => {
    setSubmitClicked(true);
    setRenderedGeometries(false);
    const allowedKeys = new Set([
      ...statisticalSetup.map(({ code }) => code),
      "spatialRegion",
      "countyTables",
    ]);
    const postForm = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (allowedKeys.has(key)) {
        // @ts-ignore
        postForm.append(key, value);
      }
    });

    // postForm.append("Maakond", regionCodeValues);
    if (regionCodeValues !== null) {
      postForm.append(
        regionCodeValues.code,
        regionCodeValues.values.toString()
      );
    }

    try {
      const response = await fetch("http://localhost:5000/join", {
        method: "POST",
        body: postForm,
      });

      if (response.ok) {
        const responseJson = await response.json();

        classifyValues(responseJson);
        setRenderedGeometries(responseJson);
        setSubmitClicked(false);
      } else {
        console.error("Server error!");
        setSubmitClicked(false);
      }
    } catch (err) {
      console.error("Server error!", err);
      setSubmitClicked(false);
    }
  };

  const getStatisticalData = async (data: string) => {
    if (data !== "") {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STAT_URL}/${data}`,
        {
          method: "GET",
        }
      );
      const responseJson = await response.json();
      console.log(responseJson.variables);
      const filteredResponse = responseJson.variables.filter(
        (obj: MainStatVariables) =>
          obj.code !== "Maakond" && obj.code !== "Elukoht"
      );

      const regionFilter = responseJson.variables.find(
        (obj: MainStatVariables) =>
          obj.code === "Maakond" || obj.code === "Elukoht"
      );

      const newRegionValues = [];
      if (spatialRegionValue === "Maakond") {
        for (let i = 0; i < regionFilter.valueTexts.length; i++) {
          if (countySSR.includes(regionFilter.valueTexts[i].toLowerCase())) {
            newRegionValues.push(regionFilter.values[i]);
          }
        }
      } else if (spatialRegionValue === "Omavalitsus") {
        console.log("OVSSR", ovSSR);
        for (let i = 0; i < regionFilter.valueTexts.length; i++) {
          if (
            ovSSR.includes(
              regionFilter.valueTexts[i].toLowerCase().replace(/^\.+/, "")
            )
          ) {
            newRegionValues.push(regionFilter.values[i]);
          }
        }
      }

      regionFilter.values = newRegionValues;
      console.log("New region values", regionFilter);

      setStatisticalSetup(filteredResponse);
      setRegionCodeValues(regionFilter);
    } else {
      setStatisticalSetup([]);
      setRegionCodeValues(null);
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col px-24">
        <div>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
            OGC API - Joins
          </h2>
        </div>
        <div className="mt-10">
          <form
            className="flex flex-col gap-4 pb-5 px-2"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <label
                htmlFor="spatialRegion"
                className="block mb-2 text-l leading-6 text-white"
              >
                Regioon
              </label>
              <select
                {...register("spatialRegion", { required: true })}
                defaultValue=""
                // onChange={(e) => {console.log(e.target.value)}}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              >
                <option key="" value=""></option>
                <option key="Maakond" value="Maakond">
                  Maakond
                </option>
                <option key="Omavalitsus" value="Omavalitsus">
                  Omavalitsus
                </option>
              </select>
            </div>

            {tablesBasedOnRegion()}

            {statisticalSetup.length > 0 && spatialRegionValue !== "" && (
              <>
                {statisticalSetup.map((variable) => (
                  <div key={variable.code}>
                    <label
                      htmlFor={variable.code}
                      className="block mb-2 text-l leading-6 text-white"
                    >
                      {variable.text}
                    </label>
                    <select
                      {...register(variable.code, { required: false })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    >
                      {variable.values.map((element: string, idx: number) => (
                        <option key={element} value={element}>
                          {variable.valueTexts[idx]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}

            <div>
              {submitClicked === false ? (
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Genereeri kaart
                </button>
              ) : (
                <Loader />
              )}
            </div>
          </form>
        </div>
      </div>

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
