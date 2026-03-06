"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { dashboardService } from "@/lib/api";
import { ClipboardList, Calendar, Loader2 } from "lucide-react";

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
  { key: "officers", label: "Officers", colNum: 2 },
  { key: "sub_maj", label: "Sub Major", colNum: 3 },
  { key: "sub", label: "Sub", colNum: 4 },
  { key: "naib_sub", label: "Naib Sub", colNum: 5 },
  { key: "hav", label: "Hav", colNum: 6 },
  { key: "lie_hav", label: "L Hav", colNum: 7 },
  { key: "naik", label: "Naik", colNum: 8 },
  { key: "lie_naik", label: "L Naik", colNum: 9 },
  { key: "rifleman", label: "Rifleman", colNum: 10 },
  { key: "total_2_10", label: "Total (2-10)", colNum: 11 },
];

const corpsSubColumns = [
  { key: "eme_chm_att", label: "CHM (Att)", parent: "EME", colNum: 27 },
  { key: "eme_armr", label: "Armr", parent: "EME", colNum: 28 },
  { key: "eme_veh_mech", label: "Veh Mech", parent: "EME", colNum: 29 },
  { key: "eme_elect", label: "Elect", parent: "EME", colNum: 30 },
  { key: "amc_rmo_offr", label: "RMO (Offr)", parent: "AMC", colNum: 31 },
  { key: "amc_nursing_asst", label: "Nursing Asst", parent: "AMC", colNum: 32 },
  { key: "aec_jcos", label: "JCOs", parent: "AEC", colNum: 33 },
  { key: "aec_hav", label: "Hav", parent: "AEC", colNum: 34 },
  { key: "total_27_34", label: "Total (27-34)", colNum: 35 },
];

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
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full min-w-[1400px] border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="sticky left-0 z-10 min-w-[180px] px-4 py-3 text-left text-sm font-semibold text-gray-300 bg-slate-800/80">
                    Details
                  </th>
                  {rankColumns.map((c) => (
                    <th
                      key={c.key}
                      className="px-3 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800/60 whitespace-nowrap"
                    >
                      {c.label}
                    </th>
                  ))}
                  {tradesmen.map((t, i) => (
                    <th
                      key={t.id}
                      className="px-2 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800/60 whitespace-nowrap"
                    >
                      {t.trade_name}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800/60 whitespace-nowrap">
                    Total (12-25)
                  </th>
                  {corpsSubColumns.map((c) => (
                    <th
                      key={c.key}
                      className="px-2 py-2 text-center text-xs font-medium text-gray-400 bg-slate-800/60 whitespace-nowrap"
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
                <tr className="border-b border-white/10 bg-slate-800/40">
                  <td className="sticky left-0 z-10 px-4 py-1 text-center text-xs font-medium text-gray-500 bg-slate-800/80">
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
                {DETAIL_ROWS.map((row) => (
                  <tr
                    key={row.key}
                    className={`border-b border-white/5 hover:bg-white/5 ${
                      row.isTotal ? "bg-blue-500/5 font-semibold" : ""
                    }`}
                  >
                    <td className="sticky left-0 z-10 px-4 py-2 text-sm text-gray-300 bg-slate-800/80">
                      {row.label}
                    </td>
                    {rankColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-2 py-1 text-center text-sm text-gray-300"
                      >
                        {getCellValue(row.key, col.key)}
                      </td>
                    ))}
                    {tradesmen.map((t) => {
                      const colKey = `trade_${t.id}`;
                      return (
                        <td
                          key={colKey}
                          className="px-2 py-1 text-center text-sm text-gray-300"
                        >
                          {getCellValue(row.key, colKey)}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center text-sm text-gray-300 font-medium">
                      {getCellValue(row.key, "total_12_25")}
                    </td>
                    {corpsSubColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-2 py-1 text-center text-sm text-gray-300"
                      >
                        {getCellValue(row.key, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
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
