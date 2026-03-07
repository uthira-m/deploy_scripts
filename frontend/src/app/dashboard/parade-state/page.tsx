"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { dashboardService } from "@/lib/api";
import { ClipboardList, Calendar, Loader2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Y-axis row keys
const DETAIL_ROWS = [
  { key: "posted_strength", label: "Posted Strength", isTotal: false },
  { key: "annual_leave", label: "Annual Leave", isAbsent: true },
  { key: "casual_leave", label: "Casual Leave", isAbsent: true },
  { key: "hospitalisation", label: "Hospitalisation", isAbsent: true },
  { key: "course", label: "Course", isAbsent: true },
  { key: "att_grrc", label: "Att GRRC", isAbsent: true },
  { key: "att_other_units", label: "Att other units", isAbsent: true },
  { key: "temp_duty", label: "Temp Duty (TD)", isAbsent: true },
  { key: "bde_hq", label: "BDE HQ", isPresent: true },
  { key: "div_hq", label: "DIV HQ", isPresent: true },
  { key: "11_compo", label: "11 COMPO", isPresent: true },
  { key: "41_asc_supply", label: "41 ASC SUPPLY", isPresent: true },
  { key: "bhavnagar", label: "BHAVNAGAR", isPresent: true },
  { key: "somnath_temple", label: "SOMNATH TEMPLE", isPresent: true },
  { key: "mco", label: "MCO", isPresent: true },
  { key: "fts", label: "FTS", isPresent: true },
  { key: "total_present", label: "Total Present", isTotal: true },
  { key: "total_absent", label: "Total Absent", isTotal: true },
];

interface ParadeStateData {
  [rowKey: string]: { [colKey: string]: number };
}

// Rank columns (2-10) + Total (2-10) = col 11
const rankColumns = [
  { key: "officers", label: "Officers", pdfLabel: "Officers", colNum: 2 },
  { key: "sub_maj", label: "Sub Major", pdfLabel: "Sub Maj", colNum: 3 },
  { key: "sub", label: "Sub", pdfLabel: "Sub", colNum: 4 },
  { key: "naib_sub", label: "Naib Sub", pdfLabel: "Nb Sub", colNum: 5 },
  { key: "hav", label: "Hav", pdfLabel: "Hav", colNum: 6 },
  { key: "lie_hav", label: "L Hav", pdfLabel: "L/Hav", colNum: 7 },
  { key: "naik", label: "Naik", pdfLabel: "Nk", colNum: 8 },
  { key: "lie_naik", label: "L Naik", pdfLabel: "L/Nk", colNum: 9 },
  { key: "rifleman", label: "Rifleman", pdfLabel: "Rfn", colNum: 10 },
  { key: "total_2_10", label: "Total (2-10)", pdfLabel: "TOTAL (2 TO 10)", colNum: 11 },
];

const corpsSubColumns = [
  { key: "eme_chm_att", label: "CHM (Att)", pdfLabel: "CHM (Att)", colNum: 27 },
  { key: "eme_armr", label: "Armr", pdfLabel: "Armr", colNum: 28 },
  { key: "eme_veh_mech", label: "Veh Mech", pdfLabel: "Veh Mech", colNum: 29 },
  { key: "eme_elect", label: "Elect", pdfLabel: "Elect", colNum: 30 },
  { key: "amc_rmo_offr", label: "RMO (Offr)", pdfLabel: "RMO (Offr)", colNum: 31 },
  { key: "amc_nursing_asst", label: "Nursing Asst", pdfLabel: "Nursing Asst", colNum: 32 },
  { key: "aec_jcos", label: "JCOs", pdfLabel: "JCOs", colNum: 33 },
  { key: "aec_hav", label: "Hav", pdfLabel: "Hav", colNum: 34 },
  { key: "total_27_34", label: "Total (25-34)", pdfLabel: "TOTAL (25-34)", colNum: 35 },
];

// Short labels for PDF trade columns (matches reference layout)
const TRADE_PDF_LABELS: Record<string, string> = {
  clerk: "Clerk",
  "clerk (sd)": "Clerk",
  chef: "Chef",
  communicator: "Sp Staff (ER)",
  "specialist staff (er)": "Sp Staff (ER)",
  dresser: "Dresser",
  painter: "Ptr",
  tailor: "Tailor",
  washerman: "W/M",
  housekeeper: "House Keeper",
  "house keeper": "House Keeper",
  equipment: "EQPT",
  "mess chef": "Chef Mess",
  "mess keeper": "Mess Keeper",
  steward: "STW",
  artisan: "Artisan",
  "m/ck spl": "M/ck SPL",
  "rt jco": "RT JCO",
};

export default function ParadeStatePage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradesmen, setTradesmen] = useState<{ id: number; trade_name: string }[]>(
    []
  );
  const [tableData, setTableData] = useState<ParadeStateData>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getParadeStateData(selectedDate);
      if (response.status === "success" && response.data) {
        setTableData(response.data.paradeState || {});
        setTradesmen(response.data.tradesmen || []);
      } else {
        setError("Failed to load parade state data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load parade state data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const getCellValue = (rowKey: string, colKey: string): number => {
    const raw = tableData[rowKey]?.[colKey] ?? 0;
    // Total Present = Posted Strength - Total Absent (fallback if API returns 0)
    if (rowKey === "total_present" && raw === 0) {
      const posted = tableData["posted_strength"]?.[colKey] ?? 0;
      const absent = tableData["total_absent"]?.[colKey] ?? 0;
      return Math.max(0, posted - absent);
    }
    return raw;
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a3" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const formatDateStr = (s: string) => {
      const d = new Date(s);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Compact header for A3 landscape report
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PARADE STATE REPORT", pageWidth / 2, 8, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${formatDateStr(selectedDate)}`, pageWidth / 2, 13, { align: "center" });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, 16, pageWidth - margin, 16);

    const getTradePdfLabel = (name: string) => {
      const key = name.toLowerCase().trim();
      return TRADE_PDF_LABELS[key] ?? name.length > 10 ? name.slice(0, 10) : name;
    };

    const headRow1 = [
      "DETAILS",
      ...rankColumns.map((c) => c.pdfLabel),
      ...tradesmen.map((t) => getTradePdfLabel(t.trade_name)),
      "TOTAL (12 to 25)",
      ...corpsSubColumns.map((c) => c.pdfLabel),
    ];
    const headRow2 = [
      "1",
      ...rankColumns.map((c) => (c.key === "total_2_10" ? "2-10" : String(c.colNum))),
      ...tradesmen.map((_, i) => String(12 + i)),
      "12-25",
      ...corpsSubColumns.map((c) => (c.key === "total_27_34" ? "27-34" : String(c.colNum))),
    ];
    const colKeys = [
      "Details",
      ...rankColumns.map((c) => c.key),
      ...tradesmen.map((t) => `trade_${t.id}`),
      "total_12_25",
      ...corpsSubColumns.map((c) => c.key),
    ];
    const body = DETAIL_ROWS.map((row) => {
      const cells = [row.label];
      colKeys.slice(1).forEach((colKey) => {
        cells.push(String(getCellValue(row.key, colKey)));
      });
      return cells;
    });

    const tableWidth = pageWidth - 2 * margin;
    const colCount = headRow1.length;
    const detailsColWidth = 42;
    const dataColWidth = (tableWidth - detailsColWidth) / (colCount - 1);

    const columnStyles: Record<number, { cellWidth?: number; halign?: string }> = {
      0: { cellWidth: detailsColWidth, halign: "left" },
    };
    for (let i = 1; i < colCount; i++) {
      columnStyles[i] = { cellWidth: dataColWidth, halign: "center" };
    }

    autoTable(doc, {
      head: [headRow1, headRow2],
      body,
      startY: 20,
      tableWidth,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 1 },
      headStyles: {
        fillColor: [245, 247, 250],
        textColor: [30, 41, 59],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        cellPadding: 1,
        minCellHeight: 32,
      },
      bodyStyles: { halign: "center", valign: "middle", textColor: [30, 41, 59] },
      columnStyles,
      alternateRowStyles: { fillColor: [252, 253, 254] },
      theme: "grid",
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.2,
      didParseCell: (data) => {
        if (data.section === "head") {
          if (data.row.index === 0 && data.column.index > 0) {
            (data.cell as { rotatedText?: string }).rotatedText = data.cell.text;
            data.cell.text = "";
          }
          if (data.row.index === 1) {
            data.cell.styles.fontSize = 6;
            data.cell.styles.fontStyle = "normal";
            data.cell.styles.cellPadding = 0.5;
            data.cell.styles.minCellHeight = 6;
          }
          if (data.row.index === 0) {
            data.cell.styles.minCellHeight = 28;
          }
        }
      },
      didDrawCell: (data) => {
        const cell = data.cell as { rotatedText?: string };
        if (
          data.section === "head" &&
          data.row.index === 0 &&
          data.column.index > 0 &&
          cell.rotatedText
        ) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(30, 41, 59);
          const cx = data.cell.x + data.cell.width / 2;
          const pad = 2;
          const anchorY = data.cell.y + data.cell.height - pad;
          doc.text(cell.rotatedText, cx, anchorY, { angle: 90, align: "center" });
        }
      },
    });

    doc.save(`parade-state-${selectedDate}.pdf`);
  };

  return (
    <ProtectedRoute>
      <div className="p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-blue-400" />
              Parade State
            </h1>
            <p className="text-gray-400 mt-1">
              Personnel strength and status (dynamic data from database)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={loading || !!error}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-rose-400">
            {error}
          </div>
        ) : (
          <div className="parade-state-scroll overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)] rounded-xl border border-white/10 bg-slate-800/95 backdrop-blur-sm">
            <table className="w-full min-w-[1400px] border-collapse">
              <thead>
                <tr className="sticky top-0 z-20 border-b border-white/10 bg-slate-800">
                  <th className="sticky left-0 z-[21] min-w-[180px] px-4 py-3 text-left text-sm font-semibold text-gray-300 bg-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)]">
                    Details
                  </th>
                  {rankColumns.map((c) => (
                    <th
                      key={c.key}
                      className="px-3 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800 whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                  {tradesmen.map((t, i) => (
                    <th
                      key={t.id}
                      className="px-2 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800 whitespace-nowrap"
                    >
                      {t.trade_name}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800 whitespace-nowrap">
                    Total (12-23)
                  </th>
                  {corpsSubColumns.map((c) => (
                    <th
                      key={c.key}
                      className="px-2 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800 whitespace-nowrap"
                      title={c.parent ? `${c.parent}: ${c.label}` : c.label}
                    >
                      {c.parent ? (
                        <>
                          <span className="text-[10px] text-gray-500">{c.parent}</span>
                          <br />
                        </>
                      ) : null}
                      {c.label}
                    </th>
                  ))}
                </tr>
                {/* Column numbers row */}
                <tr className="sticky top-[48px] z-20 border-b border-white/10 bg-slate-800">
                  <td className="sticky left-0 z-[21] px-4 py-1 text-center text-xs font-medium text-gray-500 bg-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)]">
                    1
                  </td>
                  {rankColumns.map((c) => (
                    <td
                      key={c.key}
                      className="px-2 py-1 text-center text-xs text-gray-500"
                    >
                      {c.key === "total_2_10" ? "2-10" : c.colNum}
                    </td>
                  ))}
                  {tradesmen.map((t, i) => (
                    <td
                      key={t.id}
                      className="px-2 py-1 text-center text-xs text-gray-500"
                    >
                      {12 + i}
                    </td>
                  ))}
                  <td className="px-2 py-1 text-center text-xs text-gray-500">
                    12-25
                  </td>
                  {corpsSubColumns.map((c) => (
                    <td
                      key={c.key}
                      className="px-2 py-1 text-center text-xs text-gray-500"
                    >
                      {c.key === "total_27_34" ? "27-34" : c.colNum}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DETAIL_ROWS.map((row) => {
                  const isStickyTotal =
                    row.key === "total_absent" || row.key === "total_present";
                  const cellBg = isStickyTotal ? "bg-slate-800" : "";
                  return (
                  <tr
                    key={row.key}
                    className={` border-white/5 ${
                      !isStickyTotal ? "hover:bg-white/5" : ""
                    } ${
                      row.isTotal && !isStickyTotal ? "bg-blue-500/5 font-semibold" : ""
                    } ${
                      row.key === "total_absent"
                        ? "sticky bottom-0 z-20 bg-slate-800 shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.3)]"
                        : row.key === "total_present"
                        ? "sticky bottom-10 z-20 bg-slate-800 shadow-[0_-4px_8px_-2px_rgba(0,0,0,0.3)]"
                        : ""
                    } ${isStickyTotal ? "font-semibold" : ""}`}
                  >
                    <td className={`sticky left-0 z-10 px-4 py-2 text-sm text-gray-300 bg-slate-800 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.3)] ${
                      row.isTotal ? "z-[21]" : ""
                    }`}>
                      {row.label}
                    </td>
                    {rankColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-2 py-1 text-center text-sm text-gray-300 ${cellBg}`}
                      >
                        {getCellValue(row.key, col.key)}
                      </td>
                    ))}
                    {tradesmen.map((t) => {
                      const colKey = `trade_${t.id}`;
                      return (
                        <td
                          key={colKey}
                          className={`px-2 py-1 text-center text-sm text-gray-300 ${cellBg}`}
                        >
                          {getCellValue(row.key, colKey)}
                        </td>
                      );
                    })}
                    <td className={`px-2 py-1 text-center text-sm text-gray-300 font-medium ${cellBg}`}>
                      {getCellValue(row.key, "total_12_25")}
                    </td>
                    {corpsSubColumns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-2 py-1 text-center text-sm text-gray-300 ${cellBg}`}
                      >
                        {getCellValue(row.key, col.key)}
                      </td>
                    ))}
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500">
          All counts are dynamic from database. Out station personnel are mapped
          by formation (BDE HQ, DIV HQ, 11 COMPO, 41 ASC SUPPLY, BHAVNAGAR,
          SOMNATH TEMPLE, MCO, FTS, Att GRRC, Att other units, TD). Leave,
          course, and hospitalisation counts reflect status on selected date.
        </p>
      </div>
    </ProtectedRoute>
  );
}
