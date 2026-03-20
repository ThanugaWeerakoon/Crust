import { useMemo, useState, useEffect } from "react";
import { MenuItem, CartItem, Category, Discount, Order } from "../types";
import {
  SearchIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UtensilsIcon,
  BanknoteIcon,
  ShoppingCartIcon,
} from "lucide-react";
import { Receipt } from "../components/ui/Receipt";

interface POSOrderProps {
  menuItems: MenuItem[];
  discounts: Discount[];
  onPlaceOrder: (
    order: Omit<Order, "firestoreId">,
    firestoreId?: string
  ) => void;
  editingOrder?: Order | null; // optional
}

export function POSOrder({
  menuItems,
  discounts,
  onPlaceOrder,
  editingOrder: propEditingOrder,
}: POSOrderProps) {
  // SPLIT BILL
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitQty, setSplitQty] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [tableNumber, setTableNumber] = useState("1");
  const [tableNameSet, setTableNameSet] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [showSavePopupSet, setShowSavePopupSet] = useState(false);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(true);
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>("");
  const [completedOrder, setCompletedOrder] = useState<Omit<
    Order,
    "firestoreId"
  > | null>(null);

  // 🔹 Load editing order
  useEffect(() => {
    if (propEditingOrder) {
      setCart(propEditingOrder.items || []);
      setIsTakeaway(propEditingOrder.isTakeaway || false);
      setTableNumber(propEditingOrder.tableNumber || "1");
      setSelectedDiscountId(propEditingOrder.discountId || "");
    }
  }, [propEditingOrder]);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [tableName, setTableName] = useState("");
  // ---------------- Cart Operations ----------------
  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing)
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      return [...prev, { ...item, quantity: 1 }];
    });
  };
  // ---------------- Calculations ----------------
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount = useMemo(() => {
    if (!selectedDiscountId || subtotal === 0) return 0;

    const discount = discounts.find((d) => d.id === selectedDiscountId);
    if (!discount) return 0;

    if (discount.type === "percentage") {
      return subtotal * (discount.value / 100);
    }

    return Math.min(discount.value, subtotal);
  }, [selectedDiscountId, subtotal, discounts]);

  const tax = serviceChargeEnabled ? (subtotal - discountAmount) * 0.1 : 0;

  const total = subtotal - discountAmount + tax;
  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  useEffect(() => {
    if (showSavePopup && tableName === "") {
      const nextTable = orders.length + 1;
      setTableNameSet(`Table-${nextTable.toString().padStart(2, "0")}`);
    }
  }, [showSavePopup]);

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const formatCurrency = (amount: number) =>
    `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

  // ---------------- Checkout ----------------
  const handleCheckout = (method: "Cash" | "Card" | "Online") => {
  if (cart.length === 0) return;

  const orderData: Omit<Order, "firestoreId"> = {
    id:
      propEditingOrder?.id ||
      `ORD-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
    items: [...cart],
    subtotal,
    tax,
    discount: discountAmount,
    ...(selectedDiscountId ? { discountId: selectedDiscountId } : {}),
    total,
    paymentMethod: method,
    isTakeaway,
    tableNumber: isTakeaway ? undefined : tableNumber,

    // ✅ Always mark as completed when checkout
    status: "Completed",

    date: new Date().toISOString(),
    cashier: "Chamod",
  };

  onPlaceOrder(orderData, propEditingOrder?.firestoreId);

  setCompletedOrder(orderData);
  setCart([]);
  setSelectedDiscountId("");
};

  const categories: (Category | "All")[] = [
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

  const handleSaveOrder = () => {
    if (cart.length === 0) return;

    const orderData: Omit<Order, "firestoreId"> = {
      id:
        propEditingOrder?.id ||
        `ORD-${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`,

      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      ...(selectedDiscountId ? { discountId: selectedDiscountId } : {}),
      total,

      paymentMethod: "Cash", 
      isTakeaway,

      tableNumber: isTakeaway ? undefined : tableName,

      status: "Pending", // important for OrderHistory

      date: new Date().toISOString(),
      cashier: "Chamod",
    };

    // send order to App.tsx → OrderHistory
    onPlaceOrder(orderData);

    // clear cart
    setCart([]);
    setSelectedDiscountId("");
    setTableName("");
    setShowSavePopup(false);
  };

  const handleSplitOrder = () => {
  if (cart.length === 0) return;

  const bill1: CartItem[] = [];
  const bill2: CartItem[] = [];

  cart.forEach((item) => {
    const qty = splitQty[item.id] || 0;

    if (qty > 0) {
      bill1.push({ ...item, quantity: qty });
    }

    if (item.quantity - qty > 0) {
      bill2.push({
        ...item,
        quantity: item.quantity - qty,
      });
    }
  });

  if (bill1.length === 0 || bill2.length === 0) {
    alert("Invalid split quantities");
    return;
  }

  const createOrder = (items: CartItem[]) => {
    const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);

    const discount = selectedDiscountId
      ? discountAmount * (sub / subtotal)
      : 0;

    const tax = serviceChargeEnabled ? (sub - discount) * 0.1 : 0;

    return {
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      items,
      subtotal: sub,
      discount,
      tax,
      total: sub - discount + tax,
      paymentMethod: "Cash",
      isTakeaway,
      tableNumber: isTakeaway ? undefined : tableName,
      status: "Pending",
      date: new Date().toISOString(),
      cashier: "Chamod",
    } as Omit<Order, "firestoreId">;
  };

  const order1 = createOrder(bill1);
  const order2 = createOrder(bill2);

  onPlaceOrder(order1);
  onPlaceOrder(order2);

  setCart([]);
  setSplitQty({});
  setShowSplitModal(false);
};

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(90vh-64px)] bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* LEFT: Menu */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Search + Categories */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-10">
          <div className="relative w-full sm:w-72 mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
<div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
  {categories.map((cat) => (
    <button
      key={cat}
      onClick={() => setActiveCategory(cat)}
      className={`flex-shrink-0 px-3 py-2 rounded-xl font-medium text-sm min-h-[44px] max-w-[100px] text-center break-words transition-colors ${
        activeCategory === cat
          ? "bg-amber-500 text-white shadow-md"
          : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
      }`}
    >
      {cat}
    </button>
  ))}
</div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={!item.available}
                className={`flex flex-col text-left bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 transition-all duration-200 min-h-[160px] ${
                  item.available
                    ? "hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-500/50 active:scale-95"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="h-24 w-full bg-amber-50 dark:bg-slate-700 flex items-center justify-center">
                  <UtensilsIcon className="h-8 w-8 text-amber-300 dark:text-slate-500" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart & Checkout */}
      <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 h-full">
        {/* Takeaway / Dine-in */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setIsTakeaway(false)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
              !isTakeaway
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-2 border-amber-500"
                : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-2 border-transparent"
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setIsTakeaway(true)}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors min-h-[44px] ${
              isTakeaway
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-2 border-amber-500"
                : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-2 border-transparent"
            }`}
          >
            Takeaway
          </button>
        </div>
        {/* 
        {!isTakeaway && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Table Number:
            </span>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-gray-100 dark:bg-slate-800 border-none rounded-lg py-2 px-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px]"
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Table {i + 1}
                </option>
              ))}
            </select>
          </div>
        )} */}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 space-y-4">
              <ShoppingCartIcon className="h-16 w-16 opacity-20" />
              <p className="font-medium">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700"
              >
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
                    className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout */}
        <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          <div className="mb-4">
            <select
              value={selectedDiscountId}
              onChange={(e) => setSelectedDiscountId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-3 px-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 min-h-[34px]"
            >
              <option value="">No Discount Applied</option>
              {discounts
                .filter((d) => d.enabled)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (
                    {d.type === "percentage" ? `${d.value}%` : `LKR ${d.value}`}
                    )
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span>Service Charge</span>

              <button
                onClick={() => setServiceChargeEnabled(!serviceChargeEnabled)}
                className={`px-2 py-1 text-xs rounded ${
                  serviceChargeEnabled
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {serviceChargeEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Service Charge (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
              <span>Total</span>
              <span className="text-amber-600 dark:text-amber-500">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowSplitModal(true)}
              disabled={cart.length === 0}
              className="flex w-full items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white p-3 rounded-xl font-medium transition-colors min-h-[34px]"
            >
              Split
            </button>
            <button
              onClick={() => setShowSavePopup(true)}
              disabled={cart.length === 0}
              className="flex w-full items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white p-3 rounded-xl font-medium transition-colors min-h-[34px]"
            >
              <BanknoteIcon className="h-5 w-5" />
              <span>Save</span>
            </button>
            {showSavePopup && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-80 space-y-4 shadow-lg">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Save Order
                  </h2>

                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Table Name"
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowSavePopup(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveOrder}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Save Order
                    </button>
                    
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => handleCheckout("Cash")}
              disabled={cart.length === 0}
              className="flex w-full items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white p-3 rounded-xl font-medium transition-colors min-h-[34px]"
            >
              <BanknoteIcon className="h-5 w-5" />
              <span>Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {completedOrder && (
        <Receipt
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}


      {showSplitModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl w-96 space-y-4">
      <h2 className="text-lg font-bold">Split Bill</h2>

      {cart.map((item) => (
        <div key={item.id} className="flex justify-between items-center">
          <span>
            {item.name} ({item.quantity})
          </span>

          <input
            type="number"
            min={0}
            max={item.quantity}
            value={splitQty[item.id] || 0}
            onChange={(e) =>
              setSplitQty({
                ...splitQty,
                [item.id]: Number(e.target.value),
              })
            }
            className="w-16 border border-gray-300 dark:border-slate-600 rounded px-2 py-1
            bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowSplitModal(false)}
          className="px-4 py-2 bg-gray-200 rounded dark:bg-red-600"
        >
          Cancel
        </button>

        <button
          onClick={handleSplitOrder}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Split Bill
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
