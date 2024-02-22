"use client";

// @ts-ignore
import GeoStats from "geostats";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import Loader from "./Loader";
import { useGeometries } from "../hooks/useGeometriesContext";

import {
  MainStatVariables,
  MapProps,
  GeometriesContextProps,
  BreaksContextProps,
} from "../utils/interfaces";

import { useBreaks } from "../hooks/useBreaksContext";
import { maakondStatTables, omavalitsusStatTables } from "../utils/statTables";
import Options from "../utils/options";
// FIXME bug on sama tabeli päring regiooniga, state ei muutu ja koodid jäävad samaks, aasta ka miskipärast

const StatisticalFileJoinForm = ({ countySSR, ovSSR }: MapProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const { setRenderedGeometries }: GeometriesContextProps = useGeometries();

  const { setBreaks }: BreaksContextProps = useBreaks();

  const [submitClicked, setSubmitClicked] = useState(false);

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

    console.log("Clicked for filejoin")
  };

  return (
    <div className="flex flex-1 flex-col px-10 w-screen max-w-xl mx-auto">
      <div>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
          OGC API - Joins
        </h2>
      </div>
      <Options />
      <p className="mt-3 text-gray-500 dark:text-gray-400">
        TBA. Teenus võimaldab siduda statistilise andmefaili (ilmselt csv) ja Maa-ameti ruumiandmed. Kasutada saab maakondi, omavalitsusi ja asustusüksusi. Väljundiks on GeoJSON.
      </p>
      <div className="mt-8">
        <form
          className="flex flex-col gap-4 pb-5 px-2"
          onSubmit={handleSubmit(onSubmit)}
        >
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
      <Toaster />
    </div>
  );
};

export default StatisticalFileJoinForm;
