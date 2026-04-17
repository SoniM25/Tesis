"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: {
    average: { x: string; y: number }[];
    max: { x: string; y: number }[];
    min: { x: string; y: number }[];
  };
  timeFrame?: string;
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function TemperatureChart({ data, timeFrame }: PropsType) {
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
    colors: ["#3B82F6", "#10B981", "#EF4444"],
    chart: {
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      width: [3, 2, 2],
      curve: "smooth",
      dashArray: [0, 5, 5],
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    dataLabels: {
      enabled: false,
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
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
        text: "Temperatura (°C)",
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      labels: {
        formatter: (value: number) => `${value.toFixed(1)}°`,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "inherit",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        size: 9,
        shape: "circle",
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toFixed(1)}°C`,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const series = [
    {
      name: "Promedio",
      data: data.average,
    },
  ];

  if (data.max.length > 0) {
    series.push({
      name: "Máxima",
      data: data.max,
    });
  }

  if (data.min.length > 0) {
    series.push({
      name: "Mínima",
      data: data.min,
    });
  }

  return (
    <div className="-ml-3.5 mt-3">
      <Chart options={options} series={series} type="line" height={370} />
    </div>
  );
}
