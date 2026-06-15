"use client";

import React, { useState, useMemo } from "react";

type PropsType = {
  timeFrame?: string;
};

export function PosicionSolChart({ timeFrame = "monthly" }: PropsType) {
  // 1. Estados locales para controlar el mes y el año de forma dinámica
  const [mesActual, setMesActual] = useState<number>(5); // Junio por defecto
  const [añoActual, setAñoActual] = useState<number>(2026); // Año en curso por defecto

  const mesesNombres = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const añosDisponibles = [2022, 2023, 2024, 2025];

  // 2. Cálculo cinemático solar dinámico basado en Mes y Año
  const metricas = useMemo(() => {
    // Factor estacional basado en el mes (órbita de declinación)
    const factorEstacional = Math.sin((mesActual - 2) * (Math.PI / 6));

    // Pequeña variación secular o ajuste basado en el año (simulación cinemática por año bisiesto/eje)
    const ajusteAnual = (añoActual - 2024) * 0.05;

    // Fórmulas base adaptadas a la latitud regional de Tlaxcala (~19.3° N)
    const inclinacionOptima = 25.4 + (10.1 * factorEstacional) + (ajusteAnual * 0.1);
    const anguloCenital = 19.3 - (23.45 * factorEstacional) + (ajusteAnual * 0.05);
    const azimutSugerido = 180 + (15 * factorEstacional);

    return {
      optimo: Math.abs(inclinacionOptima).toFixed(1),
      cenital: Math.abs(anguloCenital).toFixed(1),
      azimut: azimutSugerido.toFixed(1),
    };
  }, [mesActual, añoActual]);

  return (
    <div className="flex flex-col gap-6 mt-4">

      {/* --- SELECTORES DENTRO DE LA TARJETA --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke pb-4 dark:border-dark-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Parámetros Temporales de Análisis
        </span>
        <div className="flex items-center gap-2">
          {/* Selector de Mes */}
          <select
            value={mesActual}
            onChange={(e) => setMesActual(Number(e.target.value))}
            className="rounded border border-stroke bg-transparent px-3 py-1.5 text-sm font-medium text-dark outline-none dark:border-dark-3 dark:text-white bg-white dark:bg-gray-dark"
          >
            {mesesNombres.map((nombre, idx) => (
              <option key={idx} value={idx} className="text-dark dark:text-white bg-white dark:bg-gray-dark">
                {nombre}
              </option>
            ))}
          </select>

          {/* Selector de Año */}
          <select
            value={añoActual}
            onChange={(e) => setAñoActual(Number(e.target.value))}
            className="rounded border border-stroke bg-transparent px-3 py-1.5 text-sm font-medium text-dark outline-none dark:border-dark-3 dark:text-white bg-white dark:bg-gray-dark"
          >
            {añosDisponibles.map((año) => (
              <option key={año} value={año} className="text-dark dark:text-white bg-white dark:bg-gray-dark">
                {año}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- GRID DE GRÁFICO 3D Y MÉTRICAS --- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Gráfico Esquemático 3D */}
        <div className="sm:col-span-2 rounded-xl border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2 min-h-[260px] flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-400">
            Proyección de Incidencia Vectorial ({mesesNombres[mesActual]} - {añoActual})
          </span>

          {/* Domo Esquemático 3D */}
          <div className="relative w-full h-44 flex items-center justify-center mt-4 overflow-hidden">
            <div className="absolute w-[95%] h-[60%] -bottom-10 rounded-full border border-stroke bg-white dark:bg-gray-800 dark:border-dark-3 opacity-90 transform rotateX-40"></div>

            {/* Puntos Cardinales */}
            <span className="absolute -bottom-8 left-2 text-[10px] font-bold text-gray-400">N</span>
            <span className="absolute -bottom-8 right-2 text-[10px] font-bold text-gray-400">S</span>
            <span className="absolute bottom-2 -left-3 text-[10px] font-bold text-gray-400">O</span>
            <span className="absolute bottom-2 -right-3 text-[10px] font-bold text-gray-400">E</span>

            <div className="relative w-[85%] h-full flex items-end justify-center">
              <div className="absolute w-[100%] h-[180%] -bottom-[80%] rounded-full border border-dotted border-primary/20"></div>

              {/* Vector Solar Dinámico */}
              <div
                className="absolute bottom-0 left-1/2 h-36 w-1 bg-gradient-to-t from-primary to-yellow-500 origin-bottom transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-50%) rotate(${parseFloat(metricas.optimo) - 25}deg)` }}
              >
                <div className="absolute -top-4 -left-3.5 h-8 w-8 rounded-full bg-yellow-500 shadow-xl flex items-center justify-center text-white text-xs animate-pulse">
                  ☀️
                </div>
              </div>
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-400">CÉNIT (90°)</span>
            </div>
          </div>
        </div>

        {/* Bloque Lateral de Métricas */}
        <div className="flex flex-col gap-3 justify-between">
          {/* Inclinación */}
          <div className="rounded-xl border border-stroke p-3 dark:border-dark-3 bg-white dark:bg-gray-dark">
            <span className="text-[11px] font-bold uppercase text-primary block">
               Inclinación (β)
            </span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-extrabold text-dark dark:text-white">{metricas.optimo}</span>
              <span className="text-xs font-semibold text-gray-500">°</span>
            </div>
          </div>

          {/* Cenital */}
          <div className="rounded-xl border border-stroke p-3 dark:border-dark-3 bg-white dark:bg-gray-dark">
            <span className="text-[11px] font-bold uppercase text-orange-500 block">
               Cenital (Θz)
            </span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-extrabold text-dark dark:text-white">{metricas.cenital}</span>
              <span className="text-xs font-semibold text-gray-500">°</span>
            </div>
          </div>

          {/* Azimut */}
          <div className="rounded-xl border border-stroke p-3 dark:border-dark-3 bg-white dark:bg-gray-dark">
            <span className="text-[11px] font-bold uppercase text-purple-500 block">
               Azimut
            </span>
            <div className="flex items-baseline gap-0.5 mt-1">
              <span className="text-xl font-extrabold text-dark dark:text-white">{metricas.azimut}</span>
              <span className="text-xs font-semibold text-gray-500">°</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}