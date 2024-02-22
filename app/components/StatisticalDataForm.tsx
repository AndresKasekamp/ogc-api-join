"use client";

// @ts-ignore
import GeoStats from "geostats";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import Loader from "./Loader";
import { useGeometries } from "../hooks/useGeometriesContext";
import DownloadLink from "./Download";

import {
  MainStatVariables,
  MapProps,
  GeometriesContextProps,
  BreaksContextProps,
} from "../utils/interfaces";

import { useBreaks } from "../hooks/useBreaksContext";
import { omavalitsusStatTables, maakondStatTables } from "../utils/statTables";
import Options from "../utils/options";
// FIXME bug on sama tabeli päring regiooniga, state ei muutu ja koodid jäävad samaks, aasta ka miskipärast

const StatisticalDataForm = ({ countySSR, ovSSR }: MapProps) => {
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

  const fileName = "your-geojson-data.geojson";

  const [regionCodeValues, setRegionCodeValues] =
    useState<MainStatVariables | null>(null);
  const spatialRegionValue = watch("spatialRegion", "");

  const { renderedGeometries, setRenderedGeometries }: GeometriesContextProps =
    useGeometries();

  const { setBreaks }: BreaksContextProps = useBreaks();

  const [submitClicked, setSubmitClicked] = useState(false);

  const tablesBasedOnRegion = () => {
    switch (spatialRegionValue) {
      case "Maakond":
        return (
          <div>
            <label
              htmlFor="regionTable"
              className="block mb-2 text-l leading-6 text-white"
            >
              Maakonna tabelid
            </label>
            <select
              {...register("regionTable", { required: true })}
              onChange={(e) => {
                getStatisticalData(e.target.value);
              }}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            >
              {maakondStatTables.map((tbl) => (
                <option key={tbl.id} value={tbl.id}>
                  {tbl.name}
                </option>
              ))}
            </select>
          </div>
        );
      case "Omavalitsus":
        return (
          <div>
            <label
              htmlFor="regionTable"
              className="block mb-2 text-l leading-6 text-white"
            >
              Omavalitsuse tabelid
            </label>
            <select
              {...register("regionTable", { required: true })}
              onChange={(e) => {
                getStatisticalData(e.target.value);
              }}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            >
              {omavalitsusStatTables.map((tbl) => (
                <option key={tbl.id} value={tbl.id}>
                  {tbl.name}
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
    classifier.getClassJenks(4);
    console.log("Classifier", classifier); // You can adjust the number of classes as needed
    setBreaks(classifier.bounds);
  };

  const onSubmit = async (data: any) => {
    setSubmitClicked(true);
    setRenderedGeometries(null);

    const allowedKeys = new Set([
      ...statisticalSetup.map(({ code }) => code),
      "spatialRegion",
      "regionTable",
    ]);
    const postForm = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (allowedKeys.has(key)) {
        console.log(key, value);
        // @ts-ignore
        postForm.append(key, value);
      }
    });

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
        console.error("Error here");
        toast.error(`Something went wrong`, {
          position: "top-center",
          duration: 5000,
        });
        setSubmitClicked(false);
      }
    } catch (err) {
      console.error("Error", err);
      toast.error(`Something went wrong`, {
        position: "top-center",
        duration: 5000,
      });
      setSubmitClicked(false);
    }
  };

  const getStatisticalData = async (data: string) => {
    setStatisticalSetup([]);
    setRegionCodeValues(null);
    if (data !== "") {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STAT_URL}/${data}`,
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const responseJson = await response.json();
          console.log(responseJson.variables);
          const filteredResponse = responseJson.variables.filter(
            (obj: MainStatVariables) =>
              obj.code !== "Maakond" &&
              obj.code !== "Elukoht" &&
              obj.code !== "Haldusüksus"
          );

          const regionFilter = responseJson.variables.find(
            (obj: MainStatVariables) =>
              obj.code === "Maakond" ||
              obj.code === "Elukoht" ||
              obj.code === "Haldusüksus"
          );

          const newRegionValues = [];
          if (spatialRegionValue === "Maakond") {
            for (let i = 0; i < regionFilter.valueTexts.length; i++) {
              if (
                countySSR.includes(regionFilter.valueTexts[i].toLowerCase())
              ) {
                newRegionValues.push(regionFilter.values[i]);
              }
            }
          } else if (spatialRegionValue === "Omavalitsus") {
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

          setStatisticalSetup(filteredResponse);
          setRegionCodeValues(regionFilter);
        } else {
          toast.error(`Something went wrong`, {
            position: "top-center",
            duration: 5000,
          });
        }
      } catch (err) {
        toast.error(`Something went wrong`, {
          position: "top-center",
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col px-10 w-screen max-w-xl mx-auto">
      <div>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
          OGC API - Joins
        </h2>
      </div>
      <Options />
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
              <hr />
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
        
        {renderedGeometries !== null && (
            <DownloadLink
              geojsonData={renderedGeometries}
              fileName={fileName}
            />
          )}
      </div>
      <Toaster />
    </div>
  );
};

export default StatisticalDataForm;
