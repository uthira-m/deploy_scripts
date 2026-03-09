"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService ,leaveService, imageService, whatsNewService} from "@/lib/api";
import { Users, CheckCircle2, Hospital, CalendarDays, Briefcase,Bell, BookOpen, Clock, FileCheck, Plus, FileText, Building2, Calendar, GraduationCap, AlertCircle, ChevronLeft, ChevronRight, Shield, Eye } from 'lucide-react';
import ImageComponent from 'next/image';
import { config } from "@/config/env";
import { formatDate, parseToTimestamp } from "@/lib/utils";
import { getServerDate } from "@/lib/serverTime";

// Greeting messages - shown randomly per day in the text marquee
const GREETING_MESSAGES = [
  'Hard work, courage, and honor – have a wonderful day soldier.',
  'Salute to your strength and commitment. Have a proud day ahead.',
  'Rise with courage, serve with honor. Have a great day.',
  'Salute to the brave hearts protecting the nation. Have a nice day.',
  'Every day is a mission. Serve with pride. Have a great day.',
  'Salute to the warriors who never give up. Have a great day.',
  'Hard work and courage lead the way. Have a great day.',
];

// Returns a greeting that stays the same for the day (seeded by date)
const getGreetingForToday = (): string => {
  const dateStr = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % GREETING_MESSAGES.length;
  return GREETING_MESSAGES[index];
};

// Custom tooltip component for better styling control
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-gray-200 text-sm">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: <span className="font-semibold text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { appName } = useAppSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState([
    { title: "Total Personnel", value: "0", change: "+8%", icon: Users, description: "Total Personnel", color: "from-indigo-500 to-indigo-600", borderColor: "indigo-500", categoryBreakdown: "00-00-00" },
    { title: "Available Personnel", value: "0", change: "+5%", icon: CheckCircle2, description: "Available Personnel", color: "from-green-500 to-green-600", borderColor: "green-500" },
    { title: "On ERE", value: "0", change: "+2", icon: Hospital, description: "On ERE", color: "from-orange-500 to-orange-600", borderColor: "orange-500" },
    { title: "On Leave", value: "0", change: "+3", icon: CalendarDays, description: "On Leave", color: "from-amber-500 to-amber-600", borderColor: "amber-500" },
    { title: "Out Station Employees", value: "0", change: "+0", icon: Briefcase, description: "Out Station Employment", color: "from-cyan-500 to-cyan-600", borderColor: "cyan-500" },
    { title: "Active Courses", value: "0", change: "+3", icon: BookOpen, description: "Currently Running", color: "from-emerald-500 to-emerald-600", borderColor: "emerald-500" },
    { title: "Pending Leave Requests", value: "0", change: "-5", icon: Clock, description: "Awaiting Approval", color: "from-rose-500 to-rose-600", borderColor: "rose-500" },
    { title: "Approved Leaves", value: "0", change: "+2", icon: FileCheck, description: "Recently Approved", color: "from-blue-500 to-blue-600", borderColor: "blue-500" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveChartData, setLeaveChartData] = useState<any[]>([]);
  const [leaveTypeData, setLeaveTypeData] = useState<any[]>([]);
  const [leaveSummary, setLeaveSummary] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState<any[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('all');
  const [duesData, setDuesData] = useState<any[]>([]);
  const [duesLoading, setDuesLoading] = useState(true);
  const [duesCourseOutStationData, setDuesCourseOutStationData] = useState<any[]>([]);
  const [duesCourseOutStationLoading, setDuesCourseOutStationLoading] = useState(true);
  const [leaveArrivalsData, setLeaveArrivalsData] = useState<any[]>([]);
  const [leaveArrivalsLoading, setLeaveArrivalsLoading] = useState(true);
  const [upcomingNotificationsData, setUpcomingNotificationsData] = useState<any[]>([]);
  const [upcomingNotificationsLoading, setUpcomingNotificationsLoading] = useState(true);
  const [companyPersonnelData, setCompanyPersonnelData] = useState<any[]>([]);
  const [companyPersonnelLoading, setCompanyPersonnelLoading] = useState(true);
  const [companyStatusData, setCompanyStatusData] = useState<any[]>([]);
  const [companyStatusLoading, setCompanyStatusLoading] = useState(true);
  const [categoryPersonnelData, setCategoryPersonnelData] = useState<any>(null);
  const [categoryPersonnelLoading, setCategoryPersonnelLoading] = useState(true);
  const [todayBirthdays, setTodayBirthdays] = useState<any[]>([]);
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [dashboardImages, setDashboardImages] = useState<string[]>([]);
  const [personnelImages, setPersonnelImages] = useState<string[]>([]);
  const [whatsNewDocs, setWhatsNewDocs] = useState<{filename: string; file_path: string; file_size: number; modified_at?: string}[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [whatsNewDocsLoading, setWhatsNewDocsLoading] = useState(true);
  const [outStationFormationCategories, setOutStationFormationCategories] = useState<Record<string, string> | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth();
  const BACKEND_URL = config.BACKEND_URL;

  const statNavigationMap: Record<string, { href: string; query?: Record<string, string> }> = {
    "Total Personnel": { href: "/dashboard/all-personnel" },
    "Available Personnel": { href: "/dashboard/all-personnel", query: { status: "Available" } },
    "On ERE": { href: "/dashboard/all-personnel", query: { status: "On ERE" } },
    "On Leave": { href: "/dashboard/all-personnel", query: { status: "On Leave" } },
    "On Course": { href: "/dashboard/all-personnel", query: { status: "On Course" } },
    "My Courses": { href: "/dashboard/courses" },
    "Active Courses": { href: "/dashboard/courses" },
    "Out Station Employees": { href: "/dashboard/all-personnel", query: { status: "Out Station" } },
    "Pending Leave Requests": { href: "/dashboard/leave", query: { status: "Pending" } },
    "Approved Leaves": { href: "/dashboard/leave", query: { status: "Approved" } },
  };

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        
        if (response.status === 'success' && response.data) {
          
          const { totalPersonnel, availablePersonnel, onEREPersonnel, onLeavePersonnel, onCoursePersonnel, outStationPersonnel, activeCourses, myCourses, pendingRequests, approvedRequests, outStationFormationCategories: formationCats } = response.data;
          
          if (formationCats && (user?.role === 'admin' || user?.role === 'commander')) {
            setOutStationFormationCategories(formationCats);
          } else {
            setOutStationFormationCategories(null);
          }
          
          setStats([
            { 
              title: "Total Personnel", 
              value: totalPersonnel.categoryBreakdown.toString(), 
              change: totalPersonnel.change, 
              icon: Users, 
              description: totalPersonnel.description, 
              color: "from-indigo-500 to-indigo-600",
              borderColor: "indigo-500",
              categoryBreakdown: totalPersonnel.categoryBreakdown || "00-00-00"
            },
            { 
              title: "Available Personnel", 
              value: availablePersonnel.categoryBreakdown?.toString() || "00-00-00", 
              change: availablePersonnel.change, 
              icon: CheckCircle2, 
              description: availablePersonnel.description, 
              color: "from-green-500 to-green-600",
              borderColor: "green-500",
              categoryBreakdown: availablePersonnel.categoryBreakdown || "00-00-00"
            },
            { 
              title: "On ERE", 
              value: onEREPersonnel.categoryBreakdown || onEREPersonnel.count.toString(), 
              change: onEREPersonnel.change, 
              icon: Hospital, 
              description: onEREPersonnel.description, 
              color: "from-orange-500 to-orange-600",
              borderColor: "orange-500"
            },
            { 
              title: "On Leave", 
              value: onLeavePersonnel.categoryBreakdown || onLeavePersonnel.count.toString(), 
              change: onLeavePersonnel.change, 
              icon: CalendarDays, 
              description: onLeavePersonnel.description, 
              color: "from-amber-500 to-amber-600",
              borderColor: "amber-500"
            },
            { 
              title: "Out Station Employees", 
              value: outStationPersonnel?.categoryBreakdown || outStationPersonnel?.count?.toString() || "00-00-00", 
              change: outStationPersonnel?.change || "+0", 
              icon: Briefcase, 
              description: outStationPersonnel?.description || "Out Station Employment", 
              color: "from-cyan-500 to-cyan-600",
              borderColor: "cyan-500"
            },
            ...((user?.role === 'admin' || user?.role === 'commander') && onCoursePersonnel ? [{
              title: "On Course",
              value: onCoursePersonnel.categoryBreakdown || onCoursePersonnel.count.toString(),
              change: onCoursePersonnel.change,
              icon: GraduationCap,
              description: onCoursePersonnel.description,
              color: "from-sky-500 to-sky-600",
              borderColor: "sky-500"
            }] : []),
            ...(user?.role === 'personnel' && myCourses ? [{
              title: "My Courses", 
              value: myCourses.count.toString(), 
              change: myCourses.change, 
              icon: BookOpen, 
              description: myCourses.description, 
              color: "from-emerald-500 to-emerald-600",
              borderColor: "emerald-500"
            }] : activeCourses ? [{
              title: "Active Courses", 
              value: activeCourses.count.toString(), 
              change: activeCourses.change, 
              icon: BookOpen, 
              description: activeCourses.description, 
              color: "from-emerald-500 to-emerald-600",
              borderColor: "emerald-500"
            }] : []),
            { 
              title: "Pending Leave Requests", 
              value: pendingRequests.count.toString(), 
              change: pendingRequests.change, 
              icon: Clock, 
              description: pendingRequests.description, 
              color: "from-rose-500 to-rose-600",
              borderColor: "rose-500"
            },
            // { 
            //   title: "Approved Leaves", 
            //   value: approvedRequests.count.toString(), 
            //   change: approvedRequests.change, 
            //   icon: "✅", 
            //   description: approvedRequests.description, 
            //   color: "from-blue-500 to-blue-600" 
            // },
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user?.role]);

  // Fetch leave types
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await leaveService.getLeaveTypes();
        
        if (response?.success === true && response.data) {
          setAvailableLeaveTypes(response.data);
        }
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };

    fetchLeaveTypes();
  }, []);

  // Fetch leave chart data
  useEffect(() => {
    const fetchLeaveChartData = async () => {
      try {
        setChartLoading(true);
        const response = await dashboardService.getLeaveChartData(selectedLeaveType);
        
        if (response.status === 'success' && response.data) {
          setLeaveChartData(response.data.chartData || []);
          setLeaveTypeData(response.data.leaveTypeData || []);
          setLeaveSummary(response.data.summary || null);
        }
      } catch (error) {
        console.error('Error fetching leave chart data:', error);
        // Set fallback data if API fails
        setLeaveChartData([]);
        setLeaveTypeData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchLeaveChartData();
  }, [selectedLeaveType]);

  // Fetch dues data
  useEffect(() => {
    const fetchDuesData = async () => {
      try {
        setDuesLoading(true);
        const response = await dashboardService.getDuesData();
        
        if (response.status === 'success' && response.data) {
          setDuesData(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching dues data:', error);
        setDuesData([]);
      } finally {
        setDuesLoading(false);
      }
    };

    fetchDuesData();
  }, []);

  // Fetch dues data for courses and out station
  useEffect(() => {
    const fetchDuesCourseOutStationData = async () => {
      try {
        setDuesCourseOutStationLoading(true);
        const response = await dashboardService.getDuesCourseOutStationData();
        
        if (response.status === 'success' && response.data) {
          setDuesCourseOutStationData(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching course and out station dues data:', error);
        setDuesCourseOutStationData([]);
      } finally {
        setDuesCourseOutStationLoading(false);
      }
    };

    fetchDuesCourseOutStationData();
  }, []);

  // Fetch leave arrivals data
  useEffect(() => {
    const fetchLeaveArrivalsData = async () => {
      try {
        setLeaveArrivalsLoading(true);
        const response = await dashboardService.getLeaveArrivalsData();

        if (response.status === 'success' && response.data) {
          const data = response.data || [];
          const companyOrder = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Headquarter', 'Support'];
          const sorted = [...data].sort((a, b) => {
            if (a.company === 'Total') return 1;
            if (b.company === 'Total') return -1;
            const aIdx = companyOrder.indexOf(a.company);
            const bIdx = companyOrder.indexOf(b.company);
            if (aIdx === -1 && bIdx === -1) return (a.company || '').localeCompare(b.company || '');
            if (aIdx === -1) return 1;
            if (bIdx === -1) return -1;
            return aIdx - bIdx;
          });
          setLeaveArrivalsData(sorted);
        }
      } catch (error) {
        console.error('Error fetching leave arrivals data:', error);
        setLeaveArrivalsData([]);
      } finally {
        setLeaveArrivalsLoading(false);
      }
    };

    fetchLeaveArrivalsData();
  }, []);

  // Fetch upcoming notifications data
  useEffect(() => {
    const fetchUpcomingNotificationsData = async () => {
      try {
        setUpcomingNotificationsLoading(true);
        const response = await dashboardService.getUpcomingNotificationsData();

        if (response.status === 'success' && response.data) {
          setUpcomingNotificationsData(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching upcoming notifications data:', error);
        setUpcomingNotificationsData([]);
      } finally {
        setUpcomingNotificationsLoading(false);
      }
    };

    fetchUpcomingNotificationsData();
  }, []);

  // Fetch company-wise personnel count (Admin only)
  useEffect(() => {
    const fetchCompanyPersonnelCount = async () => {
      if (user?.role !== 'admin') {
        setCompanyPersonnelLoading(false);
        return;
      }

      try {
        setCompanyPersonnelLoading(true);
        const response = await dashboardService.getCompanyPersonnelCount();
        
        if (response.status === 'success' && response.data) {
          // Add colors to chart data
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];
          const chartData = (response.data.chartData || []).map((item: any, index: number) => ({
            ...item,
            color: colors[index % colors.length]
          }));
          setCompanyPersonnelData(chartData);
        }
      } catch (error) {
        console.error('Error fetching company personnel count:', error);
        setCompanyPersonnelData([]);
      } finally {
        setCompanyPersonnelLoading(false);
      }
    };

    fetchCompanyPersonnelCount();
  }, [user?.role]);

  // Fetch company-wise personnel status distribution (Admin only)
  useEffect(() => {
    const fetchCompanyStatusData = async () => {
      if (user?.role !== 'admin') {
        setCompanyStatusLoading(false);
        return;
      }

      try {
        setCompanyStatusLoading(true);
        const response = await dashboardService.getPersonnelCountByCompanyAndStatus();
        if (response.status === 'success' && response.data) {
          const normalizedData = (response.data || []).map((item: any) => ({
            company: item.company,
            ere: item.ERE || 0,
            available: item.Available || 0,
            leave: item.Leave || 0,
            onCourse: item['On Course'] || 0,
            outStation: item['Out Station'] || 0
          }));
          setCompanyStatusData(normalizedData);
        } else {
          setCompanyStatusData([]);
        }
      } catch (error) {
        console.error('Error fetching company status data:', error);
        setCompanyStatusData([]);
      } finally {
        setCompanyStatusLoading(false);
      }
    };

    fetchCompanyStatusData();
  }, [user?.role]);

  // Fetch category-wise personnel count (Commander only)
  useEffect(() => {
    const fetchCategoryPersonnelCount = async () => {
      if (user?.role !== 'commander') {
        setCategoryPersonnelLoading(false);
        return;
      }

      try {
        setCategoryPersonnelLoading(true);
        const response = await dashboardService.getCategoryPersonnelCount();
        
        if (response.status === 'success' && response.data) {
          setCategoryPersonnelData(response.data);
        }
      } catch (error) {
        console.error('Error fetching category personnel count:', error);
        setCategoryPersonnelData(null);
      } finally {
        setCategoryPersonnelLoading(false);
      }
    };

    fetchCategoryPersonnelCount();
  }, [user?.role]);

  // Fetch today birthdays
  useEffect(() => {
    const fetchTodayBirthdays = async () => {
      try {
        setBirthdaysLoading(true);
        const response = await dashboardService.getTodayBirthdays();
        
        if (response.status === 'success' && response.data) {
          setTodayBirthdays(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching today birthdays:', error);
        setTodayBirthdays([]);
      } finally {
        setBirthdaysLoading(false);
      }
    };

    fetchTodayBirthdays();
  }, []);

  // Fetch images and whats-new docs
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setImagesLoading(true);
        const [dashboardRes, personnelRes] = await Promise.all([
          imageService.getImages('dashboard'),
          imageService.getImages('personnel')
        ]);

        if (dashboardRes.status === 'success' && dashboardRes.data) {
          const dashboardImageUrls = dashboardRes.data.map((img: any) => `${BACKEND_URL}${img.file_path}`);
          setDashboardImages(dashboardImageUrls);
        }

        if (personnelRes.status === 'success' && personnelRes.data) {
          const personnelImageUrls = personnelRes.data.map((img: any) => `${BACKEND_URL}${img.file_path}`);
          setPersonnelImages(personnelImageUrls);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setImagesLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const fetchWhatsNewDocs = async () => {
      try {
        setWhatsNewDocsLoading(true);
        const res = await whatsNewService.getDocuments();
        if (res.status === 'success' && res.data) {
          const docs = Array.isArray(res.data) ? res.data : [];
          // Sort by modified_at (last updated first)
          const sorted = [...docs].sort((a: any, b: any) => {
            const aTime = parseToTimestamp(a.modified_at);
            const bTime = parseToTimestamp(b.modified_at);
            return bTime - aTime;
          });
          setWhatsNewDocs(sorted);
        }
      } catch (error) {
        console.error('Error fetching What\'s New docs:', error);
      } finally {
        setWhatsNewDocsLoading(false);
      }
    };
    fetchWhatsNewDocs();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (dashboardImages.length === 0) return;
    
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % dashboardImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [dashboardImages.length]);

  // 2nd Row - Quick Actions
  const quickActions = [
    { title: "Add Personnel", icon: Plus, href: "/dashboard/personnel", color: "from-blue-500 to-blue-600" },
    { title: "Create Course", icon: FileText, href: "/dashboard/courses", color: "from-green-500 to-green-600" },
    { title: "View Companies", icon: Building2, href: "/dashboard/companies", color: "from-purple-500 to-purple-600" },
    { title: "Leave Management", icon: Calendar, href: "/dashboard/leave", color: "from-orange-500 to-orange-600" },
  ];

  // 3rd Row - Chart Data with financial colors
  // Use dynamic data from API, fallback to empty array if not loaded
  const leaveData = leaveChartData.length > 0 ? leaveChartData : [];

  // Use dynamic leave type data for course performance chart, fallback to static data
  const courseData = leaveTypeData.length > 0 ? leaveTypeData.map((item, index) => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const colorNames = ['emerald', 'blue', 'orange', 'red', 'purple', 'cyan'];
    const selectedColor = colors[index % colors.length];
    const selectedColorName = colorNames[index % colorNames.length];
    
    return {
      name: item.name,
      value: item.value,
      color: `from-${selectedColorName}-400 to-${selectedColorName}-600`,
      bgColor: selectedColor
    };
  }) : [
    { name: "Above Average (AA)", value: 35, color: "from-emerald-400 to-emerald-600", bgColor: "#10B981" },
    { name: "Average (A)", value: 45, color: "from-blue-400 to-blue-600", bgColor: "#3B82F6" },
    { name: "Below Average (BA)", value: 20, color: "from-gray-400 to-gray-600", bgColor: "#6B7280" },
  ];

  // 4th Row - Personnel In/Out Data
  const personnelData = [
    { month: "Jan", in: 120, out: 85 },
    { month: "Feb", in: 135, out: 92 },
    { month: "Mar", in: 110, out: 78 },
    { month: "Apr", in: 145, out: 105 },
    { month: "May", in: 125, out: 88 },
    { month: "Jun", in: 140, out: 95 },
  ];

  // Bottom - Recent Activities
  const recentActivities = [
    { action: "New personnel registered", user: "Lt. John Smith", time: "2 minutes ago", type: "success" },
    { action: "Course completion", user: "Capt. Sarah Johnson", time: "15 minutes ago", type: "info" },
    { action: "Leave request approved", user: "Sgt. Mike Davis", time: "1 hour ago", type: "success" },
    { action: "System maintenance", user: "Admin", time: "2 hours ago", type: "warning" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleStatCardClick = (title: string) => {
    const target = statNavigationMap[title];
    if (!target) return;

    const queryString = target.query ? `?${new URLSearchParams(target.query).toString()}` : "";
    router.push(`${target.href}${queryString}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Main Content */}
        <div className="mx-auto p-4 lg:p-6">
          {/* Dashboard Content */}
          <div>
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2"> Dashboard</h1>
              <p className="text-gray-300 text-sm lg:text-base">
                {user?.role === 'personnel' ? `Welcome to your ${appName} dashboard` : `Manage your ${appName} system and monitor key metrics`}
              </p>
            </div>

            {/* 1st Row - Stats Cards (admin/commander only) */}
            {(user?.role === 'admin' || user?.role === 'commander') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        {/* <div className="h-8 bg-gray-600 rounded mb-2"></div> */}
                        <div className="h-4 bg-gray-600 rounded mb-1 w-1/2"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                      </div>
                      <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-lg bg-gray-600"></div>
                    </div>
                  </div>
                ))
              ) : error ? (
                // Error state
                <div className="col-span-full bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 p-4 lg:p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-red-400 text-center">
                      <p className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Error Loading Data
                      </p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Stats cards - main stats and formation category cards (admin/commander only)
                <>
                  {stats.map((stat) => {
                    const isClickable = Boolean(statNavigationMap[stat.title]);
                    const borderTopMap: Record<string, string> = {
                      'indigo-500': 'border-t-indigo-500',
                      'green-500': 'border-t-green-500',
                      'orange-500': 'border-t-orange-500',
                      'amber-500': 'border-t-amber-500',
                      'cyan-500': 'border-t-cyan-500',
                      'emerald-500': 'border-t-emerald-500',
                      'rose-500': 'border-t-rose-500',
                      'blue-500': 'border-t-blue-500',
                      'sky-500': 'border-t-sky-500',
                    };
                    const borderTopClass = (stat.borderColor && borderTopMap[stat.borderColor]) || 'border-t-gray-500';
                    return (
                      <button
                        type="button"
                        key={stat.title}
                        onClick={() => handleStatCardClick(stat.title)}
                        disabled={!isClickable}
                        className={`bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 border-t-4 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300 shadow-lg text-left w-full ${borderTopClass} ${isClickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60' : 'cursor-default'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                            <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{stat.value}</p>
                            {stat.categoryBreakdown && (
                              <div className="mt-2" />
                            )}
                          </div>
                          <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                            {stat.icon && <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {outStationFormationCategories && (
                    <>
                      <div className="col-span-full mt-4 mb-2">
                        <h2 className="text-lg font-semibold text-white">Outstation Formation Categories</h2>
                        <p className="text-gray-400 text-sm">Personnel count by formation (Officers - JCO - OR)</p>
                      </div>
                      <div className="col-span-full">
                        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                          {['Guards and Duties', 'FTS', 'IN STN DUTIES', 'ATT GRRC', 'ATT OTHER UNITS', 'TD'].map((title) => {
                            const value = outStationFormationCategories[title] || '00-00-00';
                            const filterUrl = `/dashboard/all-personnel?status=Out Station&formation_category=${encodeURIComponent(title)}`;
                            return (
                              <Link
                                key={title}
                                href={filterUrl}
                                className="min-w-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 hover:bg-white/10 transition-all duration-300 shadow-lg text-left block cursor-pointer"
                              >
                                <div className="flex items-center justify-between min-w-0">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 text-[10px] sm:text-xs lg:text-sm font-medium leading-tight truncate" title={title}>{title}</p>
                                    <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-white mt-0.5 sm:mt-1 font-mono leading-tight">{value}</p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            )}

            {/* Gauge Row */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <GaugeCard value={1.86} min={0} max={3} label="Current Ratio" color="blue" />
              <GaugeCard value={10} min={0} max={31} label="DSI" sublabel="[Days Sales Inventory]" unit="Days" color="orange" />
              <GaugeCard value={7} min={0} max={31} label="DSO" sublabel="[Days Sales Outstanding]" unit="Days" color="red" />
              <GaugeCard value={28} min={0} max={31} label="DPO" sublabel="[Days Payable Outstanding]" unit="Days" color="green" />
            </div> */}

            {/* 2nd Row - Quick Actions */}
          {/* {user?.role === 'admin' &&  <div className="mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 block shadow-lg"
                  >
                    <div className="mb-2 flex items-center justify-center">
                      {action.icon && <action.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />}
                    </div>
                    <p className="text-white font-medium text-sm lg:text-base">{action.title}</p>
                  </Link>
                ))}
              </div>
            </div>} */}

           

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 items-stretch">
              {/* What's New - Documents List */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 transition-all duration-300 shadow-lg flex flex-col min-h-[400px]">
                <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">What&apos;s New</h2>
                {whatsNewDocsLoading ? (
                  <div className="flex items-center justify-center h-[320px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
                  </div>
                ) : whatsNewDocs.length > 0 ? (
                  <div className="overflow-y-auto h-[320px] pr-1 space-y-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {whatsNewDocs.map((doc) => {
                      const docUrl = `${BACKEND_URL}${doc.file_path}`;
                      const ext = doc.filename.split('.').pop()?.toLowerCase() || '';
                      const isPdf = ext === 'pdf';
                      const displayName = doc.filename.replace(/^\d+_/, '');
                      return (
                        <div
                          key={doc.filename}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                            isPdf ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{displayName}</p>
                            {doc.modified_at && (
                              <p className="text-gray-400 text-xs mt-0.5">{formatDate(doc.modified_at)}</p>
                            )}
                          </div>
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                   <div className="flex items-center justify-center w-full h-[320px]">
                      <div className="text-center">
                        {/* Creative Empty Pie Chart Design */}
                        <div className="relative w-40 h-40 mx-auto mb-4">
                          {/* Empty Pie Chart Circle - Outer Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(75, 85, 99, 0.3)"
                              strokeWidth="8"
                            />
                            {/* Animated dashed border */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(59, 130, 246, 0.4)"
                              strokeWidth="6"
                              strokeDasharray="10 5"
                              className="animate-spin"
                              style={{ animationDuration: '8s' }}
                            />
                          </svg>
                          {/* Center Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center backdrop-blur-sm border-2 border-gray-600/20">
                              <CalendarDays className="w-10 h-10 text-gray-500" />
                            </div>
                          </div>
                          {/* Decorative corner elements */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        </div>
                        <p className="text-gray-300 font-semibold text-base mb-1">  No documents yet. Upload PDF/DOC files from Docs Management.</p>
                       
                      </div>
                    </div>
               
                )}
              </div>
              {/* Image Carousel with Army Animations */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 transition-all duration-300 shadow-lg flex flex-col min-h-[400px]">
              {imagesLoading ? (
                <div className="relative rounded-xl border border-white/10 w-full h-[400px] flex items-center justify-center ">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                    <p className="text-gray-400 text-sm">Loading images...</p>
                  </div>
                </div>
              ) : dashboardImages.length > 0 ? (
                <div className="relative rounded-xl border border-white/10 w-full h-[420px] overflow-hidden shadow-2xl group mx-auto">
                  <div className="relative h-full w-full flex items-center justify-center">
                    {/* Blurred background image layer */}
                    {dashboardImages.map((img, index) => (
                      <div
                        key={`bg-${index}`}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === carouselIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
                        }`}
                      >
                        <ImageComponent
                          src={img}
                          alt={`Dashboard banner background ${index + 1}`}
                          fill
                          className="object-cover blur-sm scale-110"
                          priority={index === 0}
                          unoptimized
                        />
                      </div>
                    ))}
                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xl z-[5]"></div>
                    {/* Main image layer */}
                    {dashboardImages.map((img, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
                          index === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <ImageComponent
                          src={img}
                          alt={`Dashboard banner ${index + 1}`}
                          fill
                          className="object-contain"
                          priority={index === 0}
                          unoptimized
                        />
                      </div>
                    ))}
                    
                    {/* Navigation Arrows */}
                    {dashboardImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCarouselIndex((prev) => (prev - 1 + dashboardImages.length) % dashboardImages.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setCarouselIndex((prev) => (prev + 1) % dashboardImages.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Dots Indicator */}
                  {dashboardImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                      {dashboardImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCarouselIndex(index)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === carouselIndex
                              ? 'w-8 bg-white'
                              : 'w-2 bg-white/50 hover:bg-white/75'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative rounded-xl  w-full h-[400px] flex flex-col items-center justify-center">
                   <div className="relative w-40 h-40 mx-auto ">
                          {/* Empty Pie Chart Circle - Outer Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(75, 85, 99, 0.3)"
                              strokeWidth="8"
                            />
                            {/* Animated dashed border */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(59, 130, 246, 0.4)"
                              strokeWidth="6"
                              strokeDasharray="10 5"
                              className="animate-spin"
                              style={{ animationDuration: '8s' }}
                            />
                          </svg>
                          {/* Center Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center backdrop-blur-sm border-2 border-gray-600/20">
                              <CalendarDays className="w-10 h-10 text-gray-500" />
                            </div>
                          </div>
                          {/* Decorative corner elements */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        </div>
                  <p className="text-gray-300 font-semibold text-base mt-3">No dashboard images available</p>
                </div>
              )}
              </div>
            </div>

            {/* Personnel Images Marquee - Only show if images exist */}
            {personnelImages.length > 0 && (
              <div className="mb-6 lg:mb-8 overflow-hidden">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 shadow-lg overflow-hidden">
                  <marquee behavior="scroll" direction="left" loop>
                    <div className="flex gap-4" style={{ display: 'inline-flex', alignItems: 'center', paddingRight: '6rem' }}>
                      {personnelImages.map((img, index) => (
                        <div
                          key={`${img}-${index}`}
                          className="flex-shrink-0 w-32 h-32 lg:w-48 lg:h-48 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg hover:border-white/40 transition-all duration-300 hover:scale-105"
                          onMouseEnter={(e) => (e.currentTarget.closest('marquee') as HTMLMarqueeElement)?.stop()}
                          onMouseLeave={(e) => (e.currentTarget.closest('marquee') as HTMLMarqueeElement)?.start()}
                        >
                          <ImageComponent
                            src={img}
                            alt={`Personnel ${index + 1}`}
                            width={128}
                            height={128}
                            className="w-full h-full"
                            quality={90}
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </marquee>
                </div>
              </div>
            )}

            {/* Text Marquee */}
            <div className="mb-6 lg:mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 shadow-lg overflow-hidden">
                <marquee behavior="scroll" direction="left" loop className="whitespace-nowrap text-center" onMouseEnter={(e) => e.currentTarget.stop()} onMouseLeave={(e) => e.currentTarget.start()}>
                  <div className="inline-flex items-center whitespace-nowrap">
                  {/* Date and Day - Profiling Time Period custom date */}
                  <span className="inline-flex items-center gap-3 text-white font-semibold text-lg lg:text-xl mx-8 shrink-0">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    {getServerDate().toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}, {getServerDate().toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  {/* Greeting */}
                  <span className="inline-flex items-center gap-2 text-yellow-300 font-medium text-base lg:text-lg mx-8 shrink-0">
                    <span className="text-2xl">👋</span>
                    {getGreetingForToday()}
                  </span>
                  {/* Contact Info */}
                  <span className="inline-flex items-center gap-2 text-cyan-300 font-medium text-base lg:text-lg mx-8 shrink-0">
                    <span>📞</span>
                    For any assistance contact DOCU CELL : +91 7599313770, +91 7895114479
                  </span>
                  {/* Birthdays */}
                  {!birthdaysLoading && todayBirthdays.length > 0 && (
                    <span className="inline-flex items-center gap-2 text-pink-300 font-medium text-base lg:text-lg mx-8 shrink-0">
                      <span className="text-2xl">🎂</span>
                      Happy Birthday to {todayBirthdays.map((b, idx) => (
                        <span key={b.id || idx}>
                          <Link href={`/dashboard/personnel/${b.id}?from=dashboard&returnTo=${encodeURIComponent('/dashboard')}`} className="text-pink-300 hover:text-pink-200 underline cursor-pointer">
                            {b.name || b.army_no}
                          </Link>
                          {idx < todayBirthdays.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  )}
                  </div>
                </marquee>
              </div>
            </div>

            {/* Admin/Commander only sections - Leave Arrivals, Charts, etc. */}
            {(user?.role === 'admin' || user?.role === 'commander') && (
            <>
            {/* Leave Arrivals and Upcoming Notifications - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Leave Arrivals Summary */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 transition-all duration-300 shadow-lg">
                <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Leave Arrivals Today</h2>
                {leaveArrivalsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading leave arrivals data...</p>
                    </div>
                  </div>
                ) : leaveArrivalsData.length === 0 ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">No personnel returning from leave today</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-200">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 font-medium">Company</th>
                          <th className="text-center py-3 px-4 font-medium">Officer</th>
                          <th className="text-center py-3 px-4 font-medium">JCO</th>
                          <th className="text-center py-3 px-4 font-medium">Other Rank</th>
                          <th className="text-center py-3 px-4 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveArrivalsData.map((row, index) => (
                          <tr key={index} className={`border-b border-white/5 ${row.company === 'Total' ? 'bg-white/10 font-semibold' : 'hover:bg-white/5'}`}>
                            <td className="py-3 px-4">{row.company}</td>
                            <td className="text-center py-3 px-4">{row.officer}</td>
                            <td className="text-center py-3 px-4">{row.jco}</td>
                            <td className="text-center py-3 px-4">{row.other_rank}</td>
                            <td className="text-center py-3 px-4 font-semibold text-blue-400">{row.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Upcoming Notifications Summary */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 transition-all duration-300 shadow-lg">
                <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Upcoming Notifications</h2>
                {upcomingNotificationsLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">Loading upcoming notifications...</p>
                    </div>
                  </div>
                ) : upcomingNotificationsData.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        {/* Creative Empty Pie Chart Design */}
                        <div className="relative w-40 h-40 mx-auto mb-4">
                          {/* Empty Pie Chart Circle - Outer Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(75, 85, 99, 0.3)"
                              strokeWidth="8"
                            />
                            {/* Animated dashed border */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(59, 130, 246, 0.4)"
                              strokeWidth="6"
                              strokeDasharray="10 5"
                              className="animate-spin"
                              style={{ animationDuration: '8s' }}
                            />
                          </svg>
                          {/* Center Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center backdrop-blur-sm border-2 border-gray-600/20">
                              <Bell className="w-10 h-10 text-gray-500" />
                            </div>
                          </div>
                          {/* Decorative corner elements */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        </div>
                        <p className="text-gray-300 font-semibold text-base mb-1">No upcoming notifications in the next month</p>
                      </div>
                    </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {upcomingNotificationsData.map((notification, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            notification.type === 'Course' ? 'bg-blue-400' :
                            notification.type === 'ERE' ? 'bg-orange-400' :
                            notification.type === 'Out Station' ? 'bg-green-400' :
                            'bg-purple-400'
                          }`}></div>
                          <div>
                            <p className="text-white font-medium text-sm">{notification.army_no} - {notification.name}</p>
                            <p className="text-gray-400 text-xs">{notification.details}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">{formatDate(notification.date)}</p>
                          <p className={`text-xs font-semibold ${
                            notification.type === 'Course' ? 'text-blue-400' :
                            notification.type === 'ERE' ? 'text-orange-400' :
                            notification.type === 'Out Station' ? 'text-green-400' :
                            'text-purple-400'
                          }`}>
                            {notification.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3rd Row - Charts with financial styling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Leave Management Chart */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 transition-all duration-300 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 lg:mb-4">
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-white">Leave Management</h2>
                    {selectedLeaveType !== 'all' && (
                      <p className="text-sm text-gray-400 mt-1">
                        Filtered by: {availableLeaveTypes.find(lt => lt.id.toString() === selectedLeaveType)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                    <div className="flex items-center bg-amber-500/10 px-2 lg:px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded mr-1 lg:mr-2"></div>
                      <span className="text-gray-200 font-medium">On Leave</span>
                    </div>
                    <div className="flex items-center bg-emerald-500/10 px-2 lg:px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded mr-1 lg:mr-2"></div>
                      <span className="text-gray-200 font-medium">Available</span>
                    </div>
                  </div>
                </div>
                <div className="h-44 lg:h-62">
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Loading chart data...</p>
                      </div>
                    </div>
                  ) : leaveData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">No data available</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leaveData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                          dataKey="dateStr" 
                          stroke="#9CA3AF" 
                          fontSize={10}
                          tick={{ fill: '#9CA3AF' }}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          stroke="#9CA3AF" 
                          fontSize={10}
                          tick={{ fill: '#9CA3AF' }}
                          width={40}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          labelStyle={{ color: '#9CA3AF' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar 
                          dataKey="leave" 
                          fill="#F59E0B" 
                          radius={[4, 4, 0, 0]}
                          name="On Leave"
                        />
                        <Bar 
                          dataKey="available" 
                          fill="#10B981" 
                          radius={[4, 4, 0, 0]}
                          name="Available"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Course Grading Chart */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 transition-all duration-300 shadow-lg">
                <h2 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">Leave Type Distribution</h2>
                <div className="flex items-center justify-between h-36 lg:h-44">
                  {chartLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Loading chart data...</p>
                      </div>
                    </div>
                  ) : courseData.length === 0 || courseData.every(item => item.value === 0) ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="text-center">
                        {/* Creative Empty Pie Chart Design */}
                        <div className="relative w-40 h-40 mx-auto mb-4">
                          {/* Empty Pie Chart Circle - Outer Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(75, 85, 99, 0.3)"
                              strokeWidth="8"
                            />
                            {/* Animated dashed border */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(59, 130, 246, 0.4)"
                              strokeWidth="6"
                              strokeDasharray="10 5"
                              className="animate-spin"
                              style={{ animationDuration: '8s' }}
                            />
                          </svg>
                          {/* Center Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center backdrop-blur-sm border-2 border-gray-600/20">
                              <CalendarDays className="w-10 h-10 text-gray-500" />
                            </div>
                          </div>
                          {/* Decorative corner elements */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        </div>
                        <p className="text-gray-300 font-semibold text-base mb-1">No Leave Data Available</p>
                        <p className="text-gray-500 text-xs">There are no leave requests to display in the chart</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Pie Chart */}
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={courseData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {courseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.bgColor} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Summary on Right Side */}
                      <div className="w-1/2 pl-4 lg:pl-6">
                        <div className="space-y-3 lg:space-y-4">
                          {courseData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2 lg:p-3 hover:bg-white/10 transition-all duration-300">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 lg:w-4 lg:h-4 rounded-full mr-2 lg:mr-3 shadow-lg"
                                  style={{ backgroundColor: item.bgColor }}
                                ></div>
                                <span className="text-gray-200 text-sm font-medium">{item.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-white font-bold text-base lg:text-lg mr-2">{item.value}</span>
                                <div className="w-12 lg:w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${Math.min(100, (item.value / Math.max(...courseData.map(d => d.value))) * 100)}%`,
                                      backgroundColor: item.bgColor
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 4th Row - Dues Charts */}
            <div className="mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Dues In & Out</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                {/* ERE Dues Chart */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 transition-all duration-300 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-white">ERE Dues</h3>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                      <div className="flex items-center bg-emerald-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues In</span>
                      </div>
                      <div className="flex items-center bg-red-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-red-400 to-red-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues Out</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-44 lg:h-62">
                    {duesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Loading dues data...</p>
                        </div>
                      </div>
                    ) : duesData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">No data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={duesData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                            width={50}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          <Bar 
                            dataKey="ereDuesIn" 
                            fill="#10B981" 
                            radius={[4, 4, 0, 0]}
                            name="Dues In"
                          />
                          <Bar 
                            dataKey="ereDuesOut" 
                            fill="#EF4444" 
                            radius={[4, 4, 0, 0]}
                            name="Dues Out"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Leave Dues Chart */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 transition-all duration-300 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-white">Leave Dues</h3>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                      <div className="flex items-center bg-blue-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues In</span>
                      </div>
                      <div className="flex items-center bg-amber-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues Out</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-44 lg:h-62">
                    {duesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Loading dues data...</p>
                        </div>
                      </div>
                    ) : duesData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">No data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={duesData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                            width={50}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          <Bar 
                            dataKey="leaveDuesIn" 
                            fill="#3B82F6" 
                            radius={[4, 4, 0, 0]}
                            name="Dues In"
                          />
                          <Bar 
                            dataKey="leaveDuesOut" 
                            fill="#F59E0B" 
                            radius={[4, 4, 0, 0]}
                            name="Dues Out"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5th Row - Course & Out Station Dues Charts */}
            <div className="mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Course & Out Station Dues In & Out</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                {/* Course Dues Chart */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 transition-all duration-300 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-white">Course Dues</h3>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                      <div className="flex items-center bg-purple-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues In</span>
                      </div>
                      <div className="flex items-center bg-pink-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-pink-400 to-pink-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues Out</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-44 lg:h-62">
                    {duesCourseOutStationLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Loading course dues data...</p>
                        </div>
                      </div>
                    ) : duesCourseOutStationData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">No data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={duesCourseOutStationData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                            width={50}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          <Bar 
                            dataKey="courseDuesIn" 
                            fill="#8B5CF6" 
                            radius={[4, 4, 0, 0]}
                            name="Dues In"
                          />
                          <Bar 
                            dataKey="courseDuesOut" 
                            fill="#EC4899" 
                            radius={[4, 4, 0, 0]}
                            name="Dues Out"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Out Station Dues Chart */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 transition-all duration-300 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-white">Out Station Dues</h3>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                      <div className="flex items-center bg-cyan-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues In</span>
                      </div>
                      <div className="flex items-center bg-teal-500/10 px-2 lg:px-3 py-1 rounded-lg">
                        <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-teal-400 to-teal-600 rounded mr-1 lg:mr-2"></div>
                        <span className="text-gray-200 font-medium">Dues Out</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-44 lg:h-62">
                    {duesCourseOutStationLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Loading out station dues data...</p>
                        </div>
                      </div>
                    ) : duesCourseOutStationData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">No data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={duesCourseOutStationData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                            width={50}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          <Bar 
                            dataKey="outStationDuesIn" 
                            fill="#06B6D4" 
                            radius={[4, 4, 0, 0]}
                            name="Dues In"
                          />
                          <Bar 
                            dataKey="outStationDuesOut" 
                            fill="#14B8A6" 
                            radius={[4, 4, 0, 0]}
                            name="Dues Out"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>

         
                 {/* Company-wise Personnel Status (Admin only) */}
            {user?.role === 'admin' && (
               <div className="mb-6 lg:mb-8">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="text-lg lg:text-xl font-semibold text-white">Company-wise Personnel Status</h2>
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-xs lg:text-sm">
                    <div className="flex items-center bg-orange-500/10 px-2 lg:px-3 py-1 rounded-lg"><div className="w-2 h-2 lg:w-3 lg:h-3 bg-orange-500 rounded mr-1 lg:mr-2"></div><span className="text-gray-200 font-medium">On ERE</span></div>
                    <div className="flex items-center bg-emerald-500/10 px-2 lg:px-3 py-1 rounded-lg"><div className="w-2 h-2 lg:w-3 lg:h-3 bg-emerald-500 rounded mr-1 lg:mr-2"></div><span className="text-gray-200 font-medium">Available</span></div>
                    <div className="flex items-center bg-amber-500/10 px-2 lg:px-3 py-1 rounded-lg"><div className="w-2 h-2 lg:w-3 lg:h-3 bg-amber-500 rounded mr-1 lg:mr-2"></div><span className="text-gray-200 font-medium">On Leave</span></div>
                    <div className="flex items-center bg-blue-500/10 px-2 lg:px-3 py-1 rounded-lg"><div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded mr-1 lg:mr-2"></div><span className="text-gray-200 font-medium">On Course</span></div>
                    <div className="flex items-center bg-cyan-500/10 px-2 lg:px-3 py-1 rounded-lg"><div className="w-2 h-2 lg:w-3 lg:h-3 bg-cyan-500 rounded mr-1 lg:mr-2"></div><span className="text-gray-200 font-medium">Out Station</span></div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 transition-all duration-300 shadow-lg">
                  <div className="h-56 lg:h-72">
                    {companyStatusLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Fetching personnel status...</p>
                        </div>
                      </div>
                    ) : companyStatusData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">No personnel data available</p>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={companyStatusData} margin={{ top: 10, right: 20, left: 0, bottom: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                          <XAxis 
                            dataKey="company" 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                            textAnchor="end"
                            height={45}
                          />
                          <YAxis 
                            stroke="#9CA3AF" 
                            fontSize={14}
                            tick={{ fill: '#9CA3AF' }}
                            width={45}
                            label={{ value: 'Personnel Count', angle: -90, position: 'center', style: { fill: '#9CA3AF', fontSize: 14, } }}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="ere" name="On ERE" fill="#F97316" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="available" name="Available" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="leave" name="On Leave" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="onCourse" name="On Course" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="outStation" name="Out Station" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            )}
            

            {/* Company-wise Personnel Count Chart (Admin only) */}
            {user?.role === 'admin' && (
              <div className="mb-6 lg:mb-8">
                <h2 className="text-lg lg:text-xl font-semibold text-white mb-3">Company-wise Personnel Distribution</h2>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-4 hover:bg-white/10 transition-all duration-300 shadow-lg">
                  <div className="h-56 lg:h-72">
                    {companyPersonnelLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                          <p className="text-gray-400 text-sm">Loading company data...</p>
                        </div>
                      </div>
                    ) : companyPersonnelData.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <p className="text-gray-400 text-sm">No companies found</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between h-full">
                        {/* Pie Chart - Only show companies with personnel > 0 */}
                        <div className="w-1/2 h-full">
                          {companyPersonnelData.filter(item => item.value > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={companyPersonnelData.filter(item => item.value > 0)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                  {companyPersonnelData.filter(item => item.value > 0).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                 <div className="relative w-40 h-40 mx-auto mb-4">
                          {/* Empty Pie Chart Circle - Outer Ring */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(75, 85, 99, 0.3)"
                              strokeWidth="8"
                            />
                            {/* Animated dashed border */}
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(59, 130, 246, 0.4)"
                              strokeWidth="6"
                              strokeDasharray="10 5"
                              className="animate-spin"
                              style={{ animationDuration: '8s' }}
                            />
                          </svg>
                          {/* Center Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 flex items-center justify-center backdrop-blur-sm border-2 border-gray-600/20">
                              <CalendarDays className="w-10 h-10 text-gray-500" />
                            </div>
                          </div>
                          {/* Decorative corner elements */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        </div>
                                <p className="text-gray-300 font-semibold text-base">No personnel assigned to any company</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Summary on Right Side - Show all companies including 0 */}
                        <div className="w-1/2 pl-4 lg:pl-6">
                          <div className="space-y-3 lg:space-y-4 max-h-56 lg:max-h-72 overflow-y-auto">
                            {companyPersonnelData.map((item, index) => {
                              const maxValue = Math.max(...companyPersonnelData.map(d => d.value), 1);
                              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                              return (
                                <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-2 lg:p-3 hover:bg-white/10 transition-all duration-300">
                                  <div className="flex items-center">
                                    <div 
                                      className="w-3 h-3 lg:w-4 lg:h-4 rounded-full mr-2 lg:mr-3 shadow-lg"
                                      style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-gray-200 text-sm font-medium">{item.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-white font-bold text-base lg:text-lg mr-2">{item.categoryBreakdown || '00-00-00'}</span>
                                    <div className="w-12 lg:w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ 
                                          width: `${Math.min(100, percentage)}%`,
                                          backgroundColor: item.color
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Category-wise Personnel Count (Commander only) */}
            {/* {user?.role === 'commander' && (
              <div className="mb-6 lg:mb-8">
                <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Personnel Count by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Officers</p>
                        {categoryPersonnelLoading ? (
                          <div className="animate-pulse">
                            <div className="h-8 w-16 bg-gray-600 rounded"></div>
                          </div>
                        ) : (
                          <p className="text-3xl lg:text-4xl font-bold text-white">{categoryPersonnelData?.officers || 0}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Award className="w-6 h-6 lg:w-8 lg:h-8 text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">JCO</p>
                        {categoryPersonnelLoading ? (
                          <div className="animate-pulse">
                            <div className="h-8 w-16 bg-gray-600 rounded"></div>
                          </div>
                        ) : (
                          <p className="text-3xl lg:text-4xl font-bold text-white">{categoryPersonnelData?.jco || 0}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Star className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">OR</p>
                        {categoryPersonnelLoading ? (
                          <div className="animate-pulse">
                            <div className="h-8 w-16 bg-gray-600 rounded"></div>
                          </div>
                        ) : (
                          <p className="text-3xl lg:text-4xl font-bold text-white">{categoryPersonnelData?.or || 0}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 lg:w-8 lg:h-8 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
                {categoryPersonnelData && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                      Total Personnel: <span className="text-white font-semibold">{categoryPersonnelData.total || 0}</span>
                    </p>
                  </div>
                )}
              </div>
            )} */}

            {/* 5th Row - Personnel Chart */}
            {/* <div className="mb-6 lg:mb-8">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Personnel Movement</h2>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300 shadow-lg">
                <div className="h-48 lg:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personnelData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tick={{ fill: '#9CA3AF' }}
                        width={50}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelStyle={{ color: '#9CA3AF' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar 
                        dataKey="in" 
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]}
                        name="Personnel In"
                      />
                      <Bar 
                        dataKey="out" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                        name="Personnel Out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mt-4 lg:mt-6 text-sm">
                  <div className="flex items-center bg-blue-500/10 px-3 lg:px-4 py-1 lg:py-2 rounded-lg">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded mr-2 lg:mr-3 shadow-lg"></div>
                    <span className="text-gray-200 font-medium">Personnel In</span>
                  </div>
                  <div className="flex items-center bg-emerald-500/10 px-3 lg:px-4 py-1 lg:py-2 rounded-lg">
                    <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded mr-2 lg:mr-3 shadow-lg"></div>
                    <span className="text-gray-200 font-medium">Personnel Out</span>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Bottom - Recent Activities */}
            {/* <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 shadow-lg">
              <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Recent Activities</h2>
              <div className="space-y-3 lg:space-y-4">
                {recentActivities.map((activity, index) => {
                  const dotColor =
                    activity.type === 'success'
                      ? 'bg-emerald-500'
                      : activity.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500';
                  return (
                    <div key={index} className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${dotColor}`}></div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm lg:text-base">{activity.action}</p>
                        <p className="text-gray-400 text-sm">{activity.user}</p>
                      </div>
                      <span className="text-gray-400 text-sm">{activity.time}</span>
                    </div>
                  );
                })}
              </div>
            </div> */}
            </>
            )}
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
} 