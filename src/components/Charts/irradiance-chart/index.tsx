import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getIrradianceData } from "@/services/nasa-power.service";
import { IrradianceChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function IrradianceOverview({
                                           timeFrame = "monthly",
                                           className,
                                         }: PropsType) {
  const data = await getIrradianceData(timeFrame as "hourly" | "daily" | "weekly" | "monthly" | "yearly");

  const avgIrradiance = data.length > 0
    ? (data.reduce((acc, { y }) => acc + y, 0) / data.length).toFixed(2)
    : "0.00";

  const maxIrradiance = data.length > 0
    ? Math.max(...data.map(({ y }) => y)).toFixed(2)
    : "0.00";

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Irradiancia Solar
        </h2>

        <PeriodPicker
          items={["hourly", "daily", "weekly", "monthly", "yearly"]}
          defaultValue={timeFrame}
          sectionKey="irradiance_overview"
        />
      </div>

      <IrradianceChart data={data} timeFrame={timeFrame} />

      <dl className="grid divide-stroke text-center dark:divide-dark-3 sm:grid-cols-2 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="dark:border-dark-3 max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-dark dark:text-white">
            {avgIrradiance} kWh/m²/día
          </dt>
          <dd className="font-medium dark:text-dark-6">Promedio</dd>
        </div>

        <div>
          <dt className="text-xl font-bold text-dark dark:text-white">
            {maxIrradiance} kWh/m²/día
          </dt>
          <dd className="font-medium dark:text-dark-6">Máximo</dd>
        </div>
      </dl>
    </div>
  );
}