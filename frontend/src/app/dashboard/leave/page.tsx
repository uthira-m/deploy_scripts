'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
import { Upload, Calendar, CheckCircle, XCircle, Clock, FileSpreadsheet, FileCheck, AlertCircle, X, Info, CheckCircle2, FileX, FileText, BarChart3, UserCheck, UserCog, AlertTriangle, Check, X as XIcon, Briefcase } from 'lucide-react';
import { paginationConfig } from '@/config/pagination';

interface LeaveType {
  id: number;
  name: string;
  max_days: number;
  description: string;
}

interface Supervisor {
  id: number;
  army_no: string;
  name: string;
}

interface LeaveRequest {
  id: number;
  leaveTypeId: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
  LeaveType: LeaveType;
  User: {
    id: number;
    army_no: string;
    name: string;
  };
  supervisor: {
    id: number;
    army_no: string;
    name: string;
  };
}

interface LeaveApproval {
  id: number;
  status: string;
  comments: string;
  approvedAt: string;
  LeaveRequest: LeaveRequest;
  approver: {
    id: number;
    army_no: string;
    name: string;
  };
}

interface LeaveBalance {
  leaveTypeId: number;
  leaveTypeName: string;
  maxDays: number;
  usedDays: number;
  remainingDays: number;
  percentage: number;
}

// Static leave types data
const STATIC_LEAVE_TYPES: LeaveType[] = [
  { id: 1, name: 'Annual Leave', max_days: 30, description: 'Regular annual leave entitlement' },
  { id: 2, name: 'Sick Leave', max_days: 15, description: 'Medical and health-related leave' },
  { id: 3, name: 'Casual Leave', max_days: 10, description: 'Short-term personal leave' },
  { id: 4, name: 'Emergency Leave', max_days: 7, description: 'Emergency situations' },
  { id: 5, name: 'Maternity Leave', max_days: 90, description: 'Maternity and parental leave' }
];

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('approval-queue');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(STATIC_LEAVE_TYPES);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const [approvalQueue, setApprovalQueue] = useState<LeaveApproval[]>([]);
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<LeaveApproval | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedLeaveForExtension, setSelectedLeaveForExtension] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  // Status filter and page: use URL as single source of truth to avoid duplicate API calls
  const statusFilter = searchParams?.get('status') || '';
  const page = Math.max(1, parseInt(searchParams?.get('page') || String(paginationConfig.DEFAULT_PAGE), 10));
  const [leaveCategoryFilter, setLeaveCategoryFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [limit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    leave_type_id: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Extension form states
  const [extensionData, setExtensionData] = useState({
    new_end_date: '',
    extension_reason: ''
  });
  
  const [approver, setApprover] = useState<any>(null);

  const [approvalData, setApprovalData] = useState({
    status: 'approved',
    comments: ''
  });

  const showSuccess = (message: string) => {
    setNotificationMessage(message);
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const showError = (message: string) => {
    setNotificationMessage(message);
    setNotificationType('error');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  useEffect(() => {
    if (user?.role) loadData();
  }, [activeTab, user?.role, page, statusFilter, leaveCategoryFilter]);

  // Load leave types from API
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await leaveService.getLeaveTypes();
        if (response?.success === true && response.data) {
          setLeaveTypes(response.data);
        }
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };
    fetchLeaveTypes();
  }, []);

  // Sync filtered requests with allRequests (leave type filter is now applied by backend API)
  useEffect(() => {
    setFilteredRequests([...allRequests]);
  }, [allRequests]);

  const loadData = async () => {
    if (!user?.role) return;

    setLoading(true);
    try {
      // For Admin: Load ALL leave requests ONLY
      if (user.role === 'admin') {
        // Use statusFilter (derived from URL) - single source of truth avoids duplicate API calls
        try {
          const apiParams = {
            status: statusFilter || undefined,
            leave_type_id: leaveCategoryFilter || undefined,
            page: page,
            limit: limit
          };
          const allRequestsResponse = await leaveService.getAllLeaveRequests(apiParams);
          const responseData = allRequestsResponse.data as { leaveRequests?: LeaveRequest[]; pagination?: { total_pages?: number; total?: number } };
          setAllRequests(responseData.leaveRequests || []);
          setTotalPages(responseData.pagination?.total_pages || 1);
          setTotal(responseData.pagination?.total || 0);
          console.log('Admin leave requests loaded:', responseData.leaveRequests?.length || 0);
        } catch (error) {
          console.error('Error loading admin leave requests:', error);
        }
        setLoading(false);
        return; // Admin stops here - no approver needed
      }

      // For Commander/Personnel: Load approver
      console.log(`Loading ${user.role} view`);

      // For Commander/Personnel: Load approver using my-approver API
      try {
        console.log('Fetching approver from /api/leave/my-approver');
        const approverResponse = await leaveService.getMyApprover();
        const approverData = approverResponse.data || null;
        setApprover(approverData);
        console.log(`Approver loaded: ${approverData?.name} (${approverData?.role})`);
      } catch (error) {
        console.error('Error loading approver:', error);
        setApprover(null);
      }

      // Load user's leave requests (NO MOCK DATA)
      try {
        const requestsResponse = await leaveService.getMyLeaveRequests();
        // Go backend returns { leaveRequests: [...], pagination: {...} }; Node returns array directly
        const rawData = requestsResponse.data;
        const requestsData = Array.isArray(rawData) ? rawData : (rawData as { leaveRequests?: unknown[] })?.leaveRequests ?? [];
        setMyRequests(requestsData);
        console.log('My leave requests loaded:', requestsData.length);
      } catch (error) {
        console.error('Error loading my leave requests:', error);
        setMyRequests([]);
      }

      // Load leave types
      // try {
      //   const leaveTypesResponse = await api.get('/leave/types');
      //   if (leaveTypesResponse.data?.data) {
      //     setLeaveTypes(leaveTypesResponse.data.data);
      //     console.log('Leave types loaded:', leaveTypesResponse.data.data.length);
      //   }
      // } catch (error) {
      //   console.error('Error loading leave types:', error);
      // }

      // For Commander: Load reportee leave requests for approval queue
      if (user.role === 'commander' && activeTab === 'approval-queue') {
        try {
          const commanderRequestsResponse = await leaveService.getCommanderLeaveRequests();
          // Go backend returns { leaveRequests: [...], pagination: {...} }; Node returns array directly
          const rawData = commanderRequestsResponse.data;
          const commanderData = Array.isArray(rawData) ? rawData : (rawData as { leaveRequests?: unknown[] })?.leaveRequests ?? [];
          setApprovalQueue(commanderData);
          console.log('Commander approval queue loaded:', commanderData.length);
        } catch (error) {
          console.error('Error loading commander leave requests:', error);
          setApprovalQueue([]);
        }
      }

    } catch (error) {
      console.error('Error in loadData:', error);
      // Don't set fallback data - show actual error state
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaveBalance = (types: LeaveType[], requests: LeaveRequest[]) => {
    
    
    if (!types || types.length === 0) {
      
      setLeaveBalance([]);
      return;
    }
    
    const balance: LeaveBalance[] = types.map(type => {
      const approvedRequests = requests.filter(
        req => (req.leave_type || req.leaveType || req.LeaveType)?.id === type.id && (req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'extended')
      );
      
      const usedDays = approvedRequests.reduce((total, req) => {
        try {
          const start = new Date(req.startDate);
          const end = new Date(req.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return total + Math.max(0, days);
        } catch (error) {
  
          return total;
        }
      }, 0);

      const remainingDays = Math.max(0, type.max_days - usedDays);
      const percentage = type.max_days > 0 ? (usedDays / type.max_days) * 100 : 0;

      return {
        leaveTypeId: type.id,
        leaveTypeName: type.name,
        maxDays: type.max_days,
        usedDays,
        remainingDays,
        percentage: Math.min(percentage, 100)
      };
    });

    
    setLeaveBalance(balance);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Send only required fields to backend
      const requestData = {
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason
      };
      
      await leaveService.createLeaveRequest(requestData);
      setShowCreateModal(false);
      setFormData({
        leave_type_id: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      loadData();
      showSuccess('Leave request submitted successfully!');
    } catch (error: any) {
      console.error('Error creating leave request:', error);
      const errorMessage = error?.message || 'Failed to create leave request';
      showError(errorMessage);
      // Show alert for conflict errors
      if (errorMessage.includes("already assigned") || errorMessage.includes("already on")) {
        alert(errorMessage);
      }
    }
  };

  const handleQuickApprove = async (leaveId: number) => {
    try {
      const response = await leaveService.approveRejectLeaveRequest(leaveId, {
        action: 'approve'
      });
      
      if (response.success) {
        showSuccess('Leave request approved successfully!');
        loadData();
      } else {
        showError(response.message || 'Failed to approve leave request');
      }
    } catch (error: any) {
      console.error('Error approving leave:', error);
      showError(error.message || 'Failed to approve leave request');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApproval) return;
    
    const rejectionReason = (e.target as any).rejection_reason.value;
    if (!rejectionReason || !rejectionReason.trim()) {
      showError('Rejection reason is required');
      return;
    }

    try {
      const response = await leaveService.approveRejectLeaveRequest(selectedApproval.id, {
        action: 'reject',
        rejection_reason: rejectionReason
      });
      
      if (response.success) {
        showSuccess('Leave request rejected successfully!');
        setShowApprovalModal(false);
        setSelectedApproval(null);
        loadData();
      } else {
        showError(response.message || 'Failed to reject leave request');
      }
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      showError(error.message || 'Failed to reject leave request');
    }
  };

  // Normalize date to YYYY-MM-DD for API/input (handles ISO strings like "2025-03-15T00:00:00.000Z")
  const toDateString = (dateVal: string | Date): string => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
      const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) return match[0];
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
    }
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Get the day after a date (for min date - backend requires new end date AFTER original)
  const dayAfter = (dateVal: string | Date): string => {
    const str = toDateString(dateVal);
    if (!str) return '';
    const [y, m, day] = str.split('-').map(Number);
    const next = new Date(y, m - 1, day + 1);
    return toDateString(next);
  };

  const handleExtendLeave = (leaveRequest: any) => {
    setSelectedLeaveForExtension(leaveRequest);
    const endDate = leaveRequest.end_date;
    setExtensionData({
      new_end_date: dayAfter(endDate),
      extension_reason: ''
    });
    setShowExtendModal(true);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      showError('Please select a file to upload');
      return;
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = uploadFile.name.substring(uploadFile.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      showError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setUploading(true);
    try {
      const response = await leaveService.bulkUploadPastLeaves(uploadFile);
      
      if (response.success) {
        const { total, successful, errors, details, summary } = response.data;
        let message = `Upload completed! ${successful} out of ${total} records processed successfully.`;
        if (errors > 0) {
          message += ` ${errors} errors occurred.`;
          // Show detailed error information
          if (details?.errors && details.errors.length > 0) {
            const errorList = details.errors.slice(0, 10).map((err: any) => {
              if (typeof err === 'string') return err;
              return err.message || err.error || err;
            }).join('\n');
            const errorMessage = details.errors.length > 10 
              ? `${errorList}\n... and ${details.errors.length - 10} more errors`
              : errorList;
            console.error('Upload errors:', errorMessage);
            // Show first few errors in alert for user visibility
            alert(`Upload completed with ${errors} errors:\n\n${errorMessage}`);
          }
        }
        if (summary) {
          message += ` Success rate: ${summary.success_rate}`;
        }
        showSuccess(message);
        setShowUploadModal(false);
        setUploadFile(null);
        loadData(); // Reload leave requests
      } else {
        showError(response.message || 'Failed to upload file');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showError(error?.response?.data?.message || error?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!extensionData.new_end_date || !extensionData.extension_reason) {
      showError('All fields are required');
      return;
    }

    try {
      const response = await leaveService.createLeaveExtension({
        leave_request_id: selectedLeaveForExtension.id,
        new_end_date: extensionData.new_end_date,
        extension_reason: extensionData.extension_reason
      });

      if (response.success) {
        showSuccess('Leave extended successfully!');
        setShowExtendModal(false);
        setSelectedLeaveForExtension(null);
        setExtensionData({ new_end_date: '', extension_reason: '' });
        loadData();
      } else {
        showError(response.message || 'Failed to extend leave');
      }
    } catch (error: any) {
      console.error('Error extending leave:', error);
      showError(error?.message || 'Failed to extend leave');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'extended': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getBalanceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
    if (percentage >= 50) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-rose-500 to-rose-600';
    if (percentage >= 50) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDays = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      return days > 0 ? days : 0;
    } catch (error) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Leave Management</h1>
        <p className="text-gray-300 text-sm lg:text-base">Manage leave requests and approvals</p>
      </div>

      {/* Show Approver Info and New Request Button only for non-admin users */}
      {user?.role !== 'admin' && (
        <>
          {/* Approver Info Card */}
          {/* {approver && (
            <div className="mb-6 lg:mb-8 p-4 lg:p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-xl border border-blue-500/20 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">
                  {approver.role === 'admin' ? <Briefcase className="w-6 h-6" /> : <UserCog className="w-6 h-6" />}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-300">
                    Your Leave Approver...
                    <span className="ml-3 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                      {approver.role === 'admin' ? 'Admin' : 'Commander'}
                    </span>
                  </h3>
                  <p className="text-lg font-bold text-white mt-1">{approver.name}</p>
                </div>
              </div>
              <div className="ml-12 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Army No:</span>
                  <span className="text-white ml-2 font-medium">{approver.army_no}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rank:</span>
                  <span className="text-white ml-2 font-medium">{approver.rank}</span>
                </div>
                {approver.unit && (
                  <div>
                    <span className="text-gray-400">Unit:</span>
                    <span className="text-white ml-2 font-medium">{approver.unit}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!approver && !loading && (
            <div className="mb-6 lg:mb-8 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <div>
                  <h3 className="text-sm font-semibold text-yellow-400">No Approver Assigned...</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {user?.role === 'personnel' 
                      ? 'Please contact administrator to set up your reporting relationship.'
                      : 'No admin found in the system.'}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* New Request Button */}
          {/* <div className="mb-6 lg:mb-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Request
            </button>
          </div> */}
        </>
      )}

      {/* Leave Balance Summary */}
      {/* <div className="mb-6 lg:mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 shadow-lg">
          <h2 className="text-lg lg:text-xl font-semibold text-white mb-4">Leave Balance Summary</h2>
          {leaveBalance.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-500/20 rounded-full border border-gray-500/30">
                  <BarChart3 className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Leave Types Available</h3>
              <p className="text-gray-400">Leave types need to be configured by the administrator.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {leaveBalance.map((balance, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{balance.leaveTypeName}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-white mt-1">{balance.remainingDays} days</p>
                      <p className="text-gray-500 text-xs mt-1">of {balance.maxDays} days</p>
                    </div>
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-r ${getBalanceColor(balance.percentage)} flex items-center justify-center text-xl lg:text-2xl shadow-lg`}>
                      {balance.percentage >= 80 ? '⚠️' : balance.percentage >= 50 ? '🟡' : '✅'}
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div 
                      className={`h-full bg-gradient-to-r ${getProgressColor(balance.percentage)} rounded-full transition-all duration-500`}
                      style={{ width: `${balance.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Used: {balance.usedDays} days</span>
                    <span>{balance.percentage.toFixed(1)}% used</span>
                  </div>
                  <p className={`text-xs font-medium ${
                    balance.remainingDays > balance.maxDays * 0.5 ? 'text-emerald-400' :
                    balance.remainingDays > balance.maxDays * 0.25 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {balance.remainingDays > balance.maxDays * 0.5 ? 'Good balance' :
                     balance.remainingDays > balance.maxDays * 0.25 ? 'Moderate balance' : 'Low balance'}
                  </p>
                </div>
              ))}
            </div>
          )} */}
          
          {/* Total Summary */}
          {/* {leaveBalance.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-gray-400 text-sm">Total Days Remaining</p>
                  <p className="text-2xl lg:text-3xl font-bold text-white">
                    {leaveBalance.reduce((total, balance) => total + balance.remainingDays, 0)} days
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Total Used</p>
                    <p className="text-white font-semibold">
                      {leaveBalance.reduce((total, balance) => total + balance.usedDays, 0)} days
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Total Allocated</p>
                    <p className="text-white font-semibold">
                      {leaveBalance.reduce((total, balance) => total + balance.maxDays, 0)} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div> */}

      {/* Admin View - Simple Table with All Leaves */}
      {user?.role === 'admin' ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          <div className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-white">All Leave Requests</h2>
              
              <div className="flex flex-wrap gap-3 items-center">
                {/* Download Template Button */}
                <button
                  onClick={async () => {
                    try {
                      const response = await leaveService.downloadTemplate();
                      const blob = new Blob([response.data], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'leave_upload_template.xlsx';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      showSuccess('Template downloaded successfully!');
                    } catch (error: any) {
                      console.error('Error downloading template:', error);
                      showError(error?.response?.data?.message || error?.message || 'Failed to download template');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Download Template
                </button>
                
                {/* Upload Button */}
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Past Leaves
                </button>
              
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (e.target.value) {
                        params.set('status', e.target.value);
                      } else {
                        params.delete('status');
                      }
                      params.set('page', '1'); // Reset to first page on filter change
                      router.push(`/dashboard/leave?${params.toString()}`);
                    }}
                    className="px-4 py-2 appearance-none rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Status &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
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

                {/* Leave Category Filter */}
                <div className="relative">
                  <select
                    value={leaveCategoryFilter}
                    onChange={(e) => {
                      setLeaveCategoryFilter(e.target.value);
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', '1'); // Reset to first page on filter change
                      router.push(`/dashboard/leave?${params.toString()}`);
                    }}
                    className="px-4 py-2 appearance-none rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Leave Types &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                    {leaveTypes.map((leaveType) => (
                      <option key={leaveType.id} value={leaveType.id.toString()}>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                </div>
              </div>
            </div>
            
            {(statusFilter || leaveCategoryFilter) && (
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                {statusFilter && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                    Status: {statusFilter}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('status');
                        params.set('page', '1');
                        router.push(`/dashboard/leave?${params.toString()}`);
                      }}
                      className="hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {leaveCategoryFilter && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                    Type: {leaveTypes.find(lt => lt.id.toString() === leaveCategoryFilter)?.name || 'Unknown'}
                    <button
                      onClick={() => {
                        setLeaveCategoryFilter('');
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', '1');
                        router.push(`/dashboard/leave?${params.toString()}`);
                      }}
                      className="hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Leave Requests</h3>
                <p className="text-gray-400">There are no leave requests in the system yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                       <th className="px-4 py-3 text-left text-white font-semibold text-sm">S.No</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Personnel</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Leave Type</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Dates</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Days</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Reason</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Status</th>
                      {/* <th className="px-4 py-3 text-left text-white font-semibold text-sm">Extensions</th> */}
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Approver Name</th>
                      <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredRequests.map((request: any,index:number) => (
                      <tr key={request.id} className="hover:bg-white/5 transition-colors">
                         <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">
                            {(page - 1) * limit + index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3">

                          <div className="text-sm font-medium text-white">{request.personnel?.name}</div>
                          <div className="text-xs text-gray-400">{request.personnel?.army_no}</div>
                          <div className="text-xs text-gray-500">{request.personnel?.rank}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">
                            {request.leave_type?.name || request.leaveType?.name || request.LeaveType?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{formatDate(request.start_date)}</div>
                          <div className="text-xs text-gray-400">to {formatDate(request.end_date)}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-base font-bold text-blue-400">
                            {request.total_days || calculateDays(request.start_date, request.end_date)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300 max-w-xs truncate">{request.reason}</div>
                          {request.rejection_reason && (
                            <div className="text-xs text-rose-400 mt-1">Rejection: {request.rejection_reason}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        {/* <td className="px-4 py-3">
                          {request.extensions && request.extensions.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Extended ({request.extensions.length})
                              </span>
                              {request.extensions.length <= 3 ? (
                                // Show all extensions if 3 or fewer
                                request.extensions.map((extension: any, index: number) => (
                                  <div key={extension.id} className="text-xs text-gray-400">
                                    +{extension.extension_days} days
                                  </div>
                                ))
                              ) : (
                                // Show first 2 and indicate more
                                <>
                                  {request.extensions.slice(0, 2).map((extension: any, index: number) => (
                                    <div key={extension.id} className="text-xs text-gray-400">
                                      +{extension.extension_days} days
                                    </div>
                                  ))}
                                  <div className="text-xs text-blue-400 cursor-pointer hover:text-blue-300" title={`Click to see all ${request.extensions.length} extensions`}>
                                    +{request.extensions.length - 2} more...
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td> */}
                        <td className="px-4 py-3">
                          {(request.approved_by_profile || request.approvedBy)?.name ? (
                            <div>
                              <div className="text-sm text-white">{(request.approved_by_profile || request.approvedBy).name}</div>
                              <div className="text-xs text-gray-400">{(request.approved_by_profile || request.approvedBy).rank}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {request.status === 'Pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleQuickApprove(request.id)}
                                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                              >
                                <Check className="w-4 h-4 inline mr-1" />
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedApproval(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-medium hover:bg-rose-500/30 transition-colors"
                              >
                                <XIcon className="w-4 h-4 inline mr-1" />
                                Reject
                              </button>
                            </div>
                          ) : (request.status === 'Approved' || request.status === 'approved' || request.status === 'Extended' || request.status === 'extended') ? (
                            <div className="flex gap-2">
                              {/* <span className="text-xs text-emerald-400 font-medium">Approved</span> */}
                              <button
                                onClick={() => handleExtendLeave(request)}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium hover:bg-blue-500/30 transition-colors"
                              >
                                Extend
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-300 text-sm">
                  Showing {filteredRequests.length} of {total} leave requests
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(Math.max(1, page - 1)));
                      router.push(`/dashboard/leave?${params.toString()}`);
                    }}
                    disabled={page === 1}
                    className="px-3 lg:px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('page', String(p));
                        router.push(`/dashboard/leave?${params.toString()}`);
                      }}
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
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', String(Math.min(totalPages, page + 1)));
                      router.push(`/dashboard/leave?${params.toString()}`);
                    }}
                    disabled={page === totalPages}
                    className="px-3 lg:px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Commander/Personnel View - Tabs and Content */
        <>
          {/* Tabs */}
          <div className="mb-6 lg:mb-8">
            <div className="flex flex-wrap gap-2 lg:gap-4 border-b border-white/10">
              {/* <button
                onClick={() => setActiveTab('my-requests')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  activeTab === 'my-requests'
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                My Requests
              </button> */}
              {user?.role === 'commander' && (
                <button
                  onClick={() => setActiveTab('approval-queue')}
                  className={`px-4 lg:px-6 py-2 lg:py-3 rounded-t-lg font-medium transition-all duration-200 ${
                    activeTab === 'approval-queue'
                      ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Approval Queue
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="p-4 lg:p-6">
          {/* My Requests Tab */}
          {activeTab === 'my-requests' && (
            <div>
              {myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Leave Requests</h3>
                  <p className="text-gray-400 mb-6">You haven't submitted any leave requests yet.</p>
                  {/* <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Create Your First Request
                  </button> */}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">S.No</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Leave Type</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Dates</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Days</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Reason</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Status</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Applied On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {myRequests.map((request,index) => (
                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-400">
                            {index+1}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {request.leave_type?.name || request.leaveType?.name || request.LeaveType?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                            <div className="text-base font-bold text-blue-400">
                              {request.total_days || calculateDays(request.start_date, request.end_date)}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <div className="text-sm text-gray-300 max-w-xs truncate">
                              {request.reason}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(request.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Approval Queue Tab - Commander Only */}
          {activeTab === 'approval-queue' && user?.role === 'commander' && (
            <div>
              {approvalQueue.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <CheckCircle2 className="w-16 h-16 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Pending Approvals</h3>
                  <p className="text-gray-400">All leave requests from your reportees have been processed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">S.No</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Personnel</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Leave Type</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Dates</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Days</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Reason</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Status</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Approver Name</th>
                        <th className="px-4 py-3 text-left text-white font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {approvalQueue.map((request: any,index:any) => (
                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-4 py-3">
                            <div className="text-sm text-gray-300 max-w-xs truncate">{index+1}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-white">{request.personnel?.name}</div>
                            <div className="text-xs text-gray-400">{request.personnel?.army_no}</div>
                            <div className="text-xs text-gray-500">{request.personnel?.rank}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-white">
                              {request.leave_type?.name || request.leaveType?.name || request.LeaveType?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-300">{formatDate(request.start_date)}</div>
                            <div className="text-xs text-gray-400">to {formatDate(request.end_date)}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 font-semibold">
                            {request.total_days || calculateDays(request.start_date, request.end_date)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-300 max-w-xs truncate">{request.reason}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(request.supervisor?.name && request.status=='Approved') ? (
                              <div>
                                <div className="text-sm text-white">{request.supervisor.name}</div>
                                <div className="text-xs text-gray-400">{request.supervisor.rank}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {request.status === 'Pending' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleQuickApprove(request.id)}
                                  className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                                >
                                  <Check className="w-4 h-4 inline mr-1" />
                                Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApproval(request);
                                    setShowApprovalModal(true);
                                  }}
                                  className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-medium hover:bg-rose-500/30 transition-colors"
                                >
                                  <XIcon className="w-4 h-4 inline mr-1" />
                                Reject
                                </button>
                              </div>
                            ) : (request.status === 'Approved' || request.status === 'Extended') ? (
                              <div className="flex gap-2">
                                <span className="text-xs text-emerald-400 font-medium">{request.status === 'Extended' ? 'Extended' : 'Approved'}</span>
                                {(user?.role === 'commander' || user?.role === 'admin') && (
                                  <button
                                    onClick={() => handleExtendLeave(request)}
                                    className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium hover:bg-blue-500/30 transition-colors"
                                  >
                                    Extend
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Admin Management Tab */}
          {activeTab === 'admin' && user?.role === 'admin' && (
            <div>
              {allRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <BarChart3 className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Leave Requests Found</h3>
                  <p className="text-gray-400">There are currently no leave requests in the system.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Employee</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Leave Type</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Dates</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Reason</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Status</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Extensions</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Applied On</th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {allRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {request.User?.profile?.name || request.User?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {request.User?.army_no}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {request.leave_type?.name || request.leaveType?.name || request.LeaveType?.name}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatDate(request.start_date)} - {formatDate(request.end_date)}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <div className="text-sm text-gray-300 max-w-xs truncate">
                              {request.reason}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            {request.extensions && request.extensions.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Extended ({request.extensions.length})
                                </span>
                                {request.extensions.length <= 3 ? (
                                  // Show all extensions if 3 or fewer
                                  request.extensions.map((extension: any, index: number) => (
                                    <div key={extension.id} className="text-xs text-gray-400">
                                      +{extension.extension_days} days
                                    </div>
                                  ))
                                ) : (
                                  // Show first 2 and indicate more
                                  <>
                                    {request.extensions.slice(0, 2).map((extension: any, index: number) => (
                                      <div key={extension.id} className="text-xs text-gray-400">
                                        +{extension.extension_days} days
                                      </div>
                                    ))}
                                    <div className="text-xs text-blue-400 cursor-pointer hover:text-blue-300" title={`Click to see all ${request.extensions.length} extensions`}>
                                      +{request.extensions.length - 2} more...
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                            {(request.status === 'Approved' || request.status === 'approved' || request.status === 'Extended' || request.status === 'extended') ? (
                              <button
                                onClick={() => handleExtendLeave(request)}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium hover:bg-blue-500/30 transition-colors"
                              >
                                Extend Leave
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {request.status}
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
          )}
            </div>
          </div>
        </>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border-white/20">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Create Leave Request...</h3>
              <form onSubmit={handleCreateRequest}>
                {approver && (
                  <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Approver
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {approver.role === 'admin' ? <Briefcase className="w-6 h-6" /> : <UserCog className="w-6 h-6" />}
                      </span>
                      <div className="text-base font-semibold text-white">{approver.name}</div>
                    </div>
                  </div>
                )}
                {!approver && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="text-xs text-yellow-400">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      No approver assigned. Please contact administrator.
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Leave Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.leave_type_id}
                    onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                    required
                  >
                    <option value="" className="bg-gray-800 text-white">Select Leave Type</option>
                    {leaveTypes.map((leaveType) => (
                      <option key={leaveType.id} value={leaveType.id} className="bg-gray-800 text-white">
                        {leaveType.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
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
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                    rows={3}
                    placeholder="Please provide a reason for your leave request"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border-white/20">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Reject Leave Request</h3>
              
              {/* Leave Details */}
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-sm text-gray-400">Personnel</div>
                <div className="text-white font-medium">{selectedApproval.personnel?.name || selectedApproval.User?.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(selectedApproval.start_date || selectedApproval.startDate)} - {formatDate(selectedApproval.end_date || selectedApproval.endDate)}
                </div>
              </div>

              <form onSubmit={handleReject}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rejection Reason <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    name="rejection_reason"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 text-white placeholder-gray-400"
                    rows={4}
                    placeholder="Please provide a reason for rejecting this leave request..."
                    required
                  />
                  <div className="text-xs text-gray-400 mt-1">This reason will be visible to the personnel.</div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApprovalModal(false);
                      setSelectedApproval(null);
                    }}
                    className="px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all duration-300"
                  >
                    Reject Leave
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`px-6 py-4 rounded-lg shadow-2xl border ${
            notificationType === 'success' 
              ? 'bg-emerald-500/20 border-emerald-500/30 backdrop-blur-xl' 
              : 'bg-rose-500/20 border-rose-500/30 backdrop-blur-xl'
          }`}>
            <div className="flex items-center gap-3">
              {/* <span className="text-2xl">
                {notificationType === 'success' ? '✅' : '❌'}
              </span> */}
              <div>
                <div className={`text-sm font-semibold ${
                  notificationType === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {notificationType === 'success' ? 'Success' : 'Error'}
                </div>
                <div className="text-white text-sm mt-0.5">{notificationMessage}</div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="ml-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Leave Modal */}
      {showExtendModal && selectedLeaveForExtension && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border-white/20">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Extend Leave Request</h3>
              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-300">
                  <div><strong>Employee:</strong> {selectedLeaveForExtension.User?.profile?.name || selectedLeaveForExtension.User?.name || selectedLeaveForExtension.personnel?.name || 'N/A'}</div>
                  <div><strong>Current End Date:</strong> {formatDate(selectedLeaveForExtension.end_date)}</div>
                  <div><strong>Leave Type:</strong> {selectedLeaveForExtension.leave_type?.name || selectedLeaveForExtension.LeaveType?.name || selectedLeaveForExtension.leaveType?.name}</div>
                </div>
              </div>
              <form onSubmit={handleExtendSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={extensionData.new_end_date}
                    onChange={(e) => setExtensionData({ ...extensionData, new_end_date: e.target.value })}
                    min={dayAfter(selectedLeaveForExtension.end_date)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Extension Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={extensionData.extension_reason}
                    onChange={(e) => setExtensionData({ ...extensionData, extension_reason: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                    rows={3}
                    placeholder="Please provide a reason for extending this leave"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Extend Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExtendModal(false);
                      setSelectedLeaveForExtension(null);
                      setExtensionData({ new_end_date: '', extension_reason: '' });
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className=" border-b border-white/10 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Upload Past Leave Details</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Bulk import leave records from Excel</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  disabled={uploading}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* File Upload Area */}
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
                      if (file) {
                        setUploadFile(file);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    {uploadFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                          <FileCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">{uploadFile.name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {(uploadFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors">
                          <Upload className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">Excel files (.xlsx, .xls) up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Format Requirements */}
              {/* <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Excel Format Requirements</h4>
                    <p className="text-xs text-gray-400">Ensure your Excel file contains these columns</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">army_no</p>
                      <p className="text-xs text-gray-400">Required - Personnel army number</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">leave_type_id</p>
                      <p className="text-xs text-gray-400">Required - Leave type ID</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">start_date</p>
                      <p className="text-xs text-gray-400">Required - YYYY-MM-DD format</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">end_date</p>
                      <p className="text-xs text-gray-400">Required - YYYY-MM-DD format</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">reason</p>
                      <p className="text-xs text-gray-400">Required - Leave reason</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">supervisor_id</p>
                      <p className="text-xs text-gray-400">Optional - Supervisor army number</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">status</p>
                      <p className="text-xs text-gray-400">Optional - Pending/Approved/Rejected</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-500/20 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-300">
                    <strong>Note:</strong> If status is "Approved", the leave will be automatically approved by admin and an approval record will be created.
                  </p>
                </div>
              </div> */}

              {/* Action Buttons */}
              <form onSubmit={handleBulkUpload} className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  {uploading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload File
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 