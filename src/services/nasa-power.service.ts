// NASA POWER API Service para obtener datos de irradiancia y temperatura
// Ubicación: Apizaco, Tlaxcala, México (19.4167, -98.1333)

const APIZACO_LAT = 19.4167;
const APIZACO_LON = -98.1333;
const NASA_POWER_API = "https://power.larc.nasa.gov/api/temporal";

type TimeFrame = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

interface NasaPowerResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN?: Record<string, number>;
      T2M?: Record<string, number>;
      [key: string]: Record<string, number> | undefined;
    };
  };
}

// Función auxiliar para obtener fechas según el período
function getDateRange(timeFrame: TimeFrame): { start: string; end: string } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now);

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
      start.setFullYear(start.getFullYear() - 5);
      break;
    default:
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
  }

  end.setDate(end.getDate() - 3);

  const formatDate = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

// Obtener datos de irradiancia desde NASA POWER
export async function getIrradianceData(timeFrame: TimeFrame = "monthly") {
  try {
    const { start, end } = getDateRange(timeFrame);

    const url = `${NASA_POWER_API}/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${APIZACO_LON}&latitude=${APIZACO_LAT}&start=${start}&end=${end}&format=JSON`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error("NASA POWER API error:", response.status);
      return generateMockIrradianceData(timeFrame);
    }

    const data: NasaPowerResponse = await response.json();
    const irradianceData = data.properties?.parameter?.ALLSKY_SFC_SW_DWN;

    if (!irradianceData) {
      return generateMockIrradianceData(timeFrame);
    }

    return processIrradianceData(irradianceData, timeFrame);
  } catch (error) {
    console.error("Error fetching irradiance data:", error);
    return generateMockIrradianceData(timeFrame);
  }
}

// Obtener datos de temperatura desde NASA POWER
export async function getTemperatureData(timeFrame: TimeFrame = "monthly") {
  try {
    const { start, end } = getDateRange(timeFrame);

    const url = `${NASA_POWER_API}/daily/point?parameters=T2M,T2M_MAX,T2M_MIN&community=RE&longitude=${APIZACO_LON}&latitude=${APIZACO_LAT}&start=${start}&end=${end}&format=JSON`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      console.error("NASA POWER API error:", response.status);
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
    console.error("Error fetching temperature data:", error);
    return generateMockTemperatureData(timeFrame);
  }
}

// Procesar datos de irradiancia según el período
function processIrradianceData(
  data: Record<string, number>,
  timeFrame: TimeFrame
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

    default:
      return entries.slice(-12).map(([date, value]) => ({
        x: formatDateLabel(date, "monthly"),
        y: Math.round(value * 100) / 100,
      }));
  }
}

// Procesar datos de temperatura
function processTemperatureData(
  tempAvg: Record<string, number>,
  tempMax: Record<string, number> | undefined,
  tempMin: Record<string, number> | undefined,
  timeFrame: TimeFrame
) {
  const avgEntries = Object.entries(tempAvg).filter(([, v]) => v !== -999);
  const maxEntries = tempMax ? Object.entries(tempMax).filter(([, v]) => v !== -999) : [];
  const minEntries = tempMin ? Object.entries(tempMin).filter(([, v]) => v !== -999) : [];

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

// Funciones auxiliares de formateo y agregación
function formatDateLabel(dateStr: string, type: string): string {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

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

  entries.forEach(([date, value]) => {
    const d = new Date(`${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`);
    const weekNum = getWeekNumber(d);
    const key = `Sem ${weekNum}`;
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(value);
  });

  return Object.entries(weeks).slice(-4).map(([label, values]) => ({
    label,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
  }));
}

function aggregateByMonth(entries: [string, number][]) {
  const months: { [key: string]: number[] } = {};
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  entries.forEach(([date, value]) => {
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

  entries.forEach(([date, value]) => {
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

// Datos mock en caso de fallo de API
function generateMockIrradianceData(timeFrame: TimeFrame) {
  const mockData: { x: string; y: number }[] = [];

  switch (timeFrame) {
    case "hourly":
      for (let i = 0; i < 24; i++) {
        let value = 0;
        if (i >= 6 && i <= 18) {
          value = 5 * Math.sin(((i - 6) / 12) * Math.PI);
        }
        mockData.push({ x: `${i.toString().padStart(2, "0")}:00`, y: Math.round(value * 100) / 100 });
      }
      break;
    case "daily":
      const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      days.forEach((day) => {
        mockData.push({ x: day, y: Math.round((4 + Math.random() * 3) * 100) / 100 });
      });
      break;
    case "weekly":
      for (let i = 1; i <= 4; i++) {
        mockData.push({ x: `Sem ${i}`, y: Math.round((4.5 + Math.random() * 2) * 100) / 100 });
      }
      break;
    case "monthly":
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      months.forEach((month) => {
        mockData.push({ x: month, y: Math.round((4 + Math.random() * 3) * 100) / 100 });
      });
      break;
    case "yearly":
      for (let i = 2020; i <= 2024; i++) {
        mockData.push({ x: i.toString(), y: Math.round((5 + Math.random() * 1) * 100) / 100 });
      }
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
          data.push({ x: `${i.toString().padStart(2, "0")}:00`, y: Math.round((18 + variation) * 10) / 10 });
        }
        break;
      case "daily":
        const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        days.forEach((day) => {
          data.push({ x: day, y: Math.round((15 + Math.random() * 10) * 10) / 10 });
        });
        break;
      case "weekly":
        for (let i = 1; i <= 4; i++) {
          data.push({ x: `Sem ${i}`, y: Math.round((16 + Math.random() * 6) * 10) / 10 });
        }
        break;
      case "monthly":
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const baseTemps = [12, 14, 16, 18, 20, 19, 18, 18, 17, 15, 13, 12];
        months.forEach((month, i) => {
          data.push({ x: month, y: baseTemps[i] + Math.round(Math.random() * 2 * 10) / 10 });
        });
        break;
      case "yearly":
        for (let i = 2020; i <= 2024; i++) {
          data.push({ x: i.toString(), y: Math.round((16 + Math.random() * 2) * 10) / 10 });
        }
        break;
    }

    return data;
  };

  const avg = generateSeries();
  const max = avg.map((d) => ({ ...d, y: d.y + 5 + Math.random() * 2 }));
  const min = avg.map((d) => ({ ...d, y: d.y - 5 - Math.random() * 2 }));

  return { average: avg, max, min };
}