
import { Order } from '../../types';
import { PrinterIcon, XIcon, PizzaIcon } from 'lucide-react';
import logo from "../../../assets/Logo.png";

interface ReceiptProps {
  order: Omit<Order, "firestoreId">;
  onClose: () => void;
}


export function Receipt({ order, onClose }: ReceiptProps) {
const handlePrint = () => {

  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.quantity}</td>
      <td>${item.name}</td>
      <td style="text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const receiptHTML = `
  <html>
  <head>
  <meta charset="UTF-8">
  <style>
    body{
      width:384px;
      font-family:Arial;
      text-align:center;
      margin:0;
      padding:10px;
    }
    table{
      width:100%;
      border-collapse:collapse;
      margin-top:5px;
    }
    th,td{
      font-size:14px;
      padding:2px 0;
    }
    th{
      border-bottom:1px dashed black;
    }
    .right{
      text-align:right;
    }
  </style>
  </head>

  <body>

    <img src="${logo}" width="80"/>

    <h2>CRUST</h2>
    <div>Crust Pizza Ahangama</div>
    <div>Tel: +94 77 074 7446</div>

    <hr/>

    <div>Order ID: ${order.id}</div>
    <div>${new Date(order.date).toLocaleString()}</div>
    <div>Cashier: ${order.cashier}</div>
    <div>${order.isTakeaway ? "TAKEAWAY" : `TABLE ${order.tableNumber}`}</div>

    <hr/>

    <table>
      <thead>
        <tr>
          <th>Qty</th>
          <th>Item</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <hr/>

    <div>Subtotal: ${formatCurrency(order.subtotal)}</div>
    <div>Discount: ${formatCurrency(order.discount)}</div>
    <div>Service Charge: ${formatCurrency(order.tax)}</div>

    <h3>Total: ${formatCurrency(order.total)}</h3>

    <div>Payment: ${order.paymentMethod}</div>

    <br/>

    <div>Thank you for dining with us!</div>
    <div>Please come again.</div>

  </body>
  </html>
  `;

  const rawbtUrl = "intent:" + encodeURIComponent(receiptHTML) + "#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;";
  window.location.href = rawbtUrl;

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

        {/* Printable Area */}
        <div
          className="print-area overflow-y-auto p-3 bg-white text-black"

          id="printable-receipt">

          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
               <img 
                src={logo} 
                alt="CRUST Logo"
                className="h-14 w-14 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest">
              CRUST
            </h1>
            <p className="text-sm text-gray-600">Crust Pizza Ahangama</p>
            <p className="text-sm text-gray-600">Tel: +94 77 074 7446</p>
          </div>

          <div className="border-t border-dashed border-gray-400 py-4 mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span>Order ID:</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Date:</span>
              <span>{new Date(order.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Cashier:</span>
              <span>{order.cashier}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 text-base">
              <span>Type:</span>
              <span>
                {order.isTakeaway ? 'TAKEAWAY' : `TABLE ${order.tableNumber}`}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 py-4 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) =>
                <tr key={index}>
                    <td className="py-1 align-top">{item.quantity}</td>
                    <td className="py-1 pr-2">
                      <div>{item.name}</div>
                      {item.notes &&
                    <div className="text-xs text-gray-500 italic">
                          Note: {item.notes}
                        </div>
                    }
                    </td>
                    <td className="py-1 text-right align-top">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed border-gray-400 py-4 mb-6 text-sm">
            <div className="flex justify-between mb-1">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 &&
            <div className="flex justify-between mb-1 text-gray-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            }
            <div className="flex justify-between mb-2">
              <span>Service Charge (10%)</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-800 pt-2 mt-2">
              <span>TOTAL</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between mt-4 text-gray-600">
              <span>Payment Method</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center text-sm">
            <p className="font-medium mb-1">Thank you for dining with us!</p>
            <p className="text-gray-500">Please come again.</p>
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

