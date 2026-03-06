"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { personnelService, officersService, personnelJCOService } from "@/lib/api";

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

const formatServiceDuration = (doe?: string) => {
  if (!doe) return "-";
  const startDate = new Date(doe);
  if (Number.isNaN(startDate.getTime())) return "-";
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "-";
  return `${years}y ${months}m`;
};

const getCompanyNames = (person: Personnel) => {
  if (!person.companies || person.companies.length === 0) return "-";
  return person.companies.map(company => company.company_name).join(", ");
};

export default function AllPersonnelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const statusOptions = ['Available', 'On Leave', 'On ERE', 'On Course', 'Out Station'];

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
    if (queryStatus) {
      setStatusFilter(queryStatus);
    }
  }, [searchParams]);

  // Fetch all personnel from three sources
  useEffect(() => {
    const fetchAllPersonnel = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch from all three APIs in parallel with large limits
        const [personnelResponse, officersResponse, jcoResponse] = await Promise.all([
          personnelService.getAllPersonnel(1, 1000, ""),
          officersService.getAllOfficers(1, 1000, ""),
          personnelJCOService.getAllPersonnel(1, 1000, "")
        ]);

        const combinedPersonnel: Personnel[] = [];

        // Add OR personnel (personnel API excludes JCO)
        if (personnelResponse.status === 'success' && personnelResponse.data?.personnel) {
          const orPersonnel = personnelResponse.data.personnel.map((p: Personnel) => ({
            ...p,
            category: 'OR'
          }));
          combinedPersonnel.push(...orPersonnel);
        }

        // Add Officers
        if (officersResponse.status === 'success' && officersResponse.data?.personnel) {
          const officers = officersResponse.data.personnel.map((p: Personnel) => ({
            ...p,
            category: 'Officers'
          }));
          combinedPersonnel.push(...officers);
        }

        // Add JCO personnel
        if (jcoResponse.status === 'success' && jcoResponse.data?.personnel) {
          const jcoPersonnel = jcoResponse.data.personnel.map((p: Personnel) => ({
            ...p,
            category: 'JCO'
          }));
          combinedPersonnel.push(...jcoPersonnel);
        }

        // Sort personnel by category hierarchy: Officers first, JCO second, OR third
        const categoryOrder = { 'Officers': 1, 'JCO': 2, 'OR': 3 };
        combinedPersonnel.sort((a, b) => {
          const orderA = categoryOrder[a.category as keyof typeof categoryOrder] || 999;
          const orderB = categoryOrder[b.category as keyof typeof categoryOrder] || 999;
          return orderA - orderB;
        });

        setAllPersonnel(combinedPersonnel);
      } catch (err: any) {
        if (err.message.includes('Authentication failed')) {
          setError("Session expired. Please login again.");
        } else {
          setError(err.message || "Failed to fetch personnel data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllPersonnel();
  }, []);

  const filteredPersonnel = useMemo(() => {
    return allPersonnel.filter((person) => {
      const statusValue = getDisplayStatus(person);
      const normalizedFilter = statusFilter.trim().toLowerCase();
      const normalizedStatus = (statusValue || '').trim().toLowerCase();
      const matchesStatusFilter =
        !normalizedFilter ||
        (normalizedFilter === 'out station'
          ? normalizedStatus.includes('out station')
          : normalizedStatus === normalizedFilter);

      const matchesSearch =
        (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.army_no && person.army_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.rank && person.rank.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.service && person.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.rankInfo?.name && person.rankInfo.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch && matchesStatusFilter;
    });
  }, [allPersonnel, searchTerm, statusFilter]);

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
                placeholder="Search by name, army number, or rank..."
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none backdrop-blur-sm"
                >
                  <option value="">All Status</option>
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
        ) : filteredPersonnel.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
            <p className="text-gray-400">No personnel found matching your criteria.</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Army No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPersonnel.map((person, index) => {
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
                        <td className="px-4 py-3 text-sm text-gray-300">{index + 1}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryBadgeClass}`}>
                            {person.category || 'OR'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{person.army_no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-white">{person.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{person.rankInfo?.name || person.rank || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{formatServiceDuration(person.doe)}</td>
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
                            href={`/dashboard/personnel/${person.id}`}
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
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mt-4 text-gray-300 text-sm">
            Showing {filteredPersonnel.length} of {allPersonnel.length} personnel
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

