import { Order } from '../../types';
import { PrinterIcon, XIcon } from 'lucide-react';

const LOGO_URL = "https://bheduvpljuxhovkeqtye.supabase.co/storage/v1/object/public/artists/LogoRec.jpeg";

interface ReceiptProps {
  order: Omit<Order, "firestoreId">;
  onClose: () => void;
}

export function Receipt({ order, onClose }: ReceiptProps) {

  const handlePrint = () => {
    const printContents = document.getElementById("printable-receipt")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank", "width=400,height=700");
    if (!printWindow) {
      alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.id}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              color: #000;
              background: #fff;
              padding: 12px;
              width: 100%;
            }

            /* Layout utilities */
            .text-center { text-align: center; }
            .text-right  { text-align: right; }
            .text-left   { text-align: left; }
            .flex        { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center  { justify-content: center; }

            /* Spacing */
            .mb-1  { margin-bottom: 4px; }
            .mb-2  { margin-bottom: 8px; }
            .mb-3  { margin-bottom: 12px; }
            .mt-1  { margin-top: 4px; }
            .mt-2  { margin-top: 8px; }
            .pt-1  { padding-top: 4px; }
            .py-2  { padding-top: 8px; padding-bottom: 8px; }
            .py-0-5 { padding-top: 2px; padding-bottom: 2px; }
            .pb-1  { padding-bottom: 4px; }
            .pr-1  { padding-right: 4px; }
            .p-2   { padding: 8px; }

            /* Typography */
            .text-xs   { font-size: 11px; }
            .text-sm   { font-size: 12px; }
            .text-base { font-size: 14px; }
            .font-bold   { font-weight: bold; }
            .font-medium { font-weight: 600; }
            .italic      { font-style: italic; }

            /* Colors */
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }

            /* Borders */
            .border-t        { border-top: 1px solid; }
            .border-dashed   { border-style: dashed !important; }
            .border-gray-400 { border-color: #9ca3af; }
            .border-gray-800 { border-color: #1f2937; }

            /* Image */
            .logo-wrap {
              display: flex;
              justify-content: center;
              margin-bottom: 4px;
            }
            .logo-wrap img {
              height: 88px;
              width: 88px;
              object-fit: contain;
            }

            /* Table */
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th {
              text-align: left;
              padding-bottom: 4px;
              font-weight: bold;
            }
            th:last-child { text-align: right; }
            td { padding: 2px 0; vertical-align: top; }
            td:last-child { text-align: right; white-space: nowrap; }

            /* Divider sections */
            .section {
              border-top: 1px dashed #9ca3af;
              padding: 8px 0;
              margin-bottom: 8px;
            }

            /* Total row */
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 15px;
              font-weight: bold;
              border-top: 1px solid #1f2937;
              padding-top: 4px;
              margin-top: 4px;
            }

            /* Footer */
            .footer {
              text-align: center;
              font-size: 12px;
              margin-top: 8px;
            }

            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                width: 80mm;
                padding: 8px;
              }
            }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onload = function () {
              window.focus();
              window.print();
              window.onafterprint = function () { window.close(); };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Receipt Preview</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable preview */}
        <div className="overflow-y-auto flex-1">
          <div className="print-area p-2 bg-white text-black" id="printable-receipt">

            {/* Logo */}
            <div className="text-center mb-3">
              <div className="logo-wrap flex justify-center mb-1">
                <img
                  src={LOGO_URL}
                  alt="CRUST Logo"
                  className="h-24 w-24 object-contain"
                />
              </div>
            </div>

            {/* Order Info */}
            <div className="section text-xs">
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
            <div className="section">
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
                          <div className="text-[10px] text-gray-500 italic">{item.notes}</div>
                        }
                      </td>
                      <td className="py-0.5 text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="section text-xs">
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
              <div className="total-row">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between mt-2 text-gray-600">
                <span>Payment</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="footer text-center text-xs">
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