export function arrayToCSV(rows: (string|number)[][]) {
  return rows.map(r => r.map(cell => {
    const needQuote = String(cell).includes(",") || String(cell).includes("\n") || String(cell).includes('"');
    const escaped = String(cell).replace(/"/g, '""');
    return needQuote ? `"${escaped}"` : escaped;
  }).join(",")).join("\n");
}
