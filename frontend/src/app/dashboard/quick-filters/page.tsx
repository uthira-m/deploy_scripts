"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Pagination } from "@/components/Pagination";
import { quickFiltersService, rankService, api } from "@/lib/api";
import { Filter, Search, X, ChevronDown, ChevronUp, Download, Printer, Calendar, FileText } from "lucide-react";
import { paginationConfig } from "@/config/pagination";

interface FilteredPersonnel {
  s_no: number;
  army_no: string;
  name: string;
  rank: string;
  company: string | null;
  platoon: string | null;
  trades_name: string | null;
  sports_name: string | null;
  education_civilian: string | null;
  education_military: string | null;
  blood_group: string | null;
  id: number;
  dynamic_status?: string;
  formation_category?: string;
}

interface Company {
  id: number;
  company_name: string;
}

interface Rank {
  id: number;
  name: string;
  category_id?: number;
}

interface Platoon {
  id: number;
  platoon_name: string;
  company_id: number;
}

interface Tradesman {
  id: number;
  trade_name: string;
}

export default function QuickFiltersPage() {
  const [personnel, setPersonnel] = useState<FilteredPersonnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter states - nominal role: all 4 dropdowns at once
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [rankId, setRankId] = useState<number | null>(null);
  const [platoonId, setPlatoonId] = useState<number | null>(null);
  const [tradesmanId, setTradesmanId] = useState<number | null>(null);
  const [educationType, setEducationType] = useState<string>("");
  const [sportsEventName, setSportsEventName] = useState<string>("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formationCategory, setFormationCategory] = useState<string>("");

  // Options data
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  const [tradesmen, setTradesmen] = useState<Tradesman[]>([]);

  // Date and report states
  const [asOfDate, setAsOfDate] = useState<string>("");
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<Record<string, FilteredPersonnel[]> | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // UI states - initially all collapsed
  const [expandedSections, setExpandedSections] = useState({
    nominalRole: false,
    education: false,
    sports: false,
    bloodGroup: false,
    statusDate: false
  });

  // Blood group options
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Status options (ERE, Course, Leave, Out Station, Available)
  const statusOptions = [
    { value: "On ERE", label: "On ERE" },
    { value: "On Course", label: "On Course" },
    { value: "On Leave", label: "On Leave" },
    { value: "Out Station", label: "Out Station" },
    { value: "Available", label: "Available" }
  ];

  // Formation category options (6 categories for Out Station)
  const formationCategoryOptions = [
    { value: "Guards and Duties", label: "Guards and Duties" },
    { value: "FTS", label: "FTS" },
    { value: "IN STN DUTIES", label: "IN STN DUTIES" },
    { value: "ATT GRRC", label: "ATT GRRC" },
    { value: "ATT OTHER UNITS", label: "ATT OTHER UNITS" },
    { value: "TD", label: "TD" }
  ];

  // Education options - Civilian and Military categories
  const educationCivilianOptions = [
    { value: "10", label: "10th Standard" },
    { value: "12", label: "12th Standard" },
    { value: "under graduate", label: "Under Graduate" },
    { value: "post graduate", label: "Post Graduate" }
  ];
  const educationMilitaryOptions = [
    { value: "mri_pass", label: "MR I - Pass" },
    { value: "mri_yet_to_appear", label: "MR I - Yet to Appear" },
    { value: "mr_ii_pass", label: "MR II - Pass" },
    { value: "mr_ii_yet_to_appear", label: "MR II - Yet to Appear" }
  ];

  // Fetch options data
  useEffect(() => {
    fetchCompanies();
    fetchRanks();
    fetchPlatoons();
    fetchTradesmen();
  }, []);

  const hasActiveFilters = (companyId !== null) || (rankId !== null) || (platoonId !== null) || (tradesmanId !== null) || !!educationType || !!sportsEventName || !!bloodGroupFilter || !!statusFilter;

  // Fetch when page or limit changes (after filters are applied)
  useEffect(() => {
    if (hasActiveFilters) {
      fetchFilteredPersonnel();
    }
  }, [page, limit]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/company?limit=100');
      if (response.status === 'success') {
        setCompanies(response.data.companies || []);
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await rankService.getAllRanks();
      if (response.status === 'success' && response.data) {
        const rankList = Array.isArray(response.data) ? response.data : (response.data.ranks || []);
        // Sort by hierarchy: Officers first, JCO, then OR; within category by rank order
        const catOrder = (r: Rank) => (r as any).category?.hierarchy_order ?? (r as any).category?.order ?? (r as any).category_id ?? 999;
        const RANK_ORDER: Record<string, number> = {
          'Colonel': 1, 'Lieutenant Colonel': 2, 'Major': 3, 'Captain': 4, 'Lieutenant': 5,
          'Subedar Major': 1, 'Subedar': 2, 'Naib Subedar': 3,
          'Havaldar': 1, 'Lance Havaldar': 2, 'Naik': 3, 'Lance Naik': 4, 'Rifleman': 5, 'Agniveer': 6
        };
        const rankOrder = (r: Rank) => {
          const o = (r as any).order;
          if (o != null && o > 0) return o;
          return RANK_ORDER[r.name?.trim() ?? ''] ?? 999;
        };
        rankList.sort((a: Rank, b: Rank) => catOrder(a) - catOrder(b) || rankOrder(a) - rankOrder(b));
        setRanks(rankList);
      }
    } catch (err: any) {
      console.error('Error fetching ranks:', err);
    }
  };

  const fetchPlatoons = async () => {
    try {
      const response = await api.get('/platoon');
      if (response.status === 'success' && response.data) {
        setPlatoons(response.data.platoons || []);
      }
    } catch (err: any) {
      console.error('Error fetching platoons:', err);
    }
  };

  const fetchTradesmen = async () => {
    try {
      const response = await api.get('/tradesman');
      if (response.status === 'success' && response.data) {
        setTradesmen(response.data.tradesmen || []);
      }
    } catch (err: any) {
      console.error('Error fetching tradesmen:', err);
    }
  };

  const fetchFilteredPersonnel = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        limit
      };

      if (companyId !== null) {
        params.company_id = companyId;
      }
      if (rankId !== null) {
        params.rank_id = rankId;
      }
      if (platoonId !== null) {
        params.platoon_id = platoonId;
      }
      if (tradesmanId !== null) {
        params.tradesman_id = tradesmanId;
      }

      if (educationType) {
        params.education_type = educationType;
      }

      if (sportsEventName) {
        params.sports_event_name = sportsEventName;
      }

      if (bloodGroupFilter) {
        params.blood_group = bloodGroupFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
        if (statusFilter === "Out Station" && formationCategory) {
          params.formation_category = formationCategory;
        }
      }

      if (asOfDate && statusFilter) {
        params.as_of_date = asOfDate;
      }

      const response = await quickFiltersService.getQuickFilteredPersonnel(params);

      if (response.status === 'success' && response.data) {
        setPersonnel(response.data.personnel || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotal(response.data.pagination?.total || 0);
      } else {
        setError("Failed to fetch filtered personnel");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch filtered personnel");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCompanyId(null);
    setRankId(null);
    setPlatoonId(null);
    setTradesmanId(null);
    setEducationType("");
    setSportsEventName("");
    setBloodGroupFilter("");
    setStatusFilter("");
    setFormationCategory("");
    setAsOfDate("");
    setPage(1);
    setPersonnel([]);
    setTotal(0);
    setTotalPages(1);
    setError(null);
    setReportData(null);
    setShowReport(false);
  };

  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      setError(null);
      const response = await quickFiltersService.getStatusReport(reportDate || undefined);
      if (response.status === "success" && response.data) {
        const data = response.data as { as_of_date: string; report: Record<string, FilteredPersonnel[]> };
        setReportData(data.report || {});
        setShowReport(true);
        setError(null);
      } else {
        setError("Failed to generate report");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReportCSV = () => {
    if (!reportData) return;
    const statusOrder = ["On ERE", "On Course", "On Leave", "Out Station", "Available"];
    const headers = ["Status", "S.No", "Army No", "Name", "Rank", "Company", "Platoon", "Trades Name", "Blood Group", "Formation"];
    const rows: string[][] = [];
    let sNo = 1;
    for (const status of statusOrder) {
      const list = reportData[status] || [];
      for (const p of list) {
        rows.push([
          status,
          String(sNo++),
          p.army_no,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          p.rank,
          p.company || "",
          p.platoon || "",
          p.trades_name || "",
          p.blood_group || "",
          p.formation_category || "",
        ]);
      }
    }
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `status-report-${reportDate || "report"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchFilteredPersonnel();
  };

  const handleDownloadCSV = async (downloadAll = false) => {
    let dataToExport = personnel;
    if (downloadAll && total > personnel.length) {
      try {
        setDownloading(true);
        const params: any = {
          page: 1,
          limit: Math.min(total, 10000)
        };
        if (companyId !== null) params.company_id = companyId;
        if (rankId !== null) params.rank_id = rankId;
        if (platoonId !== null) params.platoon_id = platoonId;
        if (tradesmanId !== null) params.tradesman_id = tradesmanId;
        if (educationType) params.education_type = educationType;
        if (sportsEventName) params.sports_event_name = sportsEventName;
        if (bloodGroupFilter) params.blood_group = bloodGroupFilter;
        if (statusFilter) {
          params.status = statusFilter;
          if (statusFilter === "Out Station" && formationCategory) params.formation_category = formationCategory;
        }
        if (asOfDate && statusFilter) params.as_of_date = asOfDate;
        const response = await quickFiltersService.getQuickFilteredPersonnel(params);
        if (response.status === 'success' && response.data?.personnel) {
          dataToExport = response.data.personnel;
        }
      } catch (err) {
        console.error('Failed to fetch all results:', err);
      } finally {
        setDownloading(false);
      }
    }
    if (dataToExport.length === 0) return;
    const headers = ["S.No", "Army No", "Name", "Rank", "Company", "Platoon", "Trades Name", "Sports Name", "Civilian Education", "Military Education", "Blood Group", "Status", "Formation"];
    const rows = dataToExport.map((p, idx) => [
      idx + 1,
      p.army_no,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      p.rank,
      p.company || "",
      p.platoon || "",
      p.trades_name || "",
      p.sports_name || "",
      p.education_civilian || "",
      p.education_military || "",
      p.blood_group || "",
      p.dynamic_status || "",
      p.formation_category || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quick-filter-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ProtectedRoute>
      <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 lg:p-8">
        <div className="flex-1 min-h-0 flex flex-col mx-auto w-full">
          {/* Header - fixed, no scroll */}
          <div className="flex-shrink-0 mb-4">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              {/* <Filter className="w-8 h-8 text-blue-400" /> */}
              Quick Filters
            </h1>
            <p className="text-gray-400">Filter personnel by Nominal Roll, Education, Sports, Blood Group, and Status (ERE, Course, Leave, Out Station)</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
            {/* Side Menu - Filters with own scroll */}
            <div className="w-full lg:w-80 flex-shrink-0 print:hidden flex flex-col min-h-0">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col min-h-0 flex-1 overflow-hidden">
                {/* Scrollable filter content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                </div>

                <div className="space-y-4">
                  {/* Nominal Role Filter */}
                  <div className="border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSections({ ...expandedSections, nominalRole: !expandedSections.nominalRole })}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="font-semibold">Nominal Roll</span>
                      {expandedSections.nominalRole ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.nominalRole && (
                      <div className="p-4 space-y-3 border-t border-white/20">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Company</label>
                          <select
                            value={companyId ?? ""}
                            onChange={(e) => setCompanyId(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">All Companies</option>
                            {companies.map((c) => (
                              <option key={c.id} value={c.id}>{c.company_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Rank</label>
                          <select
                            value={rankId ?? ""}
                            onChange={(e) => setRankId(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">All Ranks</option>
                            {ranks.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Platoon</label>
                          <select
                            value={platoonId ?? ""}
                            onChange={(e) => setPlatoonId(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">All Platoons</option>
                            {platoons.map((p) => (
                              <option key={p.id} value={p.id}>{p.platoon_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Tradesman</label>
                          <select
                            value={tradesmanId ?? ""}
                            onChange={(e) => setTradesmanId(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">All Tradesmen</option>
                            {tradesmen.map((t) => (
                              <option key={t.id} value={t.id}>{t.trade_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Education Filter */}
                  <div className="border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSections({ ...expandedSections, education: !expandedSections.education })}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="font-semibold">Education</span>
                      {expandedSections.education ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.education && (
                      <div className="p-4 border-t border-white/20">
                        <label className="block text-sm font-medium text-gray-200 mb-2">Education Category</label>
                        <select
                          value={educationType}
                          onChange={(e) => setEducationType(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                          <option value="">All Education</option>
                          <option disabled className="bg-gray-800 text-gray-400 font-semibold">── Civilian ──</option>
                          {educationCivilianOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                          <option disabled className="bg-gray-800 text-gray-400 font-semibold">── Military ──</option>
                          {educationMilitaryOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Sports Filter */}
                  <div className="border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSections({ ...expandedSections, sports: !expandedSections.sports })}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="font-semibold">Sports</span>
                      {expandedSections.sports ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.sports && (
                      <div className="p-4 border-t border-white/20">
                        <label className="block text-sm font-medium text-gray-200 mb-2">Event Name</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={sportsEventName}
                            onChange={(e) => setSportsEventName(e.target.value)}
                            placeholder="Search event name..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Blood Group Filter */}
                  <div className="border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSections({ ...expandedSections, bloodGroup: !expandedSections.bloodGroup })}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="font-semibold">Blood Group</span>
                      {expandedSections.bloodGroup ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.bloodGroup && (
                      <div className="p-4 border-t border-white/20">
                        <label className="block text-sm font-medium text-gray-200 mb-2">Blood Group</label>
                        <select
                          value={bloodGroupFilter}
                          onChange={(e) => setBloodGroupFilter(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                          <option value="">All Blood Groups</option>
                          {bloodGroupOptions.map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Status & Date - separate fields in single box */}
                  <div className="border border-white/20 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSections({ ...expandedSections, statusDate: !expandedSections.statusDate })}
                      className="w-full px-4 py-3 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Status & Date
                      </span>
                      {expandedSections.statusDate ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedSections.statusDate && (
                      <div className="p-4 border-t border-white/20 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => {
                              setStatusFilter(e.target.value);
                              if (e.target.value !== "Out Station") setFormationCategory("");
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          >
                            <option value="">All Status</option>
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        {statusFilter === "Out Station" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-200 mb-2">Formation Category (6 categories)</label>
                            <select
                              value={formationCategory}
                              onChange={(e) => setFormationCategory(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                              <option value="">All Formations</option>
                              {formationCategoryOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Filter Date (for status)</label>
                          <input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-400 mt-1">When filtering by status, use this date. Leave empty for today.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generate Status Report */}
                  <div className="border border-emerald-500/30 rounded-xl overflow-hidden bg-emerald-500/5">
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold flex items-center gap-2 text-emerald-400">
                        <FileText className="w-5 h-5" />
                        Status Report
                      </h3>
                      <p className="text-sm text-gray-400">View all personnel grouped by status (ERE, Course, Leave, Out Station, Available) for a date.</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Report Date</label>
                        <input
                          type="date"
                          value={reportDate}
                          onChange={(e) => setReportDate(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <button
                        onClick={handleGenerateReport}
                        disabled={reportLoading}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        {reportLoading ? "Generating..." : "Generate Report"}
                      </button>
                    </div>
                  </div>
                </div>
                </div>

                {/* Apply and Reset Buttons - fixed at bottom, not scrollable */}
                <div className="flex-shrink-0 p-6 pt-0">
                  <div className="pt-6 border-t border-white/20 space-y-3">
                    <button
                      onClick={handleApplyFilters}
                      disabled={loading || !hasActiveFilters}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                      <Filter className="w-5 h-5" />
                      Apply Filters
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Table / Report View - with own scroll */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col min-h-0 overflow-hidden flex-1">
                {/* Report View */}
                {showReport && (
                  <>
                    {error && (
                      <div className="p-6 border-b border-red-500/30 bg-red-500/10">
                        <p className="text-red-400">{error}</p>
                      </div>
                    )}
                    {reportData && (
                  <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="p-6 border-b border-white/20 flex-shrink-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-bold">Status Report as of {reportDate}</h2>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => { setShowReport(false); setReportData(null); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
                          >
                            Back to Filters
                          </button>
                          <button
                            onClick={handleDownloadReportCSV}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download Report
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-8 overflow-y-auto flex-1 min-h-0">
                      {(["On ERE", "On Course", "On Leave", "Out Station", "Available"] as const).map((status) => {
                        const list = reportData[status] || [];
                        return (
                          <div key={status} className="border border-white/20 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 bg-white/10 font-semibold flex items-center justify-between">
                              <span>{status}</span>
                              <span className="text-sm text-gray-400 font-normal">{list.length} personnel</span>
                            </div>
                            {list.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-white/5">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">S.No</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Army No</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Name</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Rank</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Company</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Platoon</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Trades</th>
                                      {status === "Out Station" && (
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 ">Formation</th>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/10">
                                    {list.map((p, idx) => (
                                      <tr key={p.id} className="hover:bg-white/5">
                                        <td className="px-4 py-3 text-sm">{p.s_no ?? idx + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium">{p.army_no}</td>
                                        <td className="px-4 py-3 text-sm">{p.name}</td>
                                        <td className="px-4 py-3 text-sm">{p.rank}</td>
                                        <td className="px-4 py-3 text-sm">{p.company || "-"}</td>
                                        <td className="px-4 py-3 text-sm">{p.platoon || "-"}</td>
                                        <td className="px-4 py-3 text-sm">{p.trades_name || "-"}</td>
                                        {status === "Out Station" && (
                                          <td className="px-4 py-3 text-sm">{p.formation_category || "-"}</td>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-6 text-center text-gray-400">No personnel in this status</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                    )}
                  </>
                )}

                {/* Filter Results Table */}
                {!showReport && (
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-white/20 flex-shrink-0">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-bold">Results</h2>
                    <div className="flex items-center gap-3">
                      {total > 0 && (
                        <span className="text-sm text-gray-400">
                          {total} {total === 1 ? 'record' : 'records'} found
                        </span>
                      )}
                      {personnel.length > 0 && (
                        <>
                          <button
                            onClick={() => handleDownloadCSV(false)}
                            disabled={downloading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-medium transition-colors print:hidden disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          {total > personnel.length && (
                            <button
                              onClick={() => handleDownloadCSV(true)}
                              disabled={downloading}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/60 hover:bg-emerald-500 text-white font-medium transition-colors print:hidden disabled:opacity-50"
                            >
                              <Download className="w-4 h-4" />
                              Download All ({total})
                            </button>
                          )}
                          {/* <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-medium transition-colors print:hidden"
                          >
                            <Printer className="w-4 h-4" />
                            Print
                          </button> */}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                {/* Loading State */}
                {loading && (
                  <div className="p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
                    <p className="mt-4 text-gray-400">Loading results...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="p-12 text-center">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && personnel.length === 0 && (
                  <div className="p-12 text-center">
                    <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No data found</p>
                    <p className="text-gray-500 text-sm">{hasActiveFilters ? "No personnel match your filters" : "Apply filters to see results"}</p>
                  </div>
                )}

                {/* Results Table */}
                {!loading && !error && personnel.length > 0 && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">S.No</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Army No</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Rank</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Company</th>
                            {(platoonId !== null || personnel.some(p => p.platoon)) && (
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Platoon</th>
                            )}
                            {(tradesmanId !== null || personnel.some(p => p.trades_name)) && (
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Trades Name</th>
                            )}
                            {(sportsEventName || personnel.some(p => p.sports_name)) && (
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Sports Name</th>
                            )}
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Civilian Education</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Military Education</th>
                            {(bloodGroupFilter || personnel.some(p => p.blood_group)) && (
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Blood Group</th>
                            )}
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Status</th>
                            {(statusFilter === "Out Station" || personnel.some(p => p.formation_category)) && (
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">Formation</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {personnel.map((person) => (
                            <tr key={person.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.s_no}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{person.army_no}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.rank}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.company || "-"}</td>
                              {(platoonId !== null || personnel.some(p => p.platoon)) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{person.platoon || "-"}</td>
                              )}
                              {(tradesmanId !== null || personnel.some(p => p.trades_name)) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{person.trades_name || "-"}</td>
                              )}
                              {(sportsEventName || personnel.some(p => p.sports_name)) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{person.sports_name || "-"}</td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.education_civilian || "-"}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.education_military || "-"}</td>
                              {(bloodGroupFilter || personnel.some(p => p.blood_group)) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{person.blood_group || "-"}</td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{person.dynamic_status || "-"}</td>
                              {(statusFilter === "Out Station" || personnel.some(p => p.formation_category)) && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{person.formation_category || "-"}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-white/20">
                      <Pagination
                        page={page}
                        limit={limit}
                        total={total}
                        onPageChange={setPage}
                        onLimitChange={setLimit}
                      />
                    </div>
                  </>
                )}
                </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

