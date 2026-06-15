"use client";

import { PosicionSolChart } from "./index";

type PosicionSolOverviewProps = {
  timeFrame?: string;
  loading?: boolean;
};

export function PosicionSolOverview({
  timeFrame = "monthly",
  loading = false,
}: PosicionSolOverviewProps) {
  return (
    <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
      <div className="mb-2">
        <h4 className="text-xl font-bold text-dark dark:text-white">
          Geometría Cinematica Solar (SCARRH)
        </h4>
        <p className="text-body text-sm font-medium">
          Análisis predictivo de ángulos de inclinación
        </p>
      </div>

      <div>
        {loading ? (
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="text-body ml-3 text-sm font-medium">
              Sincronizando coordenadas espaciales...
            </span>
          </div>
        ) : (
          <PosicionSolChart timeFrame={timeFrame} />
        )}
      </div>
    </div>
  );
}
