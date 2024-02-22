import dynamic from "next/dynamic";
import { useRegionNames } from "@/app/hooks/useGeographicalNames";

export default async function Home() {
  const [countyNames, ovNames] = await useRegionNames();

  const DynamicStatisticalDataForm = dynamic(
    () => import("../../components/StatisticalFileJoinForm"),
    {
      ssr: false,
    }
  );

  return (
    <main>
      <DynamicStatisticalDataForm countySSR={countyNames} ovSSR={ovNames} />
    </main>
  );
}
