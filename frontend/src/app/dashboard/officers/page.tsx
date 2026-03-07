"use client";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import DateOfEntryInput from "@/components/DateOfEntryInput";
import { officersService, personnelService, rankService, rankCategoryService, medicalCategoryService, api } from "@/lib/api";
import { validatePersonnelDob } from "@/lib/utils";
import { paginationConfig } from "@/config/pagination";
import { MoreVertical, Eye, Trash2, KeyRound } from "lucide-react";

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
}

interface Rank {
  id: number;
  name: string;
  category_id?: number;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface RankCategory {
  id: number;
  name: string;
  description?: string;
  hierarchy_order: number;
}

interface Company {
  id: number;
  company_name: string;
}

export default function OfficersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(paginationConfig.DEFAULT_PAGE);
  const [limit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [rankCategories, setRankCategories] = useState<RankCategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [medicalCategories, setMedicalCategories] = useState<{id: number; name: string}[]>([]);
  const [formData, setFormData] = useState({
    army_no: "",
    name: "",
    rank_id: "",
    unit: "",
    email: "",
    phone: "",
    dob: "",
    doe: "",
    company_id: ""
  });
  const [phoneError, setPhoneError] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Yes, Delete",
    type: "danger",
    onConfirm: () => {}
  });
  const [openOverflowId, setOpenOverflowId] = useState<number | null>(null);
  const [actionsMenuPosition, setActionsMenuPosition] = useState<{ top: number; right: number } | null>(null);

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [filters, setFilters] = useState({
    // Personal Information
    rank: '',
    status: '',
    service: '',
    unit: '',
    email: '',
    phone: '',
    dob: '',
    doe: '',
    med_cat: '',
    special_skill: '',
    games_level: '',
    honors_awards: '',
    not_endorsed: '',
    nok: '',
    account_number: '',
    pan_card: '',
    aadhar_card: '',
    dsp_account: '',
    blood_group: '',
    date_of_marriage: '',

    // Employment Details
    present_employment: '',
    planned_employment: '',
    company_id: '',

    // Education Details
    civ: '',
    mri: '',
    mr_ii: '',

    // ERE (Employment Recommendation)
    ere_unit: '',
    ere_remarks: '',

    // Course Details
    course_name: '',
    course_status: '',
    course_from_date: '',
    course_to_date: '',

    // Field Service
    field_service_location: '',
    field_service_from_date: '',
    field_service_to_date: '',
    field_service_remarks: '',

    // Foreign Posting
    foreign_posting_unit: '',
    foreign_posting_from_date: '',
    foreign_posting_to_date: '',
    foreign_posting_remarks: '',

    // Punishment & Offence
    offence: '',
    date_of_offence: '',
    punishment_awarded: '',
    punishment_remarks: '',
    punishment_endorsed: '',

    // Family Problem
    family_problem: '',
    family_problem_remarks: '',

    // Family Details
    family_details_name: '',
    family_details_relationship: '',
    family_details_contact: '',

    // Out Station
    out_station_formation: '',
    out_station_location: '',
    out_station_employment: '',
    out_station_from_date: '',
    out_station_to_date: '',

    // Hospitalization
    hospitalisation_diagnosis: '',
    hospitalisation_medical_category: '',
    hospitalisation_remarks: '',
    hospitalisation_from_date: '',
    hospitalisation_to_date: '',

    // Sports
    sports_event_name: '',
    sports_level: '',
    sports_achievements: '',

    // Medical Category (dropdown)
    medical_category_id: '',

    // Proficiency
    proficiency_type: '',
    proficiency_level: '',
    proficiency_trg_cadre: '',
    proficiency_location: '',

    // Others
    others_remarks: '',
    suitable_for_special_emp_a: '',
    suitable_for_special_emp_b: '',
    recommendation_a: '',
    recommendation_b: ''
  });
  const [tempFilters, setTempFilters] = useState({
    // Personal Information
    rank: '',
    status: '',
    service: '',
    unit: '',
    email: '',
    phone: '',
    dob: '',
    doe: '',
    med_cat: '',
    special_skill: '',
    games_level: '',
    honors_awards: '',
    not_endorsed: '',
    nok: '',
    account_number: '',
    pan_card: '',
    aadhar_card: '',
    dsp_account: '',
    blood_group: '',
    date_of_marriage: '',

    // Employment Details
    present_employment: '',
    planned_employment: '',
    company_id: '',

    // Education Details
    civ: '',
    mri: '',
    mr_ii: '',

    // ERE (Employment Recommendation)
    ere_unit: '',
    ere_remarks: '',

    // Course Details
    course_name: '',
    course_status: '',
    course_from_date: '',
    course_to_date: '',

    // Field Service
    field_service_location: '',
    field_service_from_date: '',
    field_service_to_date: '',
    field_service_remarks: '',

    // Foreign Posting
    foreign_posting_unit: '',
    foreign_posting_from_date: '',
    foreign_posting_to_date: '',
    foreign_posting_remarks: '',

    // Punishment & Offence
    offence: '',
    date_of_offence: '',
    punishment_awarded: '',
    punishment_remarks: '',
    punishment_endorsed: '',

    // Family Problem
    family_problem: '',
    family_problem_remarks: '',

    // Family Details
    family_details_name: '',
    family_details_relationship: '',
    family_details_contact: '',

    // Out Station
    out_station_formation: '',
    out_station_location: '',
    out_station_employment: '',
    out_station_from_date: '',
    out_station_to_date: '',

    // Hospitalization
    hospitalisation_diagnosis: '',
    hospitalisation_medical_category: '',
    hospitalisation_remarks: '',
    hospitalisation_from_date: '',
    hospitalisation_to_date: '',

    // Sports
    sports_event_name: '',
    sports_level: '',
    sports_achievements: '',

    // Medical Category (dropdown)
    medical_category_id: '',

    // Proficiency
    proficiency_type: '',
    proficiency_level: '',
    proficiency_trg_cadre: '',
    proficiency_location: '',

    // Others
    others_remarks: '',
    suitable_for_special_emp_a: '',
    suitable_for_special_emp_b: '',
    recommendation_a: '',
    recommendation_b: ''
  });
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    personal: false,
    employment: false,
    education: false,
    ere: false,
    course: false,
    fieldService: false,
    foreignPosting: false,
    punishment: false,
    familyProblem: false,
    familyDetails: false,
    outStation: false,
    hospitalisation: false,
    sports: false,
    medCategory: false,
    proficiency: false,
    others: false
  });
  const router = useRouter();
  const { user } = useAuth();
  const { canModify, isAdmin } = usePermissions();

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '' && value !== null && value !== undefined) ||
           statusFilter !== '' ||
           rankFilter !== '';
  };
  const startIndex = (page - 1) * limit;
  const statusOptions = ['Available', 'On Leave', 'On ERE', 'On Course','Out Station'];
  
  // Dynamically get officer rank names from fetched data
  const rankFilterOptions = useMemo(() => {
    const OFFICER_RANK_ORDER: Record<string, number> = { 'Colonel': 1, 'Lieutenant Colonel': 2, 'Major': 3, 'Captain': 4, 'Lieutenant': 5 };
    const rankOrder = (r: Rank) => {
      const o = (r as any).order ?? (r as any).hierarchy_order;
      if (o != null && o > 0) return o;
      return OFFICER_RANK_ORDER[r.name?.trim() ?? ''] ?? 999;
    };
    return ranks
      .filter(rank => rank.is_active !== false) // Only include active ranks
      .sort((a, b) => rankOrder(a) - rankOrder(b))
      .map(rank => rank.name);
  }, [ranks]);

  // Use dynamic_status directly from API response - no need for separate course API calls
  const getDisplayStatus = (person: Personnel) => {
    return person.dynamic_status || "Available";
  };

  useEffect(() => {
    fetchOfficers();
    fetchRanks();
    fetchCompanies();
    fetchMedicalCategories();
  }, [page, searchTerm, filters, statusFilter, rankFilter]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setError("");

      // Send filters to backend instead of filtering client-side
      const filtersToSend = {
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
        ),
        ...(statusFilter && { status: statusFilter }),
        ...(rankFilter && { rank: rankFilter })
      };
      const response = await officersService.getAllOfficers(page, limit, searchTerm, Object.keys(filtersToSend).length > 0 ? filtersToSend : undefined);

      if (response.status === 'success' && response.data) {
        // Transform the data to match frontend interface
        const transformedPersonnel = (response.data.personnel || []).map((person: any) => ({
          ...person,
          companies: person.company_personnel?.map((cp: any) => cp.company).filter((c: any) => c) || []
        }));

        setPersonnel(transformedPersonnel);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotal(response.data.pagination?.total || 0);
      } else {
        setError("Failed to fetch officers data");
      }
    } catch (err: any) {
      if (err.message.includes('Authentication failed')) {
        setError("Session expired. Please login again.");
      } else {
        setError(err.message || "Failed to fetch officers data");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankListFromResponse = (data: any): Rank[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data as Rank[];
    }
    if (Array.isArray(data.ranks)) {
      return data.ranks as Rank[];
    }
    return [];
  };

  const fetchRanks = async () => {
    try {
      const response = await rankService.getAllRanks();
      if (response.status === 'success' && response.data) {
        // Filter only officer ranks
        const officersCategory = await rankCategoryService.getAllRankCategories();
        if (officersCategory.status === 'success' && officersCategory.data) {
          const rankCategoriesData = officersCategory.data.rankCategories as RankCategory[];
          setRankCategories(rankCategoriesData);
          const officersCat = rankCategoriesData.find((cat) => cat.name === 'Officers');
          if (officersCat) {
            const rankList = getRankListFromResponse(response.data);
            const officerRanks = rankList.filter(rank => rank.category_id === officersCat.id);
            setRanks(officerRanks);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching ranks:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/company?limit=100');
      console.log('Company API response:', response);
      if (response.status === 'success' && response.data) {
        const data = response.data as { companies: Company[] };
        console.log('Companies data:', data.companies);
        setCompanies(data.companies || []);
      } else {
        console.error('Company API failed:', response);
        setCompanies([]);
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setCompanies([]);
    }
  };

  const fetchMedicalCategories = async () => {
    try {
      const response = await medicalCategoryService.getAllMedicalCategoriesForDropdown();
      if (response.status === 'success' && response.data) {
        const data = response.data as { medicalCategories?: {id: number; name: string}[] };
        setMedicalCategories(data.medicalCategories || []);
      } else {
        setMedicalCategories([]);
      }
    } catch (err: any) {
      console.error('Error fetching medical categories:', err);
      setMedicalCategories([]);
    }
  };

  const validatePhone = (phone: string) => {
    if (phone && phone !== '') {
      const phoneDigits = phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        setPhoneError('Phone number must be exactly 10 digits');
        return false;
      }
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    if (!validatePhone(formData.phone)) {
      setFormLoading(false);
      return;
    }

    if (formData.dob) {
      const dobError = validatePersonnelDob(formData.dob);
      if (dobError) {
        setError(dobError);
        setFormLoading(false);
        return;
      }
    }

    try {
      const cleanedFormData = {
        ...formData,
        unit: formData.unit || null,
        email: formData.email || null,
        phone: formData.phone || null,
        dob: formData.dob || null,
        doe: formData.doe || null,
        company_id: formData.company_id || null,
        rank_id: formData.rank_id || null
      };
      
      if (editingPersonnel) {
        const response = await officersService.updateOfficer(editingPersonnel.id, cleanedFormData);
        if (response.status === 'success') {
          setShowAddForm(false);
          setEditingPersonnel(null);
          resetForm();
          await fetchOfficers();
        } else {
          setError(response.message || "Failed to update officer");
        }
      } else {
        const response = await officersService.createOfficer(cleanedFormData);
        if (response.status === 'success') {
          setShowAddForm(false);
          resetForm();
          await fetchOfficers();
        } else {
          setError(response.message || "Failed to create officer");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save officer");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setOpenOverflowId(null);
    setConfirmModal({
      isOpen: true,
      title: "Delete Officer",
      message: "Are you sure you want to delete this officer? This action cannot be undone.",
      confirmText: "Yes, Delete",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const response = await officersService.deleteOfficer(id);
          if (response.status === 'success') {
            await fetchOfficers();
          } else {
            setError(response.message || "Failed to delete officer");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete officer");
        }
      }
    });
  };

  const handleResetPassword = (person: Personnel) => {
    setOpenOverflowId(null);
    setConfirmModal({
      isOpen: true,
      title: "Reset Password",
      message: `Reset password for ${person.name} (${person.army_no}) to their date of birth? They will need to use DOB (DDMMYYYY) to login.`,
      confirmText: "Reset Password",
      type: "warning",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const response = await personnelService.resetPassword(person.id);
          if (response.status === 'success') {
            setError(null);
            await fetchOfficers();
          } else {
            setError(response.message || "Failed to reset password");
          }
        } catch (err: any) {
          setError(err.message || "Failed to reset password");
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      army_no: "",
      name: "",
      rank_id: "",
      unit: "",
      email: "",
      phone: "",
      dob: "",
      doe: "",
      company_id: ""
    });
    setEditingPersonnel(null);
    setPhoneError("");
  };

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    setFormData({
      army_no: person.army_no || "",
      name: person.name || "",
      rank_id: person.rankInfo?.id?.toString() || "",
      unit: person.unit || "",
      email: person.email || "",
      phone: person.phone || "",
      dob: person.dob || "",
      doe: person.doe || "",
      company_id: person.companies?.[0]?.id?.toString() || ""
    });
    setShowAddForm(true);
  };

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

  // Filter personnel to show only officers (backend should already do this, but adding as safety)
  const filteredPersonnel = personnel;

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText ?? "Confirm"}
          cancelText="Cancel"
          type={confirmModal.type ?? "warning"}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />

        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Officers Management</h1>
          <p className="text-gray-300 text-sm lg:text-base">Manage officer records and information</p>
        </div>

        {canModify && (
          <div className="mb-6 lg:mb-8">
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Officer
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-4 lg:p-6 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, army no, rank"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(paginationConfig.DEFAULT_PAGE);
                }}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="  flex flex-col sm:flex-row gap-3">
              <div className="relative ">
                  <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 appearance-none rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
               <svg
    className="absolute right-4 top-5 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
              </div>
            <div className="relative">
                <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="px-4 py-2 appearance-none rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ranks</option>
                {rankFilterOptions.map(rankName => (
                  <option key={rankName} value={rankName}>{rankName}</option>
                ))}
              </select>
               <svg
    className="absolute right-4 top-5 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>

            </div>
            <button
              onClick={() => {
                setTempFilters(filters);
                setShowFilterDrawer(true);
              }}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {hasActiveFilters() ? 'Filters Applied' : 'Advanced'}
            </button>
                     </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading officers...</p>
          </div>
        ) : filteredPersonnel.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No officers found</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Army No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Service Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Course Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPersonnel.map((person, index) => (
                    <tr key={person.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/dashboard/personnel/${person.id}?from=officers`}
                          className="text-blue-400 hover:text-blue-300 font-mono transition-colors cursor-pointer"
                          title="View Details"
                        >
                          {person.army_no || '-'}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{person.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{person.rankInfo?.name || person.rank || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{formatServiceDuration(person.doe)}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{getCompanyNames(person)}</td>
                      <td className="px-4 py-3 text-sm">
                        {(() => {
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

                          return (
                            <span className={`px-2 py-1 rounded text-xs ${badgeClass}`}>
                              {statusValue}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {person.current_course_name || '--'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              if (openOverflowId === person.id) {
                                setOpenOverflowId(null);
                                setActionsMenuPosition(null);
                              } else {
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                setActionsMenuPosition({ top: rect.top, right: window.innerWidth - rect.right });
                                setOpenOverflowId(person.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions dropdown - rendered via portal to escape table overflow */}
        {openOverflowId && actionsMenuPosition && typeof document !== "undefined" && (() => {
          const person = filteredPersonnel.find((p) => p.id === openOverflowId);
          if (!person) return null;
          const closeMenu = () => {
            setOpenOverflowId(null);
            setActionsMenuPosition(null);
          };
          return createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={closeMenu}
                aria-hidden="true"
              />
              <div
                className="fixed z-[9999] py-1 min-w-[160px] rounded-lg bg-slate-800 border border-white/10 shadow-xl"
                style={{
                  bottom: `calc(100vh - ${actionsMenuPosition.top}px + 4px)`,
                  right: actionsMenuPosition.right,
                }}
              >
                <Link
                  href={`/dashboard/personnel/${person.id}?from=officers`}
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                {canModify && (
                  <>
                    {isAdmin && (
                      <button
                        onClick={() => { handleResetPassword(person); closeMenu(); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        Reset Password
                      </button>
                    )}
                    <button
                      onClick={() => { handleDelete(person.id); closeMenu(); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-white/10 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>,
            document.body
          );
        })()}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm">
              Showing {filteredPersonnel.length} of {total} officers
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 lg:px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm cursor-pointer ${
                    page === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20 transition-colors'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 lg:px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingPersonnel ? 'Edit Officer' : 'Add New Officer'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Army No <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.army_no}
                      onChange={(e) => setFormData({ ...formData, army_no: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rank <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.rank_id}
                        required
                        onChange={(e) => setFormData({ ...formData, rank_id: e.target.value })}
                        className="w-full px-4 py-2 pr-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Rank</option>
                        {ranks.map((rank) => (
                          <option key={rank.id} value={rank.id}>
                            {rank.name}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        validatePhone(e.target.value);
                      }}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                  </div>
                  <div>
                    <DateOfBirthInput
                      value={formData.dob}
                      onChange={(value) => setFormData({ ...formData, dob: value })}
                      label="Date of Birth"
                      required 
                      className="px-4 py-2 bg-gray-700/50 border-gray-600"
                    />
                  </div>
                  <div>
                    <DateOfEntryInput
                      label="Date of Entry"
                      value={formData.doe}
                      onChange={(value) => setFormData({ ...formData, doe: value })}
                      className="px-4 py-2 bg-gray-700/50 border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select
                        value={formData.company_id}
                        required
                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                        className="w-full px-4 py-2 pr-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name || `Company ${company.id}`}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : editingPersonnel ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Drawer */}
        {showFilterDrawer && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFilterDrawer(false)}
            />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-md h-screen bg-gray-800/95 backdrop-blur-xl border-l border-gray-600 shadow-2xl flex flex-col">
              <div className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Filter Officers</h2>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filter Options */}
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {/* Personal Information Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, personal: !expandedCategories.personal})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Personal Information</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.personal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.personal && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Rank</label>
                          <div className="relative">
                            <select
                              value={tempFilters.rank}
                              onChange={(e) => setTempFilters({...tempFilters, rank: e.target.value})}
                              className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">All Ranks</option>
                              {ranks.map((rank) => (
                                <option key={rank.id} value={rank.name}>
                                  {rank.name}
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

                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Status</label>
                          <div className="relative">
                            <select
                              value={tempFilters.status}
                              onChange={(e) => setTempFilters({...tempFilters, status: e.target.value})}
                              className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All Status</option>
                            <option value="Available">Available</option>
                            <option value="On Leave">On Leave</option>
                            <option value="On ERE">On ERE</option>
                            <option value="On Course">On Course</option>
                            <option value="Out Station">Out Station</option>
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
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Company</label>
                          <div className="relative">
                            <select
                              value={tempFilters.company_id}
                              onChange={(e) => setTempFilters({...tempFilters, company_id: e.target.value})}
                              className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">All Companies</option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.company_name}
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

                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Phone</label>
                          <input
                            type="text"
                            value={tempFilters.phone}
                            onChange={(e) => setTempFilters({...tempFilters, phone: e.target.value})}
                            placeholder="Filter by phone"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <DateOfBirthInput
                            value={tempFilters.dob}
                            onChange={(value) => setTempFilters({...tempFilters, dob: value})}
                            label="Date of Birth"
                            minAge={0}
                            maxAge={100}
                            className="px-3 py-2 rounded-lg bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div>
                          <DateOfEntryInput
                            label="Date of Entry"
                            value={tempFilters.doe}
                            onChange={(value) => setTempFilters({...tempFilters, doe: value})}
                            className="px-3 py-2 rounded-lg bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Medical Category</label>
                          <input
                            type="text"
                            value={tempFilters.med_cat}
                            onChange={(e) => setTempFilters({...tempFilters, med_cat: e.target.value})}
                            placeholder="Filter by medical category"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Special Skills</label>
                          <input
                            type="text"
                            value={tempFilters.special_skill}
                            onChange={(e) => setTempFilters({...tempFilters, special_skill: e.target.value})}
                            placeholder="Filter by special skills"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Games Level</label>
                          <input
                            type="text"
                            value={tempFilters.games_level}
                            onChange={(e) => setTempFilters({...tempFilters, games_level: e.target.value})}
                            placeholder="Filter by games level"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Honors & Awards</label>
                          <input
                            type="text"
                            value={tempFilters.honors_awards}
                            onChange={(e) => setTempFilters({...tempFilters, honors_awards: e.target.value})}
                            placeholder="Filter by honors & awards"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Not Endorsed</label>
                          <input
                            type="text"
                            value={tempFilters.not_endorsed}
                            onChange={(e) => setTempFilters({...tempFilters, not_endorsed: e.target.value})}
                            placeholder="Filter by not endorsed"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">NOK</label>
                          <input
                            type="text"
                            value={tempFilters.nok}
                            onChange={(e) => setTempFilters({...tempFilters, nok: e.target.value})}
                            placeholder="Filter by NOK"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Account Number</label>
                          <input
                            type="text"
                            value={tempFilters.account_number}
                            onChange={(e) => setTempFilters({...tempFilters, account_number: e.target.value})}
                            placeholder="Filter by account number"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">PAN Card</label>
                          <input
                            type="text"
                            value={tempFilters.pan_card}
                            onChange={(e) => setTempFilters({...tempFilters, pan_card: e.target.value})}
                            placeholder="Filter by PAN card"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Aadhar Card</label>
                          <input
                            type="text"
                            value={tempFilters.aadhar_card}
                            onChange={(e) => setTempFilters({...tempFilters, aadhar_card: e.target.value})}
                            placeholder="Filter by Aadhar card"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">DSP Account</label>
                          <input
                            type="text"
                            value={tempFilters.dsp_account}
                            onChange={(e) => setTempFilters({...tempFilters, dsp_account: e.target.value})}
                            placeholder="Filter by DSP account"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Blood Group</label>
                          <input
                            type="text"
                            value={tempFilters.blood_group}
                            onChange={(e) => setTempFilters({...tempFilters, blood_group: e.target.value})}
                            placeholder="Filter by blood group"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Date of Marriage</label>
                          <input
                            type="date"
                            value={tempFilters.date_of_marriage}
                            onChange={(e) => setTempFilters({...tempFilters, date_of_marriage: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Employment Details Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, employment: !expandedCategories.employment})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Employment Details</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.employment ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.employment && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Present Employment</label>
                          <input
                            type="text"
                            value={tempFilters.present_employment}
                            onChange={(e) => setTempFilters({...tempFilters, present_employment: e.target.value})}
                            placeholder="Filter by present employment"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Planned Employment</label>
                          <input
                            type="text"
                            value={tempFilters.planned_employment}
                            onChange={(e) => setTempFilters({...tempFilters, planned_employment: e.target.value})}
                            placeholder="Filter by planned employment"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Company</label>
                          <div className="relative">
                            <select
                              value={tempFilters.company_id}
                              onChange={(e) => setTempFilters({...tempFilters, company_id: e.target.value})}
                              className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">All Companies</option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.company_name || `Company ${company.id}`}
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
                    )}
                  </div>

                  {/* Education Details Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, education: !expandedCategories.education})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Education Details</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.education ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.education && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">CIV</label>
                          <input
                            type="text"
                            value={tempFilters.civ}
                            onChange={(e) => setTempFilters({...tempFilters, civ: e.target.value})}
                            placeholder="Filter by CIV"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">MR I</label>
                          <select
                            value={tempFilters.mri}
                            onChange={(e) => setTempFilters({...tempFilters, mri: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All MR I Status</option>
                            <option value="pass">Pass</option>
                            <option value="yet to appear">Yet to Appear</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">MR II</label>
                          <select
                            value={tempFilters.mr_ii}
                            onChange={(e) => setTempFilters({...tempFilters, mr_ii: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All MR II Status</option>
                            <option value="pass">Pass</option>
                            <option value="yet to appear">Yet to Appear</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ERE Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, ere: !expandedCategories.ere})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">ERE (Employment Recommendation)</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.ere ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.ere && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">ERE Unit</label>
                          <input
                            type="text"
                            value={tempFilters.ere_unit}
                            onChange={(e) => setTempFilters({...tempFilters, ere_unit: e.target.value})}
                            placeholder="Filter by ERE unit"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">ERE Remarks</label>
                          <input
                            type="text"
                            value={tempFilters.ere_remarks}
                            onChange={(e) => setTempFilters({...tempFilters, ere_remarks: e.target.value})}
                            placeholder="Filter by ERE remarks"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Course Details Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, course: !expandedCategories.course})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Course Details</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.course ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.course && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Course Name</label>
                          <input
                            type="text"
                            value={tempFilters.course_name}
                            onChange={(e) => setTempFilters({...tempFilters, course_name: e.target.value})}
                            placeholder="Filter by course name"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field Service Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, fieldService: !expandedCategories.fieldService})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Field Service</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.fieldService ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.fieldService && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                          <input
                            type="text"
                            value={tempFilters.field_service_location}
                            onChange={(e) => setTempFilters({...tempFilters, field_service_location: e.target.value})}
                            placeholder="Filter by location"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">From Date</label>
                          <input
                            type="date"
                            value={tempFilters.field_service_from_date}
                            onChange={(e) => setTempFilters({...tempFilters, field_service_from_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">To Date</label>
                          <input
                            type="date"
                            value={tempFilters.field_service_to_date}
                            onChange={(e) => setTempFilters({...tempFilters, field_service_to_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Remarks</label>
                          <input
                            type="text"
                            value={tempFilters.field_service_remarks}
                            onChange={(e) => setTempFilters({...tempFilters, field_service_remarks: e.target.value})}
                            placeholder="Filter by remarks"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Foreign Posting Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, foreignPosting: !expandedCategories.foreignPosting})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Foreign Posting</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.foreignPosting ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.foreignPosting && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Unit</label>
                          <input
                            type="text"
                            value={tempFilters.foreign_posting_unit}
                            onChange={(e) => setTempFilters({...tempFilters, foreign_posting_unit: e.target.value})}
                            placeholder="Filter by unit"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">From Date</label>
                          <input
                            type="date"
                            value={tempFilters.foreign_posting_from_date}
                            onChange={(e) => setTempFilters({...tempFilters, foreign_posting_from_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">To Date</label>
                          <input
                            type="date"
                            value={tempFilters.foreign_posting_to_date}
                            onChange={(e) => setTempFilters({...tempFilters, foreign_posting_to_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Remarks</label>
                          <input
                            type="text"
                            value={tempFilters.foreign_posting_remarks}
                            onChange={(e) => setTempFilters({...tempFilters, foreign_posting_remarks: e.target.value})}
                            placeholder="Filter by remarks"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Punishment & Offence Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, punishment: !expandedCategories.punishment})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Punishment & Offence</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.punishment ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.punishment && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Offence</label>
                          <input
                            type="text"
                            value={tempFilters.offence}
                            onChange={(e) => setTempFilters({...tempFilters, offence: e.target.value})}
                            placeholder="Filter by offence"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Date of Offence</label>
                          <input
                            type="date"
                            value={tempFilters.date_of_offence}
                            onChange={(e) => setTempFilters({...tempFilters, date_of_offence: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Punishment Awarded</label>
                          <input
                            type="text"
                            value={tempFilters.punishment_awarded}
                            onChange={(e) => setTempFilters({...tempFilters, punishment_awarded: e.target.value})}
                            placeholder="Filter by punishment awarded"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Punishment Remarks</label>
                          <input
                            type="text"
                            value={tempFilters.punishment_remarks}
                            onChange={(e) => setTempFilters({...tempFilters, punishment_remarks: e.target.value})}
                            placeholder="Filter by punishment remarks"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Endorsed</label>
                          <select
                            value={tempFilters.punishment_endorsed}
                            onChange={(e) => setTempFilters({...tempFilters, punishment_endorsed: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Family Problem Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, familyProblem: !expandedCategories.familyProblem})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Family Problem</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.familyProblem ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.familyProblem && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Family Problem</label>
                          <input
                            type="text"
                            value={tempFilters.family_problem}
                            onChange={(e) => setTempFilters({...tempFilters, family_problem: e.target.value})}
                            placeholder="Filter by family problem"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Family Problem Remarks</label>
                          <input
                            type="text"
                            value={tempFilters.family_problem_remarks}
                            onChange={(e) => setTempFilters({...tempFilters, family_problem_remarks: e.target.value})}
                            placeholder="Filter by family problem remarks"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Family Details Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, familyDetails: !expandedCategories.familyDetails})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Family Details</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.familyDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.familyDetails && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
                          <input
                            type="text"
                            value={tempFilters.family_details_name}
                            onChange={(e) => setTempFilters({...tempFilters, family_details_name: e.target.value})}
                            placeholder="Filter by family member name"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Relationship</label>
                          <input
                            type="text"
                            value={tempFilters.family_details_relationship}
                            onChange={(e) => setTempFilters({...tempFilters, family_details_relationship: e.target.value})}
                            placeholder="Filter by relationship (father, mother, spouse, etc.)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Contact Number</label>
                          <input
                            type="text"
                            value={tempFilters.family_details_contact}
                            onChange={(e) => setTempFilters({...tempFilters, family_details_contact: e.target.value})}
                            placeholder="Filter by contact number"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Out Station Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, outStation: !expandedCategories.outStation})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Out Station</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.outStation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.outStation && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Formation</label>
                          <input
                            type="text"
                            value={tempFilters.out_station_formation}
                            onChange={(e) => setTempFilters({...tempFilters, out_station_formation: e.target.value})}
                            placeholder="Filter by formation"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                          <input
                            type="text"
                            value={tempFilters.out_station_location}
                            onChange={(e) => setTempFilters({...tempFilters, out_station_location: e.target.value})}
                            placeholder="Filter by location"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Employment</label>
                          <input
                            type="text"
                            value={tempFilters.out_station_employment}
                            onChange={(e) => setTempFilters({...tempFilters, out_station_employment: e.target.value})}
                            placeholder="Filter by employment"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">From Date</label>
                          <input
                            type="date"
                            value={tempFilters.out_station_from_date}
                            onChange={(e) => setTempFilters({...tempFilters, out_station_from_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">To Date</label>
                          <input
                            type="date"
                            value={tempFilters.out_station_to_date}
                            onChange={(e) => setTempFilters({...tempFilters, out_station_to_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hospitalization Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, hospitalisation: !expandedCategories.hospitalisation})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Hospitalization</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.hospitalisation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.hospitalisation && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Diagnosis</label>
                          <input
                            type="text"
                            value={tempFilters.hospitalisation_diagnosis}
                            onChange={(e) => setTempFilters({...tempFilters, hospitalisation_diagnosis: e.target.value})}
                            placeholder="Filter by diagnosis"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Medical Category</label>
                          <input
                            type="text"
                            value={tempFilters.hospitalisation_medical_category}
                            onChange={(e) => setTempFilters({...tempFilters, hospitalisation_medical_category: e.target.value})}
                            placeholder="Filter by medical category"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Remarks</label>
                          <input
                            type="text"
                            value={tempFilters.hospitalisation_remarks}
                            onChange={(e) => setTempFilters({...tempFilters, hospitalisation_remarks: e.target.value})}
                            placeholder="Filter by remarks"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Admission From Date</label>
                          <input
                            type="date"
                            value={tempFilters.hospitalisation_from_date}
                            onChange={(e) => setTempFilters({...tempFilters, hospitalisation_from_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Discharge To Date</label>
                          <input
                            type="date"
                            value={tempFilters.hospitalisation_to_date}
                            onChange={(e) => setTempFilters({...tempFilters, hospitalisation_to_date: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sports Details Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, sports: !expandedCategories.sports})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Sports Details</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.sports ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.sports && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Event Name</label>
                          <input
                            type="text"
                            value={tempFilters.sports_event_name}
                            onChange={(e) => setTempFilters({...tempFilters, sports_event_name: e.target.value})}
                            placeholder="Filter by sports event name"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Level</label>
                          <input
                            type="text"
                            value={tempFilters.sports_level}
                            onChange={(e) => setTempFilters({...tempFilters, sports_level: e.target.value})}
                            placeholder="Filter by level"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Achievements</label>
                          <input
                            type="text"
                            value={tempFilters.sports_achievements}
                            onChange={(e) => setTempFilters({...tempFilters, sports_achievements: e.target.value})}
                            placeholder="Filter by achievements"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Medical Category Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, medCategory: !expandedCategories.medCategory})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Medical Category</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.medCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.medCategory && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Medical Category</label>
                          <div className="relative">
                            <select
                              value={tempFilters.medical_category_id}
                              onChange={(e) => setTempFilters({...tempFilters, medical_category_id: e.target.value})}
                              className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">All Medical Categories</option>
                              {medicalCategories.map((mc) => (
                                <option key={mc.id} value={mc.id}>{mc.name}</option>
                              ))}
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Proficiency Details Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, proficiency: !expandedCategories.proficiency})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Proficiency Details</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.proficiency ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.proficiency && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Proficiency Type</label>
                          <input
                            type="text"
                            value={tempFilters.proficiency_type}
                            onChange={(e) => setTempFilters({...tempFilters, proficiency_type: e.target.value})}
                            placeholder="Filter by type (Drone, Others)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Level</label>
                          <select
                            value={tempFilters.proficiency_level}
                            onChange={(e) => setTempFilters({...tempFilters, proficiency_level: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All Levels</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Trg Cadre</label>
                          <input
                            type="text"
                            value={tempFilters.proficiency_trg_cadre}
                            onChange={(e) => setTempFilters({...tempFilters, proficiency_trg_cadre: e.target.value})}
                            placeholder="Filter by trg cadre"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                          <input
                            type="text"
                            value={tempFilters.proficiency_location}
                            onChange={(e) => setTempFilters({...tempFilters, proficiency_location: e.target.value})}
                            placeholder="Filter by location"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Others Category */}
                  <div className="border border-gray-600 rounded-lg">
                    <button
                      onClick={() => setExpandedCategories({...expandedCategories, others: !expandedCategories.others})}
                      className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                    >
                      <span className="font-medium text-white">Others</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.others ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedCategories.others && (
                      <div className="p-4 space-y-3 border-t border-gray-600">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Suitable for Special Emp (a)</label>
                          <input
                            type="text"
                            value={tempFilters.suitable_for_special_emp_a}
                            onChange={(e) => setTempFilters({...tempFilters, suitable_for_special_emp_a: e.target.value})}
                            placeholder="Filter by suitable for special emp (a)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Suitable for Special Emp (b)</label>
                          <input
                            type="text"
                            value={tempFilters.suitable_for_special_emp_b}
                            onChange={(e) => setTempFilters({...tempFilters, suitable_for_special_emp_b: e.target.value})}
                            placeholder="Filter by suitable for special emp (b)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Recommendation (a)</label>
                          <input
                            type="text"
                            value={tempFilters.recommendation_a}
                            onChange={(e) => setTempFilters({...tempFilters, recommendation_a: e.target.value})}
                            placeholder="Filter by recommendation (a)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-2">Recommendation (b)</label>
                          <input
                            type="text"
                            value={tempFilters.recommendation_b}
                            onChange={(e) => setTempFilters({...tempFilters, recommendation_b: e.target.value})}
                            placeholder="Filter by recommendation (b)"
                            className="w-full px-3 py-2 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 flex-shrink-0">
                  <button
                    onClick={() => {
                      const emptyFilters = {
                        // Personal Information
                        rank: '',
                        status: '',
                        service: '',
                        unit: '',
                        email: '',
                        phone: '',
                        dob: '',
                        doe: '',
                        med_cat: '',
                        special_skill: '',
                        games_level: '',
                        honors_awards: '',
                        not_endorsed: '',
                        nok: '',
                        account_number: '',
                        pan_card: '',
                        aadhar_card: '',
                        dsp_account: '',
                        blood_group: '',
                        date_of_marriage: '',

                        // Employment Details
                        present_employment: '',
                        planned_employment: '',
                        company_id: '',

                        // Education Details
                        civ: '',
                        mri: '',
                        mr_ii: '',

                        // ERE (Employment Recommendation)
                        ere_unit: '',
                        ere_remarks: '',

                        // Course Details
                        course_name: '',
                        course_status: '',
                        course_from_date: '',
                        course_to_date: '',

                        // Field Service
                        field_service_location: '',
                        field_service_from_date: '',
                        field_service_to_date: '',
                        field_service_remarks: '',

                        // Foreign Posting
                        foreign_posting_unit: '',
                        foreign_posting_from_date: '',
                        foreign_posting_to_date: '',
                        foreign_posting_remarks: '',

                        // Punishment & Offence
                        offence: '',
                        date_of_offence: '',
                        punishment_awarded: '',
                        punishment_remarks: '',
                        punishment_endorsed: '',

                        // Family Problem
                        family_problem: '',
                        family_problem_remarks: '',

                        // Family Details
                        family_details_name: '',
                        family_details_relationship: '',
                        family_details_contact: '',

                        // Out Station
                        out_station_formation: '',
                        out_station_location: '',
                        out_station_employment: '',
                        out_station_from_date: '',
                        out_station_to_date: '',

                        // Hospitalization
                        hospitalisation_diagnosis: '',
                        hospitalisation_medical_category: '',
                        hospitalisation_remarks: '',
                        hospitalisation_from_date: '',
                        hospitalisation_to_date: '',

                        // Sports
                        sports_event_name: '',
                        sports_level: '',
                        sports_achievements: '',

                        // Medical Category
                        medical_category_id: '',

                        // Proficiency
                        proficiency_type: '',
                        proficiency_level: '',
                        proficiency_trg_cadre: '',
                        proficiency_location: '',

                        // Others
                        others_remarks: '',
                        suitable_for_special_emp_a: '',
                        suitable_for_special_emp_b: '',
                        recommendation_a: '',
                        recommendation_b: ''
                      };
                      setTempFilters(emptyFilters);
                      setFilters(emptyFilters);
                      setShowFilterDrawer(false);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      setFilters(tempFilters);
                      setShowFilterDrawer(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}


