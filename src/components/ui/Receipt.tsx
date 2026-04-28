import { Order } from '../../types';
import { PrinterIcon, XIcon } from 'lucide-react';

const LOGO_URL = "https://bheduvpljuxhovkeqtye.supabase.co/storage/v1/object/public/artists/LogoRec.jpeg";

interface ReceiptProps {
  order: Omit<Order, "firestoreId">;
  onClose: () => void;
}

export function Receipt({ order, onClose }: ReceiptProps) {

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  const handlePrint = () => {

    const line = "--------------------------------\n";

    const formatLine = (left: string, right: string) => {
      const totalWidth = 32;
      const space = totalWidth - left.length - right.length;
      return left + " ".repeat(space > 0 ? space : 1) + right + "\n";
    };

    const formatItem = (name: string, qty: number, price: number) => {
      const total = (qty * price).toFixed(2);
      let lines = "";

      const qtyText = qty.toString() + "x ";
      const maxNameLength = 30 - qtyText.length;

      if (name.length > maxNameLength) {
        const firstLine = name.substring(0, maxNameLength);
        const secondLine = name.substring(maxNameLength);

        lines += `[L]${qtyText}${firstLine}\n`;
        lines += `[L]   ${secondLine}\n`;
      } else {
        lines += `[L]${qtyText}${name}\n`;
      }

      lines += formatLine("", `LKR ${total}`);
      return lines;
    };

    let receipt = "";

    // ===== HEADER =====
    receipt += "[C]<b><font size='big'>CRUST</font></b>\n";
    receipt += "[C]Crust Pizza Ahangama\n";
    receipt += "[C]Tel: +94 77 074 7446\n";
    receipt += `[C]${line}`;

    // ===== ORDER INFO =====
    receipt += `[L]Order ID : ${order.id}\n`;
    receipt += `[L]Date     : ${new Date(order.date).toLocaleString()}\n`;
    receipt += `[L]Cashier  : ${order.cashier}\n`;
    receipt += `[L]Type     : ${order.isTakeaway ? "TAKEAWAY" : `TABLE ${order.tableNumber}`}\n`;

    receipt += `[C]${line}`;

    // ===== ITEMS =====
    order.items.forEach(item => {
      receipt += formatItem(item.name, item.quantity, item.price);

      if (item.notes) {
        receipt += `[L]   > ${item.notes}\n`;
      }
    });

    receipt += `[C]${line}`;

    // ===== TOTALS =====
    receipt += formatLine("Subtotal", `LKR ${order.subtotal.toFixed(2)}`);

    if (order.discount > 0) {
      receipt += formatLine("Discount", `-LKR ${order.discount.toFixed(2)}`);
    }

    receipt += formatLine("Service (10%)", `LKR ${order.tax.toFixed(2)}`);

    receipt += `[C]${line}`;

    // ===== BIG TOTAL =====
    receipt += `[L]<b><font size='big'>TOTAL</font></b>` +
               `[R]<b><font size='big'>LKR ${order.total.toFixed(2)}</font></b>\n`;

    receipt += `[C]${line}`;

    // ===== PAYMENT =====
    receipt += formatLine("Payment", order.paymentMethod);

    // ===== FOOTER =====
    receipt += "\n";
    receipt += "[C]Thank you for dining with us!\n";
    receipt += "[C]Please visit again!\n";

    receipt += "\n\n\n";

    // 🔥 Send to RawBT
    window.location.href = `rawbt:print?text=${encodeURIComponent(receipt)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Receipt Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 bg-white text-black">

            {/* Logo */}
            <div className="flex justify-center py-2">
              <img
                src={LOGO_URL}
                alt="CRUST Logo"
                className="h-24 w-24 object-contain"
              />
            </div>

            {/* Restaurant Info */}
            <div className="text-center text-xs mb-1">
              <p className="font-bold text-sm">CRUST</p>
              <p>Crust Pizza Ahangama</p>
              <p>Tel: +94 77 074 7446</p>
            </div>

            {/* Order Info */}
            <div className="border-t border-dashed border-gray-400 py-2 text-xs">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span>{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(order.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{order.cashier}</span>
              </div>
              <div className="flex justify-between font-bold mt-1 text-sm">
                <span>Type:</span>
                <span>
                  {order.isTakeaway ? 'TAKEAWAY' : `TABLE ${order.tableNumber}`}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-dashed border-gray-400 py-2 text-xs">
              {order.items.map((item, i) => (
                <div key={i} className="mb-1">
                  <div className="flex justify-between">
                    <span>{item.quantity} x {item.name}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-gray-500 italic ml-2">
                      {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-400 py-2 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Service (10%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>

              <div className="flex justify-between font-bold border-t border-black mt-1 pt-1">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
              </div>

              <div className="flex justify-between mt-2 text-gray-600">
                <span>Payment</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs mt-2 pb-2">
              <p className="font-medium">Thank you!</p>
              <p className="text-gray-500">Visit again</p>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-slate-700 hover:bg-gray-50"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-lg bg-amber-500 text-white hover:bg-amber-600 flex items-center justify-center gap-2"
          >
            <PrinterIcon className="h-5 w-5" />
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}