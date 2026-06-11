import * as Icons from "../icons";

interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url?: string;
  icon: any;
  items: NavSubItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Datos historicos",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Mejores momentos",
        url: "/charts/basic-chart",
        icon: Icons.PieChart,
        items: [],
      },
      {
        title: "Glosario",
        url: "/ui-elements/alerts",
        icon: Icons.FourCircle,
        items: [],
      },
    ],
  },
];