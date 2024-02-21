import dynamic from "next/dynamic";
import { useRegionNames } from "@/app/hooks/useGeographicalNames";
import { GeometriesProvider } from "./hooks/useGeometriesContext";
export default async function Home() {
  const [countyNames, ovNames] = await useRegionNames();

  const DynamicMap = dynamic(() => import("./components/Map"), {
    ssr: false,
  });

  return (
    <main className="flex p-24">
      <GeometriesProvider>
        <DynamicMap countySSR={countyNames} ovSSR={ovNames} />
      </GeometriesProvider>
    </main>
  );
}
