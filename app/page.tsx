import Image from "next/image";
import StatisticalDataForm from "@/app/components/form";


export default async function Home() {

  const formData = {
    spatialRegion: "",
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <StatisticalDataForm />
    </main>
  );
}
