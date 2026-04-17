"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { x: string; y: number }[];
  timeFrame?: string;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function IrradianceChart({ data, timeFrame }: PropsType) {
  const isMobile = useIsMobile();

  const getXAxisTitle = () => {
    switch (timeFrame) {
      case "hourly":
        return "Hora";
      case "daily":
        return "Día";
      case "weekly":
        return "Semana";
      case "monthly":
        return "Mes";
      case "yearly":
        return "Año";
      default:
        return "Período";
    }
  };

  const options: ApexOptions = {
    legend: {
      show: false,
    },
    colors: ["#F59E0B"],
    chart: {
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      fontFamily: "inherit",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#F59E0B",
            opacity: 0.7,
          },
          {
            offset: 100,
            color: "#FCD34D",
            opacity: 0.2,
          },
        ],
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: isMobile ? 2 : 3,
    },
    grid: {
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      marker: {
        show: true,
      },
      y: {
        formatter: (value: number) => `${value} kWh/m²/día`,
      },
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: getXAxisTitle(),
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      title: {
        text: "Irradiancia (kWh/m²/día)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value: number) => value.toFixed(1),
      },
    },
  };

  return (
    <div className="-ml-4 -mr-5 h-[310px]">
      <Chart
        options={options}
        series={[
          {
            name: "Irradiancia",
            data: data,
          },
        ]}
        type="area"
        height={310}
      />
    </div>
  );
}
