import React from 'react';
import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  ClockIcon,
  UtensilsIcon,
  TagIcon,
  BarChart3Icon,
  UsersIcon,
  PizzaIcon } from
'lucide-react';
interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}
import logo from "../../../assets/Logo.png";

export function Sidebar({
  currentPage,
  setCurrentPage,
  isMobileOpen,
  setIsMobileOpen
}: SidebarProps) {
  const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboardIcon
  },
  {
    id: 'pos',
    label: 'New Order (POS)',
    icon: ShoppingCartIcon
  },
  {
    id: 'history',
    label: 'Order History',
    icon: ClockIcon
  },
  {
    id: 'menu',
    label: 'Menu Management',
    icon: UtensilsIcon
  },
  {
    id: 'discounts',
    label: 'Discounts',
    icon: TagIcon
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3Icon
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: UsersIcon
  }];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setIsMobileOpen(false);
  };
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen &&
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setIsMobileOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-amber-500">
             <img 
                src={logo} 
                alt="CRUST Logo"
                className="h-12 w-12 object-contain"
              />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              CRUST
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}>

                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-amber-500' : ''}`} />

                {item.label}
              </button>);

          })}
        </nav>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-slate-800 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold">
              KP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                Chamod
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Supervisor
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>);

}