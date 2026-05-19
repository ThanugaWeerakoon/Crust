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
  onDeleteOrder?: (firestoreId: string) => void;
  editingOrder?: Order | null; // optional
  activeCategory: string;
}

export function POSOrder({
  menuItems,
  discounts,
  onPlaceOrder,
  onDeleteOrder,
  editingOrder: propEditingOrder,
  activeCategory
}: POSOrderProps) {
  // SPLIT BILL
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitQty, setSplitQty] = useState<Record<string, number>>({});

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
  const [tableNameError, setTableNameError] = useState(false);
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


  const handleSaveOrder = () => {
    if (cart.length === 0) return;
    
    if (!tableName.trim()) {
      setTableNameError(true);
      return;
    }
    setTableNameError(false);

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
    onPlaceOrder(orderData, propEditingOrder?.firestoreId);

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

    if (propEditingOrder && propEditingOrder.firestoreId && onDeleteOrder) {
      onDeleteOrder(propEditingOrder.firestoreId);
    }

    setCart([]);
    setSplitQty({});
    setShowSplitModal(false);
  };

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        const matchesCategory =
          activeCategory === "All" || item.category === activeCategory;

        const matchesSearch = item.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
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
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-lg">
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
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setIsTakeaway(false)}
            className={`flex-1 py-3 rounded-lg font-bold text-lg transition-colors min-h-[44px] ${
              !isTakeaway
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-2 border-amber-500"
                : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-2 border-transparent"
            }`}
          >
            Dine In
          </button>
          <button
            onClick={() => setIsTakeaway(true)}
            className={`flex-1 py-3 rounded-lg font-bold text-lg transition-colors min-h-[44px] ${
              isTakeaway
                ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-2 border-amber-500"
                : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border-2 border-transparent"
            }`}
          >
            Takeaway
          </button>
        </div>

        {/* Cart Items */}
        <div className="h-[cal(100vh-280px)] overflow-y-auto p-4 space-y-3">
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
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {item.name}
                    </h4>
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-base">
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
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
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
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-3 px-4 text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 min-h-[34px]"
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

          <div className="space-y-3 mb-4 text-base">
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
            <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
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

                  <div className="space-y-1">
                    <input
                      type="text"
                      value={tableName}
                      onChange={(e) => {
                        setTableName(e.target.value);
                        if (e.target.value.trim()) setTableNameError(false);
                      }}
                      placeholder="Table Name"
                      className={`w-full border rounded-lg p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all ${
                        tableNameError 
                          ? "border-rose-500 ring-2 ring-rose-500/20" 
                          : "border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
                      }`}
                    />
                    {tableNameError && (
                      <p className="text-rose-500 text-xs font-bold ml-1 animate-pulse">
                        ⚠️ Table name is required to save
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowSavePopup(false);
                        setTableNameError(false);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl w-full max-w-2xl space-y-6 shadow-2xl border border-gray-100 dark:border-slate-700 transform transition-all">
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-700/50 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Split Bill</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Adjust quantities below to split the selected items into a separate bill.
                </p>
              </div>
              <button 
                onClick={() => setShowSplitModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {cart.map((item) => {
                const currentQty = splitQty[item.id] || 0;
                return (
                  <div 
                    key={item.id} 
                    className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800"
                  >
                    <div className="flex-1">
                      <span className="font-bold text-lg text-slate-900 dark:text-white block">
                        {item.name}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Original Qty: {item.quantity} | Split Qty: {currentQty}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        onClick={() =>
                          setSplitQty({
                            ...splitQty,
                            [item.id]: 0,
                          })
                        }
                        disabled={currentQty === 0}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                      >
                        Reset
                      </button>

                      <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <button
                          onClick={() => {
                            const newQty = Math.max(0, currentQty - 1);
                            setSplitQty({
                              ...splitQty,
                              [item.id]: newQty,
                            });
                          }}
                          disabled={currentQty <= 0}
                          className="h-12 w-12 flex items-center justify-center font-bold text-xl text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>

                        <span className="w-12 text-center font-black text-xl text-slate-900 dark:text-white">
                          {currentQty}
                        </span>

                        <button
                          onClick={() => {
                            const newQty = Math.min(item.quantity, currentQty + 1);
                            setSplitQty({
                              ...splitQty,
                              [item.id]: newQty,
                            });
                          }}
                          disabled={currentQty >= item.quantity}
                          className="h-12 w-12 flex items-center justify-center font-bold text-xl text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setSplitQty({
                            ...splitQty,
                            [item.id]: item.quantity,
                          })
                        }
                        disabled={currentQty === item.quantity}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                      >
                        Max
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-150 dark:border-slate-700/50">
              <button
                onClick={() => setShowSplitModal(false)}
                className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-lg active:scale-[0.98] transition-all min-h-[50px] flex items-center justify-center"
              >
                Cancel
              </button>

              <button
                onClick={handleSplitOrder}
                className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all min-h-[50px] flex items-center justify-center"
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
