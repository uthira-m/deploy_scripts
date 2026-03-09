"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Pagination } from "@/components/Pagination";
import { allPersonnelService } from "@/lib/api";
import { savePersonnelListState, loadPersonnelListState, buildReturnUrl } from "@/lib/personnelListState";
import { paginationConfig } from "@/config/pagination";
import { calculateServiceDuration } from "@/lib/utils";

interface Personnel {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  email?: string;
  phone?: string;
  dob: string;
  doe: string;
  service: string;
  photo_url?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    army_no: string;
    role: string;
  };
  companies?: {
    id: number;
    company_name: string;
  }[];
  company_personnel?: Array<{ company?: { id: number; company_name: string } }>;
  dynamic_status?: string;
  current_course_name?: string;
  rankInfo?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
    };
  };
  category?: string; // Added for unified view: 'OR', 'Officers', 'JCO'
}

const getCompanyNames = (person: Personnel) => {
  // API returns company_personnel with nested company
  const companies = person.company_personnel?.map((cp) => cp.company).filter((c) => c) || person.companies || [];
  if (companies.length === 0) return "-";
  return companies.map((c) => c.company_name).join(", ");
};

export default function AllPersonnelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [formationCategoryFilter, setFormationCategoryFilter] = useState("");
  const [page, setPage] = useState(paginationConfig.DEFAULT_PAGE);
  const [limit, setLimit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const skipInitialFetchRef = useRef(false);

  const statusOptions = ['Available', 'On Leave', 'On ERE', 'On Course', 'Out Station'];

  // Restore filter state when returning from personnel details
  useEffect(() => {
    if (searchParams.get("restore") === "1") {
      skipInitialFetchRef.current = true;
      const saved = loadPersonnelListState("all-personnel");
      if (saved) {
        const search = typeof saved.searchTerm === "string" ? saved.searchTerm : "";
        setSearchTerm(search);
        setDebouncedSearch(search);
        if (typeof saved.page === "number") setPage(saved.page);
        if (typeof saved.limit === "number") setLimit(saved.limit);
        if (typeof saved.statusFilter === "string") setStatusFilter(saved.statusFilter);
        router.replace("/dashboard/all-personnel", { scroll: false });
      } else {
        skipInitialFetchRef.current = false;
      }
    }
  }, [searchParams]);

  const saveListStateAndNavigate = () => {
    savePersonnelListState("all-personnel", {
      searchTerm,
      page,
      limit,
      statusFilter,
    });
  };

  const getDisplayStatus = (person: Personnel) => {
    return person.dynamic_status || "Available";
  };

  const deriveStatusFilterValue = (value: string | null) => {
    if (!value) return "";
    const normalized = value.toLowerCase();
    if (normalized.includes("available")) return "Available";
    if (normalized.includes("leave")) return "On Leave";
    if (normalized.includes("ere")) return "On ERE";
    if (normalized.includes("course")) return "On Course";
    if (normalized.includes("out") && normalized.includes("station")) return "Out Station";
    return "";
  };

  useEffect(() => {
    const queryStatus = deriveStatusFilterValue(searchParams.get("status"));
    const queryFormation = searchParams.get("formation_category") || "";
    if (queryStatus) {
      setStatusFilter(queryStatus);
    }
    setFormationCategoryFilter(queryFormation);
  }, [searchParams]);

  // Debounce search to avoid excessive API calls while typing
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, formationCategoryFilter]);

  // Fetch when "All" is selected (statusFilter empty), a specific status is selected, or search is applied
  const hasActiveFilters = statusFilter === '' || !!statusFilter?.trim() || !!debouncedSearch?.trim();

  useEffect(() => {
    if (!hasActiveFilters) {
      setAllPersonnel([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    const controller = new AbortController();

    const fetchAllPersonnel = async () => {
      try {
        setLoading(true);
        setError("");

        const filters: Record<string, string> = {};
        if (statusFilter && statusFilter.trim() && statusFilter !== 'All') {
          filters.status = statusFilter.trim();
          if (formationCategoryFilter && formationCategoryFilter.trim()) {
            filters.formation_category = formationCategoryFilter.trim();
          }
        }

        const response = await allPersonnelService.getAllPersonnel(
          page,
          limit,
          debouncedSearch.trim(),
          Object.keys(filters).length > 0 ? filters : undefined,
          controller.signal
        );

        if (response.status === "success" && response.data) {
          const personnel = (response.data.personnel || []).map((p: Personnel) => ({
            ...p,
            category: p.category || "OR",
          }));
          setAllPersonnel(personnel);
          const pag = (response.data as { pagination?: { total?: number } }).pagination;
          setTotal(pag?.total ?? 0);
        } else {
          setAllPersonnel([]);
          setTotal(0);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (err.message?.includes("Authentication failed")) {
          setError("Session expired. Please login again.");
        } else {
          setError(err.message || "Failed to fetch personnel data");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchAllPersonnel();
    return () => controller.abort();
  }, [page, limit, debouncedSearch, statusFilter, formationCategoryFilter]);

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            All Personnel
          </h1>
          <p className="text-gray-300 text-sm lg:text-base">
            View all personnel, officers, and JCOs in one place
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 mb-6 shadow-lg">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, army number"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  value={statusFilter || 'All'}
                  onChange={(e) => setStatusFilter(e.target.value === 'All' ? '' : e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none backdrop-blur-sm"
                >
                  <option value="">All</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {statusFilter === 'Out Station' && formationCategoryFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Formation:</span>
                  <span className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-sm font-medium">
                    {formationCategoryFilter}
                  </span>
                  <Link
                    href="/dashboard/all-personnel?status=Out Station"
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Clear
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personnel Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading personnel data...</p>
            </div>
          </div>
        ) : !hasActiveFilters ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
            <p className="text-gray-400">Apply a status filter or search to view personnel.</p>
          </div>
        ) : allPersonnel.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
            <p className="text-gray-400">No personnel found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Army No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {allPersonnel.map((person, index) => {
                    const serialNo = (page - 1) * limit + index + 1;
                    const statusValue = getDisplayStatus(person);
                    const badgeClass =
                      statusValue === 'Available'
                        ? 'bg-green-500/20 text-green-300'
                        : statusValue === 'On Leave'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : statusValue === 'On ERE'
                        ? 'bg-blue-500/20 text-blue-300'
                        : statusValue === 'On Course'
                        ? 'bg-sky-500/20 text-sky-300'
                        : statusValue?.toLowerCase().includes('out station')
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-gray-500/20 text-gray-300';

                    const categoryBadgeClass =
                      person.category === 'Officers'
                        ? 'bg-purple-500/20 text-purple-300'
                        : person.category === 'JCO'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-gray-500/20 text-gray-300';

                    return (
                      <tr key={`${person.category}-${person.id}`} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-300">{serialNo}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryBadgeClass}`}>
                            {person.category || 'OR'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{person.army_no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-white">{person.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{person.rankInfo?.name || person.rank || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{calculateServiceDuration(person.doe || "")}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{getCompanyNames(person)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${badgeClass}`}>
                            {statusValue}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {person.current_course_name || '--'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link
                            href={`/dashboard/personnel/${person.id}?from=all-personnel&returnTo=${encodeURIComponent(buildReturnUrl("all-personnel"))}`}
                            onClick={saveListStateAndNavigate}
                            className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <Pagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
              onLimitChange={setLimit}
              className="mt-4 p-4 flex-shrink-0 border-t border-white/10"
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

