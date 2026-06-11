// Usando NASA POWER

const APIZACO_LAT = 19.417966;
const APIZACO_LON = -98.126993;
const NASA_POWER_API = "https://power.larc.nasa.gov/api/temporal";

// Añadimos "custom" para el manejo dinámico del calendario histórico
export type TimeFrame =
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "custom";

interface NasaPowerResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN?: Record<string, number>;
      T2M?: Record<string, number>;
      T2M_MAX?: Record<string, number>;
      T2M_MIN?: Record<string, number>;
      CLOUD_AMT?: Record<string, number>;
      [key: string]: Record<string, number> | undefined;
    };
  };
}

// Obtener fechas según el período o selección exacta del calendario
function getDateRange(
  timeFrame: TimeFrame,
  anio?: number,
  mes?: string,
): { start: string; end: string } {
  // 🔒 FORZAMOS QUE LA FECHA DE REFERENCIA MÁXIMA DEL SISTEMA SEA EL CIERRE DE 2025
  const now = new Date();
  if (now.getFullYear() >= 2026) {
    now.setFullYear(2025, 11, 31); // 11 = Diciembre, 31 = Día
  }

  let start: Date;
  let end: Date = new Date(now);

  // LÓGICA PARA EL CALENDARIO HISTÓRICO (Modo custom)
  if (timeFrame === "custom" && anio && mes) {
    const indiceMes = parseInt(mes) - 1;

    start = new Date(anio, indiceMes, 1);
    end = new Date(anio, indiceMes + 1, 0);

    const fechaLimiteMax = new Date(2025, 11, 31);

    if (start > fechaLimiteMax) {
      start = new Date(2025, 11, 31);
      end = new Date(2025, 11, 31);
    } else if (end > fechaLimiteMax) {
      end = new Date(2025, 11, 31);
    }
  } else {
    // Al haber alterado "now" arriba, este switch calculará en base a 2025 de forma automática
    switch (timeFrame) {
      case "hourly":
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        break;
      case "daily":
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case "weekly":
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
      case "monthly":
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "yearly":
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 4);
        break;
      default:
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
    }
    end = new Date(now);
  }

  // Formateador helper: Transforma a YYYYMMDD
  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

// Obtener irradiancia desde NASA POWER
export async function getIrradianceData(
  timeFrame: TimeFrame = "monthly",
  anio?: number,
  mes?: string,
) {
  try {
    // 🔒 CANDADO DE SEGURIDAD TOPE 2025
    if (timeFrame === "custom" && anio && anio >= 2026) {
      return generateMockIrradianceData(timeFrame);
    }

    const { start, end } = getDateRange(timeFrame, anio, mes);
    const url = `${NASA_POWER_API}/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${APIZACO_LON}&latitude=${APIZACO_LAT}&start=${start}&end=${end}&format=JSON`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
      mode: 'cors'
    });

    if (!response.ok) {
      console.warn(`NASA API Irradiance respondió con estatus: ${response.status}. Usando datos de respaldo.`);
      return generateMockIrradianceData(timeFrame);
    }

    const data: NasaPowerResponse = await response.json();
    const irradianceData = data.properties?.parameter?.ALLSKY_SFC_SW_DWN;

    if (!irradianceData || Object.keys(irradianceData).length === 0) {
      return generateMockIrradianceData(timeFrame);
    }

    return processIrradianceData(irradianceData, timeFrame);
  } catch (error) {
    console.error("Error crítico al obtener irradiancia (usando mock):", error);
    return generateMockIrradianceData(timeFrame);
  }
}

// Obtener temperatura desde NASA POWER
export async function getTemperatureData(
  timeFrame: TimeFrame = "monthly",
  anio?: number,
  mes?: string,
) {
  try {
    // 🔒 CANDADO DE SEGURIDAD TOPE 2025
    if (timeFrame === "custom" && anio && anio >= 2026) {
      return generateMockTemperatureData(timeFrame);
    }

    const { start, end } = getDateRange(timeFrame, anio, mes);
    const url = `${NASA_POWER_API}/daily/point?parameters=T2M,T2M_MAX,T2M_MIN&community=RE&longitude=${APIZACO_LON}&latitude=${APIZACO_LAT}&start=${start}&end=${end}&format=JSON`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
      mode: 'cors'
    });

    if (!response.ok) {
      console.warn(`NASA API Temperatura respondió con estatus: ${response.status}. Usando datos de respaldo.`);
      return generateMockTemperatureData(timeFrame);
    }

    const data: NasaPowerResponse = await response.json();
    const tempData = data.properties?.parameter?.T2M;
    const tempMax = data.properties?.parameter?.T2M_MAX;
    const tempMin = data.properties?.parameter?.T2M_MIN;

    if (!tempData) {
      return generateMockTemperatureData(timeFrame);
    }

    return processTemperatureData(tempData, tempMax, tempMin, timeFrame);
  } catch (error) {
    console.error("Error crítico al obtener temperatura (usando mock):", error);
    return generateMockTemperatureData(timeFrame);
  }
}

// Obtener nubosidad desde NASA POWER
export async function getCloudCoverData(
  timeFrame: TimeFrame = "monthly",
  anio?: number,
  mes?: string,
) {
  try {
    // 🔒 CANDADO DE SEGURIDAD TOPE 2025
    if (timeFrame === "custom" && anio && anio >= 2026) {
      return generateMockCloudData(timeFrame);
    }

    const { start, end } = getDateRange(timeFrame, anio, mes);
    const url = `${NASA_POWER_API}/daily/point?parameters=CLOUD_AMT&community=RE&longitude=${APIZACO_LON}&latitude=${APIZACO_LAT}&start=${start}&end=${end}&format=JSON`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
      mode: 'cors'
    });

    if (!response.ok) {
      console.warn(`NASA API Nubosidad respondió con estatus: ${response.status}. Usando datos de respaldo.`);
      return generateMockCloudData(timeFrame);
    }

    const data: NasaPowerResponse = await response.json();
    const cloudData = data.properties?.parameter?.CLOUD_AMT;

    if (!cloudData) {
      return generateMockCloudData(timeFrame);
    }

    return processCloudData(cloudData);
  } catch (error) {
    console.error("Error crítico al obtener nubosidad (usando mock):", error);
    return generateMockCloudData(timeFrame);
  }
}

// Procesar datos de irradiancia según el período
function processIrradianceData(
  data: Record<string, number>,
  timeFrame: TimeFrame,
) {
  const entries = Object.entries(data).filter(([, value]) => value !== -999);

  switch (timeFrame) {
    case "hourly":
      return generateHourlyFromDaily(entries.slice(-1)[0]?.[1] || 5);

    case "daily":
      return entries.slice(-7).map(([date, value]) => ({
        x: formatDateLabel(date, "daily"),
        y: Math.round(value * 100) / 100,
      }));

    case "weekly":
      return aggregateByWeek(entries).map(({ label, avg }) => ({
        x: label,
        y: Math.round(avg * 100) / 100,
      }));

    case "monthly":
      return aggregateByMonth(entries).map(({ label, avg }) => ({
        x: label,
        y: Math.round(avg * 100) / 100,
      }));

    case "yearly":
      return aggregateByYear(entries).map(({ label, avg }) => ({
        x: label,
        y: Math.round(avg * 100) / 100,
      }));

    case "custom":
      return entries.map(([date, value]) => ({
        x: formatDateLabel(date, "daily"),
        y: Math.round(value * 100) / 100,
      }));

    default:
      return entries.slice(-12).map(([date, value]) => ({
        x: formatDateLabel(date, "monthly"),
        y: Math.round(value * 100) / 100,
      }));
  }
}

// Procesar datos de temperatura de forma aislada e independiente
function processTemperatureData(
  tempAvg: Record<string, number>,
  tempMax: Record<string, number> | undefined,
  tempMin: Record<string, number> | undefined,
  timeFrame: TimeFrame,
) {
  const avgEntries = Object.entries(tempAvg).filter(([, v]) => v !== -999);
  const maxEntries = tempMax
    ? Object.entries(tempMax).filter(([, v]) => v !== -999)
    : [];
  const minEntries = tempMin
    ? Object.entries(tempMin).filter(([, v]) => v !== -999)
    : [];

  const processEntries = (entries: [string, number][]) => {
    switch (timeFrame) {
      case "hourly":
        return generateHourlyTempFromDaily(entries.slice(-1)[0]?.[1] || 18);
      case "daily":
        return entries.slice(-7).map(([date, value]) => ({
          x: formatDateLabel(date, "daily"),
          y: Math.round(value * 10) / 10,
        }));
      case "weekly":
        return aggregateByWeek(entries).map(({ label, avg }) => ({
          x: label,
          y: Math.round(avg * 10) / 10,
        }));
      case "monthly":
        return aggregateByMonth(entries).map(({ label, avg }) => ({
          x: label,
          y: Math.round(avg * 10) / 10,
        }));
      case "yearly":
        return aggregateByYear(entries).map(({ label, avg }) => ({
          x: label,
          y: Math.round(avg * 10) / 10,
        }));
      case "custom":
        return entries.map(([date, value]) => ({
          x: formatDateLabel(date, "daily"),
          y: Math.round(value * 10) / 10,
        }));
      default:
        return entries.slice(-12).map(([date, value]) => ({
          x: formatDateLabel(date, "monthly"),
          y: Math.round(value * 10) / 10,
        }));
    }
  };

  return {
    average: processEntries(avgEntries),
    max: maxEntries.length > 0 ? processEntries(maxEntries) : [],
    min: minEntries.length > 0 ? processEntries(minEntries) : [],
  };
}

// Funciones auxiliares de formateo
function formatDateLabel(dateStr: string, type: string): string {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  switch (type) {
    case "daily":
      return `${day}/${month}`;
    case "monthly":
      return monthNames[parseInt(month) - 1] || month;
    case "yearly":
      return year;
    default:
      return `${day}/${month}`;
  }
}

function aggregateByWeek(entries: [string, number][]) {
  const weeks: { [key: string]: number[] } = {};

  entries.forEach(([date, value]: [string, number]) => {
    const d = new Date(
      `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`
    );
    const weekNum = getWeekNumber(d);
    const key = `Sem ${weekNum}`;
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(value);
  });

  return Object.entries(weeks)
    .slice(-4)
    .map(([label, values]) => ({
      label,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    }));
}

function aggregateByMonth(entries: [string, number][]) {
  const months: { [key: string]: number[] } = {};
  const monthNames = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  entries.forEach(([date, value]: [string, number]) => {
    const month = parseInt(date.substring(4, 6)) - 1;
    const key = monthNames[month];
    if (!months[key]) months[key] = [];
    months[key].push(value);
  });

  return Object.entries(months).map(([label, values]) => ({
    label,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }));
}

function aggregateByYear(entries: [string, number][]) {
  const years: { [key: string]: number[] } = {};

  entries.forEach(([date, value]: [string, number]) => {
    const year = date.substring(0, 4);
    if (!years[year]) years[year] = [];
    years[year].push(value);
  });

  return Object.entries(years).map(([label, values]) => ({
    label,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }));
}

function getWeekNumber(d: Date): number {
  const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function generateHourlyFromDaily(dailyAvg: number) {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    let value = 0;
    if (i >= 6 && i <= 18) {
      const normalized = (i - 6) / 12;
      value = dailyAvg * 1.5 * Math.sin(normalized * Math.PI);
    }
    hours.push({
      x: `${i.toString().padStart(2, "0")}:00`,
      y: Math.round(value * 100) / 100,
    });
  }
  return hours;
}

function generateHourlyTempFromDaily(dailyAvg: number) {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const variation = 5 * Math.sin(((i - 6) / 24) * 2 * Math.PI);
    hours.push({
      x: `${i.toString().padStart(2, "0")}:00`,
      y: Math.round((dailyAvg + variation) * 10) / 10,
    });
  }
  return hours;
}

// MOCKS DE RESPALDO
function generateMockIrradianceData(timeFrame: TimeFrame) {
  const mockData: { x: string; y: number }[] = [];

  switch (timeFrame) {
    case "hourly":
      for (let i = 0; i < 24; i++) {
        let value = 0;
        if (i >= 6 && i <= 18) value = 5 * Math.sin(((i - 6) / 12) * Math.PI);
        mockData.push({
          x: `${i.toString().padStart(2, "0")}:00`,
          y: Math.round(value * 100) / 100,
        });
      }
      break;
    case "daily":
    case "custom":
      const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      days.forEach((day) => {
        mockData.push({
          x: day,
          y: Math.round((4 + Math.random() * 3) * 100) / 100,
        });
      });
      break;
    case "weekly":
      for (let i = 1; i <= 4; i++)
        mockData.push({
          x: `Sem ${i}`,
          y: Math.round((4.5 + Math.random() * 2) * 100) / 100,
        });
      break;
    case "monthly":
      const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      ];
      months.forEach((month) => {
        mockData.push({
          x: month,
          y: Math.round((4 + Math.random() * 3) * 100) / 100,
        });
      });
      break;
    case "yearly":
      for (let i = 2021; i <= 2025; i++)
        mockData.push({
          x: i.toString(),
          y: Math.round((5 + Math.random()) * 100) / 100,
        });
      break;
  }

  return mockData;
}

function generateMockTemperatureData(timeFrame: TimeFrame) {
  const generateSeries = () => {
    const data: { x: string; y: number }[] = [];

    switch (timeFrame) {
      case "hourly":
        for (let i = 0; i < 24; i++) {
          const variation = 5 * Math.sin(((i - 6) / 24) * 2 * Math.PI);
          data.push({
            x: `${i.toString().padStart(2, "0")}:00`,
            y: Math.round((18 + variation) * 10) / 10,
          });
        }
        break;
      case "daily":
      case "custom":
        const days = [
          "01/12", "02/12", "03/12", "04/12", "05/12", "06/12", "07/12",
        ];
        days.forEach((day) => {
          data.push({
            x: day,
            y: Math.round((15 + Math.random() * 10) * 10) / 10,
          });
        });
        break;
      case "weekly":
        for (let i = 1; i <= 4; i++)
          data.push({
            x: `Sem ${i}`,
            y: Math.round((16 + Math.random() * 6) * 10) / 10,
          });
        break;
      case "monthly":
        const months = [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
        ];
        const baseTemps = [12, 14, 16, 18, 20, 19, 18, 18, 17, 15, 13, 12];
        months.forEach((month, i) => {
          data.push({
            x: month,
            y: baseTemps[i] + Math.round(Math.random() * 2 * 10) / 10,
          });
        });
        break;
      case "yearly":
        for (let i = 2021; i <= 2025; i++)
          data.push({
            x: i.toString(),
            y: Math.round((16 + Math.random() * 2) * 10) / 10,
          });
        break;
    }

    return data;
  };

  const avg = generateSeries();
  const max = avg.map((d) => ({ ...d, y: d.y + 5 + Math.random() * 2 }));
  const min = avg.map((d) => ({ ...d, y: d.y - 5 - Math.random() * 2 }));

  return { average: avg, max, min };
}

function processCloudData(data: Record<string, number>) {
  const entries = Object.entries(data).filter(([, value]) => value !== -999);

  const categories = {
    Despejado: 0,
    "Parcialmente Nublado": 0,
    Nublado: 0,
    "Muy Nublado": 0,
  };

  entries.forEach(([, value]) => {
    if (value <= 25) categories["Despejado"]++;
    else if (value <= 50) categories["Parcialmente Nublado"]++;
    else if (value <= 75) categories["Nublado"]++;
    else categories["Muy Nublado"]++;
  });

  const total = entries.length || 1;

  return [
    {
      name: "Despejado",
      percentage: categories["Despejado"] / total,
      amount: categories["Despejado"],
    },
    {
      name: "Parcial",
      percentage: categories["Parcialmente Nublado"] / total,
      amount: categories["Parcialmente Nublado"],
    },
    {
      name: "Nublado",
      percentage: categories["Nublado"] / total,
      amount: categories["Nublado"],
    },
    {
      name: "Muy Nublado",
      percentage: categories["Muy Nublado"] / total,
      amount: categories["Muy Nublado"],
    },
  ];
}

function generateMockCloudData(timeFrame: TimeFrame) {
  const multiplier = timeFrame === "yearly" ? 12 : 1;

  return [
    {
      name: "Despejado",
      percentage: 0.35,
      amount: Math.round(35 * multiplier),
    },
    { name: "Parcial", percentage: 0.3, amount: Math.round(30 * multiplier) },
    { name: "Nublado", percentage: 0.25, amount: Math.round(25 * multiplier) },
    {
      name: "Muy Nublado",
      percentage: 0.1,
      amount: Math.round(10 * multiplier),
    },
  ];
}