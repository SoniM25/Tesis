"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getTemperatureData } from "@/services/nasa-power.service";

// 🚀 CARGA DINÁMICA: Forzamos la desactivación de SSR para evitar colisiones en el cliente
const UsedDevices = dynamic(
  () => import("@/components/Charts/used-devices").then((mod) => mod.UsedDevices),
  { ssr: false }
);

const CampaignVisitors = dynamic(
  () => import("@/components/Charts/campaign-visitors").then((mod) => mod.CampaignVisitors),
  { ssr: false }
);

interface DiaTemperatura {
  x: string;
  y: number;
}

export default function Page() {
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(2025);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("12");
  const [datosMaximos, setDatosMaximos] = useState<DiaTemperatura[]>([]);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [records, setRecords] = useState({
    maxAbsoluta: -999,
    diaMax: "",
    minAbsoluta: 999,
    diaMin: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Garantizar el ciclo de vida seguro del cliente para los componentes asíncronos
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function cargarPeriodo() {
      setLoading(true);
      try {
        const datosTemperatura = await getTemperatureData("custom", añoSeleccionado, mesSeleccionado);
        const maxSeries: DiaTemperatura[] = datosTemperatura.max || [];
        const minSeries: DiaTemperatura[] = datosTemperatura.min || [];

        setDatosMaximos(maxSeries);

        let mAbs = -999; let dMax = ""; let miAbs = 999; let dMin = "";
        maxSeries.forEach((item) => { if (item.y > mAbs) { mAbs = item.y; dMax = item.x; } });
        minSeries.forEach((item) => { if (item.y < miAbs) { miAbs = item.y; dMin = item.x; } });

        setRecords({
          maxAbsoluta: mAbs !== -999 ? mAbs : 0,
          diaMax: dMax || "--",
          minAbsoluta: miAbs !== 999 ? miAbs : 0,
          diaMin: dMin || "--",
        });
      } catch (error) {
        console.error("Error al obtener históricos para mejores momentos:", error);
        setDatosMaximos([]);
      } finally {
        setLoading(false);
      }
    }
    cargarPeriodo();
  }, [añoSeleccionado, mesSeleccionado]);

  const obtenerColorCalor = (temp: number) => {
    if (temp <= 12) return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
    if (temp <= 16) return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    if (temp <= 20) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
    if (temp <= 24) return "bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200";
    if (temp <= 28) return "bg-orange-400 text-white dark:bg-orange-700 dark:text-white";
    return "bg-red-500 text-white font-bold animate-pulse dark:bg-red-600";
  };

  const mesesNombres: { [key: string]: string } = {
    "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril", "05": "Mayo", "06": "Junio",
    "07": "Julio", "08": "Agosto", "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
  };

  return (
    <>
      <Breadcrumb pageName="Mejores Momentos" />

      {/* --- PANEL DE CONTROL --- */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div>
          <h4 className="text-xl font-bold text-dark dark:text-white">
            Análisis de Récords Térmicos
          </h4>
          <p className="text-body text-sm font-medium">
            Filtra y visualiza el comportamiento extremo del mes seleccionado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="rounded border border-stroke bg-transparent px-4 py-2 font-medium text-dark outline-none dark:border-dark-3 dark:text-white"
          >
            {Object.entries(mesesNombres).map(([valor, nombre]) => (
              <option
                key={valor}
                value={valor}
                className="bg-white text-dark dark:bg-gray-dark dark:text-white"
              >
                {nombre}
              </option>
            ))}
          </select>
          <select
            value={añoSeleccionado}
            onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
            className="rounded border border-stroke bg-transparent px-4 py-2 font-medium text-dark outline-none dark:border-dark-3 dark:text-white"
          >
            {[2021, 2022, 2023, 2024, 2025].map((y) => (
              <option
                key={y}
                value={y}
                className="bg-white text-dark dark:bg-gray-dark dark:text-white"
              >
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="mb-6 flex h-44 items-center justify-center rounded-[10px] border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-body ml-3 text-base font-medium">
            Calculando mapas de calor y récords de la NASA...
          </span>
        </div>
      ) : datosMaximos.length === 0 ? (
        <div className="text-body mb-6 rounded-[10px] border border-stroke bg-white p-6 text-center dark:border-dark-3 dark:bg-gray-dark">
          No existen mediciones disponibles para el período de tiempo
          seleccionado.
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* MAPA DE CALOR */}
          <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-dark dark:text-white">
                Mapa de Calor: Máximas Diarias ({mesesNombres[mesSeleccionado]})
              </h3>
              <span className="text-body text-xs font-medium">
                Valores en °C
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10">
              {datosMaximos.map((item, idx) => {
                const numeroDia = item.x.split("/")[0];
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center rounded-lg p-2 shadow-sm transition-all hover:scale-105 ${obtenerColorCalor(item.y)}`}
                    title={`Día ${item.x}: ${item.y}°C`}
                  >
                    <span className="text-[10px] font-semibold opacity-70">
                      Día {parseInt(numeroDia)}
                    </span>
                    <span className="text-sm font-bold">
                      {item.y.toFixed(1)}°
                    </span>
                  </div>
                );
              })}
            </div>
            {/* LEYENDA */}
            <div className="text-body mt-6 flex flex-wrap items-center gap-4 border-t border-stroke pt-4 text-xs font-medium dark:border-dark-3">
              <span className="text-[10px] font-bold uppercase">Escala:</span>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-blue-100 dark:bg-blue-950"></span>{" "}
                ≤12° (Frío)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-green-100 dark:bg-green-950"></span>{" "}
                ≤16° (Templado)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-yellow-100 dark:bg-yellow-900/30"></span>{" "}
                ≤20° (Cálido)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-orange-200 dark:bg-orange-900/50"></span>{" "}
                ≤24° (Caluroso)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded bg-orange-400 dark:bg-orange-700"></span>{" "}
                ≤28° (Muy Cálido)
              </div>
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 animate-pulse rounded bg-red-500 dark:bg-red-600"></span>{" "}
                &gt;28° (Extremo)
              </div>
            </div>
          </div>

          {/* HITOS INDEPENDIENTES */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 items-center justify-between rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
              <div>
                <span className="text-body text-xs font-bold uppercase tracking-wider">
                  {" "}
                  Máximo Absoluto
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-red-500 dark:text-red-400">
                    {records.maxAbsoluta.toFixed(1)}
                  </span>
                  <span className="text-body text-lg font-semibold">°C</span>
                </div>
                <p className="text-body mt-2 text-xs">
                  Pico alcanzado el día:{" "}
                  <span className="font-bold text-dark dark:text-white">
                    {records.diaMax}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
              <div>
                <span className="text-body text-xs font-bold uppercase tracking-wider">
                  Mínimo Absoluto
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-blue-500 dark:text-blue-400">
                    {records.minAbsoluta.toFixed(1)}
                  </span>
                  <span className="text-body text-lg font-semibold">°C</span>
                </div>
                <p className="text-body mt-2 text-xs">
                  Pico alcanzado el día:{" "}
                  <span className="font-bold text-dark dark:text-white">
                    {records.diaMin}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GRÁFICOS COMPLEMENTARIOS ORIGINALES PROTEGIDOS --- */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {hasMounted && (
          <>
            <div className="col-span-12 xl:col-span-5">
              <UsedDevices />
            </div>
            <div className="col-span-12 xl:col-span-7">
              <CampaignVisitors data={null} />
            </div>
          </>
        )}
      </div>
    </>
  );
}