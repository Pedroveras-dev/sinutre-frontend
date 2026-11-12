//import { useState } from 'react';
import { SignOut } from '@phosphor-icons/react';
import { NAV_ITEMS } from '@/constants/navigation';
import { clearToken } from '@/lib/api';
import { SidebarBrand } from './SidebarBrand';
import { SidebarItem } from './SidebarItem';

interface SidebarProps {
  drawerId: string;
}

// Sai da conta: apaga o token salvo e recarrega na tela de login.
function logout() {
  clearToken();
  window.location.assign('/login');
}

export function Sidebar({ drawerId }: SidebarProps) {
 // const [activeId, setActiveId] = useState<string>('home');
  const expanded = true;

  return (
    <aside className="drawer-side z-50">
      <label
        htmlFor={drawerId}
        aria-label="Fechar menu"
        className="drawer-overlay"
      />
      <div
        className={`bg-base-100 flex flex-col min-h-full border-r border-base-200 shadow-sm transition-all duration-300 ${
          expanded ? 'w-64 items-start' : 'w-20 items-center'
        }`}
      >
        <SidebarBrand expanded={expanded} />
        <ul className="menu w-full grow pt-4 gap-2">
          {NAV_ITEMS.map(item => (
            <SidebarItem
              key={item.id}
              label={item.label}
              Icon={item.Icon}
              to={item.to}
              expanded={expanded}
            />
          ))}
        </ul>

        <ul className="menu w-full pb-4">
          <li>
            <button
              type="button"
              className="flex items-center gap-4 px-4 h-12"
              onClick={logout}
            >
              <SignOut size={22} />
              {expanded && <span>Sair</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
