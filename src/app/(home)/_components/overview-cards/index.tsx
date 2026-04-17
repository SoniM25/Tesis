import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { views, profit, products, users } = await getOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="17/04/2026"
        data={{
          value: "Fecha",
          growthRate: 0,
        }}
        Icon={icons.Views}
      />

      <OverviewCard
        label="0 a 90°"
        data={{
          value: "Latitud, Longitud°",
          growthRate: 0,
        }}
        Icon={icons.Location}
      />

      <OverviewCard
        label="kWp"
        data={{
          ...products,
          value: "Potencia PV",
          growthRate: "" as any,
        }}
        Icon={icons.Sun}
      />

      <OverviewCard
        label="°"
        data={{
          ...users,
          value: "Orientación e Inclinación",
          growthRate:"" as any, //orientacion de paneles solares en México
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
