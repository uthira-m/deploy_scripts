"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Pagination } from "@/components/Pagination";
import { personnelService, api, medicalCategoryService, rankService } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { paginationConfig } from "@/config/pagination";
import Sidebar from "@/components/Sidebar";

interface HospitalisationRecord {
  id: number;
  profile_id: number;
  date_of_admission?: string;
  date_of_discharge?: string;
  diagnosis?: string;
  medical_category?: string;
  remarks?: string;
  profile?: {
    id: number;
    army_no: string;
    name: string;
    rank: string;
    rankInfo?: { id: number; name: string };
    company_personnel?: Array<{
      company?: { id: number; company_name: string };
    }>;
  };
}

interface Company {
  id: number;
  company_name: string;
}

interface MedicalCategory {
  id: number;
  name: string;
}

interface Rank {
  id: number;
  name: string;
}

export default function LMCPersonnel2Page() {
  const [hospitalisations, setHospitalisations] = useState<HospitalisationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [medicalCategories, setMedicalCategories] = useState<MedicalCategory[]>([]);
  const [filterRank, setFilterRank] = useState<string>("");
  const [filterCompany, setFilterCompany] = useState<string>("");
  const [filterMedicalCategory, setFilterMedicalCategory] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState(paginationConfig.DEFAULT_PAGE);
  const [limit, setLimit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [total, setTotal] = useState(0);

  const fetchHospitalisations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = {
        page,
        limit,
      };
      if (filterRank) params.rank = filterRank;
      if (filterCompany) params.company = filterCompany;
      if (filterMedicalCategory) params.medical_category = filterMedicalCategory;
      if (searchText.trim()) params.search = searchText.trim();

      const response = await personnelService.getHospitalisationList(params);

      if (response.status === "success" && response.data) {
        const data = response.data as {
          hospitalisations?: HospitalisationRecord[];
          pagination?: { total?: number };
        };
        setHospitalisations(data.hospitalisations || []);
        setTotal(data.pagination?.total ?? 0);
      } else {
        setHospitalisations([]);
        setTotal(0);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch hospitalisation records";
      console.error("Error fetching hospitalisation:", err);
      setError(message);
      setHospitalisations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filterRank, filterCompany, filterMedicalCategory, searchText, page, limit]);

  useEffect(() => {
    fetchHospitalisations();
  }, [fetchHospitalisations]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [companyRes, rankRes, medCatRes] = await Promise.all([
          api.get("/company?limit=100"),
          rankService.getAllRanks(),
          medicalCategoryService.getAllMedicalCategories(),
        ]);
        if (companyRes.status === "success") setCompanies(companyRes.data?.companies || []);
        if (rankRes.status === "success") setRanks(rankRes.data?.ranks || []);
        if (medCatRes.status === "success" && medCatRes.data)
          setMedicalCategories(medCatRes.data.medicalCategories || []);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };
    fetchDropdowns();
  }, []);

  const getCompanyNames = (record: HospitalisationRecord): string => {
    const cps = record.profile?.company_personnel;
    if (!cps || cps.length === 0) return "--";
    const names = cps
      .map((cp) => cp.company?.company_name)
      .filter((n): n is string => !!n);
    return names.length > 0 ? names.join(", ") : "--";
  };

  const getRankName = (record: HospitalisationRecord): string => {
    return record.profile?.rankInfo?.name || record.profile?.rank || "--";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Sidebar />
        <div className="">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                LMC Personnel 2
              </h1>
              <p className="text-gray-400">
                View all hospitalisation records with personnel details
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Filters & Search */}
            <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">
                Filters & Search
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rank Filter - exact match */}
                <div className="relative">
                  <label
                    htmlFor="rank-filter"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Rank
                  </label>
                  <select
                    id="rank-filter"
                    value={filterRank}
                    onChange={(e) => {
                      setFilterRank(e.target.value);
                      setPage(1);
                    }}
                    className="w-full appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Ranks</option>
                    {ranks.map((r) => (
                      <option key={r.id} value={r.id.toString()}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-12 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Company Filter - exact match */}
                <div className="relative">
                  <label
                    htmlFor="company-filter"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Company
                  </label>
                  <select
                    id="company-filter"
                    value={filterCompany}
                    onChange={(e) => {
                      setFilterCompany(e.target.value);
                      setPage(1);
                    }}
                    className="w-full appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Companies</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id.toString()}>
                        {c.company_name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-12 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Medical Category Filter - exact match */}
                <div className="relative">
                  <label
                    htmlFor="medical-category-filter"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Medical Category
                  </label>
                  <select
                    id="medical-category-filter"
                    value={filterMedicalCategory}
                    onChange={(e) => {
                      setFilterMedicalCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Medical Categories</option>
                    {medicalCategories.map((mc) => (
                      <option key={mc.id} value={mc.name}>
                        {mc.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-12 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Search - name and army number (LIKE) */}
                <div>
                  <label
                    htmlFor="search-input"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Search (Name / Army No.)
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by name or army number..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white">Loading hospitalisation records...</p>
                </div>
              ) : hospitalisations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No hospitalisation records found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          S.No
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Army No.
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Name
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Rank
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Company
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Date of Admission
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Date of Discharge
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Diagnosis
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Medical Category
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {hospitalisations.map((record, index) => (
                        <tr
                          key={record.id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">
                            {record.profile?.army_no || "--"}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                            {record.profile?.name || "--"}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {getRankName(record)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {getCompanyNames(record)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {formatDate(record.date_of_admission)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {formatDate(record.date_of_discharge)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {record.diagnosis || "--"}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {record.medical_category || "--"}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {record.remarks || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && hospitalisations.length > 0 && (
                <div className="px-4 py-3 border-t border-white/10">
                  <Pagination
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                    onLimitChange={(newLimit) => {
                      setLimit(newLimit);
                      setPage(1);
                    }}
                    variant="dark"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
