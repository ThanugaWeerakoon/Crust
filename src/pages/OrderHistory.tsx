import React, { useState } from 'react';
import { db } from "../../firebase";
import {
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { SearchIcon, PrinterIcon } from 'lucide-react';
import { Receipt } from '../components/ui/Receipt';


interface OrderHistoryProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onEditOrder?: (order: Order) => void; // 🔹 optional callback
}


export function OrderHistory({ orders, setOrders , onEditOrder }: OrderHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | 'Completed' | 'Refunded'>(
    'All');
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [editingOrder, setEditingOrder] = useState<Order | null>(null);
const filteredOrders = [...orders]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .filter((order) => {
    const matchesSearch = order.id
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) =>
  `LKR ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2
  })}`;

const navigate = useNavigate();


  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none" />

        </div>

        <div className="flex gap-2">
          {['All', 'Completed', 'Refunded'].map((status) =>
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`
                px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px]
                ${statusFilter === status ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}
              `}>

              {status}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredOrders.map((order) =>
              <tr
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">

                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    {order.id}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(order.date).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {order.isTakeaway ?
                  'Takeaway' :
                  `Table ${order.tableNumber}`}
                  </td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="p-4">
                    <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                      ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'}
                    `}>

                      {order.status}
                    </span>
                  </td>
                              <td className="p-4 text-right space-x-2">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                  title="View Receipt"
                >
                  <PrinterIcon className="h-4 w-4" />
                </button>

                            <button
                onClick={() => {
                  if (onEditOrder) onEditOrder(order);
                }}
                className="p-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                title="Edit Order"
              >
                ✏️
              </button>
              </td>
                </tr>
                
              )}
            </tbody>
          </table>
          {editingOrder && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Edit Order {editingOrder.id}
        </h2>
        <button onClick={() => setEditingOrder(null)}>✖️</button>
      </div>

      {/* Editable fields */}
      <label className="block text-sm font-medium">Table Number / Takeaway</label>
      {!editingOrder.isTakeaway && (
        <input
          type="text"
          value={editingOrder.tableNumber || ""}
          onChange={(e) =>
            setEditingOrder({
              ...editingOrder,
              tableNumber: e.target.value, // string or empty
            })
          }
          className="w-full border rounded-lg p-2 dark:bg-slate-900"
        />
      )}

      <label className="block text-sm font-medium">Status</label>
      <select
        value={editingOrder.status}
        onChange={(e) =>
          setEditingOrder({
            ...editingOrder,
            status: e.target.value as Order["status"],
          })
        }
        className="w-full border rounded-lg p-2 dark:bg-slate-900"
      >
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Refunded">Refunded</option>
      </select>

      {/* Save / Cancel */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setEditingOrder(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            if (!editingOrder) return;

            const docId = editingOrder.firestoreId;
            if (!docId) {
              console.error("Cannot update order: missing Firestore ID");
              return;
            }

            try {
              // Update Firestore using the actual doc ID
              await updateDoc(doc(db, "orders", editingOrder.firestoreId), {
                tableNumber: editingOrder.tableNumber || null,
                status: editingOrder.status,
              });

              // Update local state
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === editingOrder.id
                    ? { ...o, tableNumber: editingOrder.tableNumber, status: editingOrder.status }
                    : o
                )
              );

              setEditingOrder(null);
            } catch (error) {
              console.error("Error updating order:", error);
            }
          }}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

        </div>
        
      </div>

      {selectedOrder &&
      <Receipt order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      }
    </div>);

}