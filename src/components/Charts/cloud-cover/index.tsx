import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getCloudCoverData } from "@/services/nasa-power.service";
import { CloudChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function CloudCover({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = await getCloudCoverData(
    timeFrame as "hourly" | "daily" | "weekly" | "monthly" | "yearly",
  );

  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Nubosidad
        </h2>

        <PeriodPicker
          items={["daily", "weekly", "monthly", "yearly"]}
          defaultValue={timeFrame}
          sectionKey="cloud_cover"
        />
      </div>

      <div className="grid place-items-center">
        <CloudChart data={data} />
      </div>
    </div>
  );
}
