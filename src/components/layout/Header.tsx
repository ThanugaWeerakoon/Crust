import React from 'react';
import { MenuIcon } from 'lucide-react';
import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  ClockIcon,
  UtensilsIcon,
  TagIcon,
  BarChart3Icon,
  UsersIcon,
  LogOutIcon
} from 'lucide-react';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';
import { Staff } from '../../types';

interface HeaderProps {
  title: string;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onMenuClick: () => void;
  userRole: Staff['role'] | null;
}

export function Header({
  title,
  currentPage,
  setCurrentPage,
  onMenuClick,
  userRole
}: HeaderProps) {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    { id: 'pos', label: 'New Order', icon: ShoppingCartIcon },
    { id: 'history', label: 'History', icon: ClockIcon },
    { id: 'menu', label: 'Menu', icon: UtensilsIcon },
    { id: 'discounts', label: 'Discounts', icon: TagIcon },
    { id: 'reports', label: 'Reports', icon: BarChart3Icon },
    { id: 'staff', label: 'Staff', icon: UsersIcon }
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!userRole) return false;
    if (userRole === 'Admin') return true;
    if (userRole === 'Cashier') return item.id !== 'dashboard';
    if (userRole === 'Biller') return item.id === 'history';
    return false;
  });

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h1>
      </div>

      {/* Navigation (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 overflow-x-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${
                  isActive
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500'
                    : 'text-slate-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
      
      {/* Right */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOutIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

    </header>
  );
}