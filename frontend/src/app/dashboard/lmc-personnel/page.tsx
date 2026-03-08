"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { personnelService, api, medicalCategoryService } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";

interface Personnel {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  rankInfo?: {
    id: number;
    name: string;
  };
  natural_category?: string;
  medicalCategory?: {
    id: number;
    name: string;
  };
  med_cat?: string;
  diagnose?: string;
  date_of_medical_board?: string;
  recat_date?: string;
  pc_bc?: string;
  restriction_due_to_cat?: string;
  remarks?: string;
  companies?: {
    id: number;
    company_name: string;
  }[];
}

interface Company {
  id: number;
  company_name: string;
}

interface MedicalCategory {
  id: number;
  name: string;
}

export default function LMCPersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [medicalCategories, setMedicalCategories] = useState<MedicalCategory[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedMedicalCategory, setSelectedMedicalCategory] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchPersonnel();
    fetchCompanies();
    fetchMedicalCategories();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all personnel - we'll filter by natural_category on the frontend
      const response = await personnelService.getAllPersonnel(1, 1000, '', {});
      
      if (response.status === 'success' && response.data?.personnel) {
        // Filter personnel that have natural_category set (permanent or temporary)
        const rawPersonnel = response.data.personnel;
        const lmcPersonnel = rawPersonnel
          .filter(
            (person: Personnel) => person.natural_category && 
            (person.natural_category.toLowerCase() === 'permanent' || 
             person.natural_category.toLowerCase() === 'temporary')
          )
          .map((person: any) => ({
            ...person,
            companies: person.company_personnel?.map((cp: any) => cp.company).filter((c: any) => c) || [],
            medicalCategory: person.medical_category || person.medicalCategory
          }));
        setPersonnel(lmcPersonnel);
      } else {
        setPersonnel([]);
      }
    } catch (err: any) {
      console.error('Error fetching LMC personnel:', err);
      setError(err.message || 'Failed to fetch LMC personnel');
      setPersonnel([]);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchMedicalCategories = async () => {
    try {
      const response = await medicalCategoryService.getAllMedicalCategories();
      if (response.status === 'success' && response.data) {
        setMedicalCategories(response.data.medicalCategories || []);
      }
    } catch (err: any) {
      console.error('Error fetching medical categories:', err);
    }
  };

  // Helper function to check if person belongs to selected company
  const matchesCompanyFilter = (person: Personnel): boolean => {
    if (selectedCompany === 'all') return true;
    if (!person.companies || person.companies.length === 0) return false;
    return person.companies.some(c => c.id.toString() === selectedCompany);
  };

  // Helper function to check if person matches medical category filter
  const matchesMedicalCategoryFilter = (person: Personnel): boolean => {
    if (selectedMedicalCategory === 'all') return true;
    const medCatId = person.medicalCategory?.id?.toString();
    const medCatName = (person.medicalCategory?.name || person.med_cat || '').toLowerCase();
    const selectedCategory = medicalCategories.find(mc => mc.id.toString() === selectedMedicalCategory);
    if (!selectedCategory) return true;
    
    return medCatId === selectedMedicalCategory || 
           medCatName === selectedCategory.name.toLowerCase();
  };

  // Filter personnel by natural category and applied filters
  const permanentPersonnel = useMemo(() => {
    return personnel.filter(
      (person) => 
        person.natural_category?.toLowerCase() === 'permanent' &&
        matchesCompanyFilter(person) &&
        matchesMedicalCategoryFilter(person)
    );
  }, [personnel, selectedCompany, selectedMedicalCategory, medicalCategories]);

  const temporaryPersonnel = useMemo(() => {
    return personnel.filter(
      (person) => 
        person.natural_category?.toLowerCase() === 'temporary' &&
        matchesCompanyFilter(person) &&
        matchesMedicalCategoryFilter(person)
    );
  }, [personnel, selectedCompany, selectedMedicalCategory, medicalCategories]);

  // Helper function to get company names
  const getCompanyNames = (person: Personnel): string => {
    if (person.companies && person.companies.length > 0) {
      return person.companies.map((c) => c.company_name).join(', ');
    }
    return '--';
  };

  // Render table component
  const renderTable = (title: string, data: Personnel[], categoryType: string) => {
    return (
      <div className="mb-8">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading personnel data...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No {categoryType.toLowerCase()} category personnel found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">S No.</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Army No.</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Rank</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Personnel Name</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Company</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Medical Category</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Diagnose</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Date of Medical Board</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Recat</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">PC / BC</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Restriction Due to Cat</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.map((person, index) => (
                    <tr key={person.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">{index + 1}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">{person.army_no || '--'}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {person.rankInfo?.name || person.rank || '--'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">{person.name || '--'}</td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {getCompanyNames(person)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {person.medicalCategory?.name || person.med_cat || '--'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {person.diagnose || '--'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {formatDate(person.date_of_medical_board)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {formatDate(person.recat_date)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {person.pc_bc || '--'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {person.restriction_due_to_cat || '--'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                        {person.remarks || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
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
                LMC Personnel
              </h1>
              <p className="text-gray-400">
                View personnel categorized by permanent and temporary medical categories
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Filter */}
                <div className='relative'>
                  <label htmlFor="company-filter" className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <select
                    id="company-filter"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Companies</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id.toString()}>
                        {company.company_name}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </div>

                {/* Medical Category Filter */}
                <div className='relative'>
                  <label htmlFor="medical-category-filter" className="block text-sm font-medium text-gray-300 mb-2">
                    Medical Category
                  </label>
                  <select
                    id="medical-category-filter"
                    value={selectedMedicalCategory}
                    onChange={(e) => setSelectedMedicalCategory(e.target.value)}
                    className="w-full appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Medical Categories</option>
                    {medicalCategories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </div>
              </div>
            </div>

            {/* Permanent Category Table */}
            {renderTable('Permanent Category', permanentPersonnel, 'Permanent')}

            {/* Temporary Category Table */}
            {renderTable('Temporary Category', temporaryPersonnel, 'Temporary')}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

