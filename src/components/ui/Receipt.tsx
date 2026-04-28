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
  const printContents = document.getElementById('printable-receipt')?.innerHTML;
  if (!printContents) return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <html>
      <head>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: monospace; font-size: 12px; padding: 8px; color: black; }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .font-medium { font-weight: 500; }
          .font-bold { font-weight: 700; }
          .text-xs { font-size: 11px; }
          .text-sm { font-size: 13px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
          .pb-1 { padding-bottom: 4px; }
          .pr-1 { padding-right: 4px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .pt-1 { padding-top: 4px; }
          .border-t { border-top: 1px solid; }
          .border-black { border-color: black; }
          .border-dashed { border-style: dashed; }
          .border-gray-400 { border-color: #9ca3af; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .italic { font-style: italic; }
          .text-\\[10px\\] { font-size: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; }
          .text-right { text-align: right; }
          img { height: 96px; width: 96px; object-fit: contain; display: block; margin: 0 auto; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `);
  doc.close();

  // Wait for image to load before printing
  const img = iframe.contentWindow?.document.querySelector('img');
  const triggerPrint = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  if (img) {
    img.onload = triggerPrint;
    img.onerror = triggerPrint; // print anyway if image fails
  } else {
    triggerPrint();
  }
};


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-1 border-b border-gray-200  dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Receipt Preview</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable preview */}
       <div className="flex-1">
          <div className="print-area p-2 bg-white text-black" id="printable-receipt">
            
            {/* Logo */}
            <div className="text-center"> {/* removed mb-3 */}
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