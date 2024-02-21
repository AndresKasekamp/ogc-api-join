import dynamic from "next/dynamic";
import { useRegionNames } from "@/app/hooks/useGeographicalNames";


export default async function Home() {
  const [countyNames, ovNames] = await useRegionNames();

  const DynamicStatisticalDataForm = dynamic(
    () => import("./components/StatisticalDataForm"),
    {
      ssr: false,
    }
  );

  return (
    <main className="flex w-1/4">
      <DynamicStatisticalDataForm countySSR={countyNames} ovSSR={ovNames} />
    </main>
  );
}
