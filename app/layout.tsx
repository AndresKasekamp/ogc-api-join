import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { useRegionNames } from "@/app/hooks/useGeographicalNames";
import { GeometriesProvider } from "./hooks/useGeometriesContext";
import { BreaksProvider } from "./hooks/useBreaksContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OGC API - Joins",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const DynamicMap = dynamic(() => import("./components/Map"), {
    ssr: false,
  });

  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex p-24">
          <GeometriesProvider>
            <BreaksProvider>
              {children}
              <DynamicMap />
            </BreaksProvider>
          </GeometriesProvider>
        </main>
      </body>
    </html>
  );
}
