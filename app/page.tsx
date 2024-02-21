import dynamic from "next/dynamic";
import { useRegionNames } from "@/app/hooks/useGeographicalNames";
import { GeometriesProvider } from "./hooks/useGeometriesContext";
import { BreaksProvider } from "./hooks/useBreaksContext";
import StatisticalDataForm from "./components/StatisticalDataForm";

export default async function Home() {
  const [countyNames, ovNames] = await useRegionNames();

  // Dynamically loading leaflet map workaround and getting reducing jenk from stat form
  const DynamicMap = dynamic(() => import("./components/Map"), {
    ssr: false,
  });

  const DynamicStatisticalDataForm = dynamic(() => import("./components/StatisticalDataForm"), {
    ssr: false,
  });

  return (
    <main className="flex p-24">
      <GeometriesProvider>
        <BreaksProvider>
          {/* <StatisticalDataForm countySSR={countyNames} ovSSR={ovNames} /> */}
          <DynamicStatisticalDataForm countySSR={countyNames} ovSSR={ovNames} />
          <DynamicMap />
        </BreaksProvider>
      </GeometriesProvider>
    </main>
  );
}
