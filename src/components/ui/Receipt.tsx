
import { Order } from '../../types';
import { PrinterIcon, XIcon, PizzaIcon } from 'lucide-react';
import logo from "../../../assets/LogoRec.jpeg";

interface ReceiptProps {
  order: Omit<Order, "firestoreId">;
  onClose: () => void;
}


export function Receipt({ order, onClose }: ReceiptProps) {
const handlePrint = async () => {
  const RAWBT_URL = "http://localhost:8080"; // RawBT default — change if different

  // Build ESC/POS text receipt
  const ESC = "\x1B";
  const LF = "\n";
  const BOLD_ON = `${ESC}E\x01`;
  const BOLD_OFF = `${ESC}E\x00`;
  const CENTER = `${ESC}a\x01`;
  const LEFT = `${ESC}a\x00`;
  const CUT = `${ESC}i`;

  const pad = (left: string, right: string, width = 32) => {
    const gap = width - left.length - right.length;
    return left + " ".repeat(Math.max(gap, 1)) + right;
  };

  let receipt = "";

  // Header
  receipt += CENTER;
  receipt += BOLD_ON + "CRUST" + BOLD_OFF + LF;
  receipt += LF;

  // Order info
  receipt += LEFT;
  receipt += pad("Order ID:", order.id) + LF;
  receipt += pad("Date:", new Date(order.date).toLocaleString()) + LF;
  receipt += pad("Cashier:", order.cashier) + LF;
  receipt += BOLD_ON;
  receipt += pad("Type:", order.isTakeaway ? "TAKEAWAY" : `TABLE ${order.tableNumber}`) + LF;
  receipt += BOLD_OFF;
  receipt += "--------------------------------" + LF;

  // Items
  for (const item of order.items) {
    const amount = `LKR ${(item.price * item.quantity).toFixed(2)}`;
    receipt += pad(`${item.quantity}x ${item.name}`, amount) + LF;
    if (item.notes) {
      receipt += `   (${item.notes})` + LF;
    }
  }

  receipt += "--------------------------------" + LF;

  // Totals
  receipt += pad("Subtotal", `LKR ${order.subtotal.toFixed(2)}`) + LF;
  if (order.discount > 0) {
    receipt += pad("Discount", `-LKR ${order.discount.toFixed(2)}`) + LF;
  }
  receipt += pad("Service (10%)", `LKR ${order.tax.toFixed(2)}`) + LF;
  receipt += "--------------------------------" + LF;
  receipt += BOLD_ON;
  receipt += pad("TOTAL", `LKR ${order.total.toFixed(2)}`) + LF;
  receipt += BOLD_OFF;
  receipt += pad("Payment", order.paymentMethod) + LF;
  receipt += "--------------------------------" + LF;

  // Footer
  receipt += CENTER;
  receipt += "Thank you!" + LF;
  receipt += "Visit again" + LF;
  receipt += LF + LF + LF;
  receipt += CUT;

  try {
    await fetch(`${RAWBT_URL}/rawbt`, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
      body: receipt,
    });
  } catch (err) {
    console.error("RawBT print failed:", err);
    alert("Could not connect to RawBT. Make sure the app is open on your tablet and on the same network.");
  }
};

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', {
      minimumFractionDigits: 2
    })}`;
  };
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Not printed */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-800 print:hidden">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Receipt Preview
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">

            <XIcon className="h-5 w-5" />
          </button>
        </div>

      <div
  className="print-area p-2 bg-white text-black"
  id="printable-receipt"
>

 <div className="text-center mb-3">
  <div className="flex justify-center mb-1">
    <img 
      src={logo} 
      alt="CRUST Logo"
      className="h-24 w-24 object-contain"
    />
  </div>
</div>

  <div className="border-t border-dashed border-gray-400 py-2 mb-2 text-xs">
    <div className="flex justify-between">
      <span>Order ID:</span>
      <span className="font-medium">{order.id}</span>
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

  <div className="border-t border-dashed border-gray-400 py-2 mb-2">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left">
          <th className="pb-1">Qty</th>
          <th className="pb-1">Item</th>
          <th className="pb-1 text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {order.items.map((item, index) =>
          <tr key={index}>
            <td className="py-0.5">{item.quantity}</td>
            <td className="py-0.5 pr-1">
              <div>{item.name}</div>
              {item.notes &&
                <div className="text-[10px] text-gray-500 italic">
                  {item.notes}
                </div>
              }
            </td>
            <td className="py-0.5 text-right">
              {formatCurrency(item.price * item.quantity)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  <div className="border-t border-dashed border-gray-400 py-2 mb-2 text-xs">
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span>{formatCurrency(order.subtotal)}</span>
    </div>

    {order.discount > 0 &&
      <div className="flex justify-between text-gray-600">
        <span>Discount</span>
        <span>-{formatCurrency(order.discount)}</span>
      </div>
    }

    <div className="flex justify-between">
      <span>Service (10%)</span>
      <span>{formatCurrency(order.tax)}</span>
    </div>

    <div className="flex justify-between text-base font-bold border-t border-gray-800 pt-1 mt-1">
      <span>TOTAL</span>
      <span>{formatCurrency(order.total)}</span>
    </div>

    <div className="flex justify-between mt-2 text-gray-600">
      <span>Payment</span>
      <span className="font-medium">{order.paymentMethod}</span>
    </div>
  </div>

  <div className="text-center text-xs">
    <p className="font-medium">Thank you!</p>
    <p className="text-gray-500">Visit again</p>
  </div>

</div>

        {/* Footer Actions - Not printed */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">

            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-lg font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">

            <PrinterIcon className="h-5 w-5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>);

}

