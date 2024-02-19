import StatisticalDataForm from "@/app/components/form";

import dynamic from "next/dynamic";
import { useState } from "react";

export default async function Home() {
  const formData = {
    spatialRegion: "",
  };

  const DynamicMap = dynamic(() => import("./components/Map"), {
    ssr: false,
  });

  return (
    <main className="flex p-24">
      {/* <StatisticalDataForm   /> */}
      <DynamicMap />
    </main>
  );
}
