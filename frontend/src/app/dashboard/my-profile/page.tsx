"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api, personnelService, personnelSportsService } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { config } from '@/config/env';
import { formatDate, formatDateShort } from '@/lib/utils';
import { getServerDate } from '@/lib/serverTime';
import { X, Download, Trophy, Lightbulb } from 'lucide-react';

interface Profile {
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
  status: string;
  rank_id?: number;
  rankInfo?: {
    id: number;
    name: string;
    category: string;
    hierarchy_order: number;
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
  eres?: ERE[];
  fieldServices?: FieldService[];
  foreignPostings?: ForeignPosting[];
  punishmentOffences?: PunishmentOffence[];
  familyProblems?: FamilyProblem[];
  education?: Education[];
  medicalCategory?: {
    id: number;
    name: string;
    is_active: boolean;
  };
}

interface CurrentCompany {
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
}

interface Course {
  id: number;
  course_name: string;
  course_code: string;
  duration?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  completion_date?: string | null;
  grade: string | null;
  status: 'obtained' | 'planned';
  remarks: string | null;
}

interface ERE {
  id: number;
  unit: string;
  from_date: string;
  to_date: string;
  planned_ere?: string;
  remarks?: string;
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
  date_of_offence: string;
  punishment_awarded?: string;
  remarks?: string;
  endorsed: boolean;
  section_aa?: string;
  type_of_entry?: string;
}

interface FamilyProblem {
  id: number;
  problem: string;
  remarks?: string;
}

interface Education {
  id: number;
  civ?: string;
  civilian_degree?: string;
  civilian_specialisation?: string;
  mri?: string;
  mr_ii?: string;
}

interface Proficiency {
  id: number;
  profile_id: number;
  proficiency_type: 'Drone' | 'Others';
  drone_equipment_id?: number;
  proficiency_level?: string;
  flying_hours?: number;
  trg_cadre?: string;
  level: string;
  duration?: string;
  location?: string;
  droneEquipment?: {
    id: number;
    equipment_name: string;
  };
}

interface Sport {
  id: number;
  personnel_id: number;
  name_of_event?: string;
  level?: string;
  year_of_participation?: string;
  achievements?: string;
}

interface Supervisor {
  id: number;
  army_no: string;
  name: string;
  rank: string;
}

export default function MyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentCompany, setCurrentCompany] = useState<CurrentCompany | null>(null);
  const [dynamicStatus, setDynamicStatus] = useState<string>('Available');
  const [courses, setCourses] = useState<Course[]>([]);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [familyDetails, setFamilyDetails] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [othersData, setOthersData] = useState<any>({});
  const [proficiencies, setProficiencies] = useState<Proficiency[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [docViewerOpen, setDocViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const personnelId = user?.id || null;


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPhotoDropdown) {
        const target = event.target as Element;
        if (!target.closest('.photo-dropdown-container')) {
          setShowPhotoDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoDropdown]);

  const refreshProfile = async () => {
    const profileRes = await api.get('/personnel/my-profile');

    if (profileRes.status === 'success' && profileRes.data) {
      const personnelData = profileRes.data.personnel;
      setProfile(personnelData);
      const activeCompany = personnelData?.companyPersonnel?.find((cp: any) => cp.status === 'Active');
      setCurrentCompany(activeCompany || null);
      setDynamicStatus(profileRes.data.dynamicStatus || 'Available');
      return;
    }

    throw new Error(profileRes.message || 'Failed to load profile');
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get profile data and update state
      const profileRes = await api.get('/personnel/my-profile');
      if (profileRes.status === 'success' && profileRes.data) {
        const personnelData = profileRes.data.personnel;
        setProfile(personnelData);
        const activeCompany = personnelData?.companyPersonnel?.find((cp: any) => cp.status === 'Active');
        setCurrentCompany(activeCompany || null);
        setDynamicStatus(profileRes.data.dynamicStatus || 'Available');

        // Now use the personnel data directly for subsequent API calls
        try {
          const coursesRes = await api.get('/user/courses');
          if (coursesRes.status === 'success' && coursesRes.data) {
            setCourses(coursesRes.data.courses || []);
          }
        } catch (err) {
          console.log('Courses not found (optional)');
        }

        try {
          const supervisorRes = await api.get('/user/supervisor');
          if (supervisorRes.status === 'success' && supervisorRes.data?.supervisor) {
            setSupervisor(supervisorRes.data.supervisor);
          }
        } catch (err) {
          console.log('Supervisor not found (optional)');
        }

        try {
          const familyDetailsRes = await personnelService.getPersonnelFamilyDetails(personnelData.id);
          if (familyDetailsRes.status === 'success' && familyDetailsRes.data) {
            setFamilyDetails(familyDetailsRes.data.familyDetails || []);
          }
        } catch (err) {
          console.log('Family details not found (optional)');
        }

        try {
          const documentsRes:any = await personnelService.getPersonnelDocuments(personnelData.army_no);
          console.log("documentsRes",documentsRes.data);
          
          if (documentsRes.success) {
            setDocuments(documentsRes.data || []);
          }
        } catch (err) {
          console.log('Documents not found (optional)');
        }

        try {
          const othersRes = await personnelService.getPersonnelOthersData(personnelData.id);
          if (othersRes.status === 'success' && othersRes.data) {
            setOthersData(othersRes.data || {});
          }
        } catch (err) {
          console.log('Others data not found (optional)');
        }

        try {
          const proficienciesRes = await personnelService.getPersonnelProficiencies(personnelData.id);
          if (proficienciesRes.status === 'success' && proficienciesRes.data) {
            const profData = proficienciesRes.data as { proficiencies?: Proficiency[] };
            setProficiencies(profData.proficiencies || []);
          }
        } catch (err) {
          console.log('Proficiencies not found (optional)');
        }

        try {
          const sportsRes = await personnelSportsService.getPersonnelSports(personnelData.id);
          if (sportsRes.status === 'success' && sportsRes.data) {
            const sportsData = sportsRes.data as { sports?: Sport[] };
            setSports(sportsData.sports || []);
          }
        } catch (err) {
          console.log('Sports not found (optional)');
        }
      } else {
        throw new Error(profileRes.message || 'Failed to load profile');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhoto = () => {
    setPhotoError('');
    setPhotoSuccess('');
    fileInputRef.current?.click();
  };

  const handlePhotoInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setShowPhotoDropdown(false);

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File size must be less than 5MB');
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    await uploadPhoto(file, previewUrl);
    event.target.value = '';
  };

  const uploadPhoto = async (file: File, previewUrl?: string) => {
    if (!profile?.id) {
      setPhotoError('Profile not loaded');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPhotoPreview(null);
      }
      return;
    }

    setPhotoLoading(true);
    setPhotoError('');
    setPhotoSuccess('');
    try {
      const response = await personnelService.uploadPersonnelPhoto(profile.id, file);
      if (response.status === 'success') {
        const newPhotoUrl = (response.data && response.data.photo_url) || null;
        setProfile(prev => prev ? { ...prev, photo_url: newPhotoUrl } : prev);
        setPhotoSuccess('Photo updated successfully');
      } else {
        setPhotoError(response.message || 'Failed to upload photo');
      }
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPhotoPreview(null);
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!profile?.id) {
      setPhotoError('Profile not loaded');
      return;
    }
    setPhotoLoading(true);
    setPhotoError('');
    setPhotoSuccess('');
    try {
      const response = await personnelService.deletePersonnelPhoto(profile.id);
      if (response.status === 'success') {
        setProfile(prev => prev ? { ...prev, photo_url: null } : prev);
        setPhotoSuccess('Photo deleted successfully');
      } else {
        setPhotoError(response.message || 'Failed to delete photo');
      }
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to delete photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleViewPhoto = () => {
    if (profile?.photo_url) {
      window.open(`${config.BACKEND_URL}${profile.photo_url}`, '_blank');
    }
  };

  const viewDocument = (document: any) => {
    setSelectedDocument(document);
    setDocViewerOpen(true);
  };

  const getPhotoSource = () => {
    if (photoPreview) return photoPreview;
    if (profile?.photo_url) {
      return `${config.BACKEND_URL}${profile.photo_url}`;
    }
    return null;
  };

  const calculateAge = (dob?: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = getServerDate();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateService = (doe?: string): string => {
    if (!doe) return 'N/A';
    const entryDate = new Date(doe);
    const today = getServerDate();
    const years = today.getFullYear() - entryDate.getFullYear();
    const months = today.getMonth() - entryDate.getMonth();
    
    let totalYears = years;
    let totalMonths = months;
    
    if (months < 0) {
      totalYears--;
      totalMonths = 12 + months;
    }
    
    return `${totalYears} years, ${totalMonths} months`;
  };

  const getCourseEndDate = (course: Course) => course.end_date || course.completion_date || null;

  const getCourseDurationLabel = (course: Course) => {
    if (course.duration && course.duration.trim()) {
      return course.duration;
    }

    if (!course.start_date || !getCourseEndDate(course)) {
      return '--';
    }

    const start = new Date(course.start_date);
    const end = new Date(getCourseEndDate(course) as string);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '--';
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      return '--';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays <= 0) {
      return '--';
    }

    if (diffDays >= 30 && diffDays % 30 === 0) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    }

    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const obtainedCourses = courses.filter(c => c.status === 'obtained');
  const plannedCourses = courses.filter(c => c.status === 'planned');
  const endorsedOffences = profile?.punishmentOffences?.filter(p => p.endorsed) || [];
  const notEndorsedOffences = profile?.punishmentOffences?.filter(p => !p.endorsed) || [];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="ml-4 text-white">Loading profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="mx-auto p-4 lg:p-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-8 text-center">
            <p className="text-gray-400">Profile not found.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-300 text-sm lg:text-base">Complete view of your personnel records</p>
        </div>

        {/* View-Only Notice */}
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
          <p className="text-sm">📖 This is a read-only view of your complete personnel records. Contact your administrator to update any information.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Personal Information */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5 shadow-lg mb-5">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center md:items-start">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handlePhotoInputChange}
              />
              <div className="relative group photo-dropdown-container">
                <div
                  className={`w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg relative overflow-hidden ${photoLoading ? 'cursor-progress' : 'cursor-pointer'}`}
                  onClick={() => setShowPhotoDropdown((prev) => !prev)}
                >
                  {getPhotoSource() ? (
                    <img
                      src={getPhotoSource() as string}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover"
                    />
                  ) : (
                    (profile.name || '')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'
                  )}
                  <div
                    className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                      photoLoading ? 'opacity-100' : ''
                    }`}
                  >
                    <span className="text-white text-xl">{photoLoading ? '⏳' : '⚙️'}</span>
                  </div>
                </div>
                {showPhotoDropdown && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setShowPhotoDropdown(false)} />
                    <div className="absolute z-[9999] top-full mt-2 left-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                      <div className="py-1">
                        {profile.photo_url && (
                          <button
                            onClick={() => { handleViewPhoto(); setShowPhotoDropdown(false); }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150 cursor-pointer"
                          >
                            <span>👁️</span> View Photo
                          </button>
                        )}
                        <button
                          onClick={() => { handleSelectPhoto(); setShowPhotoDropdown(false); }}
                          disabled={photoLoading}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                        >
                          <span>📷</span> {profile.photo_url ? 'Upload New' : 'Upload Photo'}
                        </button>
                        {profile.photo_url && (
                          <button
                            onClick={() => { handleDeletePhoto(); setShowPhotoDropdown(false); }}
                            disabled={photoLoading}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                          >
                            <span>🗑️</span> Delete Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col items-center gap-1 mt-2 w-full">
                {photoError && <p className="text-rose-300 text-xs">{photoError}</p>}
                {photoSuccess && <p className="text-emerald-300 text-xs">{photoSuccess}</p>}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
              <p className="text-blue-400 font-semibold mb-2">{profile.rank}</p>
              <p className="text-gray-400 text-sm font-mono mb-3">{profile.army_no}</p>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                dynamicStatus === 'Available' ? 'bg-green-500/20 text-green-400' :
                dynamicStatus === 'On Leave' ? 'bg-yellow-500/20 text-yellow-400' :
                dynamicStatus === 'On ERE' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {dynamicStatus}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500">DOB</p>
                  <p className="text-white text-sm">{formatDate(profile.dob)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">DOE</p>
                  <p className="text-white text-sm">{formatDate(profile.doe)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="text-white text-sm">{calculateService(profile.doe)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-white text-sm">{profile.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Med Cat</p>
                  <p className="text-white text-sm">{profile.medicalCategory?.name || profile.med_cat || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-white text-sm truncate" title={currentCompany?.company?.company_name}>{currentCompany?.company?.company_name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 shadow-lg">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'courses'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Courses
              </button>
              <button
                onClick={() => setActiveTab('ere')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'ere'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ERE
              </button>
              <button
                onClick={() => setActiveTab('field-service')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'field-service'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Field Service
              </button>
              <button
                onClick={() => setActiveTab('foreign-posting')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'foreign-posting'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Foreign Posting
              </button>
              <button
                onClick={() => setActiveTab('punishment')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'punishment'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Punishment/Offence
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'family'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Family Problems
              </button>
              <button
                onClick={() => setActiveTab('proficiency')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'proficiency'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                Proficiency
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'education'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
                Education
              </button>
              <button
                onClick={() => setActiveTab('sports')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'sports'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Sports
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'docs'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Docs
              </button>
              <button
                onClick={() => setActiveTab('others')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'others'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Others
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Date of Birth</label>
                        <p className="text-white text-base mt-1">{formatDate(profile.dob)} ({calculateAge(profile.dob)} years)</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Date of Entry</label>
                        <p className="text-white text-base mt-1">{formatDate(profile.doe)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Service Duration</label>
                        <p className="text-white text-base mt-1">{calculateService(profile.doe)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Medical Category</label>
                        <p className="text-white text-base mt-1">{profile.medicalCategory?.name || profile.med_cat || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Recat Date</label>
                        <p className="text-white text-base mt-1">{profile.recat_date ? formatDate(profile.recat_date) : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Phone</label>
                        <p className="text-white text-base mt-1">{profile.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Games Level</label>
                        <p className="text-white text-base mt-1">{profile.games_level || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Medical Category Details */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <label className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                        {/* <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg> */}
                        Medical Category Details
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Nature of Category</p>
                          <p className="text-white text-sm">{profile.natural_category || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PC / BC</p>
                          <p className="text-white text-sm">{profile.pc_bc || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date of Medical Board</p>
                          <p className="text-white text-sm">{profile.date_of_medical_board ? formatDate(profile.date_of_medical_board) : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Diagnosis</p>
                          <p className="text-white text-sm">{profile.diagnose || 'N/A'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-500">Restriction Due to Category</p>
                          <p className="text-white text-sm">{profile.restriction_due_to_cat || 'N/A'}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-sm text-gray-500">Remarks</p>
                          <p className="text-white text-sm">{profile.remarks || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Professional & Employment */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Professional & Employment</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Special Skills</label>
                        <p className="text-white text-base mt-1">{profile.special_skill || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Honors & Awards</label>
                        <p className="text-white text-base mt-1">{profile.honors_awards || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Present Employment</label>
                        <p className="text-white text-base mt-1">{profile.present_employment || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Planned Employment</label>
                        <p className="text-white text-base mt-1">{profile.planned_employment || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Identification & NOK */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <label className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                        {/* <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c.828 0 1.5-.895 1.5-2s-.672-2-1.5-2-1.5.895-1.5 2 .672 2 1.5 2zm0 0v1m0 4h.01M20 12c0 4.418-3.582 9-8 9s-8-4.582-8-9 3.582-9 8-9 8 4.582 8 9z" />
                        </svg> */}
                        Identification & NOK
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">NOK</p>
                          <p className="text-white text-sm">{profile.nok || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account Number</p>
                          <p className="text-white text-sm">{profile.account_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PAN Card</p>
                          <p className="text-white text-sm">{profile.pan_card || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aadhar Card</p>
                          <p className="text-white text-sm">{profile.aadhar_card || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">DSP Account</p>
                          <p className="text-white text-sm">{profile.dsp_account || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Blood Group</p>
                          <p className="text-white text-sm">{profile.blood_group || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date of Marriage</p>
                          <p className="text-white text-sm">{profile.date_of_marriage ? formatDate(profile.date_of_marriage) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {supervisor && (
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Supervisor
                        </label>
                        <p className="text-white text-base font-medium">{supervisor.name}</p>
                        <p className="text-blue-400 text-sm">{supervisor.rank} - {supervisor.army_no}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                {/* Obtained Courses */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className=" border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Courses Obtained ({obtainedCourses.length})</h3>
                  </div>
                  {obtainedCourses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No obtained courses found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Course Code</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Course Name</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Start Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">End Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Duration</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Grade</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {obtainedCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white font-mono text-sm">{course.course_code}</td>
                              <td className="px-6 py-4 text-white text-sm">{course.course_name}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(course.start_date || undefined)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(getCourseEndDate(course) || undefined)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{getCourseDurationLabel(course)}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                  {course.grade || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{course.remarks || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Planned Courses */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Courses Planned ({plannedCourses.length})</h3>
                  </div>
                  {plannedCourses.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No planned courses found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Course Code</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Course Name</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Start Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">End Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Duration</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {plannedCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white font-mono text-sm">{course.course_code}</td>
                              <td className="px-6 py-4 text-white text-sm">{course.course_name}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(course.start_date || undefined)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(getCourseEndDate(course) || undefined)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{getCourseDurationLabel(course)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{course.remarks || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ERE Tab */}
            {activeTab === 'ere' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className=" border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Employment Readiness Evaluation (ERE) ({profile.eres?.length || 0})</h3>
                </div>
                {!profile.eres || profile.eres.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No ERE records found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Unit</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">From Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">To Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Planned ERE</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {profile.eres.map((ere) => (
                          <tr key={ere.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-white text-sm">{ere.unit}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(ere.from_date)}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(ere.to_date)}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{ere.planned_ere || '--'}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{ere.remarks || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Field Service Tab */}
            {activeTab === 'field-service' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className=" border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Field Service ({profile.fieldServices?.length || 0})</h3>
                </div>
                {!profile.fieldServices || profile.fieldServices.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No field service records found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Location</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">From Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">To Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {profile.fieldServices.map((service) => (
                          <tr key={service.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-white text-sm">{service.location}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(service.from_date)}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(service.to_date)}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{service.remarks || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Foreign Posting Tab */}
            {activeTab === 'foreign-posting' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className=" border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Foreign Posting ({profile.foreignPostings?.length || 0})</h3>
                </div>
                {!profile.foreignPostings || profile.foreignPostings.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No foreign posting records found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Unit</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">From Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">To Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {profile.foreignPostings.map((posting) => (
                          <tr key={posting.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-white text-sm">{posting.unit}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(posting.from_date)}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(posting.to_date)}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{posting.remarks || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Punishment/Offence Tab */}
            {activeTab === 'punishment' && (
              <div className="space-y-6">
                {/* Endorsed Offences */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className=" border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Endorsed Offences ({endorsedOffences.length})</h3>
                  </div>
                  {endorsedOffences.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No endorsed offences found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Offence</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Punishment Awarded</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {endorsedOffences.map((offence) => (
                            <tr key={offence.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white text-sm">{offence.offence}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(offence.date_of_offence)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{offence.punishment_awarded || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{offence.remarks || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Not Endorsed Offences */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className=" border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Not Endorsed Offences ({notEndorsedOffences.length})</h3>
                  </div>
                  {notEndorsedOffences.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No not-endorsed offences found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Offence</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Punishment Awarded</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {notEndorsedOffences.map((offence) => (
                            <tr key={offence.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white text-sm">{offence.offence}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(offence.date_of_offence)}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{offence.punishment_awarded || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{offence.remarks || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Family Problems Tab */}
            {activeTab === 'family' && (
              <div className="space-y-6">
                {/* Family Details Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Family Details</h3>
                  </div>

                  {familyDetails.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      No data
                    </div>
                  ) : (
                    <div className="p-6">
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
                    </div>
                  )}
                </div>

                {/* Family Problems Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Family Problems ({profile.familyProblems?.length || 0})</h3>
                  </div>
                  {!profile.familyProblems || profile.familyProblems.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No family problems recorded</div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {profile.familyProblems.map((problem, index) => (
                        <div key={problem.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                              <span className="text-pink-400 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium mb-2 break-words line-clamp-3" title={problem.problem || undefined}>{problem.problem}</h4>
                              {problem.remarks && (
                                <p className="text-gray-400 text-sm break-words line-clamp-3" title={problem.remarks}>{problem.remarks}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proficiency Tab */}
            {activeTab === 'proficiency' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Proficiency Details ({proficiencies.length})</h3>
                </div>
                {proficiencies.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No proficiency records found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">S.No</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Type</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Details</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Level</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Duration</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {proficiencies.map((proficiency, index) => (
                          <tr key={proficiency.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-white text-sm">{index + 1}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{proficiency.proficiency_type}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">
                              {proficiency.proficiency_type === 'Drone' ? (
                                <div>
                                  <div><strong>Equipment:</strong> {proficiency.droneEquipment?.equipment_name || '-'}</div>
                                  {proficiency.proficiency_level && <div><strong>Level:</strong> {proficiency.proficiency_level}</div>}
                                  {proficiency.flying_hours && <div><strong>Flying Hrs:</strong> {proficiency.flying_hours}</div>}
                                </div>
                              ) : (
                                <div><strong>Trg/Cadre:</strong> {proficiency.trg_cadre || '-'}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{proficiency.level ? proficiency.level.charAt(0).toUpperCase() + proficiency.level.slice(1) : '--'}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{proficiency.duration || '--'}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{proficiency.location || '--'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Education Qualifications</h3>
                </div>
                {(() => {
                  const educationList: Education[] = Array.isArray(profile.education)
                    ? profile.education
                    : profile.education && typeof profile.education === 'object' && 'id' in profile.education
                      ? [profile.education as Education]
                      : [];
                  if (educationList.length === 0) {
                    return <div className="p-8 text-center text-gray-400">No education records found</div>;
                  }
                  const edu = educationList[0];
                  return (
                    <div className="p-6 space-y-6">
                      {/* Civilian Education */}
                      <div className="space-y-4 pl-4 border-l-2 border-blue-500/30">
                        <h4 className="text-md font-semibold text-white">Civilian Education</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-400">Degree / School</label>
                            <p className="text-white mt-1 capitalize">{edu.civilian_degree || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-400">Specialisation</label>
                            <p className="text-white mt-1">{edu.civilian_specialisation || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      {/* Military Education */}
                      <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                        <h4 className="text-md font-semibold text-white">Military Education</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-400">MR I</label>
                            <p className="text-white mt-1 capitalize">{edu.mri || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-400">MR II</label>
                            <p className="text-white mt-1 capitalize">{edu.mr_ii || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Sports Tab */}
            {activeTab === 'sports' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Sports Details ({sports.length})</h3>
                </div>
                {sports.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No sports records found</div>
                ) : (
                  <div className="p-6 space-y-4">
                    {sports.map((sport) => (
                      <div key={sport.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-400">Name of Event</label>
                            <p className="text-white mt-1">{sport.name_of_event || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-400">Level</label>
                            <p className="text-white mt-1">{sport.level || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-400">Year of Participation</label>
                            <p className="text-white mt-1">{sport.year_of_participation ? formatDateShort(sport.year_of_participation) : 'N/A'}</p>
                          </div>
                          {sport.achievements && (
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-gray-400">Achievements</label>
                              <p className="text-white mt-1">{sport.achievements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Docs Tab */}
            {activeTab === 'docs' && (
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                <div className="border-b border-white/10 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Documents ({documents.length})</h3>
                </div>
                {!documents || documents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No documents found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Document Type</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">File Name</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">File Size</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Uploaded Date</th>
                          <th className="px-6 py-3 text-left text-white font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-white/5">
                            <td className="px-6 py-4 text-white text-sm capitalize">{doc.document_type}</td>
                            <td className="px-6 py-4 text-white text-sm">{doc.original_name}</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{(doc.file_size / 1024).toFixed(2)} KB</td>
                            <td className="px-6 py-4 text-gray-300 text-sm">{formatDateShort(doc.uploaded_at)}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => viewDocument(doc)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                                title="View Document"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Others Tab */}
            {activeTab === 'others' && (
              <div className="space-y-6">
                {/* Out Station Employment - First */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Out Station Employment ({othersData.outStationEmployments?.length || 0})</h3>
                  </div>
                  {!othersData.outStationEmployments || othersData.outStationEmployments.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No out station employment records found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">S.No</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Formation</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Location</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Employment</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">From Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">To Date</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Attachment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {othersData.outStationEmployments.map((emp: any, index: number) => (
                            <tr key={emp.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white text-sm">{index + 1}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.formation || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.location || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.employment || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.start_date ? formatDate(emp.start_date) : '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.end_date ? formatDate(emp.end_date) : '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.attachment || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Hospitalisation / Admission Details */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Hospitalisation / Admission Details ({othersData.hospitalisations?.length || 0})</h3>
                  </div>
                  {!othersData.hospitalisations || othersData.hospitalisations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No hospitalisation records found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">S.No</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Date of Admission</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Date of Discharge</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Diagnosis</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Medical Category</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {othersData.hospitalisations.map((h: any, index: number) => (
                            <tr key={h.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white text-sm">{index + 1}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{h.date_of_admission ? formatDate(h.date_of_admission) : '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{h.date_of_discharge ? formatDate(h.date_of_discharge) : '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{h.diagnosis || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{h.medical_category || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{h.remarks || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Special Employment Suitability */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Special Employment Suitability ({othersData.specialEmployment?.length || 0})</h3>
                  </div>
                  {!othersData.specialEmployment || othersData.specialEmployment.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No special employment suitability records found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">S.No</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">SUITABLE FOR SPECIAL EMP (a)</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">SUITABLE FOR SPECIAL EMP (b)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {othersData.specialEmployment.map((emp:any,index:number) => (
                            <tr key={emp.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white text-sm">{index+1}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.suitable_for_special_emp_a || '--'}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{emp.suitable_for_special_emp_b || '--'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Recommendations ({othersData.recommendations?.length || 0})</h3>
                  </div>
                  {!othersData.recommendations || othersData.recommendations.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No recommendation records found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">S.No</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">RECOMMENDATION (a)</th>
                            <th className="px-6 py-3 text-left text-white font-semibold text-sm">RECOMMENDATION (b)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {othersData.recommendations.map((rec:any,index:number) => (
                            <tr key={rec.id} className="hover:bg-white/5">
                              <td className="px-6 py-4 text-white text-sm">{index+1}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{rec.recommendation_a}</td>
                              <td className="px-6 py-4 text-gray-300 text-sm">{rec.recommendation_b || '--'}</td>
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
        {/* </div> */}

        {/* Document Viewer Drawer */}
        {docViewerOpen && selectedDocument && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-end z-50">
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

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          {/* <p className="text-gray-400 text-sm">
            Profile ID: {profile.id}
          </p> */}
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      {/* </div> */}
    </ProtectedRoute>
  );
}

