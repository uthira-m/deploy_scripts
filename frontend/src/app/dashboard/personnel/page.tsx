"use client";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import DateOfEntryInput from "@/components/DateOfEntryInput";
import { personnelService, rankService, rankCategoryService, medicalCategoryService, api } from "@/lib/api";
import { calculateServiceDuration, validatePersonnelDob } from "@/lib/utils";
import { paginationConfig } from "@/config/pagination";
import { Upload, FileSpreadsheet, FileCheck, X, Clock, AlertCircle, MoreVertical, Eye, Trash2, KeyRound } from "lucide-react";
import * as XLSX from "xlsx";


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
  honors_awards?: string;
  med_cat?: string;
  special_skill?: string;
  games_level?: string;
  present_employment?: string;
  planned_employment?: string;
  photo_url?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    army_no: string;
    role: string;
  };
  companies?:{
    id: number;
    company_name: string;
  }[];
  dynamic_status?: string;
  current_course_name?: string;
  eres?: {
    id: number;
    unit: string;
    from_date: string;
    to_date: string;
    planned_ere: string;
    remarks?: string;
  }[];
  fieldServices?: {
    id: number;
    location: string;
    role: string;
    from_date: string;
    to_date: string;
    achievements?: string;
    remarks?: string;
  }[];
  foreignPostings?: {
    id: number;
    unit: string;
    from_date: string;
    to_date: string;
    remarks?: string;
  }[];
  punishmentOffences?: {
    id: number;
    offence: string;
    date_of_offence?: string;
    punishment_awarded?: string;
    remarks?: string;
    endorsed: boolean;
  }[];
  familyProblems?: {
    id: number;
    problem: string;
    remarks: string;
  }[];
  specialEmploymentSuitabilities?: {
    id: number;
    suitable_for_special_emp_a?: string;
    suitable_for_special_emp_b?: string;
  }[];
  recommendations?: {
    id: number;
    recommendation_a?: string;
    recommendation_b?: string;
  }[];
}

interface Rank {
  id: number;
  name: string;
  category_id?: number;
  hierarchy_order: number;
  description?: string;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
    description?: string;
    hierarchy_order: number;
  };
}

interface RankCategory {
  id: number;
  name: string;
  description?: string;
  hierarchy_order: number;
  is_active: boolean;
  ranks?: Rank[];
}

interface Company {
  id: number;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export default function PersonnelPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(paginationConfig.DEFAULT_PAGE);
  const [limit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
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
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    validCount: number;
    errorCount: number;
    errors: { row: number; armyNo: string; field: string; error: string }[];
    validated: boolean;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  // Phone validation function
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
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [rankCategories, setRankCategories] = useState<RankCategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [medicalCategories, setMedicalCategories] = useState<{id: number; name: string}[]>([]);
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
  const [statusFilter, setStatusFilter] = useState("");
  const [rankFilter, setRankFilter] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, login, isAuthenticated } = useAuth();
  const { canModify, isAdmin } = usePermissions();
  console.log("can modify",canModify,isAdmin);

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '' && value !== null && value !== undefined) ||
           statusFilter !== '' ||
           rankFilter !== '';
  };
  const statusOptions = ['Available', 'On Leave', 'On ERE', 'On Course', 'Out Station'];
  
  // Dynamically get OR rank names for filter dropdown
  const { jcoRankNames, orRankNames, orRankFilterOptions, orRanksForForm } = useMemo(() => {
    const jcoNames: string[] = [];
    const orNames: string[] = [];
    const orRankOptions: string[] = [];
    const orRanks: Rank[] = [];
    
    // Find JCO and OR categories
    const jcoCategory = rankCategories.find(cat => 
      cat.name.toLowerCase().includes('jco') || 
      cat.name.toLowerCase().includes('junior commissioned')
    );
    const orCategory = rankCategories.find(cat => 
      cat.name.toLowerCase().includes('other ranks') || 
      (cat.name.toLowerCase().includes('other') && cat.name.toLowerCase().includes('rank'))
    );
    
    // Get ranks belonging to JCO and OR categories
    ranks.forEach(rank => {
      const rankName = rank.name.trim();
      const rankNameLower = rankName.toLowerCase().trim();
      const categoryId = rank.category_id || rank.category?.id;
      const categoryName = rank.category?.name?.toLowerCase() || '';
      
      // Check if rank belongs to JCO category
      if (jcoCategory && (categoryId === jcoCategory.id || categoryName.includes('jco') || categoryName.includes('junior commissioned'))) {
        jcoNames.push(rankNameLower);
      }
      // Check if rank belongs to OR category
      else if (orCategory && (categoryId === orCategory.id || categoryName.includes('other ranks') || (categoryName.includes('other') && categoryName.includes('rank')))) {
        orNames.push(rankNameLower);
        // Only include active ranks (include if is_active is true or undefined)
        if (rank.is_active !== false) {
          orRankOptions.push(rankName);
          orRanks.push(rank);
        }
      }
    });
    
    // Sort rank options by hierarchy order (highest first: Havaldar, Lance Havaldar, Naik, Lance Naik, Rifleman, Agniveer)
    const OR_RANK_ORDER: Record<string, number> = { 'Havaldar': 1, 'Lance Havaldar': 2, 'Naik': 3, 'Lance Naik': 4, 'Rifleman': 5, 'Agniveer': 6 };
    const rankOrder = (r: Rank) => {
      const o = (r as any).order ?? r.hierarchy_order;
      if (o != null && o > 0) return o;
      return OR_RANK_ORDER[r.name?.trim() ?? ''] ?? 999;
    };
    orRanks.sort((a, b) => rankOrder(a) - rankOrder(b));
    orRankOptions.length = 0;
    orRanks.forEach(r => orRankOptions.push(r.name));
    
    return {
      jcoRankNames: jcoNames,
      orRankNames: orNames,
      orRankFilterOptions: orRankOptions,
      orRanksForForm: orRanks
    };
  }, [ranks, rankCategories]);
  
  const rankFilterOptions = orRankFilterOptions;
  
  // Use dynamic_status directly from API response - no need for separate course API calls
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

  // Debounce search term to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch personnel data on component mount and when page/search/filters change
  useEffect(() => {
    fetchPersonnel();
    fetchRanks();
    fetchRankCategories();
    fetchCompanies();
    fetchMedicalCategories();
  }, [page, debouncedSearchTerm, filters, statusFilter, rankFilter, bloodGroupFilter]);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      setError("");

      // Send filters to backend instead of filtering client-side
      const filtersToSend = {
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
        ),
        ...(statusFilter && { status: statusFilter }),
        ...(rankFilter && { rank: rankFilter }),
        ...(bloodGroupFilter && { blood_group: bloodGroupFilter })
      };
      const response = await personnelService.getAllPersonnel(page, limit, debouncedSearchTerm, Object.keys(filtersToSend).length > 0 ? filtersToSend : undefined);

      if (response.status === 'success' && response.data) {
        const responseData = response.data as { personnel: any[]; pagination?: { total_pages?: number; total?: number } };

        // Transform the data to match frontend interface
        const transformedPersonnel = responseData.personnel.map((person: any) => ({
          ...person,
          companies: person.company_personnel?.map((cp: any) => cp.company).filter((c: any) => c) || []
        }));

        setPersonnel(transformedPersonnel);
        setTotalPages(responseData.pagination?.total_pages || 1);
        setTotal(responseData.pagination?.total || 0);
      } else {
        setError("Failed to fetch personnel data");
      }
    } catch (err: any) {
      // Handle specific error types
      if (err.message.includes('Authentication failed')) {
        setError("Session expired. Please login again.");
      } else if (err.message.includes('401')) {
        setError("Authentication failed. Please check your login status.");
      } else {
        setError(err.message || "Failed to fetch personnel data");
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
    if (Array.isArray((data as any).ranks)) {
      return (data as any).ranks as Rank[];
    }
    return [];
  };

  const fetchRanks = async () => {
    try {
      const response = await rankService.getAllRanks();
      if (response.status === 'success' && response.data) {
        setRanks(getRankListFromResponse(response.data));
      }
    } catch (err: any) {
      console.error('Error fetching ranks:', err);
    }
  };

  const fetchRankCategories = async () => {
    try {
      const response = await rankCategoryService.getAllRankCategories();
      if (response.status === 'success' && response.data) {
        setRankCategories(response.data.rankCategories as RankCategory[]);
      }
    } catch (err: any) {
      console.error('Error fetching rank categories:', err);
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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      setFormLoading(false);
      return;
    }

    // Validate DOB (age 18-50) when provided
    if (formData.dob) {
      const dobError = validatePersonnelDob(formData.dob);
      if (dobError) {
        setError(dobError);
        setFormLoading(false);
        return;
      }
    }

    try {
      // Clean the form data - send rank_id (like officers/JCO), convert empty strings to null for optional fields
      const cleanedFormData = {
        ...formData,
        rank_id: formData.rank_id || null,
        unit: formData.unit || null,
        email: formData.email || null,
        phone: formData.phone || null,
        dob: formData.dob || null,
        doe: formData.doe || null,
        company_id: formData.company_id || null
      };
      
      const response = await personnelService.createPersonnel(cleanedFormData);
      if (response.status === 'success') {
        setShowAddForm(false);
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
        // Refresh personnel list
        await fetchPersonnel();
      } else {
        setError(response.message || "Failed to create personnel");
      }
    } catch (err: any) {
      console.error('Error creating personnel:', err);
      setError(err.message || "Failed to create personnel");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setOpenOverflowId(null);
    setConfirmModal({
      isOpen: true,
      title: "Delete Personnel",
      message: "Are you sure you want to delete this personnel? This action cannot be undone.",
      confirmText: "Yes, Delete",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const response = await personnelService.deletePersonnel(id);
          if (response.status === 'success') {
            await fetchPersonnel();
          } else {
            setError(response.message || "Failed to delete personnel");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete personnel");
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
            await fetchPersonnel();
          } else {
            setError(response.message || "Failed to reset password");
          }
        } catch (err: any) {
          setError(err.message || "Failed to reset password");
        }
      }
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await personnelService.downloadPersonnelTemplate();
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "personnel_upload_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Failed to download template");
    }
  };

  const COL_ALIASES: Record<string, string[]> = {
    army_no: ["army no", "army_no", "armyno"],
    name: ["full name", "full_name", "name"],
    rank: ["rank"],
    dob: ["date of birth", "date_of_birth", "dob"],
    doe: ["date of entry", "date_of_entry", "doe"],
    phone: ["phone number", "phone_number", "phone"],
    company: ["company"],
  };

  const parseDate = (val: string | number | Date | null | undefined): Date | null => {
    if (val == null) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    if (typeof val === "number") {
      if (val > 0 && val < 1000000) {
        const date = new Date((val - 25569) * 86400 * 1000);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    }
    const s = String(val).trim();
    if (!s) return null;
    // DD-MM-YYYY string
    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
    if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
    // Excel serial as string (e.g. "34834" when Excel stores date as number)
    const num = parseFloat(s);
    if (!isNaN(num) && num >= 1 && num <= 2958465 && /^\d+$/.test(s)) {
      const date = new Date((num - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  };

  const validateBulkUploadFile = (file: File): Promise<typeof validationResult> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          if (!rows || rows.length < 2) {
            resolve({ validCount: 0, errorCount: 0, errors: [{ row: 0, armyNo: "", field: "file", error: "File has no data rows" }], validated: true });
            return;
          }
          const header = rows[0].map((h) => String(h || "").trim().toLowerCase());
          const headerMap: Record<string, number> = {};
          for (let colIdx = 0; colIdx < header.length; colIdx++) {
            const cell = header[colIdx];
            for (const [field, aliases] of Object.entries(COL_ALIASES)) {
              if (aliases.some((a) => a === cell)) {
                headerMap[field] = colIdx;
                break;
              }
            }
          }
          const requiredFields = ["army_no", "name", "rank", "dob", "doe", "phone", "company"];
          const missing = requiredFields.filter((f) => headerMap[f] == null);
          if (missing.length > 0) {
            const labels = missing.map((f) => (f === "army_no" ? "Army No" : f === "dob" ? "Date Of Birth" : f === "doe" ? "Date Of Entry" : f.charAt(0).toUpperCase() + f.slice(1).replace(/_/g, " ")));
            resolve({ validCount: 0, errorCount: 0, errors: [{ row: 1, armyNo: "", field: "header", error: `Missing required columns: ${labels.join(", ")}` }], validated: true });
            return;
          }
          const errors: { row: number; armyNo: string; field: string; error: string }[] = [];
          const seenArmyNos = new Set<string>();
          let validCount = 0;
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i] || [];
            const getVal = (f: string) => {
              const idx = headerMap[f];
              if (idx == null || idx >= row.length) return "";
              const v = row[idx];
              return v != null ? String(v).trim() : "";
            };
            const getRawVal = (f: string) => {
              const idx = headerMap[f];
              if (idx == null || idx >= row.length) return null;
              return row[idx];
            };
            const armyNo = getVal("army_no");
            const name = getVal("name");
            const rankStr = getVal("rank");
            const dobRaw = getRawVal("dob");
            const doeRaw = getRawVal("doe");
            const phoneStr = getVal("phone");
            const companyStr = getVal("company");
            const rowNum = i + 2;
            if (!armyNo) continue; // Skip empty rows - only validate when Army No is present
            if (seenArmyNos.has(armyNo)) {
              errors.push({ row: rowNum, armyNo, field: "army_no", error: "Duplicate Army No in file - entry skipped" });
              continue;
            }
            seenArmyNos.add(armyNo); // Track for duplicate detection (add on first sight)
            if (!name) {
              errors.push({ row: rowNum, armyNo, field: "name", error: "Full Name is required" });
              continue;
            }
            if (!rankStr) {
              errors.push({ row: rowNum, armyNo, field: "rank", error: "Rank is required" });
              continue;
            }
            if (dobRaw == null || (typeof dobRaw === "string" && !dobRaw.trim())) {
              errors.push({ row: rowNum, armyNo, field: "dob", error: "Date Of Birth is required" });
              continue;
            }
            console.log("dobRaw", dobRaw);
            const dob = parseDate(dobRaw);
            console.log("dob", dob);
            if (!dob) {
              errors.push({ row: rowNum, armyNo, field: "dob", error: "Invalid Date Of Birth format (use DD-MM-YYYY)" });
              continue;
            }
            if (doeRaw == null || (typeof doeRaw === "string" && !doeRaw.trim())) {
              errors.push({ row: rowNum, armyNo, field: "doe", error: "Date Of Entry is required" });
              continue;
            }
            const doe = parseDate(doeRaw);
            if (!doe) {
              errors.push({ row: rowNum, armyNo, field: "doe", error: "Invalid Date Of Entry format (use DD-MM-YYYY)" });
              continue;
            }
            if (doe > new Date()) {
              errors.push({ row: rowNum, armyNo, field: "doe", error: "Date Of Entry cannot be in the future" });
              continue;
            }
            if (!phoneStr) {
              errors.push({ row: rowNum, armyNo, field: "phone", error: "Phone number is required" });
              continue;
            }
            const phoneDigits = phoneStr.replace(/\D/g, "");
            if (phoneDigits.length !== 10) {
              errors.push({ row: rowNum, armyNo, field: "phone", error: "Phone number must be exactly 10 digits" });
              continue;
            }
            if (!companyStr) {
              errors.push({ row: rowNum, armyNo, field: "company", error: "Company is required" });
              continue;
            }
            validCount++;
          }
          resolve({ validCount, errorCount: errors.length, errors, validated: true });
        } catch (err) {
          resolve({ validCount: 0, errorCount: 0, errors: [{ row: 0, armyNo: "", field: "file", error: "Failed to parse Excel file" }], validated: true });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (file: File | null) => {
    setUploadFile(file);
    setValidationResult(null);
    if (!file) return;
    setValidating(true);
    setError(null);
    const result = await validateBulkUploadFile(file);
    setValidationResult(result);
    setValidating(false);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setError("Please select a file to upload");
      return;
    }
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = uploadFile.name.substring(uploadFile.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const response: any = await personnelService.bulkUploadPersonnel(uploadFile);
      if (response.status === "success" && response.data) {
        const { total, successful, errors, details, summary } = response.data;
        let message = `Upload completed! ${successful} out of ${total} records processed successfully.`;
        if (errors > 0) {
          message += ` ${errors} record(s) were skipped or failed.`;
          if (details?.errors && details.errors.length > 0) {
            const errorItems = details.errors.map((err: any) => {
              const row = err.row || "?";
              const armyNo = err.army_no || "N/A";
              const errMsg = err.error || err.message || String(err);
              return `Row ${row} (Army No: ${armyNo}): ${errMsg}`;
            });
            const errorMessage = errorItems.slice(0, 20).join("\n") + (errorItems.length > 20 ? `\n... and ${errorItems.length - 20} more` : "");
            setError(`Upload completed with ${errors} errors:\n\n${errorMessage}`);
          }
        }
        if (summary?.success_rate) {
          message += ` Success rate: ${summary.success_rate}`;
        }
        setShowUploadModal(false);
        setUploadFile(null);
        setValidationResult(null);
        // Only refresh list when there were no errors - otherwise fetchPersonnel clears the error display
        if (errors === 0) {
          await fetchPersonnel();
        }
      } else {
        setError(response.message || "Failed to upload file");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // Filter personnel to exclude JCO (backend should already do this, but adding as safety)
  const filteredPersonnel = personnel.filter(person => {
    // Always exclude JCO - only show OR category
    const categoryName = (person.rankInfo?.category?.name || '').toLowerCase().trim();
    const rankName = (person.rankInfo?.name || person.rank || '').toLowerCase().trim();
    const isJCOByCategory = !!categoryName && (categoryName.includes('jco') || categoryName.includes('junior commissioned'));
    const isJCOByRank = jcoRankNames.some(jcoRank => rankName.includes(jcoRank));
    const isJCO = isJCOByCategory || isJCOByRank;

    // Exclude JCO personnel
    return !isJCO;
  });

  const getCompanyNames = (person: Personnel) => {
    if (!person.companies || person.companies.length === 0) return '--';
    return person.companies.map(company => company.company_name).join(', ');
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        {/* Confirmation Modal */}
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

        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            {user?.role === 'commander' ? 'My Personnel' : 'Personnel Management'}
          </h1>
          <p className="text-gray-300 text-sm lg:text-base">
            {user?.role === 'commander' 
              ? 'Manage other personnel in your company'
              : 'Manage personnel records and information'
            }
          </p>
        </div>

        {/* Add Personnel and Bulk Upload Buttons - For Admin */}
        {canModify && user?.role === 'admin' && (
          <div className="mb-6 lg:mb-8 flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Personnel
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Bulk Upload (Excel)
            </button>
          </div>
        )}
        
        {/* View-Only Notice for Personnel only */}
        {!canModify && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
            <p className="text-sm">
              📖 You are viewing personnel in read-only mode. Contact an administrator to make changes.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 whitespace-pre-line">
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
                  setPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 appearance-none rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
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
              <div className="relative">
                <select
                  value={rankFilter}
                  onChange={(e) => setRankFilter(e.target.value)}
                  className="px-4 py-2 appearance-none rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="">All Ranks</option>
                  {rankFilterOptions.map(rankName => (
                    <option key={rankName} value={rankName}>{rankName}</option>
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
              <div className="relative">
                <select
                  value={bloodGroupFilter}
                  onChange={(e) => {
                    setBloodGroupFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 appearance-none rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                >
                  <option value="">All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
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

        {/* Personnel Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading personnel data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">S.No</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Army No</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Name</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Rank</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Service Duration</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Company</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Status</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Course Name</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredPersonnel.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 lg:px-6 py-8 text-center text-gray-400">
                        {personnel.length === 0 
                          ? (user?.role === 'commander' ? "No other personnel in your company" : "No personnel found")
                          : "No personnel match your search criteria"
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredPersonnel.map((person,index) => (
                      <tr key={person.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base">{(page - 1) * limit + index + 1}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <Link
                            href={`/dashboard/personnel/${person.id}`}
                            className="text-blue-400 hover:text-blue-300 font-mono text-sm lg:text-base transition-colors cursor-pointer"
                            title="View Details"
                          >
                            {person.army_no || '--'}
                          </Link>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">{person.name || '--'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{person.rankInfo?.name || person.rank || '--'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">{calculateServiceDuration(person.doe)}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                          {getCompanyNames(person)}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {(() => {
                            const statusValue = getDisplayStatus(person);
                            const badgeClass =
                              statusValue === 'On Leave'
                                ? 'bg-yellow-100 text-yellow-800'
                                : statusValue === 'On ERE'
                                ? 'bg-blue-100 text-blue-800'
                                : statusValue === 'On Course'
                                ? 'bg-sky-100 text-sky-800'
                                : statusValue === 'Out Station'
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-green-100 text-green-800';

                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                                {statusValue}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                          {person.current_course_name || '--'}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                  href={`/dashboard/personnel/${person.id}`}
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
              Showing {personnel.length} of {total} personnel
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
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Add Personnel Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 w-full max-w-3xl shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Personnel</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1 */}
                <div>
                  <label className="block text-gray-200 mb-1">Army Number <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.army_no}
                    onChange={(e) => setFormData({...formData, army_no: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                    placeholder="Enter Army Number"
                  />
                </div>

                {/* Column 2 */}
                <div>
                  <label className="block text-gray-200 mb-1">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                    placeholder="Enter Full Name"
                  />
                </div>

                {/* Column 1 */}
                <div className="relative">
                  <label className="block text-gray-200 mb-1">Rank <span className="text-red-400">*</span></label>
                  <select 
                    required
                    value={formData.rank_id}
                    onChange={(e) => setFormData({...formData, rank_id: e.target.value})}
                    className="w-full appearance-none px-4 py-3 pr-10 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Rank</option>
                    {orRanksForForm.map((rank) => (
                      <option key={rank.id} value={String(rank.id)}>
                        {rank.name}
                      </option>
                    ))}
                  </select>
                   <svg
                    className="absolute right-4 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Column 2 */}
                <div>
                  <label className="block text-gray-200 mb-1">Phone <span className="text-red-400">*</span></label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({...formData, phone: e.target.value});
                      validatePhone(e.target.value);
                    }}
                    className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${phoneError ? 'border-red-400' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm`}
                    placeholder="Enter 10-digit Phone Number"
                    maxLength={10}
                  />
                  {phoneError && (
                    <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                  )}
                </div>
                  {/* Column 1 */}
                <div>
                  <DateOfBirthInput
                    value={formData.dob}
                    onChange={(value) => setFormData({...formData, dob: value})}
                    label="Date of Birth"
                    required
                    className="px-4 py-3 rounded-xl bg-white/10 border-white/20 backdrop-blur-sm"
                  />
                </div>

                {/* Column 2 */}
                <div>
                  <DateOfEntryInput
                    label="Date of Entry"
                    required
                    value={formData.doe}
                    onChange={(value) => setFormData({...formData, doe: value})}
                    className="px-4 py-3 rounded-xl bg-white/10 border-white/20 backdrop-blur-sm"
                  />
                </div>

              

                {/* Column 1 */}
                <div className="relative">
                  <label className="block text-gray-200 mb-1">Company <span className="text-red-400">*</span></label>
                  <select 
                    required
                    value={formData.company_id}
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.company_name || `Company ${company.id}`}
                      </option>
                    ))}
                  </select>
                    <svg
    className="absolute right-4 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 mt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
                >
                  {formLoading ? "Adding..." : "Add Personnel"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 border border-white/20 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      
      {/* Test Login Button (Development Only) */}
      {process.env.NODE_ENV === 'development' && !isAuthenticated && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
          <button
            onClick={async () => {
              try {
                await login('ADMIN001', 'admin123');
        
              } catch (error) {
                
              }
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Login (ADMIN001/admin123)
          </button>
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
          <div className="relative ml-auto w-full max-w-md h-screen bg-white/10 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col">
            <div className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Filter Personnel</h2>
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
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, personal: !expandedCategories.personal})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Personal Information</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.personal ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.personal && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Rank</label>
                        <div className="relative">
                          <select
                            value={tempFilters.rank}
                            onChange={(e) => setTempFilters({...tempFilters, rank: e.target.value})}
                            className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All Ranks</option>
                             {rankFilterOptions.map((rankName) => (
                                      <option key={rankName} value={rankName}>
                                        {rankName}
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
                            className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <DateOfBirthInput
                          value={tempFilters.dob}
                          onChange={(value) => setTempFilters({...tempFilters, dob: value})}
                          label="Date of Birth"
                          minAge={0}
                          maxAge={100}
                          className="px-3 py-2 rounded-lg bg-white/10 border-white/20"
                        />
                      </div>
                      <div>
                        <DateOfEntryInput
                          label="Date of Entry"
                          value={tempFilters.doe}
                          onChange={(value) => setTempFilters({...tempFilters, doe: value})}
                          className="px-3 py-2 rounded-lg bg-white/10 border-white/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Medical Category</label>
                        <input
                          type="text"
                          value={tempFilters.med_cat}
                          onChange={(e) => setTempFilters({...tempFilters, med_cat: e.target.value})}
                          placeholder="Filter by medical category"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Special Skills</label>
                        <input
                          type="text"
                          value={tempFilters.special_skill}
                          onChange={(e) => setTempFilters({...tempFilters, special_skill: e.target.value})}
                          placeholder="Filter by special skills"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Games Level</label>
                        <input
                          type="text"
                          value={tempFilters.games_level}
                          onChange={(e) => setTempFilters({...tempFilters, games_level: e.target.value})}
                          placeholder="Filter by games level"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Honors & Awards</label>
                        <input
                          type="text"
                          value={tempFilters.honors_awards}
                          onChange={(e) => setTempFilters({...tempFilters, honors_awards: e.target.value})}
                          placeholder="Filter by honors & awards"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Not Endorsed</label>
                        <input
                          type="text"
                          value={tempFilters.not_endorsed}
                          onChange={(e) => setTempFilters({...tempFilters, not_endorsed: e.target.value})}
                          placeholder="Filter by not endorsed"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">NOK</label>
                        <input
                          type="text"
                          value={tempFilters.nok}
                          onChange={(e) => setTempFilters({...tempFilters, nok: e.target.value})}
                          placeholder="Filter by NOK"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Account Number</label>
                        <input
                          type="text"
                          value={tempFilters.account_number}
                          onChange={(e) => setTempFilters({...tempFilters, account_number: e.target.value})}
                          placeholder="Filter by account number"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">PAN Card</label>
                        <input
                          type="text"
                          value={tempFilters.pan_card}
                          onChange={(e) => setTempFilters({...tempFilters, pan_card: e.target.value})}
                          placeholder="Filter by PAN card"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Aadhar Card</label>
                        <input
                          type="text"
                          value={tempFilters.aadhar_card}
                          onChange={(e) => setTempFilters({...tempFilters, aadhar_card: e.target.value})}
                          placeholder="Filter by Aadhar card"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">DSP Account</label>
                        <input
                          type="text"
                          value={tempFilters.dsp_account}
                          onChange={(e) => setTempFilters({...tempFilters, dsp_account: e.target.value})}
                          placeholder="Filter by DSP account"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Blood Group</label>
                        <input
                          type="text"
                          value={tempFilters.blood_group}
                          onChange={(e) => setTempFilters({...tempFilters, blood_group: e.target.value})}
                          placeholder="Filter by blood group"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Date of Marriage</label>
                        <input
                          type="date"
                          value={tempFilters.date_of_marriage}
                          onChange={(e) => setTempFilters({...tempFilters, date_of_marriage: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Employment Details Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, employment: !expandedCategories.employment})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Employment Details</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.employment ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.employment && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Present Employment</label>
                        <input
                          type="text"
                          value={tempFilters.present_employment}
                          onChange={(e) => setTempFilters({...tempFilters, present_employment: e.target.value})}
                          placeholder="Filter by present employment"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Planned Employment</label>
                        <input
                          type="text"
                          value={tempFilters.planned_employment}
                          onChange={(e) => setTempFilters({...tempFilters, planned_employment: e.target.value})}
                          placeholder="Filter by planned employment"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Company</label>
                        <div className="relative">
                          <select
                            value={tempFilters.company_id}
                            onChange={(e) => setTempFilters({...tempFilters, company_id: e.target.value})}
                            className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    </div>
                  )}
                </div>

                {/* Education Details Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, education: !expandedCategories.education})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Education Details</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.education ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.education && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">CIV</label>
                        <input
                          type="text"
                          value={tempFilters.civ}
                          onChange={(e) => setTempFilters({...tempFilters, civ: e.target.value})}
                          placeholder="Filter by CIV"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">MR I</label>
                        <select
                          value={tempFilters.mri}
                          onChange={(e) => setTempFilters({...tempFilters, mri: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, ere: !expandedCategories.ere})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">ERE (Employment Recommendation)</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.ere ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.ere && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">ERE Unit</label>
                        <input
                          type="text"
                          value={tempFilters.ere_unit}
                          onChange={(e) => setTempFilters({...tempFilters, ere_unit: e.target.value})}
                          placeholder="Filter by ERE unit"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">ERE Remarks</label>
                        <input
                          type="text"
                          value={tempFilters.ere_remarks}
                          onChange={(e) => setTempFilters({...tempFilters, ere_remarks: e.target.value})}
                          placeholder="Filter by ERE remarks"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Details Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, course: !expandedCategories.course})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Course Details</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.course ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.course && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Course Name</label>
                        <input
                          type="text"
                          value={tempFilters.course_name}
                          onChange={(e) => setTempFilters({...tempFilters, course_name: e.target.value})}
                          placeholder="Filter by course name"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                   
                    </div>
                  )}
                </div>

                {/* Field Service Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, fieldService: !expandedCategories.fieldService})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Field Service</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.fieldService ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.fieldService && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                        <input
                          type="text"
                          value={tempFilters.field_service_location}
                          onChange={(e) => setTempFilters({...tempFilters, field_service_location: e.target.value})}
                          placeholder="Filter by location"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">From Date</label>
                        <input
                          type="date"
                          value={tempFilters.field_service_from_date}
                          onChange={(e) => setTempFilters({...tempFilters, field_service_from_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">To Date</label>
                        <input
                          type="date"
                          value={tempFilters.field_service_to_date}
                          onChange={(e) => setTempFilters({...tempFilters, field_service_to_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Remarks</label>
                        <input
                          type="text"
                          value={tempFilters.field_service_remarks}
                          onChange={(e) => setTempFilters({...tempFilters, field_service_remarks: e.target.value})}
                          placeholder="Filter by remarks"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Foreign Posting Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, foreignPosting: !expandedCategories.foreignPosting})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Foreign Posting</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.foreignPosting ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.foreignPosting && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Unit</label>
                        <input
                          type="text"
                          value={tempFilters.foreign_posting_unit}
                          onChange={(e) => setTempFilters({...tempFilters, foreign_posting_unit: e.target.value})}
                          placeholder="Filter by unit"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">From Date</label>
                        <input
                          type="date"
                          value={tempFilters.foreign_posting_from_date}
                          onChange={(e) => setTempFilters({...tempFilters, foreign_posting_from_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">To Date</label>
                        <input
                          type="date"
                          value={tempFilters.foreign_posting_to_date}
                          onChange={(e) => setTempFilters({...tempFilters, foreign_posting_to_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Remarks</label>
                        <input
                          type="text"
                          value={tempFilters.foreign_posting_remarks}
                          onChange={(e) => setTempFilters({...tempFilters, foreign_posting_remarks: e.target.value})}
                          placeholder="Filter by remarks"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Punishment & Offence Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, punishment: !expandedCategories.punishment})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Punishment & Offence</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.punishment ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.punishment && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Offence</label>
                        <input
                          type="text"
                          value={tempFilters.offence}
                          onChange={(e) => setTempFilters({...tempFilters, offence: e.target.value})}
                          placeholder="Filter by offence"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Date of Offence</label>
                        <input
                          type="date"
                          value={tempFilters.date_of_offence}
                          onChange={(e) => setTempFilters({...tempFilters, date_of_offence: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Punishment Awarded</label>
                        <input
                          type="text"
                          value={tempFilters.punishment_awarded}
                          onChange={(e) => setTempFilters({...tempFilters, punishment_awarded: e.target.value})}
                          placeholder="Filter by punishment awarded"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Punishment Remarks</label>
                        <input
                          type="text"
                          value={tempFilters.punishment_remarks}
                          onChange={(e) => setTempFilters({...tempFilters, punishment_remarks: e.target.value})}
                          placeholder="Filter by punishment remarks"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Endorsed</label>
                        <select
                          value={tempFilters.punishment_endorsed}
                          onChange={(e) => setTempFilters({...tempFilters, punishment_endorsed: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, familyProblem: !expandedCategories.familyProblem})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Family Problem</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.familyProblem ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.familyProblem && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Family Problem</label>
                        <input
                          type="text"
                          value={tempFilters.family_problem}
                          onChange={(e) => setTempFilters({...tempFilters, family_problem: e.target.value})}
                          placeholder="Filter by family problem"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Family Problem Remarks</label>
                        <input
                          type="text"
                          value={tempFilters.family_problem_remarks}
                          onChange={(e) => setTempFilters({...tempFilters, family_problem_remarks: e.target.value})}
                          placeholder="Filter by family problem remarks"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Family Details Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, familyDetails: !expandedCategories.familyDetails})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Family Details</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.familyDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.familyDetails && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Name</label>
                        <input
                          type="text"
                          value={tempFilters.family_details_name}
                          onChange={(e) => setTempFilters({...tempFilters, family_details_name: e.target.value})}
                          placeholder="Filter by family member name"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Relationship</label>
                        <input
                          type="text"
                          value={tempFilters.family_details_relationship}
                          onChange={(e) => setTempFilters({...tempFilters, family_details_relationship: e.target.value})}
                          placeholder="Filter by relationship (father, mother, spouse, etc.)"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Contact Number</label>
                        <input
                          type="text"
                          value={tempFilters.family_details_contact}
                          onChange={(e) => setTempFilters({...tempFilters, family_details_contact: e.target.value})}
                          placeholder="Filter by contact number"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Out Station Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, outStation: !expandedCategories.outStation})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Out Station</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.outStation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.outStation && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Formation</label>
                        <input
                          type="text"
                          value={tempFilters.out_station_formation}
                          onChange={(e) => setTempFilters({...tempFilters, out_station_formation: e.target.value})}
                          placeholder="Filter by formation"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                        <input
                          type="text"
                          value={tempFilters.out_station_location}
                          onChange={(e) => setTempFilters({...tempFilters, out_station_location: e.target.value})}
                          placeholder="Filter by location"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Employment</label>
                        <input
                          type="text"
                          value={tempFilters.out_station_employment}
                          onChange={(e) => setTempFilters({...tempFilters, out_station_employment: e.target.value})}
                          placeholder="Filter by employment"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">From Date</label>
                        <input
                          type="date"
                          value={tempFilters.out_station_from_date}
                          onChange={(e) => setTempFilters({...tempFilters, out_station_from_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">To Date</label>
                        <input
                          type="date"
                          value={tempFilters.out_station_to_date}
                          onChange={(e) => setTempFilters({...tempFilters, out_station_to_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hospitalization Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, hospitalisation: !expandedCategories.hospitalisation})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Hospitalization</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.hospitalisation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.hospitalisation && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Diagnosis</label>
                        <input
                          type="text"
                          value={tempFilters.hospitalisation_diagnosis}
                          onChange={(e) => setTempFilters({...tempFilters, hospitalisation_diagnosis: e.target.value})}
                          placeholder="Filter by diagnosis"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Medical Category</label>
                        <input
                          type="text"
                          value={tempFilters.hospitalisation_medical_category}
                          onChange={(e) => setTempFilters({...tempFilters, hospitalisation_medical_category: e.target.value})}
                          placeholder="Filter by medical category"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Remarks</label>
                        <input
                          type="text"
                          value={tempFilters.hospitalisation_remarks}
                          onChange={(e) => setTempFilters({...tempFilters, hospitalisation_remarks: e.target.value})}
                          placeholder="Filter by remarks"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Admission From Date</label>
                        <input
                          type="date"
                          value={tempFilters.hospitalisation_from_date}
                          onChange={(e) => setTempFilters({...tempFilters, hospitalisation_from_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Discharge To Date</label>
                        <input
                          type="date"
                          value={tempFilters.hospitalisation_to_date}
                          onChange={(e) => setTempFilters({...tempFilters, hospitalisation_to_date: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sports Details Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, sports: !expandedCategories.sports})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Sports Details</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.sports ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.sports && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Event Name</label>
                        <input
                          type="text"
                          value={tempFilters.sports_event_name}
                          onChange={(e) => setTempFilters({...tempFilters, sports_event_name: e.target.value})}
                          placeholder="Filter by sports event name"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Level</label>
                        <input
                          type="text"
                          value={tempFilters.sports_level}
                          onChange={(e) => setTempFilters({...tempFilters, sports_level: e.target.value})}
                          placeholder="Filter by level"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Achievements</label>
                        <input
                          type="text"
                          value={tempFilters.sports_achievements}
                          onChange={(e) => setTempFilters({...tempFilters, sports_achievements: e.target.value})}
                          placeholder="Filter by achievements"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Category Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, medCategory: !expandedCategories.medCategory})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Medical Category</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.medCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.medCategory && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Medical Category</label>
                        <div className="relative">
                          <select
                            value={tempFilters.medical_category_id}
                            onChange={(e) => setTempFilters({...tempFilters, medical_category_id: e.target.value})}
                            className="w-full appearance-none px-3 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, proficiency: !expandedCategories.proficiency})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Proficiency Details</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.proficiency ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.proficiency && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Proficiency Type</label>
                        <input
                          type="text"
                          value={tempFilters.proficiency_type}
                          onChange={(e) => setTempFilters({...tempFilters, proficiency_type: e.target.value})}
                          placeholder="Filter by type (Drone, Others)"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className='relative'>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Level</label>
                        <select
                          value={tempFilters.proficiency_level}
                          onChange={(e) => setTempFilters({...tempFilters, proficiency_level: e.target.value})}
                          className="w-full appearance-none px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Levels</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                         <svg className="absolute right-3 top-12 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Trg Cadre</label>
                        <input
                          type="text"
                          value={tempFilters.proficiency_trg_cadre}
                          onChange={(e) => setTempFilters({...tempFilters, proficiency_trg_cadre: e.target.value})}
                          placeholder="Filter by trg cadre"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Location</label>
                        <input
                          type="text"
                          value={tempFilters.proficiency_location}
                          onChange={(e) => setTempFilters({...tempFilters, proficiency_location: e.target.value})}
                          placeholder="Filter by location"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Others Category */}
                <div className="border border-white/20 rounded-lg">
                  <button
                    onClick={() => setExpandedCategories({...expandedCategories, others: !expandedCategories.others})}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Others</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedCategories.others ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategories.others && (
                    <div className="p-4 space-y-3 border-t border-white/20">
                     
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Suitable for Special Emp (a)</label>
                        <input
                          type="text"
                          value={tempFilters.suitable_for_special_emp_a}
                          onChange={(e) => setTempFilters({...tempFilters, suitable_for_special_emp_a: e.target.value})}
                          placeholder="Filter by suitable for special emp (a)"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Suitable for Special Emp (b)</label>
                        <input
                          type="text"
                          value={tempFilters.suitable_for_special_emp_b}
                          onChange={(e) => setTempFilters({...tempFilters, suitable_for_special_emp_b: e.target.value})}
                          placeholder="Filter by suitable for special emp (b)"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Recommendation (a)</label>
                        <input
                          type="text"
                          value={tempFilters.recommendation_a}
                          onChange={(e) => setTempFilters({...tempFilters, recommendation_a: e.target.value})}
                          placeholder="Filter by recommendation (a)"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Recommendation (b)</label>
                        <input
                          type="text"
                          value={tempFilters.recommendation_b}
                          onChange={(e) => setTempFilters({...tempFilters, recommendation_b: e.target.value})}
                          placeholder="Filter by recommendation (b)"
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Bulk Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Bulk Upload Personnel</h3>
                      <p className="text-sm text-gray-400 mt-0.5">Import personnel from Excel (.xlsx)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setValidationResult(null);
                    }}
                    disabled={uploading}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong className="text-white">Mandatory:</strong> Army No, Full Name, Rank, Date Of Birth, Date Of Entry, Phone number, Company (dates: DD-MM-YYYY, or Excel date format)
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    <strong className="text-gray-300">Optional:</strong> PAN Card, Aadhar Card, NOK, Account Number, DSP Account, Blood Group, Date of Marriage
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-sm text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Download template (.xlsx)
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Select Excel File</span>
                      <span className="text-red-400">*</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileSelect(file || null);
                      }}
                      className="hidden"
                      id="personnel-file-upload"
                    />
                    <label
                      htmlFor="personnel-file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group"
                    >
                      {uploadFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                            <FileCheck className="w-6 h-6 text-green-400" />
                          </div>
                          <p className="text-sm font-medium text-white">{uploadFile.name}</p>
                          <p className="text-xs text-gray-400">{(uploadFile.size / 1024).toFixed(2)} KB</p>
                          {validating && <p className="text-xs text-amber-400">Validating...</p>}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                            <Upload className="w-6 h-6 text-emerald-400" />
                          </div>
                          <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">Excel files (.xlsx, .xls) up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                {validationResult && validationResult.validated && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Validation Summary
                    </h4>
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-400">{validationResult.validCount} valid record(s)</span>
                      {validationResult.errorCount > 0 && (
                        <span className="text-amber-400">{validationResult.errorCount} error(s)</span>
                      )}
                    </div>
                    {validationResult.errors.length > 0 && (
                      <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                        {validationResult.errors.slice(0, 10).map((err, idx) => (
                          <div key={idx} className="text-amber-300/90">
                            Row {err.row} (Army No: {err.armyNo || "N/A"}): {err.error}
                          </div>
                        ))}
                        {validationResult.errors.length > 10 && (
                          <div className="text-gray-400">... and {validationResult.errors.length - 10} more</div>
                        )}
                      </div>
                    )}
                    {validationResult.validCount === 0 && validationResult.errors.length > 0 && (
                      <p className="text-amber-400 text-sm">Fix errors and re-upload to proceed.</p>
                    )}
                    {validationResult.validCount > 0 && (
                      <p className="text-emerald-400/90 text-sm">Click &quot;Confirm & Upload&quot; to proceed with {validationResult.validCount} valid record(s).</p>
                    )}
                  </div>
                )}
                <form onSubmit={handleBulkUpload} className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setValidationResult(null);
                    }}
                    disabled={uploading}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile || validating || (validationResult !== null && (validationResult.validCount === 0 || validationResult.errorCount > 0))}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {uploading ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Confirm & Upload
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
    </ProtectedRoute>
  );
} 