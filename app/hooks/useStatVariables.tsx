"use client";

import React, { useState, useEffect } from "react";

export const useStatVariables = (tblName: string) => {
  const [statisticalSetup, setStatisticalSetup] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `https://andmed.stat.ee/api/v1/et/stat/${tblName}`,
        {
          method: "GET",
        }
      );
      const responseJson = await response.json();
      setStatisticalSetup(responseJson.variables);
    };
    fetchData();
  }, [tblName]);
  return statisticalSetup;
};
