import { IrradianceOverview } from "@/components/Charts/irradiance-chart";
import { TemperatureOverview } from "@/components/Charts/temperature-chart";
import { MexicoMap } from "@/components/Charts/mexico-map";
import { UsedDevices } from "@/components/Charts/used-devices";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Suspense } from "react";
import { ChatsCard } from "./_components/chats-card";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

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
            extractTimeFrame("irradiance_overview")?.split(":")[1] || "monthly"
          }
        />

        <TemperatureOverview
          key={extractTimeFrame("temperature_overview")}
          timeFrame={
            extractTimeFrame("temperature_overview")?.split(":")[1] || "monthly"
          }
          className="col-span-12 xl:col-span-5"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          key={extractTimeFrame("used_devices")}
          timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
        />

        <MexicoMap />

        <div className="col-span-12 grid xl:col-span-8">
          <Suspense fallback={<TopChannelsSkeleton />}>
            <TopChannels />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ChatsCard />
        </Suspense>
      </div>
    </>
  );
}
