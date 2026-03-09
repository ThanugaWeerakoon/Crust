import  { useMemo, useState } from 'react';
import { MenuItem, CartItem, Category, Discount, Order } from '../types';
import {
  SearchIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UtensilsIcon,  
  BanknoteIcon,
  ShoppingCartIcon } from
'lucide-react';
import { Receipt } from '../components/ui/Receipt';
interface POSOrderProps {
  menuItems: MenuItem[];
  discounts: Discount[];
  onPlaceOrder: (order: Order) => void;
}
export function POSOrder({
  menuItems,
  discounts,
  onPlaceOrder
}: POSOrderProps) {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [tableNumber, setTableNumber] = useState('1');
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const categories: (Category | 'All')[] = [
  'All',
  'Mocktails',
  'Smoothies',
  'Juice',
  'Milkshake',
  'Soft Drinks'
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.
      toLowerCase().
      includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);
  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
        i.id === item.id ?
        {
          ...i,
          quantity: i.quantity + 1
        } :
        i
        );
      }
      return [
      ...prev,
      {
        ...item,
        quantity: 1
      }];

    });
  };
  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
    prev.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty
        };
      }
      return item;
    })
    );
  };
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };
  const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2
  })}`;
  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = useMemo(() => {
    if (!selectedDiscountId || subtotal === 0) return 0;
    const discount = discounts.find((d) => d.id === selectedDiscountId);
    if (!discount) return 0;
    if (discount.type === 'percentage') {
      return subtotal * (discount.value / 100);
    }
    return Math.min(discount.value, subtotal);
  }, [selectedDiscountId, subtotal, discounts]);
  const tax = (subtotal - discountAmount) * 0.1; // 10% tax
  const total = subtotal - discountAmount + tax;
  const handleCheckout = (method: 'Cash' | 'Card' | 'Online') => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000).
      toString().
      padStart(4, '0')}`,
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod: method,
      isTakeaway,
      tableNumber: isTakeaway ? undefined : tableNumber,
      status: 'Completed',
      date: new Date().toISOString(),
      cashier: 'Kamal Perera' // Mock current user
    };
    onPlaceOrder(newOrder);
    setCompletedOrder(newOrder);
    // Reset form
    setCart([]);
    setNotes('');
    setSelectedDiscountId('');
  };
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* LEFT SIDE: Menu Items (65%) */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Top Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />

            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) =>
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                  px-6 py-3 rounded-full font-medium whitespace-nowrap transition-colors min-h-[44px]
                  ${activeCategory === cat ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'}
                `}>

                {cat}
              </button>
            )}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) =>
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              disabled={!item.available}
              className={`
                  flex flex-col text-left bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700
                  transition-all duration-200 min-h-[160px]
                  ${item.available ? 'hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-500/50 active:scale-95' : 'opacity-50 cursor-not-allowed'}
                `}>

                <div className="h-24 w-full bg-amber-50 dark:bg-slate-700 flex items-center justify-center">
                  <UtensilsIcon className="h-8 w-8 text-amber-300 dark:text-slate-500" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(item.price)}
                    </span>
                    {!item.available &&
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-100 dark:bg-rose-500/20 px-2 py-1 rounded-md">
                        Out
                      </span>
                  }
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Cart & Checkout (35%) */}
      <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 h-full">
        {/* Order Settings */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setIsTakeaway(false)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${!isTakeaway ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-2 border-amber-500' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-2 border-transparent'}`}>

            Dine In
          </button>
          <button
            onClick={() => setIsTakeaway(true)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${isTakeaway ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-2 border-amber-500' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-2 border-transparent'}`}>

            Takeaway
          </button>
        </div>

        {!isTakeaway &&
        <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Table Number:
            </span>
            <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="bg-gray-100 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]">

              {[...Array(20)].map((_, i) =>
            <option key={i + 1} value={i + 1}>
                  Table {i + 1}
                </option>
            )}
            </select>
          </div>
        }

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ?
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 space-y-4">
              <ShoppingCartIcon className="h-16 w-16 opacity-20" />
              <p className="font-medium">Cart is empty</p>
            </div> :

          cart.map((item) =>
          <div
            key={item.id}
            className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700">

                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.name}
                    </h4>
                    <p className="text-amber-600 dark:text-amber-400 font-medium text-sm">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors">

                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center">

                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center">

                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
          )
          }
        </div>

        {/* Summary & Checkout */}
        <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="mb-4">
            <select
              value={selectedDiscountId}
              onChange={(e) => setSelectedDiscountId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-3 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]">

              <option value="">No Discount Applied</option>
              {discounts.
              filter((d) => d.enabled).
              map((d) =>
              <option key={d.id} value={d.id}>
                    {d.name} (
                    {d.type === 'percentage' ? `${d.value}%` : `LKR ${d.value}`}
                    )
                  </option>
              )}
            </select>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 &&
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            }
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
              <span>Total</span>
              <span className="text-amber-600 dark:text-amber-500">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCheckout('Cash')}
              disabled={cart.length === 0}
              className=" flex flex-col items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white p-3 rounded-xl font-medium transition-colors min-h-[64px]">

              <BanknoteIcon className="h-5 w-5" />
              <span>Checkout</span>
            </button>

           
          </div>
        </div>
      </div>

      {completedOrder &&
      <Receipt
        order={completedOrder}
        onClose={() => setCompletedOrder(null)} />

      }
    </div>);

}