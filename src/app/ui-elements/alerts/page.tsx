import { Alert } from "@/components/ui-elements/alert";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glosario de Variables | SCARRH",
  description: "Glosario de variables físicas, climáticas y de simulación del proyecto SCARRH",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Glosario" />

      <div className="space-y-7.5 rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card md:p-6 xl:p-9">

        {/* --- SECCIÓN: ADVERTENCIAS / VARIABLES TÉRMICAS MÁXIMAS --- */}
        <Alert
          variant="warning"
          title="Variables de Control y Extremos Térmicos (Alerta / Monitoreo)"
          description="• Temperatura Máxima Diaria (T2M_MAX): El valor térmico más alto registrado en un día de 24 horas. Es la variable crítica mapeada en las celdas de calor para evaluar picos extremos de calor.
          • Máximo Absoluto Mensual: El hito o pico térmico más elevado de todo el conjunto de datos de un mes seleccionado, utilizado para fijar récords históricos en el panel de control."
        />

        {/* --- SECCIÓN: PROCESOS EXITOSOS / METEOROLOGÍA ÓPTIMA --- */}
        <Alert
          variant="success"
          title="Variables de Radiación y Potencial Solar (Rendimiento Óptimo)"
          description="• Irradiancia Solar (G): Densidad de potencia con la que la energía electromagnética del Sol incide sobre una superficie por unidad de área.
          • kWh/m²/día: Unidad de medida técnico-ambiental que indica cuánta energía disponible para transformación fotovoltaica cae sobre un metro cuadrado a lo largo de una jornada."
        />

        {/* --- SECCIÓN: ERRORES / CONTINGENCIAS / MÍNIMOS --- */}
        <Alert
          variant="error"
          title="Variables de Descenso Térmico y Ecosistema de Datos (Límites / Contingencias)"
          description="• Temperatura Mínima Diaria (T2M_MIN): El valor térmico más bajo registrado durante el día, indispensable para detectar heladas o descensos bruscos en la monitorización regional.
          • Mínimo Absoluto Mensual: El hito o valor térmico más bajo registrado dentro de los días evaluados en el módulo.
          • NASA POWER API: Backend científico global y proveedor oficial de datasets meteorológicos de radiación solar para alimentar los modelos predictivos."
        />

      </div>
    </>
  );
}