import dynamic from "next/dynamic";
import { useRegionNames } from "@/app/hooks/useGeographicalNames";
import { GeometriesProvider } from "./hooks/useGeometriesContext";
import { BreaksProvider } from "./hooks/useBreaksContext";
import StatisticalDataForm from "./components/StatisticalDataForm";

export default async function Home() {
  const [countyNames, ovNames] = await useRegionNames();

  const DynamicMap = dynamic(() => import("./components/Map"), {
    ssr: false,
  });

  return (
    <main className="flex p-24">
      <GeometriesProvider>
        <BreaksProvider>
          <StatisticalDataForm countySSR={countyNames} ovSSR={ovNames} />
          <DynamicMap />
        </BreaksProvider>
      </GeometriesProvider>
    </main>
  );
}
