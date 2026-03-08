"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Printer } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { personnelService, personnelJCOService, leaveService } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { config } from "@/config/env";

interface Personnel {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  photo_url?: string;
  companyPersonnel?: {
    company: { company_name: string };
  }[];
}

interface Course {
  id: number;
  course_title?: string;
  course_name?: string;
  start_date?: string;
  end_date?: string;
  completion_date?: string;
  grade?: string;
  course?: { course_title?: string };
}

interface ERE {
  id: number;
  unit: string;
  from_date: string;
  to_date: string;
  planned_ere: string;
  remarks?: string;
}

interface ForeignPosting {
  id: number;
  unit: string;
  from_date: string;
  to_date: string;
  remarks?: string;
}

interface PunishmentOffence {
  id: number;
  offence: string;
  date_of_offence?: string;
  punishment_awarded?: string;
  endorsed: boolean;
}

interface OutStationEmployment {
  id: number;
  formation?: string;
  location?: string;
  employment?: string;
  start_date?: string;
  end_date?: string;
}

interface FieldService {
  id: number;
  location: string;
  from_date: string;
  to_date: string;
  remarks?: string;
}

interface LeaveRecord {
  id: number;
  start_date?: string;
  end_date?: string;
  total_days?: number;
  status?: string;
  leaveType?: { name?: string };
  LeaveType?: { name?: string };
  leave_type?: { name?: string };
  leave_type_name?: string;
}

interface Proficiency {
  id: number;
  profile_id: number;
  proficiency_type: "Drone" | "Others";
  drone_equipment_id?: number;
  proficiency_level?: "low" | "medium" | "high";
  flying_hours?: number;
  trg_cadre?: string;
  level: "unit" | "brigade" | "division" | "corps";
  duration?: string;
  location?: string;
  drone_equipment?: {
    equipment_name?: string;
  };
}

interface DisplayMonth {
  label: string;
  monthIndex: number;
  year: number;
}

type DateRangeType = "lastYear" | "custom";

const getCourseEndDate = (course: Course) =>
  course.end_date || course.completion_date || "";

const transformCourses = (coursesData: any[]) =>
  (coursesData || []).map((c: any) => ({
    ...c,
    course_name: c.course?.course_title ?? c.course_name ?? "--",
  }));

const calculateLeaveDays = (start?: string, end?: string) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return null;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const getLeaveTypeLabel = (record: LeaveRecord) =>
  record.leaveType?.name ||
  record.LeaveType?.name ||
  record.leave_type?.name ||
  record.leave_type_name ||
  "N/A";

const parseDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const rangeIntersects = (
  startStr: string | undefined,
  endStr: string | undefined,
  rangeStart: Date,
  rangeEnd: Date
) => {
  const start = parseDate(startStr) || parseDate(endStr);
  const end = parseDate(endStr) || parseDate(startStr);
  if (!start || !end) return false;
  const s = start.getTime();
  const e = end.getTime();
  const rs = rangeStart.getTime();
  const re = rangeEnd.getTime();
  return e >= rs && s <= re;
};

export default function GlobalProfilingPage() {
  const { user } = useAuth();

  const [armyNo, setArmyNo] = useState("");
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("lastYear");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [eres, setEres] = useState<ERE[]>([]);
  const [foreignPostings, setForeignPostings] = useState<ForeignPosting[]>([]);
  const [punishmentOffences, setPunishmentOffences] = useState<
    PunishmentOffence[]
  >([]);
  const [outStationEmployments, setOutStationEmployments] = useState<
    OutStationEmployment[]
  >([]);
  const [fieldServices, setFieldServices] = useState<FieldService[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [proficiencies, setProficiencies] = useState<Proficiency[]>([]);

  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(null);
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const;

  const computeRange = (): { from: Date; to: Date } | null => {
    if (dateRangeType === "lastYear") {
      const to = new Date();
      const from = new Date();
      from.setFullYear(to.getFullYear() - 1);
      return { from, to };
    }

    if (!customFrom || !customTo) {
      setError("Please select both From and To dates for custom range.");
      return null;
    }

    const from = new Date(customFrom);
    const to = new Date(customTo);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      setError("Invalid custom date range.");
      return null;
    }

    if (from > to) {
      setError("From date cannot be after To date.");
      return null;
    }

    return { from, to };
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPersonnel(null);
    setCourses([]);
    setEres([]);
    setForeignPostings([]);
    setPunishmentOffences([]);
    setOutStationEmployments([]);
    setFieldServices([]);
    setLeaveRecords([]);

    const trimmedArmyNo = armyNo.trim();
    if (!trimmedArmyNo) {
      setError("Please enter an Army Number.");
      return;
    }

    const range = computeRange();
    if (!range) return;

    try {
      setLoading(true);

      // Find personnel by army number - search both OR (personnel) and JCO categories
      let list: any[] = [];
      let searchRes = await personnelService.getAllPersonnel(
        1,
        10,
        trimmedArmyNo
      );

      if (searchRes.status === "success" && searchRes.data) {
        const searchData = searchRes.data as { personnel: any[] };
        list = searchData.personnel || [];
      }

      // If not found in OR personnel, search in JCO
      if (list.length === 0) {
        const jcoRes = await personnelJCOService.getAllPersonnel(
          1,
          10,
          trimmedArmyNo
        );
        if (jcoRes.status === "success" && jcoRes.data) {
          const jcoData = jcoRes.data as { personnel: any[] };
          list = jcoData.personnel || [];
        }
      }

      if (list.length === 0) {
        setError("No personnel found for the given Army Number.");
        return;
      }

      const match =
        list.find(
          (p: any) =>
            String(p.army_no).toLowerCase() === trimmedArmyNo.toLowerCase()
        ) || list[0];

      const personId = match.id as number;

      // Use personnelService for profile/details - works for both OR and JCO (same personnel_profile table)
      const profileRes = await personnelService.getPersonnelById(personId);
      if (profileRes.status !== "success" || !profileRes.data) {
        setError("Failed to load personnel details.");
        return;
      }
      const pData = profileRes.data as any;
      const person: Personnel = pData.personnel || pData;
      setPersonnel(person);

      const [
        courseRes,
        ereRes,
        foreignRes,
        punishmentRes,
        fieldRes,
        othersRes,
        profRes,
      ] = await Promise.all([
        personnelService.getPersonnelCourses(personId),
        personnelService.getPersonnelEREs(personId),
        personnelService.getPersonnelForeignPostings(personId),
        personnelService.getPersonnelPunishmentOffences(personId),
        personnelService.getPersonnelFieldServices(personId),
        personnelService.getPersonnelOthersData(personId),
        personnelService.getPersonnelProficiencies(personId),
      ]);

      if (courseRes.status === "success" && courseRes.data) {
        const data = courseRes.data as any;
        const allCourses = transformCourses(data.courses || []);
        setCourses(
          allCourses.filter((c) =>
            rangeIntersects(c.start_date, getCourseEndDate(c), range.from, range.to)
          )
        );
      }

      if (ereRes.status === "success" && ereRes.data) {
        const data = ereRes.data as any;
        const allEres: ERE[] = data.eres || [];
        // Keep full list; monthly bars will apply date filtering
        setEres(allEres);
      }

      if (foreignRes.status === "success" && foreignRes.data) {
        const data = foreignRes.data as any;
        const allForeign: ForeignPosting[] = data.foreignPostings || [];
        setForeignPostings(
          allForeign.filter((fp) =>
            rangeIntersects(fp.from_date, fp.to_date, range.from, range.to)
          )
        );
      }

      if (punishmentRes.status === "success" && punishmentRes.data) {
        const data = punishmentRes.data as any;
        const all = [
          ...(data.punishmentOffences || []),
          ...(data.endorsedOffences || []),
          ...(data.notEndorsedOffences || []),
        ] as PunishmentOffence[];
        const seen = new Set<number>();
        const unique = all.filter((x) => {
          if (seen.has(x.id)) return false;
          seen.add(x.id);
          return true;
        });
        setPunishmentOffences(
          unique.filter((p) =>
            rangeIntersects(p.date_of_offence, p.date_of_offence, range.from, range.to)
          )
        );
      }

      if (fieldRes.status === "success" && fieldRes.data) {
        const data = fieldRes.data as any;
        const allField: FieldService[] = data.fieldServices || [];
        setFieldServices(
          allField.filter((fs) =>
            rangeIntersects(fs.from_date, fs.to_date, range.from, range.to)
          )
        );
      }

      if (othersRes.status === "success" && othersRes.data) {
        const data = othersRes.data as any;
        const allOut: OutStationEmployment[] = data.outStationEmployments || [];
        setOutStationEmployments(
          allOut.filter((o) =>
            rangeIntersects(o.start_date, o.end_date, range.from, range.to)
          )
        );

      if (profRes.status === "success" && profRes.data) {
        const data = profRes.data as any;
        setProficiencies(data.proficiencies || data || []);
      }
      }

      // Leave records for the selected personnel
      let leaveRecordsData: LeaveRecord[] = [];
      if (user?.role === "admin") {
        const leaveRes = await leaveService.getAllLeaveRequests({
          personnel_id: personId,
        });
        const raw = (leaveRes.data as any)?.leaveRequests || leaveRes.data;
        leaveRecordsData = Array.isArray(raw) ? raw : raw?.data || [];
      } else if (user?.role === "commander") {
        const leaveRes = await leaveService.getCommanderLeaveRequests();
        const raw = (leaveRes.data as any)?.leaveRequests || leaveRes.data;
        const all = Array.isArray(raw) ? raw : raw?.data || [];
        leaveRecordsData = all.filter(
          (r: any) =>
            (r.personnel_id ?? r.personnel?.id ?? r.personnelId) === personId
        );
      } else {
        const leaveRes = await leaveService.getMyLeaveRequests();
        const raw = (leaveRes.data as any)?.leaveRequests || leaveRes.data;
        const all = Array.isArray(raw) ? raw : raw?.data || [];
        leaveRecordsData = all.filter(
          (r: any) =>
            (r.personnel_id ?? r.personnel?.id ?? r.personnelId) === personId
        );
      }
      setLeaveRecords(
        leaveRecordsData.filter((lr) =>
          rangeIntersects(lr.start_date, lr.end_date, range.from, range.to)
        )
      );

      setEffectiveFrom(range.from);
      setEffectiveTo(range.to);
    } catch (err: any) {
      setError(err.message || "Failed to generate profiling data.");
    } finally {
      setLoading(false);
    }
  };

  const droneProficiency = useMemo(
    () => proficiencies.find((p) => p.proficiency_type === "Drone") || null,
    [proficiencies]
  );

  const othersProficiency = useMemo(
    () => proficiencies.find((p) => p.proficiency_type === "Others") || null,
    [proficiencies]
  );

  const displayMonths = useMemo<DisplayMonth[]>(() => {
    // Default: Jan–Dec of current year
    const base = effectiveFrom || new Date();
    const startMonth = effectiveFrom ? effectiveFrom.getMonth() : 0;
    const baseYear = base.getFullYear();

    const result: DisplayMonth[] = [];
    for (let i = 0; i < 12; i++) {
      const total = startMonth + i;
      const monthIndex = total % 12;
      const year = baseYear + Math.floor(total / 12);
      result.push({
        label: months[monthIndex],
        monthIndex,
        year,
      });
    }
    return result;
  }, [effectiveFrom]);

  const monthFlags = useMemo(() => {
    const buildFlags = <T,>(
      items: T[],
      getStart: (item: T) => string | undefined,
      getEnd: (item: T) => string | undefined
    ): boolean[] =>
      displayMonths.map((dm) => {
        return items.some((item) => {
          const startStr = getStart(item);
          const endStr = getEnd(item);
          const startDate = parseDate(startStr) || parseDate(endStr);
          const endDate = parseDate(endStr) || parseDate(startStr);
          if (!startDate || !endDate) return false;

          const monthStart = new Date(
            dm.year,
            dm.monthIndex,
            1,
            0,
            0,
            0,
            0
          );
          const monthEnd = new Date(
            dm.year,
            dm.monthIndex + 1,
            0,
            23,
            59,
            59,
            999
          );

          return !(endDate < monthStart || startDate > monthEnd);
        });
      });

    return {
      course: buildFlags(
        courses,
        (c) => c.start_date,
        (c) => getCourseEndDate(c)
      ),
      ere: buildFlags(eres, (e) => e.from_date, (e) => e.to_date),
      outstation: buildFlags(
        outStationEmployments,
        (o) => o.start_date,
        (o) => o.end_date
      ),
      foreign: buildFlags(
        foreignPostings,
        (fp) => fp.from_date,
        (fp) => fp.to_date
      ),
    };
  }, [
    courses,
    eres,
    outStationEmployments,
    foreignPostings,
    displayMonths,
  ]);

  if (!user || user.role !== "admin") {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200">
            Only administrators can access the profiling tool.
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 lg:p-6 space-y-6 print:bg-white print:p-0">
        <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Profiling
            </h1>
            <p className="text-gray-300 text-sm lg:text-base">
              Search any Army Number and generate a detailed profiling report.
            </p>
          </div>
          {personnel && (
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
          )}
        </div>

        <form
          onSubmit={handleGenerate}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 space-y-4 shadow-lg print:hidden"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Army Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={armyNo}
                  onChange={(e) => setArmyNo(e.target.value)}
                  placeholder="Enter Army Number"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  {loading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>

            <div className="w-full lg:w-80">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Time Period
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                    <input
                      type="radio"
                      className="form-radio text-blue-500"
                      checked={dateRangeType === "lastYear"}
                      onChange={() => setDateRangeType("lastYear")}
                    />
                    Last 1 year
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-200">
                    <input
                      type="radio"
                      className="form-radio text-blue-500"
                      checked={dateRangeType === "custom"}
                      onChange={() => setDateRangeType("custom")}
                    />
                    Custom
                  </label>
                </div>
                {dateRangeType === "custom" && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {personnel && (
          <div
            id="profiling-report"
            className="bg-slate-900/80 rounded-xl shadow-2xl w-full max-w-5xl mx-auto border border-white/10 text-gray-100 print:bg-white print:text-gray-900 print:shadow-none print:border print:border-gray-300"
          >
            {/* Top sheet-style table */}
            <div className="px-4 pt-3 pb-2 text-[11px] md:text-xs text-gray-100 print:text-gray-900">
              <table className="w-full border border-white/20 border-collapse print:border-gray-300">
                <thead>
                  <tr>
                    <th
                      colSpan={13}
                      className="border border-white/20 py-2 text-center font-bold text-sm bg-slate-800/80 print:bg-white print:border-gray-300"
                    >
                      Profiling
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      Army No
                    </td>
                    <td
                      colSpan={5}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {personnel.army_no || " "}
                    </td>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      Year
                    </td>
                    <td
                      colSpan={5}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {effectiveFrom
                        ? effectiveFrom.getFullYear()
                        : new Date().getFullYear()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      Name
                    </td>
                    <td
                      colSpan={5}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {personnel.name || " "}
                    </td>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      From
                    </td>
                    <td
                      colSpan={5}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {effectiveFrom
                        ? formatDate(effectiveFrom.toISOString())
                        : " "}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      Rank
                    </td>
                    <td
                      colSpan={5}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {personnel.rank || " "}
                    </td>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      To
                    </td>
                    <td
                      colSpan={5}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {effectiveTo
                        ? formatDate(effectiveTo.toISOString())
                        : " "}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-white/20 px-2 py-1 font-semibold print:border-gray-300">
                      Company
                    </td>
                    <td
                      colSpan={12}
                      className="border border-white/20 px-2 py-1 text-left print:border-gray-300"
                    >
                      {personnel.companyPersonnel?.[0]?.company?.company_name ||
                        personnel.unit ||
                        " "}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Profiling grid */}
            <div className="px-4 pb-4 border-b border-white/20 text-[11px] md:text-xs text-gray-100 print:border-gray-300 print:text-gray-900">
              <div className="overflow-x-auto mt-1">
                <table className="w-full border border-white/20 border-collapse text-center print:border-gray-300">
                  <thead>
                    <tr>
                      <th
                        colSpan={13}
                        className="border border-white/20 px-2 py-1 text-left font-semibold bg-slate-800/80 print:bg-white print:border-gray-300"
                      >
                        Detailed Profiling
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                        Month
                      </th>
                      {displayMonths.map((m) => (
                        <th
                          key={`${m.label}-${m.year}-${m.monthIndex}`}
                          className="border border-white/20 px-2 py-1 print:border-gray-300"
                        >
                          {m.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthFlags && (
                      <>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            Course
                          </td>
                          {monthFlags.course.map((active, idx) => (
                            <td
                              key={idx}
                              className={`border border-white/20 px-2 py-3 print:border-gray-300 ${
                                active ? "bg-emerald-500 print:bg-gray-400" : ""
                              }`}
                            >
                              {active && (
                                <span className="inline-block w-full text-center text-[10px] text-white print:text-black">
                                  ■
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            ERE
                          </td>
                          {monthFlags.ere.map((active, idx) => (
                            <td
                              key={idx}
                              className={`border border-white/20 px-2 py-3 print:border-gray-300 ${
                                active ? "bg-purple-500 print:bg-gray-400" : ""
                              }`}
                            >
                              {active && (
                                <span className="inline-block w-full text-center text-[10px] text-white print:text-black">
                                  ■
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            Outstation
                          </td>
                          {monthFlags.outstation.map((active, idx) => (
                            <td
                              key={idx}
                              className={`border border-white/20 px-2 py-3 print:border-gray-300 ${
                                active ? "bg-sky-500 print:bg-gray-400" : ""
                              }`}
                            >
                              {active && (
                                <span className="inline-block w-full text-center text-[10px] text-white print:text-black">
                                  ■
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            Foreign Posting
                          </td>
                          {monthFlags.foreign.map((active, idx) => (
                            <td
                              key={idx}
                              className={`border border-white/20 px-2 py-3 print:border-gray-300 ${
                                active ? "bg-amber-400 print:bg-gray-400" : ""
                              }`}
                            >
                              {active && (
                                <span className="inline-block w-full text-center text-[10px] text-white print:text-black">
                                  ■
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                    {!monthFlags && (
                      <>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            Course
                          </td>
                          {months.map((m) => (
                            <td
                              key={m}
                              className="border border-white/20 px-2 py-3 print:border-gray-300"
                            />
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            ERE
                          </td>
                          {months.map((m) => (
                            <td
                              key={m}
                              className="border border-white/20 px-2 py-3 print:border-gray-300"
                            />
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            Outstation
                          </td>
                          {months.map((m) => (
                            <td
                              key={m}
                              className="border border-white/20 px-2 py-3 print:border-gray-300"
                            />
                          ))}
                        </tr>
                        <tr>
                          <td className="border border-white/20 px-2 py-1 text-left print:border-gray-300">
                            Foreign Posting
                          </td>
                          {months.map((m) => (
                            <td
                              key={m}
                              className="border border-white/20 px-2 py-3 print:border-gray-300"
                            />
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competency - Drone Proficiency */}
            <div className="px-4 pb-4 border-b border-white/20 text-xs md:text-sm text-gray-100 print:border-gray-300 print:text-gray-900">
              <div className="overflow-x-auto mt-2">
                <table className="w-full border border-white/20 border-collapse print:border-gray-300 bg-slate-900/60 print:bg-white">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left">
                        Competency
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Drone Equipment
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Proficiency Level
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Flying Hours
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Level
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Skill
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">
                        Drone Proficiency
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {droneProficiency?.drone_equipment?.equipment_name || "—"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {droneProficiency?.proficiency_level || "—"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {typeof droneProficiency?.flying_hours === "number"
                          ? droneProficiency.flying_hours
                          : "—"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {droneProficiency?.level || "—"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {droneProficiency?.duration || droneProficiency?.location || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competency - Others Proficiency */}
            <div className="px-4 pb-4 text-xs md:text-sm text-gray-100 print:text-gray-900">
              <div className="overflow-x-auto mt-2">
                <table className="w-full border border-white/20 border-collapse print:border-gray-300 bg-slate-900/60 print:bg-white">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-2 py-1 text-left">
                        Competency
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Trg/Cadre *
                      </th>
                      <th className="border border-gray-300 px-2 py-1">
                        Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">
                        Others Proficiency
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {othersProficiency?.trg_cadre || "—"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {othersProficiency?.level || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

