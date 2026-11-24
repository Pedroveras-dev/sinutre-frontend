import type { Icon } from '@phosphor-icons/react';
import {
  AppleLogo,
  //Barbell,
  ChartLineUp,
  Gear,
  House,
} from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  Icon: Icon;
  to: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Início', Icon: House, to: "/" },
  { id: 'diet', label: 'Dieta', Icon: AppleLogo, to: "/foods" },
  // { id: 'activities', label: 'Atividades', Icon: Barbell, to: "/" },
  { id: 'progress', label: 'Métricas', Icon: ChartLineUp, to: "/stats" },
  { id: 'settings', label: 'Configurações', Icon: Gear, to:"/settings" },
] as const;
