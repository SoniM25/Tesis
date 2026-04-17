import { ArrowDownIcon, ArrowUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import type { JSX, SVGProps } from "react";

type PropsType = {
  label: string;
  data: {
    value: number | string;
    growthRate?: number | string | null;
  };
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

export function OverviewCard({ label, data, Icon }: PropsType) {
  const isNumber = typeof data.growthRate === "number";
  const isDecreasing = isNumber && (data.growthRate as number) < 0;

  return (
    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
      <Icon />

      <div className="mt-6 flex items-end justify-between">
        <dl>
          <dt className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
            {data.value}
          </dt>
          <dd className="text-sm font-medium text-dark-6">{label}</dd>
        </dl>

        {
        }
        {data.growthRate !== undefined &&
          data.growthRate !== null &&
          data.growthRate !== 0 && (
            <dl
              className={cn(
                "text-sm font-medium",
                isNumber
                  ? isDecreasing
                    ? "text-red"
                    : "text-green"
                  : "text-dark-6",
              )}
            >
              <dt className="flex items-center gap-1.5">
                {data.growthRate}
                {/* Solo mostrar el % si es un número */}
                {isNumber && "%"}

                {/* Solo mostrar flechas si es un número */}
                {isNumber &&
                  (isDecreasing ? (
                    <ArrowDownIcon aria-hidden />
                  ) : (
                    <ArrowUpIcon aria-hidden />
                  ))}
              </dt>

              <dd className="sr-only">
                {label}{" "}
                {isNumber ? (isDecreasing ? "Decreased" : "Increased") : ""} by{" "}
                {data.growthRate}
              </dd>
            </dl>
          )}
      </div>
    </div>
  );
}
