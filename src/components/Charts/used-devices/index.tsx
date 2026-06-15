"use client";

import { useEffect, useState } from "react";
import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { getDevicesUsedData } from "@/services/charts.services";
import { DonutChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

// ✅ CORRECCIÓN: Función síncrona normal para Client Component
export function UsedDevices({
                              timeFrame = "monthly", // Usamos el valor por defecto en inglés alineado a tu app
                              className,
                            }: PropsType) {
  // 1. Estados para controlar los datos y la carga
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Efecto para hacer la petición asíncrona de manera segura
  useEffect(() => {
    async function fetchDevices() {
      setLoading(true);
      try {
        const result = await getDevicesUsedData(timeFrame);
        setData(result);
      } catch (error) {
        console.error("Error al obtener dispositivos utilizados:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDevices();
  }, [timeFrame]);


}