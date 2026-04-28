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

  const handlePrint = async () => {
    const ESC = "\x1b";
    const GS  = "\x1d";

    // Fetch logo and convert to base64
    const getBase64Logo = async (): Promise<string> => {
      const response = await fetch(LOGO_URL);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    };

    const logoBase64 = await getBase64Logo();

    let receipt = "";

    // Initialize printer
    receipt += ESC + "@";

    // Logo centered
    receipt += "[C]<img>" + logoBase64 + "</img>\n";

    // Restaurant info centered
    receipt += "[C]<b>CRUST</b>\n";
    receipt += "[C]Crust Pizza Ahangama\n";
    receipt += "[C]Tel: +94 77 074 7446\n";
    receipt += "[C]--------------------------------\n";

    // Order info left aligned
    receipt += ESC + "a" + "\x00"; // left align
    receipt += `Order ID : ${order.id}\n`;
    receipt += `Date     : ${new Date(order.date).toLocaleString()}\n`;
    receipt += `Cashier  : ${order.cashier}\n`;
    receipt += `Type     : ${order.isTakeaway ? "TAKEAWAY" : `TABLE ${order.tableNumber}`}\n`;
    receipt += "--------------------------------\n";

    // Column headers
    receipt += "Qty  Item                  Amount\n";
    receipt += "--------------------------------\n";

    // Items
    order.items.forEach(item => {
      const qty    = item.quantity.toString().padEnd(5);
      const name   = item.name.length > 14
        ? item.name.substring(0, 14)
        : item.name.padEnd(14);
      const amount = `LKR ${(item.price * item.quantity).toFixed(2)}`.padStart(13);
      receipt += `${qty}${name}${amount}\n`;
      if (item.notes) {
        receipt += `     Note: ${item.notes}\n`;
      }
    });

    receipt += "--------------------------------\n";

    // Totals
    const labelW = 20;
    const valueW = 12;

    const line = (label: string, value: string) => {
      return label.padEnd(labelW) + value.padStart(valueW) + "\n";
    };

    receipt += line("Subtotal", `LKR ${order.subtotal.toFixed(2)}`);
    if (order.discount > 0) {
      receipt += line("Discount", `-LKR ${order.discount.toFixed(2)}`);
    }
    receipt += line("Service (10%)", `LKR ${order.tax.toFixed(2)}`);
    receipt += "--------------------------------\n";

    // Bold total
    receipt += "[C]<b>" + `TOTAL: LKR ${order.total.toFixed(2)}` + "</b>\n";
    receipt += "--------------------------------\n";

    receipt += line("Payment", order.paymentMethod);

    // Footer
    receipt += "\n";
    receipt += "[C]Thank you for dining with us!\n";
    receipt += "[C]Please visit again!\n";

    // Feed and cut
    receipt += "\n\n\n";
    receipt += GS + "V" + "\x41" + "\x00"; // feed and full cut

    // Send to RawBT
    window.location.href = `rawbt://${encodeURIComponent(receipt)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-1 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Receipt Preview</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1">
          <div className="print-area p-2 bg-white text-black" id="printable-receipt">

            {/* Logo */}
            <div className="text-center">
              <div className="flex justify-center">
                <img
                  src={LOGO_URL}
                  alt="CRUST Logo"
                  className="h-24 w-24 object-contain"
                />
              </div>
            </div>

            {/* Order Info */}
            <div className="border-t border-dashed border-gray-400 py-2 text-xs">
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
                <span>{order.isTakeaway ? 'TAKEAWAY' : `TABLE ${order.tableNumber}`}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-t border-dashed border-gray-400 py-2">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pb-1">Qty</th>
                    <th className="text-left pb-1">Item</th>
                    <th className="text-right pb-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-0.5">{item.quantity}</td>
                      <td className="py-0.5 pr-1">
                        <div>{item.name}</div>
                        {item.notes && (
                          <div className="text-[10px] text-gray-500 italic">
                            {item.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-0.5 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div className="flex justify-between font-bold text-sm border-t border-black mt-1 pt-1">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between mt-2 text-gray-600">
                <span>Payment</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs mt-2">
              <p className="font-medium">Thank you!</p>
              <p className="text-gray-500">Visit again</p>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex gap-3">
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
    </div>
  );
}