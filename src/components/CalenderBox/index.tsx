"use client";

import { useState, useEffect } from "react";
import { getIrradianceData, getTemperatureData } from "@/services/nasa-power.service";

interface MetricasClima {
  irradiancia: number;
  tempMax: number;
  tempMin: number;
}

const CalendarBox = () => {
  // Estados de navegación inicializados en Marzo 2022
  const [añoSeleccionado, setAñoSeleccionado] = useState<number>(2022);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("03"); // "03" = Marzo
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);

  const [datosMes, setDatosMes] = useState<{ [dia: string]: MetricasClima }>({});
  const [loading, setLoading] = useState<boolean>(false);

  // --- EFECTO: Descarga los datos de la NASA al cambiar MES o AÑO ---
  useEffect(() => {
    async function descargarDatosMesCompleto() {
      setLoading(true);
      try {
        const datosIrradiancia = await getIrradianceData("custom", añoSeleccionado, mesSeleccionado);
        const datosTemperatura = await getTemperatureData("custom", añoSeleccionado, mesSeleccionado);

        const mapaMes: { [dia: string]: MetricasClima } = {};

        // Mapear los datos que vienen con formato x: "dd/mm"
        datosIrradiancia.forEach((item: any) => {
          const [dia] = item.x.split("/");

          const tMax = datosTemperatura.max?.find((t: any) => t.x === item.x)?.y || 0;
          const tMin = datosTemperatura.min?.find((t: any) => t.x === item.x)?.y || 0;

          mapaMes[parseInt(dia).toString()] = {
            irradiancia: item.y,
            tempMax: tMax,
            tempMin: tMin
          };
        });

        setDatosMes(mapaMes);
      } catch (error) {
        console.error("Error al traer el histórico de la NASA:", error);
        setDatosMes({});
      } finally {
        setLoading(false);
      }
    }

    descargarDatosMesCompleto();
  }, [mesSeleccionado, añoSeleccionado]);

  // --- LÓGICA PARA GENERAR LOS DÍAS EXACTOS DEL MES ---
  const obtenerMatrizCalendario = () => {
    const indiceMes = parseInt(mesSeleccionado) - 1;

    // Primer día del mes (ej: qué día de la semana cae el 1 de Marzo)
    const primerDiaMes = new Date(añoSeleccionado, indiceMes, 1);
    // Total de días que tiene el mes (pasando día 0 del mes siguiente)
    const totalDiasMes = new Date(añoSeleccionado, indiceMes + 1, 0).getDate();

    // Día de la semana en que inicia (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
    const diaInicioSemana = primerDiaMes.getDay();

    const celdas = [];

    // 1. Rellenar los días vacíos del mes anterior (si el mes no empieza en Domingo)
    for (let i = 0; i < diaInicioSemana; i++) {
      celdas.push({ tipo: "vacio", valor: "" });
    }

    // 2. Rellenar los días reales del mes actual
    for (let d = 1; d <= totalDiasMes; d++) {
      celdas.push({ tipo: "dia", valor: d });
    }

    // 3. Agrupar la lista plana de celdas en bloques de 7 (Semanas/Filas)
    const filas: any[][] = [];
    let semanaActual: any[] = [];

    celdas.forEach((celda) => {
      semanaActual.push(celda);
      if (semanaActual.length === 7) {
        filas.push(semanaActual);
        semanaActual = [];
      }
    });

    // Rellenar la última semana con celdas vacías finales si no se completaron las 7 columnas
    if (semanaActual.length > 0) {
      while (semanaActual.length < 7) {
        semanaActual.push({ tipo: "vacio", valor: "" });
      }
      filas.push(semanaActual);
    }

    return filas;
  };

  const semanas = obtenerMatrizCalendario();
  const datosDiaActual = datosMes[diaSeleccionado.toString()];

  return (
    <>
      {/* SECCIÓN 1: SELECTORES DE NAVEGACIÓN */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div>
          <h4 className="text-xl font-bold text-dark dark:text-white">
            Histórico Estadístico Meteorológico
          </h4>
          <p className="text-sm font-medium text-body">
            UATx - Monitoreo Solar Dinámico (Apizaco)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Mes */}
          <select
            value={mesSeleccionado}
            onChange={(e) => {
              setMesSeleccionado(e.target.value);
              setDiaSeleccionado(1); // Reiniciar al día 1 al cambiar de mes
            }}
            className="rounded border border-stroke bg-transparent px-4 py-2 font-medium text-dark outline-none dark:border-dark-3 dark:text-white"
          >
            <option value="01">Enero</option>
            <option value="02">Febrero</option>
            <option value="03">Marzo</option>
            <option value="04">Abril</option>
            <option value="05">Mayo</option>
            <option value="06">Junio</option>
            <option value="07">Julio</option>
            <option value="08">Agosto</option>
            <option value="09">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>

          {/* Selector de Año */}
          <select
            value={añoSeleccionado}
            onChange={(e) => {
              setAñoSeleccionado(Number(e.target.value));
              setDiaSeleccionado(1);
            }}
            className="rounded border border-stroke bg-transparent px-4 py-2 font-medium text-dark outline-none dark:border-dark-3 dark:text-white"
          >
            <option value={2021}>2021</option>
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </div>

      {/* SECCIÓN 2: GRID DEL CALENDARIO DINÁMICO */}
      <div className="w-full max-w-full rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <table className="w-full table-fixed">
          <thead>
          <tr className="grid grid-cols-7 rounded-t-[10px] bg-primary text-white">
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Dom</th>
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Lun</th>
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Mar</th>
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Mié</th>
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Jue</th>
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Vie</th>
            <th className="flex h-15 items-center justify-center p-1 text-base font-medium">Sáb</th>
          </tr>
          </thead>
          <tbody>
          {semanas.map((semana, indexFila) => (
            <tr key={indexFila} className="grid grid-cols-7">
              {semana.map((celda, indexCol) => {
                if (celda.tipo === "vacio") {
                  return (
                    <td key={indexCol} className="ease relative h-20 border border-stroke p-2 bg-gray-2/20 dark:border-dark-3 opacity-30 cursor-not-allowed md:h-25" />
                  );
                }

                const esSeleccionado = diaSeleccionado === celda.valor;

                return (
                  <td
                    key={indexCol}
                    onClick={() => setDiaSeleccionado(celda.valor)}
                    className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-300 hover:bg-gray-2 dark:border-dark-3 dark:hover:bg-dark-2 md:h-25 ${
                      esSeleccionado ? "bg-primary/10 border-primary dark:bg-primary/20" : ""
                    }`}
                  >
                      <span className={`font-medium text-sm md:text-base ${esSeleccionado ? "text-primary font-bold" : "text-dark dark:text-white"}`}>
                        {celda.valor}
                      </span>
                  </td>
                );
              })}
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN 3: RENDIMIENTO DE TARJETAS INFERIORES */}
      <div className="mt-6">
        <h5 className="mb-4 text-lg font-bold text-dark dark:text-white">
          Datos Reales del: {diaSeleccionado.toString().padStart(2, "0")}/{mesSeleccionado}/{añoSeleccionado}
        </h5>

        {loading ? (
          <div className="flex h-28 items-center justify-center rounded-[10px] bg-white border border-stroke dark:bg-gray-dark dark:border-dark-3">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <span className="ml-3 text-sm font-medium text-body">Sincronizando base de datos histórica de la NASA...</span>
          </div>
        ) : (
          datosDiaActual ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Card Irradiancia */}
              <div className="rounded-[10px] border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
                <span className="text-xs font-bold uppercase tracking-wider text-body">Irradiancia Solar</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-dark dark:text-white">{datosDiaActual.irradiancia.toFixed(2)}</span>
                  <span className="text-sm font-semibold text-body">kW-hr/m²/día</span>
                </div>
              </div>
              {/* Card Temp Máxima */}
              <div className="rounded-[10px] border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
                <span className="text-xs font-bold uppercase tracking-wider text-body">Temp. Máxima</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-dark dark:text-white">{datosDiaActual.tempMax.toFixed(1)}</span>
                  <span className="text-sm font-semibold text-body">°C</span>
                </div>
              </div>
              {/* Card Temp Mínima */}
              <div className="rounded-[10px] border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
                <span className="text-xs font-bold uppercase tracking-wider text-body">Temp. Mínima</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-dark dark:text-white">{datosDiaActual.tempMin.toFixed(1)}</span>
                  <span className="text-sm font-semibold text-body">°C</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] bg-white p-6 border text-center text-body dark:bg-gray-dark dark:border-dark-3">
              No hay mediciones históricas registradas para el día seleccionado (o cae en el retraso operativo de la API).
            </div>
          )
        )}
      </div>
    </>
  );
};

export default CalendarBox;