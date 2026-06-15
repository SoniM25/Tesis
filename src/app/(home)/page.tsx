import { IrradianceOverview } from "@/components/Charts/irradiance-chart";
import { TemperatureOverview } from "@/components/Charts/temperature-chart";
import { CloudCover } from "@/components/Charts/cloud-cover";
import { MexicoMap } from "@/components/Charts/mexico-map";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { PosicionSolOverview } from "@/components/Charts/posicion-sol/chart";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  // 🛠️ SOLUCCIÓN: Extraemos el timeFrame para el componente solar con un fallback seguro
  const solarTimeFrame =
    extractTimeFrame("posicion_sol")?.split(":")[1] || "monthly";

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <IrradianceOverview
          className="col-span-12 xl:col-span-7"
          key={extractTimeFrame("irradiance_overview")}
          timeFrame={
            (extractTimeFrame("irradiance_overview")?.split(":")[1] ||
              "monthly") as any
          }
        />

        {/* ✅ SOLUCCIÓN: Extraemos el timeFrame de temperatura usando tu extractor y se lo pasamos limpio */}
        <TemperatureOverview
          timeFrame={
            (extractTimeFrame("temperature_overview")?.split(":")[1] || "monthly") as any
          }
          className="col-span-12 xl:col-span-5"
        />

        <CloudCover
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame("cloud_cover")}
          timeFrame={
            (extractTimeFrame("cloud_cover")?.split(":")[1] || "monthly") as any
          }
        />

        <MexicoMap />

        {/* ☀️ Módulo de Ángulo Central de la Posición del Sol ocupando la fila inferior */}
        <div className="col-span-12">
          <PosicionSolOverview timeFrame={solarTimeFrame} />
        </div>
      </div>
    </>
  );
}
