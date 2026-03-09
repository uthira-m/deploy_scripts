"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import DateOfEntryInput from "@/components/DateOfEntryInput";
import { personnelService, rankService, personnelEducationService, personnelSportsService, medicalCategoryService, api } from "@/lib/api";
import { validatePersonnelDob } from "@/lib/utils";
import { getServerDate } from "@/lib/serverTime";

interface Personnel {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  status?: string;
  email?: string;
  phone?: string;
  dob: string;
  doe: string;
  service: string;
  honors_awards?: string;
  med_cat?: string;
  recat_date?: string;
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
  nok?: string;
  account_number?: string;
  pan_card?: string;
  aadhar_card?: string;
  dsp_account?: string;
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
  companyPersonnel?: Array<{ company_id: number; status: string }>;
  platoon?: { id: number; company_id?: number };
  tradesman?: { id: number };
  att_service?: string;
  att_specialization?: string;
}

interface Rank {
  id: number;
  name: string;
  category: string;
  hierarchy_order: number;
  description?: string;
  is_active: boolean;
}

interface Education {
  id: number;
  personnel_id: number;
  civ: string;
  civilian_degree: '10' | '12' | 'under graduate' | 'post graduate' | null;
  civilian_specialisation: string | null;
  mri: 'pass' | 'yet to appear' | null;
  mr_ii: 'pass' | 'yet to appear' | null;
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

interface Company {
  id: number;
  company_name: string;
  created_at: string;
  updated_at: string;
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

interface MedicalCategory {
  id: number;
  name: string;
  is_active: boolean;
}

// Att company: Services and sub-options (static)
const ATT_SERVICES = ["EME", "AMC", "AEC"] as const;
const ATT_SPECIALIZATION_BY_SERVICE: Record<string, string[]> = {
  EME: ["CHM (Att)", "Armr", "Veh Mech", "Elect"],
  AMC: ["RMO (offr)", "Nursing Asst"],
  AEC: ["JCOs", "Hav"],
};

export default function EditPersonnelPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
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

  const [personnel, setPersonnel] = useState<Personnel | null>(null);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  const [tradesmen, setTradesmen] = useState<Tradesman[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [sports, setSports] = useState<Sports[]>([]);
  const [medicalCategories, setMedicalCategories] = useState<MedicalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  const [formData, setFormData] = useState({
    name: "",
    rank: "",
    unit: "",
    status: "Active",
    email: "",
    phone: "",
    dob: "",
    doe: "",
    service: "",
    honors_awards: "",
    med_cat: "",
    recat_date: "",
    medical_category_id: "",
    diagnose: "",
    date_of_medical_board: "",
    pc_bc: "",
    restriction_due_to_cat: "",
    remarks: "",
    natural_category: "",
    special_skill: "",
    games_level: "",
    present_employment: "",
    planned_employment: "",
    nok: "",
    account_number: "",
    pan_card: "",
    aadhar_card: "",
    dsp_account: "",
    photo_url: "",
    blood_group: "",
    date_of_marriage: "",
    company_id: "",
    platoon_id: "",
    tradesman_id: ""
  });
  const [phoneError, setPhoneError] = useState("");

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

  const [currentCompanyId, setCurrentCompanyId] = useState<number | null>(null);

  const [educationFormData, setEducationFormData] = useState({
    civ: "",
    civilian_degree: "" as '10' | '12' | 'under graduate' | 'post graduate' | '',
    civilian_specialisation: "",
    mri: "" as 'pass' | 'yet to appear' | '',
    mr_ii: "" as 'pass' | 'yet to appear' | ''
  });

  const [sportsFormData, setSportsFormData] = useState({
    name_of_event: "",
    level: "",
    year_of_participation: "",
    achievements: ""
  });

  const { user, logout } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();

  // Helper to format date for date input (YYYY-MM-DD) - API may return RFC3339 or ISO string
  const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  // Helper function to check if user can edit
  const canEdit = () => {
    return user?.role !== 'user';
  };

  useEffect(() => {
    if (personnelId) {
      fetchPersonnelDetails();
      fetchRanks();
      fetchEducation();
      fetchSports();
      fetchCompanies();
      fetchMedicalCategories();
      fetchTradesmen();
    }
  }, [personnelId]);

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Pre-fill education form if data exists
  useEffect(() => {
    if (education.length > 0) {
      const eduData = education[0];
      setEducationFormData({
        civ: eduData.civ || "",
        civilian_degree: (eduData.civilian_degree || "") as '10' | '12' | 'under graduate' | 'post graduate' | '',
        civilian_specialisation: eduData.civilian_specialisation || "",
        mri: (eduData.mri || "") as 'pass' | 'yet to appear' | '',
        mr_ii: (eduData.mr_ii || "") as 'pass' | 'yet to appear' | ''
      });
    }
  }, [education]);

  // Pre-fill sports form if data exists
  useEffect(() => {
    if (sports.length > 0) {
      const sportData = sports[0];
      // Format date for date input (YYYY-MM-DD format)
      let formattedDate = "";
      if (sportData.year_of_participation) {
        const date = new Date(sportData.year_of_participation);
        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DD for date input
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      setSportsFormData({
        name_of_event: sportData.name_of_event || "",
        level: sportData.level || "",
        year_of_participation: formattedDate,
        achievements: sportData.achievements || ""
      });
    }
  }, [sports]);

  const fetchPersonnelDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await personnelService.getPersonnelById(parseInt(personnelId));
      
      if (response.status === 'success' && response.data) {
        const responseData = response.data as { personnel: Personnel };
        setPersonnel(responseData.personnel);
        
        // Populate form data
        const person = responseData.personnel;
        
        // Get the first active company assignment
        const activeCompany = person.companyPersonnel?.find((cp: any) => cp.status === 'Active');
        const companyId = activeCompany?.company_id || (person as any).platoon?.company_id || null;
        
        // Set currentCompanyId for tracking company changes
        if (companyId) {
          setCurrentCompanyId(typeof companyId === 'number' ? companyId : parseInt(companyId.toString()));
        }
        
        setFormData({
          name: person.name || "",
          rank: person.rank || "",
          unit: person.unit || "",
          status: person.status || "Active",
          email: person.email || "",
          phone: person.phone || "",
          dob: formatDateForInput(person.dob),
          doe: formatDateForInput(person.doe),
          service: person.service || "",
          honors_awards: person.honors_awards || "",
          med_cat: person.med_cat || "",
          recat_date: formatDateForInput(person.recat_date),
          medical_category_id: person.medical_category_id?.toString() || "",
          diagnose: person.diagnose || "",
          date_of_medical_board: formatDateForInput(person.date_of_medical_board),
          pc_bc: person.pc_bc || "",
          restriction_due_to_cat: person.restriction_due_to_cat || "",
          remarks: person.remarks || "",
          natural_category: person.natural_category || "",
          special_skill: person.special_skill || "",
          games_level: person.games_level || "",
          present_employment: person.present_employment || "",
          planned_employment: person.planned_employment || "",
          nok: person.nok || "",
          account_number: person.account_number || "",
          pan_card: person.pan_card || "",
          aadhar_card: person.aadhar_card || "",
          dsp_account: person.dsp_account || "",
          photo_url: person.photo_url || "",
          blood_group: person.blood_group || "",
          date_of_marriage: formatDateForInput(person.date_of_marriage),
          company_id: companyId ? companyId.toString() : "",
          platoon_id: (person as any).platoon?.id?.toString() || "",
          tradesman_id: (person as any).tradesman?.id?.toString() || "",
          att_service: person.att_service || "",
          att_specialization: person.att_specialization || ""
        });
        
        // Fetch platoons for the current company if company exists
        if (companyId) {
          fetchPlatoonsByCompany(typeof companyId === 'number' ? companyId : parseInt(companyId.toString()));
        }
      } else {
        setError("Failed to fetch personnel data");
      }
    } catch (err: any) {
      console.error('Error fetching personnel details:', err);
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
      console.error('Error fetching ranks:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/company?limit=100');
      if (response.status === 'success') {
        setCompanies(response.data.companies);
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchCurrentCompany = async () => {
    try {
      const response = await api.get(`/personnel/${personnelId}`);
      if (response.status === 'success' && response.data) {
        const personnelData = response.data as { personnel: any };
        // Get the first active company assignment
        const activeCompany = personnelData.personnel.companyPersonnel?.find((cp: any) => cp.status === 'Active');
        if (activeCompany) {
          setCurrentCompanyId(activeCompany.company_id);
          setFormData(prev => ({
            ...prev,
            company_id: activeCompany.company_id.toString()
          }));
          // Fetch platoons for the selected company
          fetchPlatoonsByCompany(activeCompany.company_id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching current company:', err);
    }
  };

  const fetchEducation = async () => {
    try {
      const response = await personnelEducationService.getPersonnelEducation(parseInt(personnelId));
      if (response.status === 'success' && response.data) {
        setEducation(response.data.education || []);
      }
    } catch (err: any) {
      console.error('Error fetching education:', err);
    }
  };

  const fetchSports = async () => {
    try {
      const response = await personnelSportsService.getPersonnelSports(parseInt(personnelId));
      if (response.status === 'success' && response.data) {
        setSports(response.data.sports || []);
      }
    } catch (err: any) {
      console.error('Error fetching sports:', err);
    }
  };

  const fetchMedicalCategories = async () => {
    try {
      const response = await medicalCategoryService.getAllMedicalCategoriesForDropdown();
      if (response.status === 'success' && response.data) {
        // Handle both { medicalCategories: [...] } and direct array response
        const categories = Array.isArray(response.data) ? response.data : (response.data?.medicalCategories || []);
        setMedicalCategories(categories);
      }
    } catch (err: any) {
      console.error('Error fetching medical categories:', err);
    }
  };

  const fetchPlatoonsByCompany = async (companyId: number) => {
    try {
      const response = await api.get(`/platoon/company/${companyId}`);
      if (response.status === 'success' && response.data) {
        setPlatoons(response.data.platoons || []);
      }
    } catch (err: any) {
      console.error('Error fetching platoons:', err);
      setPlatoons([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit()) {
      setError("You don't have permission to edit personnel");
      return;
    }

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      return;
    }

    if (formData.dob) {
      const dobError = validatePersonnelDob(formData.dob);
      if (dobError) {
        setError(dobError);
        return;
      }
    }

    try {
      setFormLoading(true);
      setError("");
      
      // Clean the form data - convert empty date strings to null
      const cleanedFormData = {
        ...formData,
        dob: formData.dob && formData.dob !== '' ? formData.dob : null,
        doe: formData.doe && formData.doe !== '' ? formData.doe : null,
        date_of_marriage: formData.date_of_marriage && formData.date_of_marriage !== '' ? formData.date_of_marriage : null,
        // Convert empty strings to null for optional fields
        unit: formData.unit || null,
        email: formData.email || null,
        phone: formData.phone || null,
        service: formData.service || null,
        honors_awards: formData.honors_awards || null,
        med_cat: formData.med_cat || null,
        recat_date: formData.recat_date && formData.recat_date !== '' ? formData.recat_date : null,
        medical_category_id: formData.medical_category_id && formData.medical_category_id !== '' ? parseInt(formData.medical_category_id) : null,
        diagnose: formData.diagnose || null,
        date_of_medical_board: formData.date_of_medical_board && formData.date_of_medical_board !== '' ? formData.date_of_medical_board : null,
        pc_bc: formData.pc_bc || null,
        restriction_due_to_cat: formData.restriction_due_to_cat || null,
        remarks: formData.remarks || null,
        natural_category: formData.natural_category || null,
        special_skill: formData.special_skill || null,
        games_level: formData.games_level || null,
        present_employment: formData.present_employment || null,
        planned_employment: formData.planned_employment || null,
        nok: formData.nok || null,
        account_number: formData.account_number || null,
        pan_card: formData.pan_card || null,
        aadhar_card: formData.aadhar_card || null,
        dsp_account: formData.dsp_account || null,
        photo_url: formData.photo_url || null,
        blood_group: formData.blood_group || null,
        platoon_id: formData.platoon_id && formData.platoon_id !== '' ? parseInt(formData.platoon_id) : null,
        tradesman_id: formData.tradesman_id && formData.tradesman_id !== '' ? parseInt(formData.tradesman_id) : null,
        att_service: formData.att_service || null,
        att_specialization: formData.att_specialization || null
      };
      
      // Remove company_id from personnel update data
      const { company_id, ...personnelupdated_ata } = cleanedFormData;
      
      const response = await personnelService.updatePersonnel(parseInt(personnelId), personnelupdated_ata);
      
      // Handle company assignment update if changed
      if (company_id && parseInt(company_id) !== currentCompanyId) {
        try {
          // Assign to new company - backend updates existing record if personnel already has active assignment
          const today = getServerDate().toISOString().split('T')[0];
          await api.post(`/company/${company_id}/personnel`, {
            personnel_id: parseInt(personnelId),
            role: 'Other',
            appointment_date: today
          });
        } catch (companyErr: any) {
          console.error('Error updating company assignment:', companyErr);
          // Don't fail the entire update if company assignment fails
          notifyError(companyErr?.message || 'Failed to update company assignment');
        }
      }
      
      if (response.status === 'success') {
        // If education data is provided, create/update education record
        if (educationFormData.civ || educationFormData.civilian_degree || educationFormData.civilian_specialisation || educationFormData.mri || educationFormData.mr_ii) {
          const educationData = {
            personnel_id: parseInt(personnelId),
            civ: educationFormData.civ || null,
            civilian_degree: educationFormData.civilian_degree || null,
            civilian_specialisation: educationFormData.civilian_specialisation || null,
            mri: educationFormData.mri || null,
            mr_ii: educationFormData.mr_ii || null
          };
          
          // If education record exists, update it; otherwise create new
          if (education.length > 0 && education[0].id) {
            await personnelEducationService.updateEducation(education[0].id, educationData);
          } else {
            await personnelEducationService.createEducation(educationData);
          }
        }

        // If sports data is provided, create/update sports record
        if (sportsFormData.name_of_event || sportsFormData.level || sportsFormData.year_of_participation || sportsFormData.achievements) {
          // Validate date - cannot be future date
          if (sportsFormData.year_of_participation) {
            const participationDate = new Date(sportsFormData.year_of_participation);
            const today = getServerDate();
            today.setHours(0, 0, 0, 0);
            
            if (participationDate > today) {
              setError("Year of participation cannot be a future date");
              notifyError("Year of participation cannot be a future date");
              setFormLoading(false);
              return;
            }
          }

          const sportsData = {
            personnel_id: parseInt(personnelId),
            name_of_event: sportsFormData.name_of_event || null,
            level: sportsFormData.level || null,
            year_of_participation: sportsFormData.year_of_participation || null,
            achievements: sportsFormData.achievements || null
          };

          // If sports record exists, update it; otherwise create new
          if (sports.length > 0 && sports[0].id) {
            await personnelSportsService.updateSports(sports[0].id, sportsData);
          } else {
            await personnelSportsService.createSports(sportsData);
          }
        }
        
        setSuccess("Personnel updated successfully");
        notifySuccess('Personnel updated successfully');
        // Redirect back to view page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/personnel/${personnelId}`);
        }, 1500);
      } else {
        setError(response.message || "Failed to update personnel");
        notifyError(response.message || 'Failed to update personnel');
      }
    } catch (err: any) {
      console.error('Error updating personnel:', err);
      setError(err.message || "Failed to update personnel");
      notifyError(err.message || 'Failed to update personnel');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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

  if (error && !personnel) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <Link href={back.href} className="text-blue-400 hover:text-blue-300">
              ← {back.label}
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!canEdit()) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">You don't have permission to edit personnel</p>
            <Link href={back.href} className="text-blue-400 hover:text-blue-300">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/personnel/${personnelId}`} className="text-blue-400 hover:text-blue-300 text-4xl transition-colors flex items-center gap-2">
                  ← 
                </Link>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Edit Personnel</h1>
                  <p className="text-gray-300 text-sm lg:text-base">Update personnel information</p>
                </div>
              </div>
              {/* <div className="flex items-center gap-4">
                <div className="text-white text-right">
                  <p className="text-sm text-gray-300">Welcome back,</p>
                  <p className="font-semibold">{user?.name || 'Administrator'}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-white hover:text-gray-300 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div> */}
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Edit Form */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information - 2 Column Layout */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter Full Name"
                    />
                  </div>

                  {fromParam !== "admins" && (
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Rank *</label>
                    <select 
                      required
                      value={formData.rank}
                      onChange={(e) => setFormData({...formData, rank: e.target.value})}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Rank</option>
                      {ranks.map((rank) => (
                        <option key={rank.id} value={rank.name}>
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
                  )}

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({...formData, phone: e.target.value});
                        validatePhone(e.target.value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${phoneError ? 'border-red-400' : 'border-white/20'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200`}
                      placeholder="Enter 10-digit Phone Number"
                      maxLength={10}
                    />
                    {phoneError && (
                      <p className="text-red-400 text-sm mt-1">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <DateOfBirthInput
                      value={formData.dob}
                      onChange={(value) => setFormData({...formData, dob: value})}
                      label="Date of Birth"
                      className="px-4 py-3 rounded-lg bg-white/10 border-white/20 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <DateOfEntryInput
                      label="Date of Entry"
                      value={formData.doe}
                      onChange={(value) => setFormData({...formData, doe: value})}
                      className="px-4 py-3 rounded-lg bg-white/10 border-white/20 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Blood Group</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select Blood Group</option>
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
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Date of Marriage</label>
                    <input
                      type="date"
                      value={formData.date_of_marriage}
                      onChange={(e) => setFormData({...formData, date_of_marriage: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  {fromParam !== "admins" && (
                  <>
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Company</label>
                    <select 
                      value={formData.company_id}
                      onChange={(e) => {
                        const newCompanyId = e.target.value;
                        const selectedCompany = companies.find((c) => c.id === parseInt(newCompanyId || "0"));
                        const isAtt = selectedCompany?.company_name?.toLowerCase() === "att";
                        setFormData({
                          ...formData,
                          company_id: newCompanyId,
                          platoon_id: "",
                          ...(!isAtt && { att_service: "", att_specialization: "" }),
                        });
                        if (newCompanyId) {
                          fetchPlatoonsByCompany(parseInt(newCompanyId));
                        } else {
                          setPlatoons([]);
                        }
                      }}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
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

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Platoon</label>
                    <select
                      value={formData.platoon_id}
                      onChange={(e) => setFormData({...formData, platoon_id: e.target.value})}
                      disabled={!formData.company_id}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Platoon</option>
                      {platoons.map((platoon) => (
                        <option key={platoon.id} value={platoon.id}>
                          {platoon.platoon_name}
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

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Tradesman</label>
                    <select
                      value={formData.tradesman_id}
                      onChange={(e) => setFormData({...formData, tradesman_id: e.target.value})}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Tradesman</option>
                      {tradesmen.map((tradesman) => (
                        <option key={tradesman.id} value={tradesman.id}>
                          {tradesman.trade_name}
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
                  </>
                  )}

                  {/* Att Company - Additional fields when company is "Att" */}
                  {fromParam !== "admins" && (() => {
                    const selectedCompany = companies.find((c) => c.id === parseInt(formData.company_id || "0"));
                    const isAttCompany = selectedCompany?.company_name?.toLowerCase() === "att";
                    if (!isAttCompany) return null;
                    const specOptions = formData.att_service ? ATT_SPECIALIZATION_BY_SERVICE[formData.att_service] || [] : [];
                    return (
                      <>
                    

                    
                        <div className="relative">
                          <label className="block text-gray-200 mb-2 text-sm font-medium">Services</label>
                          <select
                            value={formData.att_service}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                att_service: e.target.value,
                                att_specialization: "",
                              })
                            }
                            className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          >
                            <option value="">Select Service</option>
                            {ATT_SERVICES.map((s) => (
                              <option key={s} value={s}>
                                {s}
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
                        {formData.att_service && specOptions.length > 0 && (
                          <div className="relative">
                            <label className="block text-gray-200 mb-2 text-sm font-medium">
                              {formData.att_service} Specialization
                            </label>
                            <select
                              value={formData.att_specialization}
                              onChange={(e) => setFormData({ ...formData, att_specialization: e.target.value })}
                              className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                              <option value="">Select {formData.att_service} Option</option>
                              {specOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
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
                        )}
                      
                      </>

                    );
                  })()}
                </div>
              </div>

              {/* Identification & Banking */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Identification & NOK</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">NOK</label>
                    <input
                      type="text"
                      value={formData.nok}
                      onChange={(e) => setFormData({ ...formData, nok: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter NOK name or relationship"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Account Number</label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter bank account number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">PAN Card</label>
                    <input
                      type="text"
                      value={formData.pan_card}
                      onChange={(e) => setFormData({ ...formData, pan_card: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Aadhar Card</label>
                    <input
                      type="text"
                      value={formData.aadhar_card}
                      onChange={(e) => setFormData({ ...formData, aadhar_card: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter Aadhar number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">DSP Account</label>
                    <input
                      type="text"
                      value={formData.dsp_account}
                      onChange={(e) => setFormData({ ...formData, dsp_account: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter DSP account details"
                    />
                  </div>
                </div>
              </div>

              {/* Education Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Education Information</h3>
                
                {/* Civilian Education */}
                <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
                  <h4 className="text-md font-semibold text-white">Civilian Education</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* <div>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">CIV</label>
                      <input
                        type="text"
                        value={educationFormData.civ}
                        onChange={(e) => setEducationFormData({...educationFormData, civ: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Enter civilian education information"
                      />
                    </div> */}

                    <div className="relative">
                      <label className="block text-gray-200 mb-2 text-sm font-medium">Degrees / School</label>
                      <select 
                        value={educationFormData.civilian_degree}
                        onChange={(e) => setEducationFormData({...educationFormData, civilian_degree: e.target.value as '10' | '12' | 'under graduate' | 'post graduate' | ''})}
                        className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Degree</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="under graduate">Under Graduate</option>
                        <option value="post graduate">Post Graduate</option>
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

                    <div className="">
                      <label className="block text-gray-200 mb-2 text-sm font-medium">Specialisation</label>
                      <input
                        type="text"
                        value={educationFormData.civilian_specialisation}
                        onChange={(e) => setEducationFormData({...educationFormData, civilian_specialisation: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Enter specialisation"
                      />
                    </div>
                  </div>
                </div>

                {/* Military Education */}
                <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                  <h4 className="text-md font-semibold text-white">Military Education</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-gray-200 mb-2 text-sm font-medium">MR I</label>
                      <select 
                        value={educationFormData.mri}
                        onChange={(e) => setEducationFormData({...educationFormData, mri: e.target.value as 'pass' | 'yet to appear' | ''})}
                        className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select MR I Status</option>
                        <option value="pass">Pass</option>
                        <option value="yet to appear">Yet to Appear</option>
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

                    <div className="relative">
                      <label className="block text-gray-200 mb-2 text-sm font-medium">MR II</label>
                      <select 
                        value={educationFormData.mr_ii}
                        onChange={(e) => setEducationFormData({...educationFormData, mr_ii: e.target.value as 'pass' | 'yet to appear' | ''})}
                        className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select MR II Status</option>
                        <option value="pass">Pass</option>
                        <option value="yet to appear">Yet to Appear</option>
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
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Employment Information</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Present Employment</label>
                    <input
                      type="text"
                      value={formData.present_employment}
                      onChange={(e) => setFormData({...formData, present_employment: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Current position/role"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Planned Employment</label>
                    <input
                      type="text"
                      value={formData.planned_employment}
                      onChange={(e) => setFormData({...formData, planned_employment: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Future position/role"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">Honors & Awards</label>
                  <textarea
                    value={formData.honors_awards}
                    onChange={(e) => setFormData({...formData, honors_awards: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter honors, awards, and recognitions"
                  />
                </div>
              </div>

              {/* Medical Category Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Medical Category</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Medical Category</label>
                    <select
                      value={formData.medical_category_id}
                      onChange={(e) => {
                        const newMedCatId = e.target.value;
                        const updates: typeof formData = { ...formData, medical_category_id: newMedCatId };
                        if (newMedCatId && !formData.natural_category) {
                          updates.natural_category = 'permanent';
                        }
                        setFormData(updates);
                      }}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Medical Category</option>
                      {medicalCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
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

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Recat Date</label>
                    <input
                      type="date"
                      value={formData.recat_date}
                      onChange={(e) => setFormData({...formData, recat_date: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                   <div className="">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Diagnose</label>
                    <textarea
                      value={formData.diagnose}
                      onChange={(e) => setFormData({...formData, diagnose: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter diagnosis"
                    />
                  </div>
                   <div className="">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Restriction due to Cat</label>
                    <textarea
                      value={formData.restriction_due_to_cat}
                      onChange={(e) => setFormData({...formData, restriction_due_to_cat: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter restriction due to category"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Date of Medical Board</label>
                    <input
                      type="date"
                      value={formData.date_of_medical_board}
                      onChange={(e) => setFormData({...formData, date_of_medical_board: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">PC / BC</label>
                    <select
                      value={formData.pc_bc}
                      onChange={(e) => setFormData({...formData, pc_bc: e.target.value})}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select PC / BC</option>
                      <option value="PC">PC (Physical Casualty)</option>
                      <option value="BC">BC (Battle Casualty)</option>
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
                  <div className="relative">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Nature of Category</label>
                    <select
                      value={formData.natural_category}
                      onChange={(e) => setFormData({...formData, natural_category: e.target.value})}
                      className="w-full appearance-none px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Nature of Category</option>
                      <option value="temporary">Temporary</option>
                      <option value="permanent">Permanent</option>
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
                   <div className="">
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter remarks"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">Professional Information</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Special Skills</label>
                    <textarea
                      value={formData.special_skill}
                      onChange={(e) => setFormData({...formData, special_skill: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter special skills and qualifications"
                    />
                  </div>

                  {/* <div>
                    <label className="block text-gray-200 mb-2 text-sm font-medium">Games/Sports Level</label>
                    <input
                      type="text"
                      value={formData.games_level}
                      onChange={(e) => setFormData({...formData, games_level: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="e.g., National Level, State Level"
                    />
                  </div> */}
                </div>

                {/* Sports Section */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-md font-semibold text-white mb-4">Sports</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">Name of Event</label>
                      <input
                        type="text"
                        value={sportsFormData.name_of_event}
                        onChange={(e) => setSportsFormData({...sportsFormData, name_of_event: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Enter name of sports event"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">Level</label>
                      <input
                        type="text"
                        value={sportsFormData.level}
                        onChange={(e) => setSportsFormData({...sportsFormData, level: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="e.g., National, State, District"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">Year of Participation</label>
                      <input
                        type="date"
                        value={sportsFormData.year_of_participation}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const today = getServerDate().toISOString().split('T')[0];
                          
                          if (selectedDate > today) {
                            setError("Year of participation cannot be a future date");
                            notifyError("Year of participation cannot be a future date");
                            return;
                          }
                          
                          setSportsFormData({...sportsFormData, year_of_participation: selectedDate});
                          setError(null);
                        }}
                        max={getServerDate().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-200 mb-2 text-sm font-medium">Achievements</label>
                      <textarea
                        value={sportsFormData.achievements}
                        onChange={(e) => setSportsFormData({...sportsFormData, achievements: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Enter achievements in the sports event"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                <Link
                 href={`/dashboard/personnel/${personnelId}`}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {formLoading ? 'Updating...' : 'Update Personnel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
