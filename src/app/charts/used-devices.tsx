"use client";

export function UsedDevices() {
  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white">
        Temperaturas Máximas
      </h3>

      <div className="flex h-64 items-center justify-center">
        <span className="text-body">Aquí irá el gráfico de temperaturas</span>
      </div>
    </div>
  );
}
