"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

type PropsType = {
  data: { name: string; amount: number; percentage: number }[];
};

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export function CloudChart({ data }: PropsType) {
  const total = data.reduce((acc, item) => acc + item.amount, 0);

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: ["#FBBF24", "#60A5FA", "#9CA3AF", "#4B5563"],
    labels: data.map((item) => item.name),
    legend: {
      show: true,
      position: "bottom",
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
      formatter: (legendName, opts) => {
        const percentage = Math.round(
          opts.w.globals.seriesPercent[opts.seriesIndex],
        );
        return `${legendName}: ${percentage}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Días Analizados",
              fontSize: "14px",
              fontWeight: "400",
              formatter: () => total.toString(),
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} días`,
      },
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: "100%",
          },
        },
      },
      {
        breakpoint: 370,
        options: {
          chart: {
            width: 260,
          },
        },
      },
    ],
  };

  return (
    <Chart
      options={chartOptions}
      series={data.map((item) => item.amount)}
      type="donut"
    />
  );
}
