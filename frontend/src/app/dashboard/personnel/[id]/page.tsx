"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import {
  personnelService,
  courseService,
  rankService,
  gradeService,
  personnelEducationService,
  personnelSportsService,
  leaveService,
  medicalCategoryService,
  api,
} from "@/lib/api";
import { config } from "@/config/env";
import { calculateServiceDuration, formatDate,formatDateShort, toDateInputValue } from "@/lib/utils";
import { useNotification } from "@/contexts/NotificationContext";
import {
  User,
  BookOpen,
  Trophy,
  Globe,
  Plane,
  Scale,
  Users,
  CalendarDays,
  FileText,
  Calendar,
  ClipboardList,
  Briefcase,
  Lightbulb,
  GraduationCap,
  Upload,
  Eye,
  Trash2,
  X,
  Download,
  HeartPulse,
  ArrowLeft,
} from "lucide-react";

interface Personnel {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  nok?: string;
  account_number?: string;
  pan_card?: string;
  aadhar_card?: string;
  dsp_account?: string;
  dynamic_status?: string;
  email?: string;
  phone?: string;
  dob: string;
  doe: string;
  service: string;
  honors_awards?: string;
  med_cat?: string;
  recat_date?: string;
  not_endorsed?: string;
  medical_category_id?: number;
  diagnose?: string;
  date_of_medical_board?: string;
  pc_bc?: string;
  restriction_due_to_cat?: string;
  remarks?: string;
  natural_category?: string;
  special_skill?: string;
  games_level?: string;
  present_employment?: string;
  planned_employment?: string;
  photo_url?: string;
  blood_group?: string;
  date_of_marriage?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    army_no: string;
    role: string;
  };
  medicalCategory?: {
    id: number;
    name: string;
    is_active: boolean;
  };
  companyPersonnel?: {
    id: number;
    company_id: number;
    role: string;
    appointment_date: string;
    end_date?: string;
    status: string;
    remarks?: string;
    company: {
      id: number;
      company_name: string;
    };
  }[];
  platoon?: {
    id: number;
    platoon_name: string;
    company_id: number;
  };
  tradesman?: {
    id: number;
    trade_name: string;
  };
}

interface Course {
  id: number;
  course_title: string;
  course_name?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  completion_date?: string;
  grade?: string;
  status: "obtained" | "planned";
  remarks?: string;
  course_id?: number;
}

interface Education {
  id: number;
  personnel_id: number;
  civ: string;
  civilian_degree: "10" | "12" | "under graduate" | "post graduate" | null;
  civilian_specialisation: string | null;
  mri: "pass" | "yet to appear" | null;
  mr_ii: "pass" | "yet to appear" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Sports {
  id: number;
  personnel_id: number;
  name_of_event?: string;
  level?: string;
  year_of_participation?: string;
  achievements?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ERE {
  id: number;
  unit: string;
  from_date: string;
  to_date: string;
  planned_ere: string;
  remarks?: string;
}

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
}

interface DroneEquipment {
  id: number;
  equipment_name: string;
}

interface FieldService {
  id: number;
  location: string;
  from_date: string;
  to_date: string;
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
  remarks?: string;
  endorsed: boolean;
  section_aa?: string;
  type_of_entry?: string;
  created_at: string;
  updated_at: string;
}

interface AvailableCourse {
  id: number;
  course_title: string;
  course_title: string;
}

interface FamilyProblem {
  id: number;
  problem: string;
  remarks: string;
}

interface SpecialEmploymentSuitability {
  id: number;
  profile_id: number;
  suitable_for_special_emp_a?: string;
  suitable_for_special_emp_b?: string;
  created_at: string;
  updated_at: string;
}

interface Recommendation {
  id: number;
  profile_id: number;
  recommendation_a?: string;
  recommendation_b?: string;
  created_at: string;
  updated_at: string;
}

interface OutStationEmployment {
  id: number;
  profile_id: number;
  formation?: string;
  location?: string;
  attachment?: string;
  employment?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface Hospitalisation {
  id: number;
  profile_id: number;
  date_of_admission?: string;
  date_of_discharge?: string;
  diagnosis?: string;
  medical_category?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

interface FormationOption {
  id: number;
  name: string;
  parent_id?: number | null;
  sub_formations?: FormationOption[];
}

// Static formations - used when API returns empty or fails
const STATIC_FORMATIONS: FormationOption[] = [
  {
    id: 1,
    name: "Guards and Duties",
    sub_formations: [
      { id: 101, name: "AMN GD JASSAI" },
      { id: 102, name: "MAIN GATE GD JASSAI" },
      { id: 103, name: "11 COMPO" },
      { id: 104, name: "41 ASC SUPPLY" },
      { id: 105, name: "BHAVNAGAR" },
      { id: 106, name: "SOMNATH TEMPLE" },
      { id: 107, name: "MCO" },
      { id: 108, name: "GMP" },
      { id: 109, name: "BDE HQ" },
      { id: 110, name: "DIV HQ" },
      { id: 111, name: "CORP HQ" },
      { id: 112, name: "COMD HQ" },
      { id: 113, name: "MES IB" },
      { id: 114, name: "SOMNATH GATE" },
      { id: 115, name: "STN HQ" },
    ],
  },
  { id: 2, name: "FTS", sub_formations: [] },
  {
    id: 3,
    name: "IN STN DUTIES",
    sub_formations: [
      { id: 301, name: "SDC" },
      { id: 302, name: "WAR MEMORIAL" },
      { id: 303, name: "DOAT" },
      { id: 304, name: "SHREEDHARA STADIUM" },
      { id: 305, name: "FWC" },
      { id: 306, name: "MES COMPLAINT CELL" },
      { id: 307, name: "MES DVR" },
      { id: 308, name: "TRAILBLAZING AREA" },
      { id: 309, name: "WOI" },
      { id: 310, name: "BDE URC" },
    ],
  },
  { id: 4, name: "ATT GRRC", sub_formations: [] },
  { id: 5, name: "ATT OTHER UNITS", sub_formations: [] },
  { id: 6, name: "TD", sub_formations: [] },
];

const defaultOthersFormState = {
  suitable_for_special_emp_a: "",
  suitable_for_special_emp_b: "",
  recommendation_a: "",
  recommendation_b: "",
  out_station_formation_category: "",
  out_station_formation: "",
  out_station_location: "",
  out_station_attachment: "",
  out_station_employment: "",
  out_station_start_date: "",
  out_station_end_date: "",
  hospitalisation_date_of_admission: "",
  hospitalisation_date_of_discharge: "",
  hospitalisation_diagnosis: "",
  hospitalisation_medical_category: "",
  hospitalisation_remarks: "",
};

interface LeaveTypeInfo {
  id?: number;
  name?: string;
  max_days?: number;
}

interface LeaveApproverInfo {
  id?: number;
  name?: string;
  rank?: string;
}

interface PersonnelLeaveRecord {
  id: number;
  start_date?: string;
  end_date?: string;
  reason?: string;
  status?: string;
  total_days?: number;
  rejection_reason?: string;
  created_at?: string;
  leaveType?: LeaveTypeInfo;
  LeaveType?: LeaveTypeInfo;
  leave_type?: LeaveTypeInfo;
  leave_type_name?: string;
  approvedBy?: LeaveApproverInfo;
  approver?: LeaveApproverInfo;
  personnel_id?: number;
  personnel?: {
    id?: number;
    name?: string;
    army_no?: string;
    rank?: string;
  };
  user_id?: number;
}

interface Rank {
  id: number;
  name: string;
  category: string;
  hierarchy_order: number;
  description?: string;
  is_active: boolean;
}

interface Grade {
  grades:any
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export default function PersonnelDetailsPage() {
  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>(
    []
  );
  const [eres, setEres] = useState<ERE[]>([]);
  const [fieldServices, setFieldServices] = useState<FieldService[]>([]);
  const [foreignPostings, setForeignPostings] = useState<ForeignPosting[]>([]);
  const [proficiencies, setProficiencies] = useState<Proficiency[]>([]);
  const [droneEquipment, setDroneEquipment] = useState<DroneEquipment[]>([]);
  const [punishmentOffences, setPunishmentOffences] = useState<
    PunishmentOffence[]
  >([]);
  const [endorsedOffences, setEndorsedOffences] = useState<PunishmentOffence[]>(
    []
  );
  const [notEndorsedOffences, setNotEndorsedOffences] = useState<
    PunishmentOffence[]
  >([]);
  const [familyProblems, setFamilyProblems] = useState<FamilyProblem[]>([]);
  const [familyDetails, setFamilyDetails] = useState<any[]>([]);
  const [specialEmploymentData, setSpecialEmploymentData] = useState<
    SpecialEmploymentSuitability[]
  >([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [outStationEmployments, setOutStationEmployments] = useState<
    OutStationEmployment[]
  >([]);
  const [hospitalisations, setHospitalisations] = useState<
    Hospitalisation[]
  >([]);
  const [medicalCategories, setMedicalCategories] = useState<{ id: number; name: string }[]>([]);
  const [formations, setFormations] =
    useState<FormationOption[]>(STATIC_FORMATIONS);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [sports, setSports] = useState<Sports[]>([]);
  const [leaveRecords, setLeaveRecords] = useState<PersonnelLeaveRecord[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [applyLeaveLoading, setApplyLeaveLoading] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [showFamilyProblemModal, setShowFamilyProblemModal] = useState(false);
  const [showFamilyDetailModal, setShowFamilyDetailModal] = useState(false);
  const [showOutStationModal, setShowOutStationModal] = useState(false);
  const [showHospitalisationModal, setShowHospitalisationModal] = useState(false);
  const [showSpecialEmploymentModal, setShowSpecialEmploymentModal] =
    useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingFamilyProblem, setEditingFamilyProblem] =
    useState<FamilyProblem | null>(null);
  const [editingFamilyDetail, setEditingFamilyDetail] = useState<any | null>(null);
  const [editingPunishmentOffence, setEditingPunishmentOffence] =
    useState<PunishmentOffence | null>(null);
  const [editingOutStation, setEditingOutStation] =
    useState<OutStationEmployment | null>(null);
  const [editingHospitalisation, setEditingHospitalisation] =
    useState<Hospitalisation | null>(null);
  const [editingSpecialEmployment, setEditingSpecialEmployment] =
    useState<SpecialEmploymentSuitability | null>(null);
  const [editingRecommendation, setEditingRecommendation] =
    useState<Recommendation | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [uploadDocFormData, setUploadDocFormData] = useState({
    document_type: "payslip" as 'payslip' | 'form16',
    file: null as File | null
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success: notifySuccess, error: notifyError } = useNotification();

  const [courseFormData, setCourseFormData] = useState({
    course_id: "",
    start_date: "",
    end_date: "",
    grade: "",
    status: "obtained" as "obtained" | "planned",
    remarks: "",
  });

  const [punishmentFormData, setPunishmentFormData] = useState({
    offence: "",
    date_of_offence: "",
    punishment_awarded: "",
    remarks: "",
    endorsed: true,
    section_aa: "",
    type_of_entry: "",
  });

  const [familyProblemFormData, setFamilyProblemFormData] = useState({
    problem: "",
    remarks: "",
  });

  const [familyDetailFormData, setFamilyDetailFormData] = useState({
    relationship_type: "",
    name: "",
    dob: "",
    contact_number: "",
    pan_card: "",
    aadhar_card: "",
    account_number: "",
    blood_group: "",
  });

  const [othersFormData, setOthersFormData] = useState({
    ...defaultOthersFormState,
  });

  const [ereFormData, setEreFormData] = useState({
    unit: "",
    from_date: "",
    to_date: "",
    planned_ere: "",
    remarks: "",
  });

  const [fieldServiceFormData, setFieldServiceFormData] = useState({
    location: "",
    from_date: "",
    to_date: "",
    remarks: "",
  });

  const [foreignPostingFormData, setForeignPostingFormData] = useState({
    unit: "",
    from_date: "",
    to_date: "",
    remarks: "",
  });

  const [proficiencyFormData, setProficiencyFormData] = useState({
    proficiency_type: "" as 'Drone' | 'Others' | '',
    drone_equipment_id: "",
    proficiency_level: "" as 'low' | 'medium' | 'high' | '',
    flying_hours: "",
    trg_cadre: "",
    level: "" as 'unit' | 'brigade' | 'division' | 'corps' | '',
    duration_from: "",
    duration_to: "",
    location: "",
  });

  const [punishmentLoading, setPunishmentLoading] = useState(false);
  const [familyProblemLoading, setFamilyProblemLoading] = useState(false);
  const [familyDetailLoading, setFamilyDetailLoading] = useState(false);
  const [othersLoading, setOthersLoading] = useState(false);
  const [ereLoading, setEreLoading] = useState(false);
  const [fieldServiceLoading, setFieldServiceLoading] = useState(false);
  const [foreignPostingLoading, setForeignPostingLoading] = useState(false);
  const [proficiencyLoading, setProficiencyLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [cvDownloadLoading, setCvDownloadLoading] = useState(false);
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);
  const [showAddEreModal, setShowAddEreModal] = useState(false);
  const [showAddFieldServiceModal, setShowAddFieldServiceModal] =
    useState(false);
  const [showAddForeignPostingModal, setShowAddForeignPostingModal] =
    useState(false);
  const [showAddProficiencyModal, setShowAddProficiencyModal] = useState(false);
  const [editingEre, setEditingEre] = useState<ERE | null>(null);
  const [editingFieldService, setEditingFieldService] =
    useState<FieldService | null>(null);
  const [editingForeignPosting, setEditingForeignPosting] =
    useState<ForeignPosting | null>(null);
  const [editingProficiency, setEditingProficiency] = useState<Proficiency | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { canModify, isAdmin } = usePermissions();
  const personnelId = params.id as string;
  const fromParam = searchParams.get("from");
  const backConfig = {
    jco: { href: "/dashboard/personnel-jco", label: "Back to JCO List" },
    officers: { href: "/dashboard/officers", label: "Back to Officers List" },
    admins: { href: "/dashboard/admins", label: "Back to Admins List" },
  } as const;
  const back = (fromParam && backConfig[fromParam as keyof typeof backConfig]) || {
    href: "/dashboard/personnel",
    label: "Back to Personnel List",
  };

  // Document handlers
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadDocFormData.file || !personnel?.army_no) {
      setError('Please select a file');
      return;
    }

    try {
      setUploadingDoc(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', uploadDocFormData.file);
      formData.append('army_no', personnel.army_no);
      formData.append('document_type', uploadDocFormData.document_type);

      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Document uploaded successfully');
      setShowUploadDocModal(false);
      setUploadDocFormData({
        document_type: "payslip",
        file: null
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchDocuments();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Document",
      message: "Are you sure you want to delete this document? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          await api.delete(`/documents/${documentId}`);
          setSuccess("Document deleted successfully");
          fetchDocuments();
        } catch (error: any) {
          setError(error.response?.data?.message || "Failed to delete document");
        }
      },
    });
  };

  const viewDocument = (document: any) => {
    setSelectedDocument(document);
    setDocViewerOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '--';
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${month} ${year}, ${time}`;
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadDocFormData(prev => ({ ...prev, file }));
    }
  };

  const isOwnProfile = useMemo(() => {
    if (!user || !personnel) return false;
    if (user.role !== "personnel") return false;

    if (user.profile_id && personnel.id) {
      return user.profile_id === personnel.id;
    }

    if (user.id && personnel.user_id) {
      return user.id === personnel.user_id;
    }

    return false;
  }, [user, personnel]);

  const canManagePhoto = useMemo(() => {
    if (canModify) return true;
    return isOwnProfile;
  }, [canModify, isOwnProfile]);

  // Helper function to check if user can edit - Only admin can edit
  const canEdit = () => {
    return canModify; // Only admin can edit
  };

  useEffect(() => {
    if (personnelId) {
      fetchPersonnelDetails();
      fetchRelatedData();
      fetchAvailableCourses();
      fetchAllPersonnel();
      fetchRanks();
      fetchGrades();
      fetchEducation();
      fetchSports();
      if (user?.role) {
        fetchPersonnelLeaveRecords();
      }
      if (isAdmin) {
        fetchLeaveTypes();
      }
    }
  }, [personnelId, user?.role, isAdmin]);

  // Fetch documents when personnel data is loaded
  useEffect(() => {
    if (personnel?.army_no) {
      fetchDocuments();
    }
  }, [personnel?.army_no]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPhotoDropdown) {
        const target = event.target as Element;
        if (!target.closest(".photo-dropdown-container")) {
          setShowPhotoDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPhotoDropdown]);

  const fetchPersonnelDetails = async () => {
    try {
      setLoading(true);
      const response = await personnelService.getPersonnelById(
        parseInt(personnelId)
      );

      if (
        response.status === "success" &&
        response.data &&
        (response.data as any).personnel
      ) {
        setPersonnel((response.data as any).personnel as Personnel);
      } else {
        setError("Failed to fetch personnel details");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch personnel details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await courseService.getAllCourses();
      console.log("Available courses response:", response);
      if (
        response.status === "success" &&
        response.data &&
        (response.data as any).courses
      ) {
        setAvailableCourses((response.data as any).courses);
      }
    } catch (err: any) {
      // Don't set error here as it's not critical for the main functionality
    }
  };

  const fetchAllPersonnel = async () => {
    try {
      const response = await personnelService.getAllPersonnel();
      if (
        response.status === "success" &&
        response.data &&
        (response.data as any).personnel
      ) {
        // Filter out the current personnel from the list
        const allPersonnelData = (response.data as any).personnel.filter(
          (p: Personnel) => p.id !== parseInt(personnelId)
        );
        setAllPersonnel(allPersonnelData);
      }
    } catch (err: any) {
      // Don't set error here as it's not critical for the main functionality
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
      if (response.status === "success" && response.data) {
        const rankList = getRankListFromResponse(response.data);
        // Sort by hierarchy: Officers first, JCO, then OR; within category by rank order
        const catOrder = (r: Rank) => {
          const cat = (r as any).category;
          if (typeof cat === 'string') return cat.toLowerCase().includes('officer') && !cat.toLowerCase().includes('junior') ? 1 : cat.toLowerCase().includes('jco') ? 2 : 3;
          return cat?.hierarchy_order ?? 999;
        };
        const RANK_ORDER: Record<string, number> = {
          'Colonel': 1, 'Lieutenant Colonel': 2, 'Major': 3, 'Captain': 4, 'Lieutenant': 5,
          'Subedar Major': 1, 'Subedar': 2, 'Naib Subedar': 3,
          'Havaldar': 1, 'Lance Havaldar': 2, 'Naik': 3, 'Lance Naik': 4, 'Rifleman': 5, 'Agniveer': 6
        };
        const rankOrder = (r: Rank) => {
          const o = (r as any).order ?? r.hierarchy_order;
          if (o != null && o > 0) return o;
          return RANK_ORDER[r.name?.trim() ?? ''] ?? 999;
        };
        rankList.sort((a, b) => catOrder(a) - catOrder(b) || rankOrder(a) - rankOrder(b));
        setRanks(rankList);
      }
    } catch (err: any) {
      console.error("Error fetching ranks:", err);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await gradeService.getAllGrades();
      if (response.status === "success" && response.data) {
        setGrades(response.data.grades as Grade[]);
      }
    } catch (err: any) {
      console.error("Error fetching grades:", err);
    }
  };

  const fetchEducation = async () => {
    try {
      const response = await personnelEducationService.getPersonnelEducation(
        parseInt(personnelId)
      );
      if (response.status === "success" && response.data) {
        setEducation(response.data.education || []);
      }
    } catch (err: any) {
      console.error("Error fetching education:", err);
      setEducation([]);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await personnelSportsService.getPersonnelSports(
        parseInt(personnelId)
      );
      if (response.status === "success" && response.data) {
        setSports(response.data.sports || []);
      }
    } catch (err: any) {
      console.error("Error fetching sports:", err);
      setSports([]);
    }
  };

  const fetchPersonnelLeaveRecords = async () => {
    if (!personnelId || !user?.role) return;
    try {
      setLeaveLoading(true);
      setLeaveError("");
      const numericPersonnelId = parseInt(personnelId);
      let response;

      if (user.role === "admin") {
        response = await leaveService.getAllLeaveRequests({
          personnel_id: numericPersonnelId,
        });
      } else if (user.role === "commander") {
        response = await leaveService.getCommanderLeaveRequests();
      } else {
        response = await leaveService.getMyLeaveRequests();
      }

      const rawData = response.data as any;
      let records: PersonnelLeaveRecord[] = [];

      if (Array.isArray(rawData)) {
        records = rawData;
      } else if (Array.isArray(rawData?.data)) {
        records = rawData.data;
      } else if (Array.isArray(rawData?.leaveRequests)) {
        records = rawData.leaveRequests;
      } else if (Array.isArray(rawData?.leaveRequests)) {
        records = rawData.leaveRequests;
      }

      const normalizeRecords = records || [];
      const filteredRecords =
        user.role === "admin"
          ? normalizeRecords
          : normalizeRecords.filter((record) => {
              const rawRecordPersonnelId =
                record.personnel_id ??
                record.personnel?.id ??
                (record as any).personnelId ??
                (record as any).personnel?.personnel_id ??
                (record as any).personnelId;
              if (
                rawRecordPersonnelId === undefined ||
                rawRecordPersonnelId === null
              )
                return false;
              const recordPersonnelId =
                typeof rawRecordPersonnelId === "string"
                  ? parseInt(rawRecordPersonnelId, 10)
                  : rawRecordPersonnelId;
              return recordPersonnelId === numericPersonnelId;
            });

      setLeaveRecords(filteredRecords);
    } catch (err: any) {
      console.error("Error fetching leave records:", err);
      setLeaveRecords([]);
      setLeaveError(err.message || "Failed to fetch leave records");
    } finally {
      setLeaveLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveService.getLeaveTypes();
      // Handle both response.data directly or response.data.data
      const leaveTypesData = response.data || [];
      setLeaveTypes(Array.isArray(leaveTypesData) ? leaveTypesData : []);
      console.log("Leave types loaded:", leaveTypesData);
    } catch (err: any) {
      console.error("Error fetching leave types:", err);
      setLeaveTypes([]);
    }
  };

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personnelId || !isAdmin) return;

    setApplyLeaveLoading(true);
    setError("");
    setSuccess("");

    try {
      const submitData = {
        personnel_id: parseInt(personnelId),
        leave_type_id: parseInt(leaveFormData.leave_type_id),
        start_date: leaveFormData.start_date,
        end_date: leaveFormData.end_date,
        reason: leaveFormData.reason,
      };

      const response = await leaveService.createLeaveRequest(submitData);
      
      if (response.status === "success" || response.success) {
        setSuccess("Leave request submitted successfully!");
        setShowApplyLeaveModal(false);
        setLeaveFormData({
          leave_type_id: "",
          start_date: "",
          end_date: "",
          reason: "",
        });
        // Refresh leave records
        await fetchPersonnelLeaveRecords();
        notifySuccess("Leave request submitted successfully!");
      } else {
        // setError(response.message || "Failed to submit leave request");
        setApplyLeaveLoading(false);
         setShowApplyLeaveModal(false);
        notifyError(response.message || "Failed to submit leave request");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to submit leave request";
      // setError(errorMessage);
      notifyError(errorMessage);
      console.error("Error submitting leave request:", err);
    } finally {
      setApplyLeaveLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      // Fetch punishment offences
      const punishmentResponse =
        await personnelService.getPersonnelPunishmentOffences(
          parseInt(personnelId)
        );
      if (punishmentResponse.status === "success" && punishmentResponse.data) {
        const data = punishmentResponse.data as any;
        const { endorsedOffences, notEndorsedOffences, allOffences } = data;
        setEndorsedOffences(endorsedOffences || []);
        setNotEndorsedOffences(notEndorsedOffences || []);
        setPunishmentOffences(allOffences || []);
      }
    } catch (err: any) {
      console.error("Error fetching punishment offences:", err);
      // Set empty arrays on error
      setEndorsedOffences([]);
      setNotEndorsedOffences([]);
      setPunishmentOffences([]);
    }

    // Fetch ERE records
    try {
      const ereResponse = await personnelService.getPersonnelEREs(
        parseInt(personnelId)
      );
      if (ereResponse.status === "success" && ereResponse.data) {
        const data = ereResponse.data as any;
        setEres(data.eres || []);
      }

      // Fetch proficiencies
      const proficiencyResponse = await personnelService.getPersonnelProficiencies(
        parseInt(personnelId)
      );
      if (proficiencyResponse.status === "success" && proficiencyResponse.data) {
        const data = proficiencyResponse.data as any;
        setProficiencies(data.proficiencies || []);
      }

      // Fetch drone equipment
      const droneEquipmentResponse = await personnelService.getDroneEquipment();
      if (droneEquipmentResponse.status === "success" && droneEquipmentResponse.data) {
        const data = droneEquipmentResponse.data as any;
        setDroneEquipment(data.equipment || []);
      }
    } catch (err: any) {
      console.error("Error fetching ERE records:", err);
      setEres([]);
    }

    // Fetch Field Services
    try {
      const fieldServiceResponse =
        await personnelService.getPersonnelFieldServices(parseInt(personnelId));
      if (
        fieldServiceResponse.status === "success" &&
        fieldServiceResponse.data
      ) {
        const data = fieldServiceResponse.data as any;
        setFieldServices(data.fieldServices || []);
      }
    } catch (err: any) {
      console.error("Error fetching field services:", err);
      setFieldServices([]);
    }

    // Fetch Foreign Postings
    try {
      const foreignPostingResponse =
        await personnelService.getPersonnelForeignPostings(
          parseInt(personnelId)
        );
      if (
        foreignPostingResponse.status === "success" &&
        foreignPostingResponse.data
      ) {
        const data = foreignPostingResponse.data as any;
        setForeignPostings(data.foreignPostings || []);
      }
    } catch (err: any) {
      console.error("Error fetching foreign postings:", err);
      setForeignPostings([]);
    }

    // Fetch Family Problems
    try {
      const familyProblemResponse =
        await personnelService.getPersonnelFamilyProblems(
          parseInt(personnelId)
        );
      if (
        familyProblemResponse.status === "success" &&
        familyProblemResponse.data
      ) {
        const data = familyProblemResponse.data as any;
        setFamilyProblems(data.familyProblems || []);
      }
    } catch (err: any) {
      console.error("Error fetching family problems:", err);
      setFamilyProblems([]);
    }

    // Fetch Family Details
    try {
      const familyDetailResponse =
        await personnelService.getPersonnelFamilyDetails(
          parseInt(personnelId)
        );
      if (
        familyDetailResponse.status === "success" &&
        familyDetailResponse.data
      ) {
        const data = familyDetailResponse.data as any;
        setFamilyDetails(data.familyDetails || []);
      }
    } catch (err: any) {
      console.error("Error fetching family details:", err);
      setFamilyDetails([]);
    }

    // Fetch Courses
    try {
      const courseResponse = await personnelService.getPersonnelCourses(
        parseInt(personnelId)
      );
      if (courseResponse.status === "success" && courseResponse.data) {
        const data = courseResponse.data as any;
        setCourses(transformCoursesForDisplay(data.courses || []));
      }
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }

    // Fetch Others Data (Special Employment Suitability and Recommendations)
    try {
      const response = await api.get(`/others/${personnelId}`);
      if (response.status === "success" && response.data) {
        setSpecialEmploymentData(response.data.specialEmployment || []);
        setRecommendations(response.data.recommendations || []);
        setOutStationEmployments(response.data.outStationEmployments || []);
        setHospitalisations(response.data.hospitalisations || []);
      }
    } catch (err: any) {
      console.error("Error fetching others data:", err);
      setSpecialEmploymentData([]);
      setRecommendations([]);
      setOutStationEmployments([]);
      setHospitalisations([]);
    }

    // Fetch Formations for Out Station dropdown (use API if available, else static)
    try {
      const formationsResponse = await api.get("/formations");
      if (
        formationsResponse.status === "success" &&
        formationsResponse.data?.formations?.length > 0
      ) {
        setFormations(formationsResponse.data.formations);
      }
    } catch (err: any) {
      console.error("Error fetching formations:", err);
      setFormations(STATIC_FORMATIONS);
    }

    // Fetch Medical Categories for Hospitalisation dropdown
    try {
      const mcResponse = await medicalCategoryService.getAllMedicalCategoriesForDropdown();
      if (mcResponse.status === "success" && mcResponse.data) {
        const data = mcResponse.data as any;
        const categories = Array.isArray(data) ? data : (data?.medicalCategories || data?.data || []);
        setMedicalCategories(categories);
      }
    } catch (err: any) {
      console.error("Error fetching medical categories:", err);
      setMedicalCategories([]);
    }
  };

  const fetchDocuments = async () => {
    if (!personnel?.army_no) {
      return;
    }
    try {
      setDocumentsLoading(true);
      const response = await api.get(`/documents/army/${personnel.army_no}`);
      setDocuments(response.data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const getCourseEndDate = (course: Course) =>
    course.end_date || course.completion_date || "";


  const transformCoursesForDisplay = (coursesData: any[]) =>
    (coursesData || []).map((c: any) => ({
      ...c,
      course_name: c.course?.course_title ?? c.course_name ?? "--",
    }));

  // Use backend dynamic_status as single source of truth - matches listing page
  // (On Course, On ERE, On Leave, Out Station, Available)
  const displayStatus = useMemo(() => {
    return personnel?.dynamic_status || "Available";
  }, [personnel?.dynamic_status]);

  const getCourseDurationLabel = (course: Course) => {
    if (course.duration && course.duration.trim()) {
      return course.duration;
    }

    if (!course.start_date || !getCourseEndDate(course)) {
      return "--";
    }

    const start = new Date(course.start_date);
    const end = new Date(getCourseEndDate(course));

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "--";
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      return "--";
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) {
      return "--";
    }

    if (diffDays >= 30 && diffDays % 30 === 0) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    }

    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

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

  const getLeaveStatusBadgeClass = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      case "rejected":
        return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      case "cancelled":
        return "bg-gray-600/20 text-gray-300 border border-gray-600/30";
      default:
        return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
    }
  };

  const getLeaveTypeLabel = (record: PersonnelLeaveRecord) => {
    return (
      record.leaveType?.name ||
      record.LeaveType?.name ||
      record.leave_type?.name ||
      record.leave_type_name ||
      "N/A"
    );
  };

  const formatDateForInput = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().split("T")[0];
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!courseFormData.course_id) {
      setError("Course selection is required");
      setCourseLoading(false);
      return;
    }

    if (!courseFormData.start_date || !courseFormData.end_date) {
      setError("Start and end dates are required");
      setCourseLoading(false);
      return;
    }

    const startDate = new Date(courseFormData.start_date);
    const endDate = new Date(courseFormData.end_date);
    if (startDate > endDate) {
      setError("Start date cannot be after end date");
      setCourseLoading(false);
      return;
    }

    if (!params.id) {
      setError("Personnel ID is missing");
      setCourseLoading(false);
      return;
    }

    try {
      const submitData = {
        course_id: parseInt(courseFormData.course_id),
        start_date: courseFormData.start_date,
        end_date: courseFormData.end_date,
        grade: courseFormData.grade || null,
        status: courseFormData.status,
        remarks: courseFormData.remarks ?? "",
      };

      if (editingCourse) {
        console.log("Updating course ID:", editingCourse.id);
        console.log("Update data:", submitData);
        const updateResponse = await personnelService.updateCourse(
          editingCourse.id,
          submitData
        );
        console.log("Update response:", updateResponse);
        if (updateResponse.status === "success") {
          setSuccess("Course updated successfully");
          // Refresh the courses list so changes reflect immediately
          const courseResponse = await personnelService.getPersonnelCourses(
            parseInt(params.id as string)
          );
          if (courseResponse.status === "success" && courseResponse.data) {
            const data = courseResponse.data as any;
            setCourses(transformCoursesForDisplay(data.courses || []));
          }
        } else {
          notifyError(updateResponse.message || "Failed to update course");
        }
      } else {
        console.log("Creating new course for personnel:", params.id);
        console.log("Create data:", submitData);
        const createResponse = await personnelService.createPersonnelCourse(
          parseInt(params.id as string),
          submitData
        );
        console.log("Create response:", createResponse);
        if (createResponse.status == "success") {
          setSuccess("Course added successfully");
          // Refresh the courses list
          const courseResponse = await personnelService.getPersonnelCourses(
            parseInt(params.id as string)
          );
          console.log("Refreshed courses:", courseResponse);
          if (courseResponse.status === "success" && courseResponse.data) {
            const data = courseResponse.data as any;
            setCourses(transformCoursesForDisplay(data.courses || []));
          }
        } else {
          notifyError(createResponse.message);
        }
      }

      // Reset form and close modal
      resetCourseForm();
      setEditingCourse(null);
      setShowAddCourseModal(false);
    } catch (err: any) {
      console.error("Error saving course:", err);
      console.error("Full error:", err);
      const errorMessage = err.message || "Failed to save course";
      setError(errorMessage);
      // Show alert for conflict errors
      if (
        errorMessage.includes("already assigned") ||
        errorMessage.includes("already on")
      ) {
        alert(errorMessage);
      }
    } finally {
      setCourseLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    // Use the course_id from the course object if available
    const courseId = course.course_id?.toString() || "";

    setEditingCourse(course);
    setCourseFormData({
      course_id: courseId,
      start_date: formatDateForInput(course.start_date),
      end_date: formatDateForInput(course.end_date || course.completion_date),
      grade: course.grade || "",
      status: course.status,
      remarks: course.remarks || "",
    });
    setShowAddCourseModal(true);
  };

  const handleDeleteCourse = async (courseId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Course",
      message:
        "Are you sure you want to delete this course? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setError("");
        setSuccess("");
        try {
          console.log("Deleting course ID:", courseId);
          // Call API to delete the course
          const deleteResponse = await personnelService.deleteCourse(courseId);
          console.log("Delete response:", deleteResponse);

          // Refresh the courses list
          if (params.id) {
            const courseResponse = await personnelService.getPersonnelCourses(
              parseInt(params.id as string)
            );
            console.log("Refreshed courses after delete:", courseResponse);
            if (courseResponse.status === "success" && courseResponse.data) {
              const data = courseResponse.data as any;
              setCourses(transformCoursesForDisplay(data.courses || []));
            }
          }

          setSuccess("Course deleted successfully");
        } catch (err: any) {
          console.error("Error deleting course:", err);
          console.error("Full error:", err.response || err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to delete course"
          );
        }
      },
    });
  };

  const resetCourseForm = () => {
    setCourseFormData({
      course_id: "",
      start_date: "",
      end_date: "",
      grade: "",
      status: "obtained",
      remarks: "",
    });
    setEditingCourse(null);
  };

  const handleCloseCourseModal = () => {
    setShowAddCourseModal(false);
    resetCourseForm();
  };

  // Punishment Offence Functions
  const handleAddPunishment = () => {
    setEditingPunishmentOffence(null);
    setPunishmentFormData({
      offence: "",
      date_of_offence: "",
      punishment_awarded: "",
      remarks: "",
      endorsed: true,
      section_aa: "",
      type_of_entry: "",
    });
    setShowPunishmentModal(true);
    setError("");
    setSuccess("");
  };

  const handleClosePunishmentModal = () => {
    setShowPunishmentModal(false);
    setEditingPunishmentOffence(null);
    setPunishmentFormData({
      offence: "",
      date_of_offence: "",
      punishment_awarded: "",
      remarks: "",
      endorsed: true,
      section_aa: "",
      type_of_entry: "",
    });
  };

  const handleSubmitPunishment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPunishmentLoading(true);
    setError("");

    // Basic validation
    if (!punishmentFormData.offence.trim()) {
      setError("Offence description is required");
      setPunishmentLoading(false);
      return;
    }

    try {
      // Prepare data for submission - only include date if it's valid
      const submitData = {
        ...punishmentFormData,
        date_of_offence: punishmentFormData.date_of_offence || null,
      };

      if (editingPunishmentOffence) {
        // Update existing punishment offence
        const response = await personnelService.updatePunishmentOffence(
          editingPunishmentOffence.id,
          submitData
        );
        if (response.status === "success") {
          setShowPunishmentModal(false);
          setEditingPunishmentOffence(null);
          // Refresh punishment offences data
          await fetchRelatedData();
          setSuccess("Punishment offence updated successfully");
        } else {
          setError(response.message || "Failed to update punishment offence");
        }
      } else {
        // Create new punishment offence
        const response = await personnelService.createPunishmentOffence(
          parseInt(personnelId),
          submitData
        );
        if (response.status === "success") {
          setShowPunishmentModal(false);
          // Refresh punishment offences data
          await fetchRelatedData();
          setSuccess("Punishment offence added successfully");
        } else {
          setError(response.message || "Failed to add punishment offence");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save punishment offence");
    } finally {
      setPunishmentLoading(false);
    }
  };

  const handleEditPunishment = (offence: PunishmentOffence) => {
    setEditingPunishmentOffence(offence);
    setPunishmentFormData({
      offence: offence.offence,
      date_of_offence: formatDateForInput(offence.date_of_offence) || "",
      punishment_awarded: offence.punishment_awarded || "",
      remarks: offence.remarks || "",
      endorsed: offence.endorsed,
      section_aa: offence.section_aa || "",
      type_of_entry: offence.type_of_entry || "",
    });
    setShowPunishmentModal(true);
    setError("");
    setSuccess("");
  };

  const handleDeletePunishment = async (offenceId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Punishment Offence",
      message:
        "Are you sure you want to delete this punishment offence? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const response = await personnelService.deletePunishmentOffence(
            offenceId
          );
          if (response.status === "success") {
            // Refresh punishment offences data
            await fetchRelatedData();
            setSuccess("Punishment offence deleted successfully");
          } else {
            setError(response.message || "Failed to delete punishment offence");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete punishment offence");
        }
      },
    });
  };

  // Photo upload handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canManagePhoto) {
      setError("You don't have permission to update the photo.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) {
      setError("Please select an image file");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setPhotoLoading(true);
    setError("");

    try {
      const response = await personnelService.uploadPersonnelPhoto(
        parseInt(personnelId),
        file
      );
      if (response.status === "success") {
        // Refresh personnel data to show new photo
        await fetchPersonnelDetails();
        setSuccess("Photo uploaded successfully");
      } else {
        setError(response.message || "Failed to upload photo");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload photo");
    } finally {
      setPhotoLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    if (!canManagePhoto) {
      setError("You don't have permission to update the photo.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete Photo",
      message:
        "Are you sure you want to delete this photo? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        setPhotoLoading(true);
        setError("");

        try {
          const response = await personnelService.deletePersonnelPhoto(
            parseInt(personnelId)
          );
          if (response.status === "success") {
            // Refresh personnel data to remove photo
            await fetchPersonnelDetails();
            setSuccess("Photo deleted successfully");
          } else {
            setError(response.message || "Failed to delete photo");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete photo");
        } finally {
          setPhotoLoading(false);
        }
      },
    });
  };

  const handleViewPhoto = () => {
    if (personnel.photo_url) {
      window.open(`${config.BACKEND_URL}${personnel.photo_url}`, "_blank");
    }
  };

  const handleDownloadCV = async () => {
    if (!personnelId) {
      setError("Personnel ID is required");
      return;
    }

    try {
      setCvDownloadLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch(
        `${config.API_BASE_URL}/pdf/personnel/${personnelId}/cv`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to download CV: ${response.statusText}`
        );
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `CV_${
        personnel?.name?.replace(/\s+/g, "_") || "Personnel"
      }_${personnel?.army_no || personnelId}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("CV downloaded successfully");
    } catch (err: any) {
      console.error("Error downloading CV:", err);
      setError(err.message || "Failed to download CV. Please try again.");
    } finally {
      setCvDownloadLoading(false);
    }
  };

  const handleUploadNewPhoto = () => {
    if (!canManagePhoto) {
      setError("You don't have permission to update the photo.");
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handlePhotoUpload({ target: { files: [file] } } as any);
      }
    };
    fileInput.click();
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-emerald-500/30 text-emerald-300 border-2 border-emerald-400/60 shadow-emerald-500/20";
      case "on leave":
        return "bg-amber-500/30 text-amber-300 border-2 border-amber-400/60 shadow-amber-500/20";
      case "on ere":
        return "bg-violet-500/30 text-violet-300 border-2 border-violet-400/60 shadow-violet-500/20";
      case "on course":
        return "bg-sky-500/30 text-sky-300 border-2 border-sky-400/60 shadow-sky-500/20";
      case "out station":
        return "bg-cyan-500/30 text-cyan-300 border-2 border-cyan-400/60 shadow-cyan-500/20";
      default:
        return "bg-emerald-500/30 text-emerald-300 border-2 border-emerald-400/60 shadow-emerald-500/20";
    }
  };

  // Family Problem Functions
  const handleAddFamilyProblem = () => {
    setFamilyProblemFormData({
      problem: "",
      remarks: "",
    });
    setEditingFamilyProblem(null);
    setShowFamilyProblemModal(true);
  };

  const handleEditFamilyProblem = (familyProblem: FamilyProblem) => {
    setEditingFamilyProblem(familyProblem);
    setFamilyProblemFormData({
      problem: familyProblem.problem,
      remarks: familyProblem.remarks,
    });
    setShowFamilyProblemModal(true);
  };

  const handleDeleteFamilyProblem = async (familyProblemId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Family Problem",
      message:
        "Are you sure you want to delete this family problem? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const response = await personnelService.deleteFamilyProblem(
            familyProblemId
          );
          if (response.status === "success") {
            // Refresh Family Problem data
            const familyProblemResponse =
              await personnelService.getPersonnelFamilyProblems(
                parseInt(personnelId)
              );
            if (
              familyProblemResponse.status === "success" &&
              familyProblemResponse.data
            ) {
              const data = familyProblemResponse.data as any;
              setFamilyProblems(data.familyProblems || []);
            }
            setSuccess("Family problem deleted successfully");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete family problem");
        }
      },
    });
  };

  const handleSubmitFamilyProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamilyProblemLoading(true);
    setError("");

    // Basic validation
    if (!familyProblemFormData.problem.trim()) {
      setError("Problem description is required");
      setFamilyProblemLoading(false);
      return;
    }

    try {
      const familyProblemData = {
        problem: familyProblemFormData.problem,
        remarks: familyProblemFormData.remarks ?? "",
      };

      if (editingFamilyProblem) {
        // Update existing family problem
        const response = await personnelService.updateFamilyProblem(
          editingFamilyProblem.id,
          familyProblemData
        );
        if (response.status === "success") {
          // Refresh Family Problem data
          const familyProblemResponse =
            await personnelService.getPersonnelFamilyProblems(
              parseInt(personnelId)
            );
          if (
            familyProblemResponse.status === "success" &&
            familyProblemResponse.data
          ) {
            const data = familyProblemResponse.data as any;
            setFamilyProblems(data.familyProblems || []);
          }
          setSuccess("Family problem updated successfully");
        }
      } else {
        // Create new family problem
        const response = await personnelService.createFamilyProblem(
          parseInt(personnelId),
          familyProblemData
        );
        if (response.status === "success") {
          // Refresh Family Problem data
          const familyProblemResponse =
            await personnelService.getPersonnelFamilyProblems(
              parseInt(personnelId)
            );
          if (
            familyProblemResponse.status === "success" &&
            familyProblemResponse.data
          ) {
            const data = familyProblemResponse.data as any;
            setFamilyProblems(data.familyProblems || []);
          }
          setSuccess("Family problem added successfully");
        }
      }

      // Reset form and close modal
      setFamilyProblemFormData({
        problem: "",
        remarks: "",
      });
      setEditingFamilyProblem(null);
      setShowFamilyProblemModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to save family problem");
    } finally {
      setFamilyProblemLoading(false);
    }
  };

  const handleCloseFamilyProblemModal = () => {
    setShowFamilyProblemModal(false);
    setFamilyProblemFormData({
      problem: "",
      remarks: "",
    });
    setEditingFamilyProblem(null);
  };

  // Family Details Functions
  const handleAddFamilyDetail = () => {
    setFamilyDetailFormData({
      relationship_type: "",
      name: "",
      dob: "",
      contact_number: "",
      pan_card: "",
      aadhar_card: "",
      account_number: "",
      blood_group: "",
    });
    setEditingFamilyDetail(null);
    setShowFamilyDetailModal(true);
  };

  const handleEditFamilyDetail = (familyDetail: any) => {
    setEditingFamilyDetail(familyDetail);
    setFamilyDetailFormData({
      relationship_type: familyDetail.relationship_type,
      name: familyDetail.name,
      dob: toDateInputValue(familyDetail.dob),
      contact_number: familyDetail.contact_number || "",
      pan_card: familyDetail.pan_card || "",
      aadhar_card: familyDetail.aadhar_card || "",
      account_number: familyDetail.account_number || "",
      blood_group: familyDetail.blood_group || "",
    });
    setShowFamilyDetailModal(true);
  };

  const handleDeleteFamilyDetail = async (familyDetailId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Family Detail",
      message:
        "Are you sure you want to delete this family detail? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const response = await personnelService.deleteFamilyDetail(
            familyDetailId
          );
          if (response.status === "success") {
            // Refresh Family Detail data
            const familyDetailResponse =
              await personnelService.getPersonnelFamilyDetails(
                parseInt(personnelId)
              );
            if (
              familyDetailResponse.status === "success" &&
              familyDetailResponse.data
            ) {
              const data = familyDetailResponse.data as any;
              setFamilyDetails(data.familyDetails || []);
            }
            setSuccess("Family detail deleted successfully");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete family detail");
        }
      },
    });
  };

  const handleSubmitFamilyDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamilyDetailLoading(true);
    setError("");

    // Basic validation
    if (!familyDetailFormData.relationship_type || !familyDetailFormData.name.trim()) {
      setError("Relationship type and name are required");
      setFamilyDetailLoading(false);
      return;
    }

    // Spouse and child require personnel to have date of marriage (only when adding new, not when editing)
    if (!editingFamilyDetail) {
      const isSpouseOrChild = ['spouse', 'child'].includes(familyDetailFormData.relationship_type);
      if (isSpouseOrChild && !personnel?.date_of_marriage) {
        setError("Spouse and Child can only be added when the personnel has a Date of Marriage recorded.");
        setFamilyDetailLoading(false);
        return;
      }
    }

    try {
      const familyDetailData = {
        relationship_type: familyDetailFormData.relationship_type,
        name: familyDetailFormData.name,
        dob: familyDetailFormData.dob || null,
        contact_number: familyDetailFormData.contact_number || null,
        pan_card: familyDetailFormData.pan_card || null,
        aadhar_card: familyDetailFormData.aadhar_card || null,
        account_number: familyDetailFormData.account_number || null,
        blood_group: familyDetailFormData.blood_group || null,
      };

      if (editingFamilyDetail) {
        // Update existing family detail
        const response = await personnelService.updateFamilyDetail(
          editingFamilyDetail.id,
          familyDetailData
        );
        if (response.status === "success") {
          // Refresh Family Detail data
          const familyDetailResponse =
            await personnelService.getPersonnelFamilyDetails(
              parseInt(personnelId)
            );
          if (
            familyDetailResponse.status === "success" &&
            familyDetailResponse.data
          ) {
            const data = familyDetailResponse.data as any;
            setFamilyDetails(data.familyDetails || []);
          }
          setSuccess("Family detail updated successfully");
        }
      } else {
        // Create new family detail
        const response = await personnelService.createFamilyDetail(
          parseInt(personnelId),
          familyDetailData
        );
        if (response.status === "success") {
          // Refresh Family Detail data
          const familyDetailResponse =
            await personnelService.getPersonnelFamilyDetails(
              parseInt(personnelId)
            );
          if (
            familyDetailResponse.status === "success" &&
            familyDetailResponse.data
          ) {
            const data = familyDetailResponse.data as any;
            setFamilyDetails(data.familyDetails || []);
          }
          setSuccess("Family detail added successfully");
        }
      }

      // Reset form and close modal
      setFamilyDetailFormData({
        relationship_type: "",
        name: "",
        dob: "",
        contact_number: "",
        pan_card: "",
        aadhar_card: "",
        account_number: "",
        blood_group: "",
      });
      setEditingFamilyDetail(null);
      setShowFamilyDetailModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to save family detail");
    } finally {
      setFamilyDetailLoading(false);
    }
  };

  const handleCloseFamilyDetailModal = () => {
    setShowFamilyDetailModal(false);
    setFamilyDetailFormData({
      relationship_type: "",
      name: "",
      dob: "",
      contact_number: "",
      pan_card: "",
      aadhar_card: "",
      account_number: "",
      blood_group: "",
    });
    setEditingFamilyDetail(null);
  };

  // Out Station Employment modal handlers
  const handleOpenOutStationAddModal = () => {
    setEditingOutStation(null);
    setOthersFormData({
      ...defaultOthersFormState,
      out_station_formation_category: "",
      out_station_formation: "",
      out_station_location: "",
      out_station_attachment: "",
      out_station_employment: "",
      out_station_start_date: "",
      out_station_end_date: "",
    });
    setShowOutStationModal(true);
    setError("");
    setSuccess("");
  };

  const handleOpenOutStationEditModal = (item: OutStationEmployment) => {
    setEditingOutStation(item);
    const formationVal = item.formation || "";
    let category = "";
    for (const f of formations) {
      if (f.sub_formations?.length) {
        const match = f.sub_formations.find(
          (s) => s.name.toUpperCase() === formationVal.toUpperCase()
        );
        if (match) {
          category = f.name;
          break;
        }
      } else if (f.name.toUpperCase() === formationVal.toUpperCase()) {
        category = f.name;
        break;
      }
    }
    setOthersFormData({
      ...defaultOthersFormState,
      out_station_formation_category: category,
      out_station_formation: formationVal,
      out_station_location: item.location || "",
      out_station_attachment: item.attachment || "",
      out_station_employment: item.employment || "",
      out_station_start_date: formatDateForInput(item.start_date),
      out_station_end_date: formatDateForInput(item.end_date),
    });
    setShowOutStationModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseOutStationModal = () => {
    setShowOutStationModal(false);
    setEditingOutStation(null);
    setOthersFormData({ ...defaultOthersFormState });
  };

  // Hospitalisation modal handlers
  const handleOpenHospitalisationAddModal = () => {
    setEditingHospitalisation(null);
    setOthersFormData({
      ...defaultOthersFormState,
      hospitalisation_date_of_admission: "",
      hospitalisation_date_of_discharge: "",
      hospitalisation_diagnosis: "",
      hospitalisation_medical_category: "",
      hospitalisation_remarks: "",
    });
    setShowHospitalisationModal(true);
    setError("");
    setSuccess("");
  };

  const handleOpenHospitalisationEditModal = (item: Hospitalisation) => {
    setEditingHospitalisation(item);
    setOthersFormData({
      ...defaultOthersFormState,
      hospitalisation_date_of_admission: formatDateForInput(item.date_of_admission),
      hospitalisation_date_of_discharge: formatDateForInput(item.date_of_discharge),
      hospitalisation_diagnosis: item.diagnosis || "",
      hospitalisation_medical_category: item.medical_category || "",
      hospitalisation_remarks: item.remarks || "",
    });
    setShowHospitalisationModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseHospitalisationModal = () => {
    setShowHospitalisationModal(false);
    setEditingHospitalisation(null);
    setOthersFormData({ ...defaultOthersFormState });
  };

  // Special Employment Suitability modal handlers
  const handleOpenSpecialEmploymentAddModal = () => {
    setEditingSpecialEmployment(null);
    setOthersFormData({
      ...defaultOthersFormState,
      suitable_for_special_emp_a: "",
      suitable_for_special_emp_b: "",
    });
    setShowSpecialEmploymentModal(true);
    setError("");
    setSuccess("");
  };

  const handleOpenSpecialEmploymentEditModal = (
    item: SpecialEmploymentSuitability
  ) => {
    setEditingSpecialEmployment(item);
    setOthersFormData({
      ...defaultOthersFormState,
      suitable_for_special_emp_a: item.suitable_for_special_emp_a || "",
      suitable_for_special_emp_b: item.suitable_for_special_emp_b || "",
    });
    setShowSpecialEmploymentModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseSpecialEmploymentModal = () => {
    setShowSpecialEmploymentModal(false);
    setEditingSpecialEmployment(null);
    setOthersFormData({ ...defaultOthersFormState });
  };

  // Recommendations modal handlers
  const handleOpenRecommendationsAddModal = () => {
    setEditingRecommendation(null);
    setOthersFormData({
      ...defaultOthersFormState,
      recommendation_a: "",
      recommendation_b: "",
    });
    setShowRecommendationsModal(true);
    setError("");
    setSuccess("");
  };

  const handleOpenRecommendationsEditModal = (item: Recommendation) => {
    setEditingRecommendation(item);
    setOthersFormData({
      ...defaultOthersFormState,
      recommendation_a: item.recommendation_a || "",
      recommendation_b: item.recommendation_b || "",
    });
    setShowRecommendationsModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseRecommendationsModal = () => {
    setShowRecommendationsModal(false);
    setEditingRecommendation(null);
    setOthersFormData({ ...defaultOthersFormState });
  };

  const handleDeleteOthers = async (
    id: number,
    type: "special_employment" | "recommendation" | "out_station" | "hospitalisation"
  ) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Record",
      message:
        "Are you sure you want to delete this record? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Authentication required");
            return;
          }

          const endpoint =
            type === "special_employment"
              ? `/others/special-employment/${id}`
              : type === "recommendation"
              ? `/others/recommendation/${id}`
              : type === "out_station"
              ? `/others/out-station-employment/${id}`
              : `/others/hospitalisation/${id}`;

          try {
            const response = await api.delete(endpoint);
            if (response.status === "success") {
              // Refresh Others data
              try {
                const othersResponse = await api.get(`/others/${personnelId}`);
                if (
                  othersResponse.status === "success" &&
                  othersResponse.data
                ) {
                  setSpecialEmploymentData(
                    othersResponse.data.specialEmployment || []
                  );
                  setRecommendations(othersResponse.data.recommendations || []);
                  setOutStationEmployments(
                    othersResponse.data.outStationEmployments || []
                  );
                  setHospitalisations(
                    othersResponse.data.hospitalisations || []
                  );
                }
              } catch (error) {
                console.error("Error refreshing others data:", error);
              }
              setSuccess("Record deleted successfully");
            } else {
              setError(response.message || "Failed to delete record");
            }
          } catch (error: any) {
            setError(error.message || "Failed to delete record");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete record");
        }
      },
    });
  };

  const validateOutStationFields = () => {
    const requiredFields = [
      othersFormData.out_station_formation,
      othersFormData.out_station_location,
      othersFormData.out_station_employment,
      othersFormData.out_station_start_date,
      othersFormData.out_station_end_date,
    ];

    if (
      requiredFields.some((value) => !value || !value.toString().trim())
    ) {
      notifyError(
        "Please complete all Out Station Employment fields (attachment is optional)."
      );
      return false;
    }

    if (
      othersFormData.out_station_start_date &&
      othersFormData.out_station_end_date &&
      new Date(othersFormData.out_station_end_date) <
        new Date(othersFormData.out_station_start_date)
    ) {
      notifyError(
        "Out Station Employment end date cannot be earlier than start date."
      );
      return false;
    }

    return true;
  };

  const refreshOthersData = async () => {
    const othersResponse = await api.get(`/others/${personnelId}`);
    if (othersResponse.status === "success" && othersResponse.data) {
      setSpecialEmploymentData(othersResponse.data.specialEmployment || []);
      setRecommendations(othersResponse.data.recommendations || []);
      setOutStationEmployments(
        othersResponse.data.outStationEmployments || []
      );
      setHospitalisations(othersResponse.data.hospitalisations || []);
    }
  };

  const handleSubmitOutStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setOthersLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setOthersLoading(false);
        return;
      }

      if (!validateOutStationFields()) {
        setOthersLoading(false);
        return;
      }

      if (editingOutStation) {
        const response = await api.put(
          `/others/out-station-employment/${editingOutStation.id}`,
          {
            formation: othersFormData.out_station_formation || null,
            location: othersFormData.out_station_location || null,
            attachment: othersFormData.out_station_attachment || null,
            employment: othersFormData.out_station_employment || null,
            start_date: othersFormData.out_station_start_date || null,
            end_date: othersFormData.out_station_end_date || null,
          }
        );
        if (response.status === "success") {
          setSuccess("Out Station Employment updated successfully");
        } else {
          notifyError(response.message || "Failed to update record");
          setOthersLoading(false);
           handleCloseOutStationModal();
          return;
        }
      } else {
        const response = await api.post(
          `/others/${personnelId}/out-station-employment`,
          {
            formation: othersFormData.out_station_formation || null,
            location: othersFormData.out_station_location || null,
            attachment: othersFormData.out_station_attachment || null,
            employment: othersFormData.out_station_employment || null,
            start_date: othersFormData.out_station_start_date || null,
            end_date: othersFormData.out_station_end_date || null,
          }
        );
        if (response.status === "success") {
          setSuccess("Out Station Employment added successfully");
        } else {
          notifyError(response.message || "Failed to add record");
          setOthersLoading(false);
           handleCloseOutStationModal();
          return;
        }
      }

      await refreshOthersData();
      handleCloseOutStationModal();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save record";
      setError(errorMessage);
      if (
        errorMessage.includes("already assigned") ||
        errorMessage.includes("already on")
      ) {
        alert(errorMessage);
      }
    } finally {
      setOthersLoading(false);
    }
  };

  const validateHospitalisationFields = () => {
    if (
      othersFormData.hospitalisation_date_of_admission &&
      othersFormData.hospitalisation_date_of_discharge &&
      new Date(othersFormData.hospitalisation_date_of_discharge) <
        new Date(othersFormData.hospitalisation_date_of_admission)
    ) {
      notifyError(
        "Date of discharge cannot be earlier than date of admission."
      );
      return false;
    }
    return true;
  };

  const handleSubmitHospitalisation = async (e: React.FormEvent) => {
    e.preventDefault();
    setOthersLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setOthersLoading(false);
        return;
      }

      if (!validateHospitalisationFields()) {
        setOthersLoading(false);
        return;
      }

      if (editingHospitalisation) {
        const response = await api.put(
          `/others/hospitalisation/${editingHospitalisation.id}`,
          {
            date_of_admission: othersFormData.hospitalisation_date_of_admission || null,
            date_of_discharge: othersFormData.hospitalisation_date_of_discharge || null,
            diagnosis: othersFormData.hospitalisation_diagnosis || null,
            medical_category: othersFormData.hospitalisation_medical_category || null,
            remarks: othersFormData.hospitalisation_remarks ?? "",
          }
        );
        if (response.status === "success") {
          setSuccess("Hospitalisation record updated successfully");
        } else {
          setError(response.message || "Failed to update record");
          setOthersLoading(false);
          return;
        }
      } else {
        const response = await api.post(
          `/others/${personnelId}/hospitalisation`,
          {
            date_of_admission: othersFormData.hospitalisation_date_of_admission || null,
            date_of_discharge: othersFormData.hospitalisation_date_of_discharge || null,
            diagnosis: othersFormData.hospitalisation_diagnosis || null,
            medical_category: othersFormData.hospitalisation_medical_category || null,
            remarks: othersFormData.hospitalisation_remarks ?? "",
          }
        );
        if (response.status === "success") {
          setSuccess("Hospitalisation record added successfully");
        } else {
          setError(response.message || "Failed to add record");
          setOthersLoading(false);
          return;
        }
      }

      await refreshOthersData();
      handleCloseHospitalisationModal();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save record";
      setError(errorMessage);
    } finally {
      setOthersLoading(false);
    }
  };

  const handleSubmitSpecialEmployment = async (e: React.FormEvent) => {
    e.preventDefault();
    setOthersLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setOthersLoading(false);
        return;
      }

      const hasInput =
        othersFormData.suitable_for_special_emp_a ||
        othersFormData.suitable_for_special_emp_b;
      if (!hasInput) {
        setError("Please fill at least one field");
        setOthersLoading(false);
        return;
      }

      if (editingSpecialEmployment) {
        const response = await api.put(
          `/others/special-employment/${editingSpecialEmployment.id}`,
          {
            suitable_for_special_emp_a:
              othersFormData.suitable_for_special_emp_a || null,
            suitable_for_special_emp_b:
              othersFormData.suitable_for_special_emp_b || null,
          }
        );
        if (response.status === "success") {
          setSuccess("Special Employment Suitability updated successfully");
        } else {
          setError(response.message || "Failed to update record");
          setOthersLoading(false);
          return;
        }
      } else {
        const response = await api.post(
          `/others/${personnelId}/special-employment`,
          {
            suitable_for_special_emp_a:
              othersFormData.suitable_for_special_emp_a || null,
            suitable_for_special_emp_b:
              othersFormData.suitable_for_special_emp_b || null,
          }
        );
        if (response.status === "success") {
          setSuccess("Special Employment Suitability added successfully");
        } else {
          setError(response.message || "Failed to add record");
          setOthersLoading(false);
          return;
        }
      }

      await refreshOthersData();
      handleCloseSpecialEmploymentModal();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save record";
      setError(errorMessage);
    } finally {
      setOthersLoading(false);
    }
  };

  const handleSubmitRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    setOthersLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setOthersLoading(false);
        return;
      }

      const hasInput =
        othersFormData.recommendation_a || othersFormData.recommendation_b;
      if (!hasInput) {
        setError("Please fill at least one field");
        setOthersLoading(false);
        return;
      }

      if (editingRecommendation) {
        const response = await api.put(
          `/others/recommendation/${editingRecommendation.id}`,
          {
            recommendation_a: othersFormData.recommendation_a || null,
            recommendation_b: othersFormData.recommendation_b || null,
          }
        );
        if (response.status === "success") {
          setSuccess("Recommendation updated successfully");
        } else {
          setError(response.message || "Failed to update record");
          setOthersLoading(false);
          return;
        }
      } else {
        const response = await api.post(
          `/others/${personnelId}/recommendation`,
          {
            recommendation_a: othersFormData.recommendation_a || null,
            recommendation_b: othersFormData.recommendation_b || null,
          }
        );
        if (response.status === "success") {
          setSuccess("Recommendation added successfully");
        } else {
          setError(response.message || "Failed to add record");
          setOthersLoading(false);
          return;
        }
      }

      await refreshOthersData();
      handleCloseRecommendationsModal();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save record";
      setError(errorMessage);
    } finally {
      setOthersLoading(false);
    }
  };

  // ERE CRUD Functions
  const handleAddEre = () => {
    setEreFormData({
      unit: "",
      from_date: "",
      to_date: "",
      planned_ere: "",
      remarks: "",
    });
    setShowAddEreModal(true);
    setEditingEre(null);
    setError("");
    setSuccess("");
  };

  const handleEditEre = (ere: ERE) => {
    setEditingEre(ere);
    setEreFormData({
      unit: ere.unit,
      from_date: toDateInputValue(ere.from_date),
      to_date: toDateInputValue(ere.to_date),
      planned_ere: ere.planned_ere,
      remarks: ere.remarks || "",
    });
    setShowAddEreModal(true);
    setError("");
    setSuccess("");
  };

  const handleSubmitEre = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setEreLoading(true);
      setError("");

      const ereData = {
        unit: ereFormData.unit,
        from_date: ereFormData.from_date,
        to_date: ereFormData.to_date,
        planned_ere: ereFormData.planned_ere ?? "",
        remarks: ereFormData.remarks ?? "",
      };

      if (editingEre) {
        // Update existing ERE
        const response = await personnelService.updateERE(
          editingEre.id,
          ereData
        );
        if (response.status === "success") {
          // Refresh ERE data
          const ereResponse = await personnelService.getPersonnelEREs(
            parseInt(personnelId)
          );
          if (ereResponse.status === "success" && ereResponse.data) {
            const data = ereResponse.data as any;
            setEres(data.eres || []);
          }
          setSuccess("ERE updated successfully!");
          setShowAddEreModal(false);
          setEditingEre(null);
          setEreFormData({
            unit: "",
            from_date: "",
            to_date: "",
            planned_ere: "",
            remarks: "",
          });
        } else if (response.status === "failure") {
          // Handle failure case
          setError(response.message || "Failed to update ERE");
          // Show alert for conflict errors
          if (
            response.message &&
            (response.message.includes("already assigned") ||
              response.message.includes("already on"))
          ) {
            alert(response.message);
          }
        }
      } else {
        const response = await personnelService.createERE(
          parseInt(personnelId),
          ereData
        );
        console.log("ere response", response);

        if (response.status === "success") {
          const ereResponse = await personnelService.getPersonnelEREs(
            parseInt(personnelId)
          );
          if (ereResponse.status === "success" && ereResponse.data) {
            const data = ereResponse.data as any;
            setEres(data.eres || []);
          }
          setSuccess("ERE added successfully!");
          setShowAddEreModal(false);
          setEditingEre(null);
          setEreFormData({
            unit: "",
            from_date: "",
            to_date: "",
            planned_ere: "",
            remarks: "",
          });
        } else if (response.status === "failure") {
          // setError(response.message || "Failed to save ERE")
          if (
            response.message &&
            (response.message.includes("already assigned") ||
              response.message.includes("already on"))
          ) {
            // alert(response.message);
            notifyError(response.message || "Failed to Add ERE");
          }
        }
      }

      setShowAddEreModal(false);
      setEditingEre(null);
      setEreFormData({
        unit: "",
        from_date: "",
        to_date: "",
        planned_ere: "",
        remarks: "",
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save ERE";
      setError(errorMessage);
      // Show alert for conflict errors
      if (
        errorMessage.includes("already assigned") ||
        errorMessage.includes("already on")
      ) {
        alert("catch alert");
        alert(errorMessage);
      }
    } finally {
      setEreLoading(false);
    }
  };

  const handleDeleteEre = async (ereId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete ERE",
      message:
        "Are you sure you want to delete this ERE record? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          setError("");
          const response = await personnelService.deleteERE(ereId);
          if (response.status === "success") {
            // Refresh ERE data
            const ereResponse = await personnelService.getPersonnelEREs(
              parseInt(personnelId)
            );
            if (ereResponse.status === "success" && ereResponse.data) {
              const data = ereResponse.data as any;
              setEres(data.eres || []);
            }
            setSuccess("ERE deleted successfully");
          }
        } catch (err: any) {
          console.error("Error deleting ERE:", err);
          setError(err.message || "Failed to delete ERE");
        }
      },
    });
  };

  // Field Service CRUD Functions
  const handleAddFieldService = () => {
    setFieldServiceFormData({
      location: "",
      from_date: "",
      to_date: "",
      remarks: "",
    });
    setShowAddFieldServiceModal(true);
    setEditingFieldService(null);
    setError("");
    setSuccess("");
  };

  const handleEditFieldService = (fieldService: FieldService) => {
    setEditingFieldService(fieldService);
    setFieldServiceFormData({
      location: fieldService.location,
      from_date: toDateInputValue(fieldService.from_date),
      to_date: toDateInputValue(fieldService.to_date),
      remarks: fieldService.remarks || "",
    });
    setShowAddFieldServiceModal(true);
    setError("");
    setSuccess("");
  };

  const handleSubmitFieldService = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFieldServiceLoading(true);
      setError("");

      const fieldServiceData = {
        location: fieldServiceFormData.location,
        from_date: fieldServiceFormData.from_date,
        to_date: fieldServiceFormData.to_date,
        remarks: fieldServiceFormData.remarks ?? "",
      };

      if (editingFieldService) {
        // Update existing Field Service
        const response = await personnelService.updateFieldService(
          editingFieldService.id,
          fieldServiceData
        );
        if (response.status === "success") {
          // Refresh Field Service data
          const fieldServiceResponse =
            await personnelService.getPersonnelFieldServices(
              parseInt(personnelId)
            );
          if (
            fieldServiceResponse.status === "success" &&
            fieldServiceResponse.data
          ) {
            const data = fieldServiceResponse.data as any;
            setFieldServices(data.fieldServices || []);
          }
          setSuccess("Field Service updated successfully!");
        }else{
          notifyError(response.message);
          setShowAddFieldServiceModal(false);
          return
        }
      } else {
        // Create new Field Service
        const response = await personnelService.createFieldService(
          parseInt(personnelId),
          fieldServiceData
        );
        if (response.status === "success") {
          // Refresh Field Service data
          const fieldServiceResponse =
            await personnelService.getPersonnelFieldServices(
              parseInt(personnelId)
            );
          if (
            fieldServiceResponse.status === "success" &&
            fieldServiceResponse.data
          ) {
            const data = fieldServiceResponse.data as any;
            setFieldServices(data.fieldServices || []);
          }
          setSuccess("Field Service added successfully!");
        }else{
          notifyError(response.message);
          setShowAddFieldServiceModal(false);
          return
        }
      }

      setShowAddFieldServiceModal(false);
      setEditingFieldService(null);
      setFieldServiceFormData({
        location: "",
        from_date: "",
        to_date: "",
        remarks: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to save Field Service");
    } finally {
      setFieldServiceLoading(false);
    }
  };

  const handleDeleteFieldService = async (fieldServiceId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Field Service",
      message:
        "Are you sure you want to delete this Field Service record? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          setError("");
          const response = await personnelService.deleteFieldService(
            fieldServiceId
          );
          if (response.status === "success") {
            // Refresh Field Service data
            const fieldServiceResponse =
              await personnelService.getPersonnelFieldServices(
                parseInt(personnelId)
              );
            if (
              fieldServiceResponse.status === "success" &&
              fieldServiceResponse.data
            ) {
              const data = fieldServiceResponse.data as any;
              setFieldServices(data.fieldServices || []);
            }
            setSuccess("Field Service deleted successfully");
          }
        } catch (err: any) {
          console.error("Error deleting Field Service:", err);
          setError(err.message || "Failed to delete Field Service");
        }
      },
    });
  };

  // Foreign Posting CRUD Functions
  const handleAddForeignPosting = () => {
    setForeignPostingFormData({
      unit: "",
      from_date: "",
      to_date: "",
      remarks: "",
    });
    setShowAddForeignPostingModal(true);
    setEditingForeignPosting(null);
    setError("");
    setSuccess("");
  };

  const handleEditForeignPosting = (foreignPosting: ForeignPosting) => {
    setEditingForeignPosting(foreignPosting);
    setForeignPostingFormData({
      unit: foreignPosting.unit,
      from_date: toDateInputValue(foreignPosting.from_date),
      to_date: toDateInputValue(foreignPosting.to_date),
      remarks: foreignPosting.remarks || "",
    });
    setShowAddForeignPostingModal(true);
    setError("");
    setSuccess("");
  };

  const handleSubmitForeignPosting = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setForeignPostingLoading(true);
      setError("");

      const foreignPostingData = {
        unit: foreignPostingFormData.unit,
        from_date: foreignPostingFormData.from_date,
        to_date: foreignPostingFormData.to_date,
        remarks: foreignPostingFormData.remarks ?? "",
      };

      if (editingForeignPosting) {
        // Update existing Foreign Posting
        const response = await personnelService.updateForeignPosting(
          editingForeignPosting.id,
          foreignPostingData
        );
        if (response.status === "success") {
          // Refresh Foreign Posting data
          const foreignPostingResponse =
            await personnelService.getPersonnelForeignPostings(
              parseInt(personnelId)
            );
          if (
            foreignPostingResponse.status === "success" &&
            foreignPostingResponse.data
          ) {
            const data = foreignPostingResponse.data as any;
            setForeignPostings(data.foreignPostings || []);
          }
          setSuccess("Foreign Posting updated successfully!");
        }else{
          notifyError(response.message);
          setShowAddForeignPostingModal(false);
          return
        }
      } else {
        // Create new Foreign Posting
        const response = await personnelService.createForeignPosting(
          parseInt(personnelId),
          foreignPostingData
        );
        if (response.status === "success") {
          // Refresh Foreign Posting data
          const foreignPostingResponse =
            await personnelService.getPersonnelForeignPostings(
              parseInt(personnelId)
            );
          if (
            foreignPostingResponse.status === "success" &&
            foreignPostingResponse.data
          ) {
            const data = foreignPostingResponse.data as any;
            setForeignPostings(data.foreignPostings || []);
          }
          setSuccess("Foreign Posting added successfully!");
        }
        else{
          notifyError(response.message);
          setShowAddForeignPostingModal(false);
          return
        }
      }

      setShowAddForeignPostingModal(false);
      setEditingForeignPosting(null);
      setForeignPostingFormData({
        unit: "",
        from_date: "",
        to_date: "",
        remarks: "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to save Foreign Posting");
    } finally {
      setForeignPostingLoading(false);
    }
  };

  const handleDeleteForeignPosting = async (foreignPostingId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Foreign Posting",
      message:
        "Are you sure you want to delete this Foreign Posting record? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          setError("");
          const response = await personnelService.deleteForeignPosting(
            foreignPostingId
          );
          if (response.status === "success") {
            // Refresh Foreign Posting data
            const foreignPostingResponse =
              await personnelService.getPersonnelForeignPostings(
                parseInt(personnelId)
              );
            if (
              foreignPostingResponse.status === "success" &&
              foreignPostingResponse.data
            ) {
              const data = foreignPostingResponse.data as any;
              setForeignPostings(data.foreignPostings || []);
            }
            setSuccess("Foreign Posting deleted successfully");
          }
        } catch (err: any) {
          console.error("Error deleting Foreign Posting:", err);
          setError(err.message || "Failed to delete Foreign Posting");
        }
      },
    });
  };

  // Proficiency CRUD Functions
  const handleAddProficiency = () => {
    setProficiencyFormData({
      proficiency_type: "",
      drone_equipment_id: "",
      proficiency_level: "",
      flying_hours: "",
      trg_cadre: "",
      level: "",
      duration_from: "",
      duration_to: "",
      location: "",
    });
    setShowAddProficiencyModal(true);
    setEditingProficiency(null);
    setError("");
    setSuccess("");
  };

  const handleEditProficiency = (proficiency: Proficiency) => {
    setEditingProficiency(proficiency);
    // Parse duration string to extract from and to dates if format is "YYYY-MM-DD to YYYY-MM-DD"
    let duration_from = "";
    let duration_to = "";
    if (proficiency.duration) {
      const parts = proficiency.duration.split(" to ");
      if (parts.length === 2) {
        duration_from = parts[0].trim();
        duration_to = parts[1].trim();
      }
    }
    setProficiencyFormData({
      proficiency_type: proficiency.proficiency_type,
      drone_equipment_id: proficiency.drone_equipment_id?.toString() || "",
      proficiency_level: proficiency.proficiency_level || "",
      flying_hours: proficiency.flying_hours?.toString() || "",
      trg_cadre: proficiency.trg_cadre || "",
      level: proficiency.level,
      duration_from: duration_from,
      duration_to: duration_to,
      location: proficiency.location || "",
    });
    setShowAddProficiencyModal(true);
    setError("");
    setSuccess("");
  };

  const handleSubmitProficiency = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setProficiencyLoading(true);
      setError("");

      // Format duration from date fields
      let duration = null;
      if (proficiencyFormData.duration_from || proficiencyFormData.duration_to) {
        if (proficiencyFormData.duration_from && proficiencyFormData.duration_to) {
          duration = `${proficiencyFormData.duration_from} to ${proficiencyFormData.duration_to}`;
        } else if (proficiencyFormData.duration_from) {
          duration = proficiencyFormData.duration_from;
        } else if (proficiencyFormData.duration_to) {
          duration = proficiencyFormData.duration_to;
        }
      }

      const proficiencyData: any = {
        proficiency_type: proficiencyFormData.proficiency_type,
        level: proficiencyFormData.level,
        duration: duration,
        location: proficiencyFormData.location || null,
      };

      if (proficiencyFormData.proficiency_type === 'Drone') {
        proficiencyData.drone_equipment_id = parseInt(proficiencyFormData.drone_equipment_id);
        if (proficiencyFormData.proficiency_level) {
          proficiencyData.proficiency_level = proficiencyFormData.proficiency_level;
        }
        if (proficiencyFormData.flying_hours) {
          proficiencyData.flying_hours = parseFloat(proficiencyFormData.flying_hours);
        }
      } else if (proficiencyFormData.proficiency_type === 'Others') {
        proficiencyData.trg_cadre = proficiencyFormData.trg_cadre;
      }

      if (editingProficiency) {
        const response = await personnelService.updateProficiency(
          editingProficiency.id,
          proficiencyData
        );
        if (response.status === "success") {
          const proficiencyResponse = await personnelService.getPersonnelProficiencies(
            parseInt(personnelId)
          );
          if (proficiencyResponse.status === "success" && proficiencyResponse.data) {
            const data = proficiencyResponse.data as any;
            setProficiencies(data.proficiencies || []);
          }
          setSuccess("Proficiency updated successfully!");
          setShowAddProficiencyModal(false);
          setEditingProficiency(null);
          setProficiencyFormData({
            proficiency_type: "",
            drone_equipment_id: "",
            proficiency_level: "",
            flying_hours: "",
            trg_cadre: "",
            level: "",
            duration_from: "",
            duration_to: "",
            location: "",
          });
        } else {
          setError(response.message || "Failed to update proficiency");
        }
      } else {
        const response = await personnelService.createProficiency(
          parseInt(personnelId),
          proficiencyData
        );
        if (response.status === "success") {
          const proficiencyResponse = await personnelService.getPersonnelProficiencies(
            parseInt(personnelId)
          );
          if (proficiencyResponse.status === "success" && proficiencyResponse.data) {
            const data = proficiencyResponse.data as any;
            setProficiencies(data.proficiencies || []);
          }
          setSuccess("Proficiency added successfully!");
          setShowAddProficiencyModal(false);
          setEditingProficiency(null);
          setProficiencyFormData({
            proficiency_type: "",
            drone_equipment_id: "",
            proficiency_level: "",
            flying_hours: "",
            trg_cadre: "",
            level: "",
            duration_from: "",
            duration_to: "",
            location: "",
          });
        } else {
          setError(response.message || "Failed to add proficiency");
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save proficiency";
      setError(errorMessage);
    } finally {
      setProficiencyLoading(false);
    }
  };

  const handleDeleteProficiency = async (proficiencyId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Proficiency",
      message:
        "Are you sure you want to delete this proficiency record? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          setError("");
          const response = await personnelService.deleteProficiency(proficiencyId);
          if (response.status === "success") {
            const proficiencyResponse = await personnelService.getPersonnelProficiencies(
              parseInt(personnelId)
            );
            if (proficiencyResponse.status === "success" && proficiencyResponse.data) {
              const data = proficiencyResponse.data as any;
              setProficiencies(data.proficiencies || []);
            }
            setSuccess("Proficiency deleted successfully");
          }
        } catch (err: any) {
          console.error("Error deleting proficiency:", err);
          setError(err.message || "Failed to delete proficiency");
        }
      },
    });
  };

  // // Download CV Function
  // const handleDownloadCV = async () => {
  //   try {
  //     setError("");
  //     setSuccess("Generating CV... Please wait.");

  //     const token = localStorage.getItem('token');
  //     if (!token) {
  //       setError("Authentication required");
  //       return;
  //     }

  //     const response = await fetch(`${config.API_BASE_URL}/pdf/personnel/${personnelId}/cv`, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to generate CV');
  //     }

  //     // Get the filename from the response headers
  //     const contentDisposition = response.headers.get('Content-Disposition');
  //     const filename = contentDisposition
  //       ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
  //       : `CV_${personnel?.name?.replace(/\s+/g, '_') || 'Personnel'}_${personnel?.army_no || 'Unknown'}.pdf`;

  //     // Convert response to blob
  //     const blob = await response.blob();

  //     // Create download link
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = filename;
  //     document.body.appendChild(link);
  //     link.click();

  //     // Cleanup
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);

  //     setSuccess("CV downloaded successfully!");
  //   } catch (err: any) {
  //     console.error('Error downloading CV:', err);
  //     setError(err.message || "Failed to download CV");
  //   }
  // };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading personnel details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !personnel) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">
              {error || "Personnel not found"}
            </p>
            <Link
              href={back.href}
              className="text-blue-400 hover:text-blue-300"
            >
              ← {back.label}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Upload Document Modal */}
        {showUploadDocModal && (
          <div className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Upload Document</h2>
                <button
                  onClick={() => setShowUploadDocModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUploadDocument}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Document Type *
                    </label>
                    <div className="relative">
                    <select
                      value={uploadDocFormData.document_type}
                      onChange={(e) => setUploadDocFormData(prev => ({ ...prev, document_type: e.target.value as 'payslip' | 'form16' }))}
                      className="w-full  appearance-none px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                      required
                    >
                      <option value="payslip">Payslip</option>
                      <option value="form16">Form 16</option>
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      File *
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      onChange={handleDocFileChange}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Supported formats: PDF, Word, Excel, Images (Max 10MB)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadDocModal(false)}
                    className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingDoc}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadingDoc ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Viewer Drawer */}
        {docViewerOpen && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="bg-gray-800 w-full max-w-4xl h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedDocument.original_name}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Army No: {selectedDocument.army_no} | Type: {selectedDocument.document_type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(`${config.BACKEND_URL}${selectedDocument.file_path}`, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => setDocViewerOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4">
                <iframe
                  src={`${config.BACKEND_URL}${selectedDocument.file_path}`}
                  className="w-full h-full border-0 rounded-lg"
                  title={selectedDocument.original_name}
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />

        {/* Main Content */}
        <div className="mx-auto p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <Link
              href={back.href}
              className="mb-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {back.label}
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Personnel Details
                </h1>
              </div>
             
            </div>
          </div>

          {/* View-Only Notice for Personnel only */}
          {!canEdit() && !isOwnProfile && (
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
              <p className="text-sm">
                📖 You are viewing this personnel profile in read-only mode.
                Contact an administrator to make changes.
              </p>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              {success}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 mb-6 lg:mb-8 shadow-lg">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Profile Photo */}
              <div className="relative group photo-dropdown-container">
                <div
                  className={`w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl lg:text-4xl font-bold shadow-lg relative overflow-hidden ${
                    canManagePhoto ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => setShowPhotoDropdown(!showPhotoDropdown)}
                >
                  {personnel.photo_url ? (
                    <img
                      src={`${config.BACKEND_URL}${personnel.photo_url}`}
                      alt={personnel.name}
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover"
                    />
                  ) : (
                    (personnel.name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"
                  )}

                  {/* Menu Icon Overlay */}
                  <div
                    className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      photoLoading ? "opacity-100" : ""
                    }`}
                  >
                    <span className="text-white text-xl">
                      {photoLoading ? "⏳" : canManagePhoto ? "⚙️" : "👁️"}
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showPhotoDropdown && (
                  <>
                    {/* Backdrop to prevent interaction with elements behind */}
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowPhotoDropdown(false)}
                    />
                    <div className="fixed top-23 left-4 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                      <div className="py-1">
                        {personnel.photo_url && (
                          <button
                            onClick={() => {
                              handleViewPhoto();
                              setShowPhotoDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 cursor-pointer"
                          >
                            <span>👁️</span>
                            View Photo
                          </button>
                        )}
                        {canManagePhoto && (
                          <button
                            onClick={() => {
                              handleUploadNewPhoto();
                              setShowPhotoDropdown(false);
                            }}
                            disabled={photoLoading}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                          >
                            <span>📷</span>
                            Upload New
                          </button>
                        )}
                        {canManagePhoto && personnel.photo_url && (
                          <button
                            onClick={() => {
                              handleDeletePhoto();
                              setShowPhotoDropdown(false);
                            }}
                            disabled={photoLoading}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                          >
                            <span>🗑️</span>
                            Delete Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    {personnel.name}
                  </h2>
                  {displayStatus && (
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-sm ${getStatusBadgeStyle(
                        displayStatus
                      )}`}
                    >
                      {displayStatus}
                    </span>
                  )}
                  {!canEdit() && !isOwnProfile && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-sm font-medium">
                      View Only
                    </span>
                  )}
                </div>
                <p className="text-md lg:text-md text-gray-300 mb-4">
                  {personnel.army_no} - {personnel.rank}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="profile-field-label">Service Duration</p>
                    <p className="profile-field-value">
                      {calculateServiceDuration(
                        personnel.doe || personnel.created_at
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="profile-field-label">Date of Birth</p>
                    <p className="profile-field-value">
                      {formatDateShort(personnel.dob) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="profile-field-label">Date of Entry</p>
                    <div className="profile-field-value">
                      { personnel.doe || personnel.created_at  ? formatDateShort(personnel.doe || personnel.created_at)  : "--"}
                      {/* {personnel.companies && personnel.companies.length > 0 && (
                        <span className="ml-2 text-blue-400">• {personnel.companies[0].company_name}</span>
                      )} */}
                    </div>
                  </div>
                  <div>
                    <p className="profile-field-label">Company Name</p>
                    <p className="profile-field-value">
                      {personnel.companyPersonnel &&
                      personnel.companyPersonnel.length > 0
                        ? personnel.companyPersonnel[0].company.company_name
                        : "--"}
                    </p>
                  </div>
                </div>
                
                {/* Platoon and Tradesman Details */}
                {(personnel.platoon || personnel.tradesman) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {personnel.platoon && (
                      <div>
                        <p className="profile-field-label">Platoon</p>
                        <p className="profile-field-value">
                          {personnel.platoon.platoon_name || "--"}
                        </p>
                      </div>
                    )}
                    {personnel.tradesman && (
                      <div>
                        <p className="profile-field-label">Tradesman</p>
                        <p className="profile-field-value">
                          {personnel.tradesman.trade_name || "--"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {canEdit() && (
                  <Link
                    href={`/dashboard/personnel/${personnelId}/edit${fromParam ? `?from=${fromParam}` : ""}`}
                    className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium text-center"
                  >
                    Edit Profile
                  </Link>
                )}
                <button
                  onClick={handleDownloadCV}
                  disabled={cvDownloadLoading}
                  className="px-4 lg:px-6 py-2 lg:py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  {cvDownloadLoading ? "Downloading..." : "Download CV"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 mb-6 lg:mb-8 shadow-lg">
            <div className="flex flex-wrap border-b border-white/10">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "courses", label: "Courses", icon: BookOpen },
                { id: "ere", label: "ERE Details", icon: Trophy },
                { id: "fieldservice", label: "Field Service", icon: Globe },
                { id: "foreignposting", label: "Foreign Posting", icon: Plane },
                {
                  id: "punishment",
                  label: "Punishment & Offences",
                  icon: Scale,
                },
                { id: "familydetails", label: "Family Details", icon: Users },
                { id: "proficiency", label: "Proficiency", icon: Lightbulb },
                { id: "leave", label: "Leave", icon: CalendarDays },
                { id: "docs", label: "Docs", icon: FileText },
                { id: "others", label: "Others", icon: Briefcase },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-4 lg:p-6">
              {activeTab === "proficiency" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      Proficiency Details
                    </h3>
                    {canEdit() && (
                      <button
                        onClick={handleAddProficiency}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Add Proficiency
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            S.No
                          </th>
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
                          {canEdit() && (
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {proficiencies.length === 0 ? (
                          <tr>
                            <td
                              colSpan={canEdit() ? 7 : 6}
                              className="px-4 lg:px-6 py-8 text-center text-gray-400"
                            >
                              No proficiency records found
                            </td>
                          </tr>
                        ) : (
                          proficiencies.map((proficiency, index) => (
                            <tr
                              key={proficiency.id}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                {index + 1}
                              </td>
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
                                {proficiency.duration || "--"}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                {proficiency.location || "--"}
                              </td>
                              {canEdit() && (
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditProficiency(proficiency)}
                                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProficiency(proficiency.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "leave" && (
                <div>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="text-lg lg:text-xl font-semibold text-white">
                        Leave History
                      </h3>
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <button
                            onClick={() => setShowApplyLeaveModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Apply Leave
                          </button>
                        )}
                      
                      </div>
                    </div>
                    {leaveError && (
                      <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                        {leaveError}
                      </div>
                    )}
                    {success && (
                      <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
                        {success}
                      </div>
                    )}
                  </div>

                  {leaveLoading ? (
                    <div className="text-center py-12 text-gray-400">
                      Loading leave records...
                    </div>
                  ) : leaveRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                          <Calendar className="w-12 h-12 text-blue-400" />
                        </div>
                      </div>
                      <p className="text-gray-300 font-medium mb-1">
                        No leave records found
                      </p>
                      <p className="text-gray-400 text-sm">
                        Leave requests for this personnel will appear here once
                        recorded.
                      </p>
                    </div>
                  ) : (
                    <>
                  
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                             <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              S.No
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Leave Type
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Duration
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Days
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Reason
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Status
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Approver
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {leaveRecords.map((record,index) => {
                            const days =
                              record.total_days ??
                              calculateLeaveDays(
                                record.start_date,
                                record.end_date
                              );
                            const approver =
                              record.approvedBy || record.approver;
                            return (
                              <tr
                                key={record.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                 <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-center">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <p className="text-sm lg:text-base font-medium text-white">
                                    {getLeaveTypeLabel(record)}
                                  </p>
                                  {record.created_at && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Applied on {formatDate(record.created_at)}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  <div>
                                    {formatDate(record.start_date || "")} -{" "}
                                    {formatDate(record.end_date || "")}
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-center">
                                  {typeof days === "number" ? days : "--"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  <p>{record.reason || "--"}</p>
                                  {record.rejection_reason && (
                                    <p className="text-xs text-rose-400 mt-2">
                                      Rejection: {record.rejection_reason}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getLeaveStatusBadgeClass(
                                      record.status
                                    )}`}
                                  >
                                    {record.status || "Unknown"}
                                  </span>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  {approver?.name ? (
                                    <div>
                                      <p className="text-sm text-white">
                                        {approver.name}
                                      </p>
                                      {approver.rank && (
                                        <p className="text-xs text-gray-400">
                                          {approver.rank}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-500">
                                      --
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                      <span className="text-sm text-gray-400">
                          Showing {leaveRecords.length} record
                          {leaveRecords.length === 1 ? "" : "s"}
                        </span>
                          </>
                  )}
                </div>
              )}

              {activeTab === "docs" && (
                <div>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <h3 className="text-lg lg:text-xl font-semibold text-white">
                        Documents
                      </h3>
                      <div className="flex items-center gap-3">
                        {canModify && (
                          <button
                            onClick={() => setShowUploadDocModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Upload Document
                          </button>
                        )}
                      </div>
                    </div>

                    {documentsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                            <FileText className="w-8 h-8 text-purple-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">No documents found</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/10">
                            <tr>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Document
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Type
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Size
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Uploaded
                              </th>
                              {canModify && (
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {documents.map((document) => (
                              <tr key={document.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                  <div className="flex items-center">
                                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                    <span className="truncate max-w-xs">{document.original_name}</span>
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    document.document_type === 'payslip'
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  }`}>
                                    {document.document_type}
                                  </span>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {formatFileSize(document.file_size)}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {formatDate(document.uploaded_at)}
                                </td>
                                {canModify && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => viewDocument(document)}
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                        title="View Document"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDocument(document.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                        title="Delete Document"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  {/* Row 1: Personal Information | Medical Category Section  */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">NOK</p>
                            <p className="profile-field-value">
                              {personnel.nok || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">
                              Account Number
                            </p>
                            <p className="profile-field-value">
                              {personnel.account_number || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">PAN Card</p>
                            <p className="profile-field-value">
                              {personnel.pan_card || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Aadhar Card</p>
                            <p className="profile-field-value">
                              {personnel.aadhar_card || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">DSP Account</p>
                            <p className="profile-field-value">
                              {personnel.dsp_account || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Phone</p>
                            <p className="profile-field-value">
                              {personnel.phone || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">Special Skills</p>
                            <p className="profile-field-value">
                              {personnel.special_skill || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Games Level</p>
                            <p className="profile-field-value">
                              {personnel.games_level || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">Blood Group</p>
                            <p className="profile-field-value">
                              {personnel.blood_group || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Date of Marriage</p>
                            <p className="profile-field-value">
                              {personnel.date_of_marriage
                                ? formatDateShort(personnel.date_of_marriage)
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                   
                   {/* Medical Category Section */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">
                        Medical Category Details
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">
                              Medical Category
                            </p>
                            <p className="profile-field-value">
                              {personnel.medicalCategory?.name || personnel.med_cat || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Recat Date</p>
                            <p className="profile-field-value">
                              {personnel.recat_date ? new Date(personnel.recat_date).toLocaleDateString('en-GB') : "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">Nature of Category</p>
                            <p className="profile-field-value">
                              {personnel.natural_category || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">PC / BC</p>
                            <p className="profile-field-value">
                              {personnel.pc_bc || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="profile-field-label">Date of Medical Board</p>
                            <p className="profile-field-value">
                              {personnel.date_of_medical_board ? new Date(personnel.date_of_medical_board).toLocaleDateString('en-GB') : "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Diagnosis</p>
                            <p className="profile-field-value">
                              {personnel.diagnose || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Restriction Due to Category</p>
                            <p className="profile-field-value">
                              {personnel.restriction_due_to_cat || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="profile-field-label">Remarks</p>
                            <p className="profile-field-value">
                              {personnel.remarks || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row 2:Employment Details | Sports Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   
                     <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">
                        Employment Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="profile-field-label">
                            Present Employment
                          </p>
                          <p className="profile-field-value">
                            {personnel.present_employment || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="profile-field-label">
                            Planned Employment
                          </p>
                          <p className="profile-field-value">
                            {personnel.planned_employment || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="profile-field-label">Honors & Awards</p>
                          <p className="profile-field-value">
                            {personnel.honors_awards || "None"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sports Details Section */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
                      <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">
                        Sports Details
                      </h3>
                        {sports.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="flex justify-center mb-3">
                              <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                                <Trophy className="w-8 h-8 text-green-400" />
                              </div>
                            </div>
                            <p className="text-gray-400">
                              No sports records found
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {sports.map((sport) => (
                              <div key={sport.id} className="space-y-3 pb-4 border-b border-white/10 last:border-b-0 last:pb-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="profile-field-label">
                                      Name of Event
                                    </p>
                                    <p className="profile-field-value">
                                      {sport.name_of_event || "--"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="profile-field-label">Level</p>
                                    <p className="profile-field-value">
                                      {sport.level || "--"}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="profile-field-label">
                                      Year of Participation
                                    </p>
                                    <p className="profile-field-value">
                                      {sport.year_of_participation
                                        ? new Date(sport.year_of_participation).toLocaleDateString('en-GB')
                                        : "--"}
                                    </p>
                                  </div>
                                </div>
                                {sport.achievements && (
                                  <div>
                                    <p className="profile-field-label">
                                      Achievements
                                    </p>
                                    <p className="profile-field-value">
                                      {sport.achievements}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                  </div>
                 

                  {/* Row 3: Education Details - Full Width */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">
                      Education Details
                    </h3>
                    {education.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                            <GraduationCap className="w-8 h-8 text-purple-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">
                          No education records found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Civilian Education */}
                        <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
                          <h4 className="text-md font-semibold text-white">Civilian Education</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* <div>
                              <p className="profile-field-label">CIV</p>
                              <p className="profile-field-value">
                                {education[0]?.civ || "--"}
                              </p>
                            </div> */}
                            <div>
                              <p className="profile-field-label">Degrees / School</p>
                              <p className="profile-field-value capitalize">
                                {education[0]?.civilian_degree || "--"}
                              </p>
                            </div>
                            <div className="">
                              <p className="profile-field-label">Specialisation</p>
                              <p className="profile-field-value">
                                {education[0]?.civilian_specialisation || "--"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Military Education */}
                        <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                          <h4 className="text-md font-semibold text-white">Military Education</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="profile-field-label">MR I</p>
                              <p className="profile-field-value capitalize">
                                {education[0]?.mri || "--"}
                              </p>
                            </div>
                            <div>
                              <p className="profile-field-label">MR II</p>
                              <p className="profile-field-value capitalize">
                                {education[0]?.mr_ii || "--"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "courses" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      Course Details
                    </h3>
                    {canEdit() && (
                      <button
                        onClick={() => setShowAddCourseModal(true)}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Add Course
                      </button>
                    )}
                  </div>

                  {/* OBTAINED GRADING Table */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      COURSES OBTAINED{" "}
                    </h4>
                    {courses.filter((course) => course.status === "obtained")
                      .length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                            <GraduationCap className="w-8 h-8 text-green-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">
                          No completed courses with grades
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/10">
                            <tr>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Course Name
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Start Date
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                End Date
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Duration
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Grade
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Remarks
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {courses
                              .filter((course) => course.status === "obtained")
                              .map((course) => (
                                <tr
                                  key={course.id}
                                  className="hover:bg-white/5 transition-colors"
                                >
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                    {course.course_name}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {formatDate(course.start_date || "")}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {formatDate(getCourseEndDate(course))}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {getCourseDurationLabel(course)}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {course.grade || "--"}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                    <div className="break-words line-clamp-3" title={course.remarks || undefined}>
                                      {course.remarks || "--"}
                                    </div>
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    {canEdit() ? (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() =>
                                            handleEditCourse(course)
                                          }
                                          className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteCourse(course.id)
                                          }
                                          className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        View Only
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* COURSE PLANNED Table */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">
                      COURSE PLANNED
                    </h4>
                    {courses.filter((course) => course.status === "planned")
                      .length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
                            <Calendar className="w-8 h-8 text-blue-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">No planned courses</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-white/10">
                            <tr>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Course Name
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Start Date
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                End Date
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Duration
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Remarks
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {courses
                              .filter((course) => course.status === "planned")
                              .map((course) => (
                                <tr
                                  key={course.id}
                                  className="hover:bg-white/5 transition-colors"
                                >
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                    {course.course_name}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {formatDate(course.start_date || "")}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {formatDate(getCourseEndDate(course))}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                    {getCourseDurationLabel(course)}
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                    <div className="break-words line-clamp-3" title={course.remarks || undefined}>
                                      {course.remarks || "--"}
                                    </div>
                                  </td>
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    {canEdit() ? (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() =>
                                            handleEditCourse(course)
                                          }
                                          className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteCourse(course.id)
                                          }
                                          className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">
                                        View Only
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "ere" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      {" "}
                      ERE Details
                    </h3>
                    {canEdit() && (
                      <button
                        onClick={handleAddEre}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Add ERE
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            S.NO
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Unit
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Period
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Planned ERE
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Remarks
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                           Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {eres.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-4 lg:px-6 py-8 text-center text-gray-400"
                            >
                              No ERE records found
                            </td>
                          </tr>
                        ) : (
                          eres.map((ere, index) => (
                            <tr
                              key={ere.id}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                {index + 1}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                {ere.unit}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                <div className="text-sm">
                                  <div>
                                    <strong>FROM:</strong>{" "}
                                    {formatDate(ere.from_date)}
                                  </div>
                                  <div>
                                    <strong>TO:</strong>{" "}
                                    {formatDate(ere.to_date)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                {ere.planned_ere}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                <div className="break-words line-clamp-3" title={ere.remarks || undefined}>
                                  {ere.remarks || "--"}
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4">
                                {canEdit() ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditEre(ere)}
                                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEre(ere.id)}
                                      className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    View Only
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "fieldservice" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      {" "}
                      Field Service
                    </h3>
                    {canEdit() && (
                      <button
                        onClick={handleAddFieldService}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Add Field Service
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            S.No
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Location
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Period
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Remarks
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {fieldServices.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 lg:px-6 py-8 text-center text-gray-400"
                            >
                              No Field Service records found
                            </td>
                          </tr>
                        ) : (
                          fieldServices.map((service, index) => (
                            <tr
                              key={service.id}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                {index + 1}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                {service.location}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                <div className="text-sm">
                                  <div>
                                    <strong>FROM:</strong>{" "}
                                    {formatDate(service.from_date)}
                                  </div>
                                  <div>
                                    <strong>TO:</strong>{" "}
                                    {formatDate(service.to_date)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                <div className="break-words line-clamp-3" title={service.remarks || undefined}>
                                  {service.remarks || "--"}
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4">
                                {canEdit() ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        handleEditFieldService(service)
                                      }
                                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteFieldService(service.id)
                                      }
                                      className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    View Only
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "foreignposting" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      FOREIGN POSTING :-
                    </h3>
                    {canEdit() && (
                      <button
                        onClick={handleAddForeignPosting}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Add Foreign Posting
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            S.No
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Unit
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Period
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Remarks
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {foreignPostings.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 lg:px-6 py-8 text-center text-gray-400"
                            >
                              No Foreign Posting records found
                            </td>
                          </tr>
                        ) : (
                          foreignPostings.map((posting, index) => (
                            <tr
                              key={posting.id}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                {index + 1}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                {posting.unit}
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                <div className="text-sm">
                                  <div>
                                    <strong>FROM:</strong>{" "}
                                    {formatDate(posting.from_date)}
                                  </div>
                                  <div>
                                    <strong>TO:</strong>{" "}
                                    {formatDate(posting.to_date)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                <div className="break-words line-clamp-3" title={posting.remarks || undefined}>
                                  {posting.remarks || "--"}
                                </div>
                              </td>
                              <td className="px-4 lg:px-6 py-3 lg:py-4">
                                {canEdit() ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() =>
                                        handleEditForeignPosting(posting)
                                      }
                                      className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteForeignPosting(posting.id)
                                      }
                                      className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    View Only
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "punishment" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      Punishment & Offences
                    </h3>
                    {canEdit() && (
                      <button
                        onClick={handleAddPunishment}
                        className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                      >
                        Add Punishment
                      </button>
                    )}
                  </div>

                  {/* Endorsed Offences Table */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
                      ENDORSED
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-white/20">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              S.No
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Offence
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Section AA
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Type of Entry
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Date of Offence
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Punishment Awarded
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Remarks
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {endorsedOffences.length === 0 ? (
                            <tr>
                              <td
                                colSpan={8}
                                className="px-4 lg:px-6 py-8 text-center text-gray-400"
                              >
                                No endorsed offences recorded
                              </td>
                            </tr>
                          ) : (
                            endorsedOffences.map((offence, index) => (
                              <tr
                                key={offence.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base border-r border-white/20">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.offence}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.section_aa || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.type_of_entry || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.date_of_offence
                                    ? formatDate(offence.date_of_offence)
                                    : "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.punishment_awarded || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20 max-w-[200px]">
                                  <div className="break-words line-clamp-3" title={offence.remarks || undefined}>
                                    {offence.remarks || "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  {canEdit() ? (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleEditPunishment(offence)
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeletePunishment(offence.id)
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      View Only
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Not Endorsed Offences Table */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 border-b border-white/20 pb-2">
                      NOT ENDORSED
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-white/20">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              S.No
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Offence
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Section AA
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Type of Entry
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base border-r border-white/20">
                              Remarks
                            </th>
                            <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {notEndorsedOffences.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 lg:px-6 py-8 text-center text-gray-400"
                              >
                                No non-endorsed offences recorded
                              </td>
                            </tr>
                          ) : (
                            notEndorsedOffences.map((offence, index) => (
                              <tr
                                key={offence.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base border-r border-white/20">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.offence}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.section_aa || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20">
                                  {offence.type_of_entry || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base border-r border-white/20 max-w-[200px]">
                                  <div className="break-words line-clamp-3" title={offence.remarks || undefined}>
                                    {offence.remarks || "N/A"}
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4">
                                  {canEdit() ? (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleEditPunishment(offence)
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeletePunishment(offence.id)
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">
                                      View Only
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "familydetails" && (
                <div className="space-y-0">
                  {/* Family Details Section */}
                  <div className="pb-6 border-b border-white/20">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg lg:text-xl font-semibold text-white">
                        Family Details
                      </h3>
                      {familyDetails.length > 0 && canEdit() && (
                        <Link
                          href={`/dashboard/personnel/${personnelId}/family-details`}
                          className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                        >
                          Manage Family Details
                        </Link>
                      )}
                    </div>

                    {familyDetails.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mb-6">
                          <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <h3 className="text-xl font-semibold text-white mb-2">No Family Details Recorded</h3>
                          <p className="text-gray-400 mb-6">
                            Add family member details to keep track of important information.
                          </p>
                        </div>

                        {canEdit() && (
                          <Link
                            href={`/dashboard/personnel/${personnelId}/family-details`}
                            className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Family Details
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {familyDetails.slice(0, 6).map((detail) => (
                          <div
                            key={detail.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                          >
                            <div className="mb-3">
                              <h4 className="text-lg font-semibold text-white capitalize">
                                {detail.relationship_type.replace('_', ' ')}
                              </h4>
                              <p className="text-blue-300 font-medium">{detail.name}</p>
                            </div>

                            <div className="space-y-1 text-sm">
                              {detail.contact_number && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Contact:</span>
                                  <span className="text-white">{detail.contact_number}</span>
                                </div>
                              )}

                              {detail.relationship_type !== 'father' && detail.relationship_type !== 'mother' && detail.dob && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">DOB:</span>
                                  <span className="text-white">{formatDateShort(detail.dob)}</span>
                                </div>
                              )}

                              {detail.relationship_type !== 'father' && detail.relationship_type !== 'mother' && detail.blood_group && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Blood Group:</span>
                                  <span className="text-white">{detail.blood_group}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {familyDetails.length > 6 && (
                          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/20 flex items-center justify-center">
                            <Link
                              href={`/dashboard/personnel/${personnelId}/family-details`}
                              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                              View All ({familyDetails.length})
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Family Problems Section */}
                  <div className="pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg lg:text-xl font-semibold text-white">
                        Family Problems
                      </h3>
                      {canEdit() && (
                        <button
                          onClick={handleAddFamilyProblem}
                          className="px-4 lg:px-6 py-2 lg:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer"
                        >
                          Add Family Problem
                        </button>
                      )}
                    </div>

                    {familyProblems.length === 0 ? (
                      <div className="text-center py-8">
                        <h3 className="text-gray-400 mb-2">
                          No Family Problems Recorded
                        </h3>
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
                                Problem
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Remarks
                              </th>
                              {canEdit() && (
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {familyProblems.map((familyProblem, index) => (
                              <tr
                                key={familyProblem.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                  <div className="break-words line-clamp-3" title={familyProblem.problem || undefined}>
                                    {familyProblem.problem || "-"}
                                  </div>
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                  <div className="break-words line-clamp-3" title={familyProblem.remarks || undefined}>
                                    {familyProblem.remarks || "-"}
                                  </div>
                                </td>
                                {canEdit() && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleEditFamilyProblem(familyProblem)
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteFamilyProblem(
                                            familyProblem.id
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "others" && (
                <div className="space-y-0">
                  <div className="pb-4 border-b border-white/20">
                    <h3 className="text-lg lg:text-xl font-semibold text-white">
                      Others
                    </h3>
                  </div>
                   {/* Out Station Employment Section */}
                  <div className="py-6 border-b border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-white">
                        Out Station Employment
                      </h4>
                      {canEdit() && (
                        <button
                          onClick={handleOpenOutStationAddModal}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer text-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {outStationEmployments.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-cyan-500/20 rounded-full border border-cyan-500/30">
                            <Briefcase className="w-8 h-8 text-cyan-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">
                          No out station employment records found
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
                                Formation
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Location
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Attachment
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Employemnt
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Start Date
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                End Date
                              </th>
                              {canEdit() && (
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {outStationEmployments.map((item, index) => (
                              <tr
                                key={item.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.formation || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.location || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.attachment || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.employment || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.start_date
                                    ? formatDateForInput(item.start_date)
                                    : "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.end_date
                                    ? formatDateForInput(item.end_date)
                                    : "-"}
                                </td>
                                {canEdit() && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleOpenOutStationEditModal(item)
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteOthers(
                                            item.id,
                                            "out_station"
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Hospitalisation / Admission Details Section */}
                  <div className="py-6 border-b border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-white">
                        Hospitalisation / Admission Details
                      </h4>
                      {canEdit() && (
                        <button
                          onClick={handleOpenHospitalisationAddModal}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer text-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {hospitalisations.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-amber-500/20 rounded-full border border-amber-500/30">
                            <HeartPulse className="w-8 h-8 text-amber-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">
                          No hospitalisation records found
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
                                Date of Admission
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Date of Discharge 
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Diagnosis
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Medical category
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Remarks
                              </th>
                              {canEdit() && (
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {hospitalisations.map((item, index) => (
                              <tr
                                key={item.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.date_of_admission
                                    ? formatDateForInput(item.date_of_admission)
                                    : "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.date_of_discharge
                                    ? formatDateForInput(item.date_of_discharge)
                                    : "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.diagnosis || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.medical_category || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-[200px]">
                                  <div className="break-words line-clamp-3" title={item.remarks || undefined}>
                                    {item.remarks || "-"}
                                  </div>
                                </td>
                                {canEdit() && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleOpenHospitalisationEditModal(item)
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteOthers(
                                            item.id,
                                            "hospitalisation"
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Special Employment Suitability Section */}
                  <div className="py-6 border-b border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-white">
                        Special Employment Suitability
                      </h4>
                      {canEdit() && (
                        <button
                          onClick={handleOpenSpecialEmploymentAddModal}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer text-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {specialEmploymentData.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                            <ClipboardList className="w-8 h-8 text-purple-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">
                          No special employment suitability records found
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
                                Suitable for Special EMP (a)
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Suitable for Special EMP (b)
                              </th>
                              {canEdit() && (
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {specialEmploymentData.map((item, index) => (
                              <tr
                                key={item.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.suitable_for_special_emp_a || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.suitable_for_special_emp_b || "-"}
                                </td>
                                {canEdit() && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleOpenSpecialEmploymentEditModal(
                                            item
                                          )
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteOthers(
                                            item.id,
                                            "special_employment"
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Recommendations Section */}
                  <div className="pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-white">
                        Recommendations
                      </h4>
                      {canEdit() && (
                        <button
                          onClick={handleOpenRecommendationsAddModal}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer text-sm"
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {recommendations.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-lg">
                        <div className="flex justify-center mb-3">
                          <div className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                            <Lightbulb className="w-8 h-8 text-yellow-400" />
                          </div>
                        </div>
                        <p className="text-gray-400">
                          No recommendation records found
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
                                Recommendation (a)
                              </th>
                              <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                Recommendation (b)
                              </th>
                              {canEdit() && (
                                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">
                                  Actions
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {recommendations.map((item, index) => (
                              <tr
                                key={item.id}
                                className="hover:bg-white/5 transition-colors"
                              >
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">
                                  {index + 1}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.recommendation_a || "-"}
                                </td>
                                <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base">
                                  {item.recommendation_b || "-"}
                                </td>
                                {canEdit() && (
                                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() =>
                                          handleOpenRecommendationsEditModal(
                                            item
                                          )
                                        }
                                        className="text-blue-400 hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteOthers(
                                            item.id,
                                            "recommendation"
                                          )
                                        }
                                        className="text-red-400 hover:text-red-300 transition-colors text-sm cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Course Modal */}
        {showAddCourseModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingCourse ? "Edit Course" : "Add Course"}
                </h2>
                <button
                  onClick={handleCloseCourseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Course *
                    </label>
                    <select
                      required
                      value={courseFormData.course_id}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          course_id: e.target.value,
                        })
                      }
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Course</option>
                      {availableCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.course_title}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Status *
                    </label>
                    <select
                      required
                      value={courseFormData.status}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          status: e.target.value as "obtained" | "planned",
                        })
                      }
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="obtained">Courses Obtained </option>
                      <option value="planned">Course Planned</option>
                    </select>
                    <svg
                      className="absolute right-4 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={courseFormData.start_date}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          start_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={courseFormData.end_date}
                      min={courseFormData.start_date || undefined}
                      onChange={(e) =>
                        setCourseFormData({
                          ...courseFormData,
                          end_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  {courseFormData.status === "obtained" && (
                    <div className="relative">
                      <label className="block text-gray-200 mb-2 text-sm font-medium">
                        Grade
                      </label>
                      <select
                        value={courseFormData.grade}
                        onChange={(e) =>
                          setCourseFormData({
                            ...courseFormData,
                            grade: e.target.value,
                          })
                        }
                        className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Grade</option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.name}>
                            {grade.name}
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Remarks
                  </label>
                  <textarea
                    value={courseFormData.remarks}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        remarks: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleCloseCourseModal}
                    className="px-6 py-3 cursor-pointer text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={courseLoading}
                    className="px-6 py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {courseLoading
                      ? editingCourse
                        ? "Updating..."
                        : "Adding..."
                      : editingCourse
                      ? "Update Course"
                      : "Add Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add/Edit Punishment Offence Modal */}
        {showPunishmentModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingPunishmentOffence
                    ? "Edit Punishment Offence"
                    : "Add Punishment Offence"}
                </h2>
                <button
                  onClick={handleClosePunishmentModal}
                  className="text-gray-400 cursor-pointer hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitPunishment} className="space-y-6">
                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Offence *
                  </label>
                  <input
                    type="text"
                    required
                    value={punishmentFormData.offence}
                    onChange={(e) =>
                      setPunishmentFormData({
                        ...punishmentFormData,
                        offence: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter offence description"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Section AA
                    </label>
                    <input
                      type="text"
                      value={punishmentFormData.section_aa}
                      onChange={(e) =>
                        setPunishmentFormData({
                          ...punishmentFormData,
                          section_aa: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter Section AA"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Type of Entry
                    </label>
                    <select
                      value={punishmentFormData.type_of_entry}
                      onChange={(e) =>
                        setPunishmentFormData({
                          ...punishmentFormData,
                          type_of_entry: e.target.value,
                        })
                      }
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select type of entry</option>
                      <option value="black ink">Black Ink</option>
                      <option value="red ink">Red Ink</option>
                    </select>
                    <svg
                      className="absolute right-4 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Date of Offence
                    </label>
                    <input
                      type="date"
                      value={punishmentFormData.date_of_offence}
                      onChange={(e) =>
                        setPunishmentFormData({
                          ...punishmentFormData,
                          date_of_offence: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Endorsed
                    </label>
                    <select
                      value={punishmentFormData.endorsed ? "true" : "false"}
                      onChange={(e) =>
                        setPunishmentFormData({
                          ...punishmentFormData,
                          endorsed: e.target.value === "true",
                        })
                      }
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="true">Endorsed</option>
                      <option value="false">Not Endorsed</option>
                    </select>
                    <svg
                      className="absolute right-4 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                </div>

                {punishmentFormData.endorsed && (
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Punishment Awarded
                    </label>
                    <input
                      type="text"
                      value={punishmentFormData.punishment_awarded}
                      onChange={(e) =>
                        setPunishmentFormData({
                          ...punishmentFormData,
                          punishment_awarded: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter punishment details"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Remarks
                  </label>
                  <textarea
                    value={punishmentFormData.remarks}
                    onChange={(e) =>
                      setPunishmentFormData({
                        ...punishmentFormData,
                        remarks: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter any additional remarks"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleClosePunishmentModal}
                    className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={punishmentLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {punishmentLoading
                      ? "Loading..."
                      : editingPunishmentOffence
                      ? "Edit Offence"
                      : "Add Offence"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Family Problem Modal */}
        {showFamilyProblemModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingFamilyProblem
                    ? "Edit Family Problem"
                    : "Add Family Problem"}
                </h2>
                <button
                  onClick={handleCloseFamilyProblemModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitFamilyProblem} className="space-y-6">
                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Problem Description *
                  </label>
                  <textarea
                    required
                    value={familyProblemFormData.problem}
                    onChange={(e) =>
                      setFamilyProblemFormData({
                        ...familyProblemFormData,
                        problem: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Describe the family problem..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Remarks
                  </label>
                  <textarea
                    value={familyProblemFormData.remarks}
                    onChange={(e) =>
                      setFamilyProblemFormData({
                        ...familyProblemFormData,
                        remarks: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Additional remarks or notes..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleCloseFamilyProblemModal}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={familyProblemLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {familyProblemLoading
                      ? editingFamilyProblem
                        ? "Updating..."
                        : "Adding..."
                      : editingFamilyProblem
                      ? "Update Family Problem"
                      : "Add Family Problem"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Family Details Modal */}
        {showFamilyDetailModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingFamilyDetail
                    ? "Edit Family Detail"
                    : "Add Family Detail"}
                </h2>
                <button
                  onClick={handleCloseFamilyDetailModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitFamilyDetail} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Relationship Type *
                    </label>
                    <select
                      required
                      value={familyDetailFormData.relationship_type}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          relationship_type: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="" className="bg-gray-800">Select Relationship</option>
                      <option value="father" className="bg-gray-800">Father</option>
                      <option value="mother" className="bg-gray-800">Mother</option>
                      {(personnel?.date_of_marriage || (editingFamilyDetail && ['spouse', 'child'].includes(editingFamilyDetail.relationship_type))) && (
                        <>
                          <option value="spouse" className="bg-gray-800">Spouse</option>
                          <option value="child" className="bg-gray-800">Child</option>
                        </>
                      )}
                      <option value="brother" className="bg-gray-800">Brother</option>
                      <option value="sister" className="bg-gray-800">Sister</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={familyDetailFormData.name}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <DateOfBirthInput
                      value={familyDetailFormData.dob}
                      onChange={(value) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          dob: value,
                        })
                      }
                      label="Date of Birth"
                      minAge={0}
                      maxAge={100}
                      className="px-4 py-3 rounded-lg bg-white/10 border-white/20 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={familyDetailFormData.contact_number}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          contact_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      PAN Card Number
                    </label>
                    <input
                      type="text"
                      value={familyDetailFormData.pan_card}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          pan_card: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter PAN card number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Aadhar Card Number
                    </label>
                    <input
                      type="text"
                      value={familyDetailFormData.aadhar_card}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          aadhar_card: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter Aadhar card number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={familyDetailFormData.account_number}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          account_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Blood Group
                    </label>
                    <select
                      value={familyDetailFormData.blood_group}
                      onChange={(e) =>
                        setFamilyDetailFormData({
                          ...familyDetailFormData,
                          blood_group: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="" className="bg-gray-800">Select Blood Group</option>
                      <option value="A+" className="bg-gray-800">A+</option>
                      <option value="A-" className="bg-gray-800">A-</option>
                      <option value="B+" className="bg-gray-800">B+</option>
                      <option value="B-" className="bg-gray-800">B-</option>
                      <option value="AB+" className="bg-gray-800">AB+</option>
                      <option value="AB-" className="bg-gray-800">AB-</option>
                      <option value="O+" className="bg-gray-800">O+</option>
                      <option value="O-" className="bg-gray-800">O-</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleCloseFamilyDetailModal}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={familyDetailLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {familyDetailLoading
                      ? editingFamilyDetail
                        ? "Updating..."
                        : "Adding..."
                      : editingFamilyDetail
                      ? "Update Family Detail"
                      : "Add Family Detail"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add ERE Modal */}
        {showAddEreModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingEre ? "Edit ERE" : "Add ERE"}
                </h2>
                <button
                  onClick={() => setShowAddEreModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitEre} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Unit *
                    </label>
                    <input
                      type="text"
                      required
                      value={ereFormData.unit}
                      onChange={(e) =>
                        setEreFormData({ ...ereFormData, unit: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter unit"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Planned ERE 
                    </label>
                    <input
                      type="text"
                      value={ereFormData.planned_ere}
                      onChange={(e) =>
                        setEreFormData({
                          ...ereFormData,
                          planned_ere: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter planned ERE"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      From Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={ereFormData.from_date}
                      onChange={(e) =>
                        setEreFormData({
                          ...ereFormData,
                          from_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      To Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={ereFormData.to_date}
                      onChange={(e) =>
                        setEreFormData({
                          ...ereFormData,
                          to_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Remarks
                  </label>
                  <textarea
                    value={ereFormData.remarks}
                    onChange={(e) =>
                      setEreFormData({
                        ...ereFormData,
                        remarks: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter remarks"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddEreModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ereLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ereLoading
                      ? editingEre
                        ? "Updating..."
                        : "Adding..."
                      : editingEre
                      ? "Update ERE"
                      : "Add ERE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Field Service Modal */}
        {showAddFieldServiceModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingFieldService
                    ? "Edit Field Service"
                    : "Add Field Service"}
                </h2>
                <button
                  onClick={() => setShowAddFieldServiceModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitFieldService} className="space-y-6">
                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={fieldServiceFormData.location}
                    onChange={(e) =>
                      setFieldServiceFormData({
                        ...fieldServiceFormData,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter location"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      From Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={fieldServiceFormData.from_date}
                      onChange={(e) =>
                        setFieldServiceFormData({
                          ...fieldServiceFormData,
                          from_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      To Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={fieldServiceFormData.to_date}
                      onChange={(e) =>
                        setFieldServiceFormData({
                          ...fieldServiceFormData,
                          to_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Remarks
                  </label>
                  <textarea
                    value={fieldServiceFormData.remarks}
                    onChange={(e) =>
                      setFieldServiceFormData({
                        ...fieldServiceFormData,
                        remarks: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter remarks"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddFieldServiceModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={fieldServiceLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fieldServiceLoading
                      ? editingFieldService
                        ? "Updating..."
                        : "Adding..."
                      : editingFieldService
                      ? "Update Field Service"
                      : "Add Field Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Foreign Posting Modal */}
        {showAddForeignPostingModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingForeignPosting
                    ? "Edit Foreign Posting"
                    : "Add Foreign Posting"}
                </h2>
                <button
                  onClick={() => setShowAddForeignPostingModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitForeignPosting} className="space-y-6">
                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={foreignPostingFormData.unit}
                    onChange={(e) =>
                      setForeignPostingFormData({
                        ...foreignPostingFormData,
                        unit: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter unit"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      From Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={foreignPostingFormData.from_date}
                      onChange={(e) =>
                        setForeignPostingFormData({
                          ...foreignPostingFormData,
                          from_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      To Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={foreignPostingFormData.to_date}
                      onChange={(e) =>
                        setForeignPostingFormData({
                          ...foreignPostingFormData,
                          to_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Remarks
                  </label>
                  <textarea
                    value={foreignPostingFormData.remarks}
                    onChange={(e) =>
                      setForeignPostingFormData({
                        ...foreignPostingFormData,
                        remarks: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter remarks"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForeignPostingModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={foreignPostingLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {foreignPostingLoading
                      ? editingForeignPosting
                        ? "Updating..."
                        : "Adding..."
                      : editingForeignPosting
                      ? "Update Foreign Posting"
                      : "Add Foreign Posting"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Proficiency Modal */}
        {showAddProficiencyModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingProficiency
                    ? "Edit Proficiency"
                    : "Add Proficiency"}
                </h2>
                <button
                  onClick={() => setShowAddProficiencyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitProficiency} className="space-y-6">
                <div className="relative">
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Proficiency Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={proficiencyFormData.proficiency_type}
                    onChange={(e) =>
                      setProficiencyFormData({
                        ...proficiencyFormData,
                        proficiency_type: e.target.value as 'Drone' | 'Others',
                        // Reset type-specific fields when changing type
                        drone_equipment_id: "",
                        proficiency_level: "",
                        flying_hours: "",
                        trg_cadre: "",
                        duration_from: "",
                        duration_to: "",
                      })
                    }
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Drone">Drone</option>
                    <option value="Others">Others</option>
                  </select>
                    <svg
                  className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </div>

                {proficiencyFormData.proficiency_type === 'Drone' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='relative'>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">
                        Type of Drone Equipment <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={proficiencyFormData.drone_equipment_id}
                        onChange={(e) =>
                          setProficiencyFormData({
                            ...proficiencyFormData,
                            drone_equipment_id: e.target.value,
                          })
                        }
                        className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Equipment</option>
                        {droneEquipment.map((equipment) => (
                          <option key={equipment.id} value={equipment.id}>
                            {equipment.equipment_name}
                          </option>
                        ))}
                      </select>
                        <svg
                  className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                    </div>
                    <div className='relative'>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">
                        Proficiency Level
                      </label>
                      <select
                        value={proficiencyFormData.proficiency_level}
                        onChange={(e) =>
                          setProficiencyFormData({
                            ...proficiencyFormData,
                            proficiency_level: e.target.value as 'low' | 'medium' | 'high',
                          })
                        }
                        className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Level</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                        <svg
                  className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                    </div>
                    <div>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">
                        Flying Hours
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={proficiencyFormData.flying_hours}
                        onChange={(e) =>
                          setProficiencyFormData({
                            ...proficiencyFormData,
                            flying_hours: e.target.value,
                          })
                        }
                        className="w-full  px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter flying hours"
                      />
                    </div>
                  </div>
                )}

                {proficiencyFormData.proficiency_type === 'Others' && (
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Trg/Cadre *
                    </label>
                    <input
                      type="text"
                      required
                      value={proficiencyFormData.trg_cadre}
                      onChange={(e) =>
                        setProficiencyFormData({
                          ...proficiencyFormData,
                          trg_cadre: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter training/cadre"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className='relative'>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Level *
                    </label>
                    <select
                      required
                      value={proficiencyFormData.level}
                      onChange={(e) =>
                        setProficiencyFormData({
                          ...proficiencyFormData,
                          level: e.target.value as 'unit' | 'brigade' | 'division' | 'corps',
                        })
                      }
                      className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Level</option>
                      <option value="unit">Unit</option>
                      <option value="brigade">Brigade</option>
                      <option value="division">Division</option>
                      <option value="corps">Corps</option>
                    </select>
                      <svg
                  className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      Location
                    </label>
                    <input
                      type="text"
                      value={proficiencyFormData.location}
                      onChange={(e) =>
                        setProficiencyFormData({
                          ...proficiencyFormData,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Duration
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 mb-2 text-xs font-medium">
                        From
                      </label>
                      <input
                        type="date"
                        value={proficiencyFormData.duration_from}
                        onChange={(e) =>
                          setProficiencyFormData({
                            ...proficiencyFormData,
                            duration_from: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-xs font-medium">
                        To
                      </label>
                      <input
                        type="date"
                        value={proficiencyFormData.duration_to}
                        onChange={(e) =>
                          setProficiencyFormData({
                            ...proficiencyFormData,
                            duration_to: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddProficiencyModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={proficiencyLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {proficiencyLoading
                      ? editingProficiency
                        ? "Updating..."
                        : "Adding..."
                      : editingProficiency
                      ? "Update Proficiency"
                      : "Add Proficiency"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Out Station Employment Modal */}
        {showOutStationModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingOutStation
                    ? "Edit Out Station Employment"
                    : "Add Out Station Employment"}
                </h2>
                <button
                  onClick={handleCloseOutStationModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitOutStation} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      FORMATION  <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={othersFormData.out_station_formation_category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const f = formations.find((x) => x.name === cat);
                        const hasSub =
                          f?.sub_formations && f.sub_formations.length > 0;
                        setOthersFormData({
                          ...othersFormData,
                          out_station_formation_category: cat,
                          out_station_formation: hasSub ? "" : cat,
                        });
                      }}
                      required
                      className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Formation</option>
                      {formations.map((f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                     <svg
                        className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                  {formations.find(
                    (f) =>
                      f.name ===
                        othersFormData.out_station_formation_category &&
                      f.sub_formations &&
                      f.sub_formations.length > 0
                  ) && (
                    <div className="relative">
                      <label className="block text-gray-200 mb-2 text-sm font-medium">
                        FORMATION SUB-CATEGORY 
                      </label>
                      <select
                        value={othersFormData.out_station_formation}
                        onChange={(e) =>
                          setOthersFormData({
                            ...othersFormData,
                            out_station_formation: e.target.value,
                          })
                        }
                        
                        className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Sub-Category</option>
                        {formations
                          .find(
                            (f) =>
                              f.name ===
                              othersFormData.out_station_formation_category
                          )
                          ?.sub_formations?.map((s) => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                       <svg
                        className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
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
                  )}
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      LOCATION <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={othersFormData.out_station_location}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          out_station_location: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      ATTACHMENT
                    </label>
                    <input
                      type="text"
                      value={othersFormData.out_station_attachment}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          out_station_attachment: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter attachment"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      EMPLOYMENT <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={othersFormData.out_station_employment}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          out_station_employment: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter employment details"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      START DATE  <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={othersFormData.out_station_start_date}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          out_station_start_date: e.target.value,
                        })
                      }
                      required
                      
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      END DATE <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={othersFormData.out_station_end_date}
                      required
                      min={othersFormData.out_station_start_date || undefined}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          out_station_end_date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseOutStationModal}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={othersLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {othersLoading
                      ? editingOutStation
                        ? "Updating..."
                        : "Adding..."
                      : editingOutStation
                      ? "Update"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hospitalisation / Admission Details Modal */}
        {showHospitalisationModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingHospitalisation
                    ? "Edit Hospitalisation / Admission"
                    : "Add Hospitalisation / Admission"}
                </h2>
                <button
                  onClick={handleCloseHospitalisationModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitHospitalisation} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      DATE OF ADMISSION
                    </label>
                    <input
                      type="date"
                      value={othersFormData.hospitalisation_date_of_admission}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          hospitalisation_date_of_admission: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      DATE OF DISCHARGE
                    </label>
                    <input
                      type="date"
                      value={othersFormData.hospitalisation_date_of_discharge}
                      min={othersFormData.hospitalisation_date_of_admission || undefined}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          hospitalisation_date_of_discharge: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      DIAGNOSIS
                    </label>
                    <input
                      type="text"
                      value={othersFormData.hospitalisation_diagnosis}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          hospitalisation_diagnosis: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter diagnosis"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      MEDICAL CATEGORY
                    </label>
                    <select
                      value={othersFormData.hospitalisation_medical_category}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          hospitalisation_medical_category: e.target.value,
                        })
                      }
                      className="w-full appearance-none px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Medical Category</option>
                      {medicalCategories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-13 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      REMARKS
                    </label>
                    <input
                      type="text"
                      value={othersFormData.hospitalisation_remarks}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          hospitalisation_remarks: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseHospitalisationModal}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={othersLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {othersLoading
                      ? editingHospitalisation
                        ? "Updating..."
                        : "Adding..."
                      : editingHospitalisation
                      ? "Update"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Special Employment Suitability Modal */}
        {showSpecialEmploymentModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingSpecialEmployment
                    ? "Edit Special Employment Suitability"
                    : "Add Special Employment Suitability"}
                </h2>
                <button
                  onClick={handleCloseSpecialEmploymentModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitSpecialEmployment} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      SUITABLE FOR SPECIAL EMP (a)
                    </label>
                    <input
                      type="text"
                      value={othersFormData.suitable_for_special_emp_a}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          suitable_for_special_emp_a: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter details for (a)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      SUITABLE FOR SPECIAL EMP (b)
                    </label>
                    <input
                      type="text"
                      value={othersFormData.suitable_for_special_emp_b}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          suitable_for_special_emp_b: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter details for (b)"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseSpecialEmploymentModal}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={othersLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {othersLoading
                      ? editingSpecialEmployment
                        ? "Updating..."
                        : "Adding..."
                      : editingSpecialEmployment
                      ? "Update"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recommendations Modal */}
        {showRecommendationsModal && canEdit() && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-2xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingRecommendation
                    ? "Edit Recommendation"
                    : "Add Recommendation"}
                </h2>
                <button
                  onClick={handleCloseRecommendationsModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitRecommendations} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      RECOMMENDATION (a)
                    </label>
                    <input
                      type="text"
                      value={othersFormData.recommendation_a}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          recommendation_a: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter recommendation (a)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">
                      RECOMMENDATION (b)
                    </label>
                    <input
                      type="text"
                      value={othersFormData.recommendation_b}
                      onChange={(e) =>
                        setOthersFormData({
                          ...othersFormData,
                          recommendation_b: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter recommendation (b)"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseRecommendationsModal}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={othersLoading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {othersLoading
                      ? editingRecommendation
                        ? "Updating..."
                        : "Adding..."
                      : editingRecommendation
                      ? "Update"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Apply Leave Modal - Admin Only */}
        {showApplyLeaveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border-white/20">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-white mb-4">
                  Apply Leave for {personnel?.name || "Personnel"}
                </h3>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleApplyLeaveSubmit}>
                  <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Leave Type <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={leaveFormData.leave_type_id}
                        onChange={(e) =>
                          setLeaveFormData({
                            ...leaveFormData,
                            leave_type_id: e.target.value,
                          })
                        }
                        className="w-full appearance-none px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                        required
                      >
                        <option value="" className="bg-gray-800 text-white">
                          Select Leave Type
                        </option>
                        {leaveTypes.map((leaveType) => (
                          <option
                            key={leaveType.id}
                            value={leaveType.id}
                            className="bg-gray-800 text-white"
                          >
                            {leaveType.name}
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveFormData.start_date}
                      onChange={(e) =>
                        setLeaveFormData({
                          ...leaveFormData,
                          start_date: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={leaveFormData.end_date}
                      onChange={(e) =>
                        setLeaveFormData({
                          ...leaveFormData,
                          end_date: e.target.value,
                        })
                      }
                      min={
                        leaveFormData.start_date ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={leaveFormData.reason}
                      onChange={(e) =>
                        setLeaveFormData({
                          ...leaveFormData,
                          reason: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                      rows={3}
                      placeholder="Please provide a reason for the leave request"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowApplyLeaveModal(false);
                        setLeaveFormData({
                          leave_type_id: "",
                          start_date: "",
                          end_date: "",
                          reason: "",
                        });
                        setError("");
                      }}
                      className="px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applyLeaveLoading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applyLeaveLoading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
