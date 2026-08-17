// Utility to export array of objects to UTF-8 BOM formatted CSV (Excel Compatible)

export const exportToCSV = (filename, headers, rows) => {
  if (!rows || !rows.length) {
    alert("Dışa aktarılacak veri bulunamadı.");
    return;
  }

  // UTF-8 BOM for Turkish Character Encoding in Excel
  let csvContent = "\uFEFF";
  
  // Headers row
  csvContent += headers.map(h => `"${h.label}"`).join(",") + "\n";

  // Data rows
  rows.forEach(row => {
    const rowValues = headers.map(h => {
      let val = h.accessor(row);
      if (val === null || val === undefined) val = "";
      // Escape double quotes
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvContent += rowValues.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
