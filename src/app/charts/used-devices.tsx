"use client";

import React from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// 1. Definimos la estructura de los datos que le enviará el componente Padre
interface DiaTemperatura {
  x: string; // Fecha en formato "DD/MM/AAAA" o similar
  y: number; // Temperatura en °C
}

interface UsedDevicesProps {
  data: DiaTemperatura[];
}

export function UsedDevices({ data }: UsedDevicesProps) {
  // 2. Extraemos los días (eje X) y los valores de temperatura (eje Y)
  // Usamos split("/") para mostrar solo el número del día y evitar que se amontone el texto
  const categoriasDias = data.map((item) => item.x.split("/")[0]);
  const seriesTemperaturas = data.map((item) => parseFloat(item.y.toFixed(1)));

  // 3. Configuración estética y de comportamiento del gráfico de ApexCharts
  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#F97316"], // Color naranja para representar temperaturas máximas
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "area",
      toolbar: { show: false }, // Oculta los botones de descarga para mantener la interfaz limpia
    },
    stroke: {
      width: 3,
      curve: "smooth", // Línea suavizada/curva
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 4,
      colors: ["#fff"],
      strokeColors: ["#F97316"],
      strokeWidth: 2,
      hover: { size: 6 },
    },
    xaxis: {
      type: "category",
      categories: categoriasDias,
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: "Día del Mes",
        style: { fontSize: "12px", color: "#64748B" },
      },
    },
    yaxis: {
      title: {
        text: "Temperatura (°C)",
        style: { fontSize: "12px", color: "#64748B" },
      },
    },
    tooltip: {
      x: { show: true },
      y: { formatter: (val) => `${val} °C` },
    },
  };

  const series = [
    {
      name: "Temp. Máxima",
      data: seriesTemperaturas,
    },
  ];

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Evolución de Temperaturas Máximas
      </h3>

      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height="100%"
            width="100%"
          />
        ) : (
          <div className="text-body flex h-full items-center justify-center text-sm">
            Esperando datos climáticos...
          </div>
        )}
      </div>
    </div>
  );
}
