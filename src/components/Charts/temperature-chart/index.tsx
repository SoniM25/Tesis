import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getTemperatureData } from "@/services/nasa-power.service";
import { TemperatureChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function TemperatureOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = await getTemperatureData(
    timeFrame as "hourly" | "daily" | "weekly" | "monthly" | "yearly",
  );

  const avgTemp =
    data.average.length > 0
      ? (
          data.average.reduce((acc, { y }) => acc + y, 0) / data.average.length
        ).toFixed(1)
      : "0.0";

  const maxTemp =
    data.max.length > 0
      ? Math.max(...data.max.map(({ y }) => y)).toFixed(1)
      : "0.0";

  const minTemp =
    data.min.length > 0
      ? Math.min(...data.min.map(({ y }) => y)).toFixed(1)
      : "0.0";

  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Temperatura
        </h2>

        <PeriodPicker
          items={["hourly", "daily", "weekly", "monthly", "yearly"]}
          defaultValue={timeFrame || "monthly"}
          sectionKey="temperature_overview"
        />
      </div>

      <TemperatureChart data={data} timeFrame={timeFrame} />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-3 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-blue-500">{minTemp}°C</dt>
          <dd className="font-medium dark:text-dark-6">Mínima</dd>
        </div>

        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-dark dark:text-white">
            {avgTemp}°C
          </dt>
          <dd className="font-medium dark:text-dark-6">Promedio</dd>
        </div>

        <div>
          <dt className="text-xl font-bold text-red-500">{maxTemp}°C</dt>
          <dd className="font-medium dark:text-dark-6">Máxima</dd>
        </div>
      </dl>
    </div>
  );
}
