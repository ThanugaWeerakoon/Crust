const handlePrint = () => {
  const printContents = document.getElementById("printable-receipt")?.innerHTML;
  if (!printContents) return;

  const printWindow = window.open("", "_blank", "width=400,height=600");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 300px;
            padding: 10px;
            color: #000;
          }
          img { max-width: 100%; height: auto; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 2px 0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .font-medium { font-weight: 500; }
          .text-base { font-size: 14px; }
          .text-xs { font-size: 11px; }
          .text-\\[10px\\] { font-size: 10px; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-600 { color: #4b5563; }
          .italic { font-style: italic; }
          .border-t { border-top: 1px solid; }
          .border-gray-800 { border-color: #1f2937; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
          .pt-1 { padding-top: 4px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .pb-1 { padding-bottom: 4px; }
          .pr-1 { padding-right: 4px; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .justify-center { justify-content: center; }
          .border-dashed { border-style: dashed; }
          .border-gray-400 { border-color: #9ca3af; }
          .h-24 { height: 96px; }
          .w-24 { width: 96px; }
          .object-contain { object-fit: contain; }
          @media print {
            @page { margin: 0; size: 80mm auto; }
            body { width: 100%; }
          }
        </style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Wait for images to load before printing
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};