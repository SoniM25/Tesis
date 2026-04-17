"use client";

import dynamic from "next/dynamic";

const MexicoMapClient = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[422px] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-gray-500 dark:text-gray-400">Cargando mapa...</div>
    </div>
  ),
});

export function MexicoMap() {
  return (
    <div className="col-span-12 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Ubicación - Apizaco, Tlaxcala
      </h2>
      <MexicoMapClient />
    </div>
  );
}
