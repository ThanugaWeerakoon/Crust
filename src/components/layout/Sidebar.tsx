import React from 'react';
import logo from "../../../assets/Logo.png";

const categories = [
  "Add Ons",
  "Beer",
  "Mocktails",
  "Milkshake",
  "Juice",
  "Pizza",
  "Tacos",
  "The Classics",
  "To Share",
  "Smoothies",
  "Salads",
  "Soft Drinks",
  "Sweets",
  "Wines",
];

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
}

export function Sidebar({
  activeCategory,
  setActiveCategory
}: SidebarProps) {

  return (
    <aside
      className="
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
        flex flex-col
      "
    >

      {/* Logo */}
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

      {/* Categories */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition
                ${
                  isActive
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500"
                    : "text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
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
  );
}