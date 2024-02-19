"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useStatVariables } from "../hooks/useStatVariables";
import dynamic from "next/dynamic";

// TODO maakonnad on kõik võimalused, teised on üks võimalus ainult (et ei oleks liiga keeruline
// TODO api päring lahendada
// TODO loogiline klasterdamine osad tabelid lähemal, teised kaugemal
// TODO kaart paremal, vasakul on võimalused, w-full jne uurida
// TODO maakonnad peab ka sisse pärima
// TODO kas maakondade matchimine tuleb läbi tuple?
// TODO env lisada api lõpp-punktid
// TODO puhastamine vale req puhul

export default function StatisticalDataForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // const DynamicMap = dynamic(() => import("./Map"), {
  //   ssr: false,
  // });



  const [statisticalSetup, setStatisticalSetup] = useState<any[]>([]);
  const [countyCodeValues, setCountyCodeValues] = useState<string>("");

  const [renderedGeometries, setRenderedGeometries] = useState<any>(false);

  const onSubmit = async (data: any) => {
    const postForm = new FormData();

    const formKeys = Object.keys(data);

    console.log("Data", data.Vaatlusperiood);

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
      setRenderedGeometries(responseJson);
    }
  };

  const spatialRegionValue = watch("spatialRegion", "");

  const maakondStatTables = ["", "PA119", "RV032"];

  const getStatisticalData = async (data: string) => {
    const response = await fetch(
      `https://andmed.stat.ee/api/v1/et/stat/${data}`,
      {
        method: "GET",
      }
    );
    const responseJson = await response.json();
    console.log(responseJson.variables);
    const filteredResponse = responseJson.variables.filter(
      (obj: any) => obj.code !== "Maakond"
    );

    const countyFilter = responseJson.variables.find(
      (obj: any) => obj.code === "Maakond"
    );

    setCountyCodeValues(countyFilter.values.toString());
    setStatisticalSetup(filteredResponse);
  };

  return (
    <>
      {/* <DynamicMap geoJsonData={renderedGeometries}/> */}
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
    </>
  );
}
