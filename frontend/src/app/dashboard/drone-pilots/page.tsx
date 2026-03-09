"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { personnelService } from "@/lib/api";
import { formatDurationDates } from "@/lib/utils";
import { Drone, Search } from "lucide-react";
import Link from "next/link";

interface Proficiency {
  id: number;
  profile_id: number;
  proficiency_type: 'Drone' | 'Others';
  drone_equipment_id?: number;
  proficiency_level?: 'low' | 'medium' | 'high';
  flying_hours?: number;
  trg_cadre?: string;
  level: 'unit' | 'brigade' | 'division' | 'corps';
  duration?: string;
  location?: string;
  drone_equipment?: {
    id: number;
    equipment_name: string;
  };
  profile?: {
    id: number;
    army_no: string;
    name: string;
    rank: string;
    companyPersonnel?: Array<{
      id: number;
      company_id: number;
      status: string;
      company?: {
        id: number;
        company_name: string;
      };
    }>;
  };
}

export default function DronePilotsPage() {
  const [proficiencies, setProficiencies] = useState<Proficiency[]>([]);
  const [filteredProficiencies, setFilteredProficiencies] = useState<Proficiency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'Drone' | 'Others'>('all');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchProficiencies();
  }, []);

  useEffect(() => {
    filterProficiencies();
  }, [proficiencies, searchTerm, filterType]);

  const fetchProficiencies = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await personnelService.getAllProficiencies();
      if (response.status === "success" && response.data) {
        const data = response.data as any;
        setProficiencies(data.proficiencies || []);
      } else {
        setError("Failed to fetch proficiency records");
      }
    } catch (err: any) {
      console.error("Error fetching proficiencies:", err);
      setError(err.message || "Failed to fetch proficiency records");
    } finally {
      setLoading(false);
    }
  };

  const filterProficiencies = () => {
    let filtered = proficiencies;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.proficiency_type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const activeCompany = (p: Proficiency) => {
        const activeCompanyPersonnel = p.profile?.companyPersonnel?.find(cp => cp.status === 'Active');
        return activeCompanyPersonnel?.company?.company_name?.toLowerCase() || '';
      };
      filtered = filtered.filter(p => 
        p.profile?.name?.toLowerCase().includes(term) ||
        p.profile?.army_no?.toLowerCase().includes(term) ||
        p.profile?.rank?.toLowerCase().includes(term) ||
        activeCompany(p).includes(term) ||
        p.droneEquipment?.equipment_name?.toLowerCase().includes(term) ||
        p.trg_cadre?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term)
      );
    }

    setFilteredProficiencies(filtered);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading drone pilots...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-8">
        <div className=" mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-3 mb-4">
              {/* <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Drone className="w-8 h-8 text-blue-400" />
              </div> */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Drone Pilots
                </h1>
                <p className="text-gray-400 text-sm lg:text-base mt-1">
                  View all proficiency records
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 mb-6 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, army number, rank"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="lg:w-48 relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'Drone' | 'Others')}
                  className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Drone">Drone</option>
                  <option value="Others">Others</option>
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

          {/* Results Count */}
          <div className="mb-4 text-gray-400 text-sm">
            Showing {filteredProficiencies.length} of {proficiencies.length} records
          </div>

          {/* Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg overflow-hidden">
            {filteredProficiencies.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                    <Drone className="w-12 h-12 text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-300 font-medium mb-1">
                  No proficiency records found
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || filterType !== 'all' 
                    ? "Try adjusting your search or filters"
                    : "Proficiency records will appear here once added."}
                </p>
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
                        Army No
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Rank
                      </th>
                      {/* <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        COMPANY
                      </th> */}
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Type
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Details
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Level
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Duration
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredProficiencies.map((proficiency, index) => {
                      const activeCompanyPersonnel = proficiency.profile?.companyPersonnel?.find(cp => cp.status === 'Active');
                      const companyName = activeCompanyPersonnel?.company?.company_name || '--';
                      
                      return (
                        <tr
                          key={proficiency.id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                            {index + 1}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            {proficiency.profile ? (
                              <Link
                                href={`/dashboard/personnel/${proficiency.profile_id}`}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {proficiency.profile.army_no || '--'}
                              </Link>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            {proficiency.profile ? (
                              <Link
                                href={`/dashboard/personnel/${proficiency.profile_id}`}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <div className="font-medium text-white">
                                  {proficiency.profile.name || '--'}
                                </div>
                              </Link>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {proficiency.profile?.rank || '--'}
                          </td>
                          {/* <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {companyName}
                          </td> */}
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {proficiency.proficiency_type}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {proficiency.proficiency_type === 'Drone' ? (
                              <div>
                                <div><strong>Equipment:</strong> {proficiency.drone_equipment?.equipment_name || '-'}</div>
                                {proficiency.proficiency_level && (
                                  <div><strong>Proficiency Level:</strong> {proficiency.proficiency_level}</div>
                                )}
                                {proficiency.flying_hours && (
                                  <div><strong>Flying Hrs:</strong> {proficiency.flying_hours}</div>
                                )}
                              </div>
                            ) : (
                              <div><strong>Trg/Cadre:</strong> {proficiency.trg_cadre || '-'}</div>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {proficiency.level.charAt(0).toUpperCase() + proficiency.level.slice(1)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {formatDurationDates(proficiency.duration)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                            {proficiency.location || "--"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

