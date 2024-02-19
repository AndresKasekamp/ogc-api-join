"use client";

import GeoStats from "geostats";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { onEachFeature } from "../utils/renderMap";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";

interface MainStatVariables {
  code: string;
  text: number;
  valueTexts: Array<string>;
  values: Array<string>;
}

// TODO loading spinner üle tuua
const Map = () => {
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
  const [countyCodeValues, setCountyCodeValues] = useState<string>("");
  const spatialRegionValue = watch("spatialRegion", "");
  const [renderedGeometries, setRenderedGeometries] = useState<any>(false);
  const [breaks, setBreaks] = useState<number[]>([]);

  const maakondStatTables = ["", "PA119", "RV032"];

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

  // TODO formi resettimien on lappes praegu
  const onSubmit = async (data: any) => {
    const postForm = new FormData();

    const formKeys = Object.keys(data);

    // Iterating unknown variables to list
    formKeys.forEach((element) => {
      postForm.append(element, data[element]);
    });

    postForm.append("Maakond", countyCodeValues);

    const response = await fetch("http://localhost:5000/join", {
      method: "POST",
      body: postForm,
    });

    if (response.ok) {
      const responseJson = await response.json();
      console.log("Geometreis to render", responseJson);
      classifyValues(responseJson);
      setRenderedGeometries(responseJson);
    }
  };

  const getStatisticalData = async (data: string) => {
    if (data !== "") {
      const response = await fetch(
        `https://andmed.stat.ee/api/v1/et/stat/${data}`,
        {
          method: "GET",
        }
      );
      const responseJson = await response.json();
      console.log(responseJson.variables);
      const filteredResponse = responseJson.variables.filter(
        (obj: MainStatVariables) => obj.code !== "Maakond"
      );

      const countyFilter = responseJson.variables.find(
        (obj: MainStatVariables) => obj.code === "Maakond"
      );

      setStatisticalSetup(filteredResponse);
      setCountyCodeValues(countyFilter.values.toString());
    } else {
      setStatisticalSetup([]);
      setCountyCodeValues("");
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col p-24">
        <div>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
            OGC API - Joins
          </h2>
        </div>
        <div className="mt-10">
          <form
            className="flex flex-col gap-7 pb-5 px-2"
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

            {spatialRegionValue === "Maakond" && (
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
            )}

            {statisticalSetup.length > 0 && (
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
                      {...register(variable.code, { required: true })}
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
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Genereeri kaart
              </button>
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
        zoom={8}
        scrollWheelZoom={true}
        minZoom={8}
        maxZoom={12}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
