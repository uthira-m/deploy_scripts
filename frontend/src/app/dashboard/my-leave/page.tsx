"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getServerDate } from '@/lib/serverTime';
import { formatDate, parseDate } from '@/lib/utils';
import { Briefcase, UserCog,FileText } from 'lucide-react';

interface LeaveType {
  id: number;
  name: string;
  max_days: number;
}

interface LeaveRequest {
  id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  createdAt: string;
  leaveType: LeaveType;
  supervisor: {
    id: number;
    army_no: string;
    name: string;
  };
}

interface Commander {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  unit?: string;
  role: string;
  company?: string;
  company_id?: number;
}

// Static leave types data
const STATIC_LEAVE_TYPES: LeaveType[] = [
 
];

export default function MyLeavePage() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(STATIC_LEAVE_TYPES);
  const [approver, setApprover] = useState<any>(null);
  const [commanders, setCommanders] = useState<Commander[]>([]);
  const [selectedCommander, setSelectedCommander] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    supervisor_id: ''
  });

  useEffect(() => {
    if (user?.role) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
        setNotificationMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Helper function to show notifications
  const showNotificationMessage = (message: string, type: 'success' | 'error' = 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch leave requests based on role: personnel=own only, commander=assigned personnel, admin=all
      const endpoint = user?.role === 'admin'
        ? '/leave/requests/all'
        : user?.role === 'commander'
          ? '/leave/requests/commander'
          : '/leave/requests/my';
      const leaveRequestsRes = await api.get(endpoint);
      // Go backend returns { data: { leaveRequests: [...], pagination: {...} } } or { leaveRequests, pagination }
      const rawData = leaveRequestsRes.data;
      const leaveRequestsArray = Array.isArray(rawData) ? rawData : (rawData?.leaveRequests ?? []);
      setLeaveRequests(leaveRequestsArray);
      

      // Fetch leave types
      const leaveTypesRes = await api.get('/leave/types');
      if (leaveTypesRes.data) {
        setLeaveTypes(leaveTypesRes.data);
      }

      // Fetch approver/commanders based on role
      if (user?.role === 'personnel') {
        try {
          const commandersRes = await api.get('/leave/my-commanders');
          if (commandersRes.success && commandersRes.data?.commanders) {
            setCommanders(commandersRes.data.commanders);
            // Set default approver to first commander
            if (commandersRes.data.commanders.length > 0) {
              const firstCommander = commandersRes.data.commanders[0];
              setApprover(firstCommander);
              setSelectedCommander(firstCommander.id);
              setFormData(prev => ({ ...prev, supervisor_id: firstCommander.id.toString() }));
            }
          } else if (!commandersRes.success) {
            // Show error message when no commanders found
            showNotificationMessage(commandersRes.message || 'No commanders found for your company', 'error');
          }
        } catch (error) {
          console.error('Error fetching commanders:', error);
          showNotificationMessage('Failed to fetch commander information', 'error');
        }
      } else {
        // For non-personnel, use the regular approver endpoint
        try {
          const approverRes = await api.get('/leave/my-approver');
          if (approverRes.success && approverRes.data) {
            setApprover(approverRes.data);
          } else if (!approverRes.success) {
            showNotificationMessage(approverRes.message || 'No approver found', 'error');
          }
        } catch (error) {
          console.error('Error fetching approver:', error);
          showNotificationMessage('Failed to fetch approver information', 'error');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason
      };
      
      // Add supervisor_id only if it's set (for personnel with multiple commanders)
      if (formData.supervisor_id) {
        submitData.supervisor_id = parseInt(formData.supervisor_id);
      }
      
      await api.post('/leave/requests', submitData);
      setShowForm(false);
      setFormData({ leave_type_id: '', start_date: '', end_date: '', reason: '', supervisor_id: commanders.length > 0 ? commanders[0].id.toString() : '' });
      fetchData();
      showSuccess('Leave request submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      const errorMessage = error?.message || 'Failed to submit leave request';
      showError(errorMessage);
      // Show alert for conflict errors
      if (errorMessage.includes("already assigned") || errorMessage.includes("already on")) {
        alert(errorMessage);
      }
    }
  };

  const handleCommanderChange = (commanderId: number) => {
    setSelectedCommander(commanderId);
    setFormData(prev => ({ ...prev, supervisor_id: commanderId.toString() }));
    const commander = commanders.find(c => c.id === commanderId);
    if (commander) {
      setApprover(commander);
    }
  };

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

  const formatApplyDate = (dateStr?: string | null): string => {
    if (!dateStr) return '-';
    const result = formatDate(dateStr);
    return result === '--' ? '-' : result;
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return 0;
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'rejected': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (isLoading) {
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">My Leave Requests</h1>
        <p className="text-gray-300 text-sm lg:text-base">Manage your leave applications and view their status</p>
      </div>

      {/* Approver Info Card */}
      {approver && (
        <div className="mb-6 lg:mb-8 p-4 lg:p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl rounded-xl border border-blue-500/20 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              {approver.role === 'admin' ? <Briefcase className="w-6 h-6 text-blue-400" /> : <UserCog className="w-6 h-6 text-blue-400" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300">
                Commander Name
                {/* <span className="ml-3 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  {approver.role === 'admin' ? 'Admin' : 'Commander'}
                </span> */}
              </h3>
              <p className="text-lg font-bold text-white mt-1">{approver.name}</p>
            </div>
          </div>
          
          {/* Show dropdown if multiple commanders */}
          {commanders.length > 1 ? (
            <div className="ml-12 mb-3">
              <label className="block text-xs text-gray-400 mb-2">Select Commander:</label>
              <div className="relative">
                <select
                  value={selectedCommander || ''}
                  onChange={(e) => handleCommanderChange(parseInt(e.target.value))}
                  className="w-full appearance-none px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-400"
                >
                  {commanders.map((commander) => (
                    <option key={commander.id} value={commander.id} className="bg-gray-800 text-white">
                      {commander.name} - {commander.rank} ({commander.army_no})
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
          ) : null}
          
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
            {approver.company && (
              <div>
                <span className="text-gray-400">Company:</span>
                <span className="text-white ml-2 font-medium">{approver.company}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!approver && !isLoading && (
        <div className="mb-6 lg:mb-8 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-yellow-400">No Commander Assigned</h3>
              <p className="text-xs text-gray-400 mt-1">
                {user?.role === 'personnel' 
                  ? 'Please contact administrator to set up your reporting relationship.'
                  : 'No admin found in the system.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply for Leave Button */}
      <div className="mb-6 lg:mb-8">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Apply for Leave
        </button>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
        <div className="p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Leave Requests History</h3>
          
          {leaveRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <FileText className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Leave Requests</h3>
              <p className="text-gray-400">You haven't submitted any leave requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">S.No</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Leave Type</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Duration</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Days</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Reason</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Status</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Extensions</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Approver Name</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Applied Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {leaveRequests.map((request,index) => (
                    <tr key={request.id} className="hover:bg-white/5 transition-colors">
                       <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-semibold text-center">
                                 {index+1}
                                </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {request.leave_type?.name || request.leaveType?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {formatApplyDate(request.start_date)} - {formatApplyDate(request.end_date)}
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
                        {request.status === 'Rejected' && (request as any).rejection_reason && (
                          <div className="text-xs text-rose-400 mt-1">
                            Reason: {(request as any).rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        {(request as any).extensions && (request as any).extensions.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Extended ({(request as any).extensions.length})
                            </span>
                            {(request as any).extensions.length <= 3 ? (
                              // Show all extensions if 3 or fewer
                              (request as any).extensions.map((extension: any, index: number) => (
                                <div key={extension.id} className="text-xs text-gray-400">
                                  +{extension.extension_days} days
                                </div>
                              ))
                            ) : (
                              // Show first 2 and indicate more
                              <>
                                {(request as any).extensions.slice(0, 2).map((extension: any, index: number) => (
                                  <div key={extension.id} className="text-xs text-gray-400">
                                    +{extension.extension_days} days
                                  </div>
                                ))}
                                <div className="text-xs text-blue-400 cursor-pointer hover:text-blue-300" title={`Click to see all ${(request as any).extensions.length} extensions`}>
                                  +{(request as any).extensions.length - 2} more...
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        {(
                          (request.status?.toLowerCase?.() === 'approved' && ((request as any).approved_by_profile || (request as any).approvedBy)?.name) ? (
                            <div>
                              <div className="text-sm text-white">{((request as any).approved_by_profile || (request as any).approvedBy).name}</div>
                              <div className="text-xs text-gray-400">{((request as any).approved_by_profile || (request as any).approvedBy).rank}</div>
                            </div>
                          ) : (request as any).supervisor?.name ? (
                            <div>
                              <div className="text-sm text-white">{(request as any).supervisor.name}</div>
                              <div className="text-xs text-gray-400">{(request as any).supervisor.rank}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatApplyDate((request as any).created_at ?? (request as any).createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply for Leave Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-xl border-white/20">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Apply for Leave</h3>
              
              {/* Show approver info in modal */}
              {approver && (
                <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Approver
                  </label>
                  <div className="flex items-center gap-2">
                    {approver.role === 'admin' ? <Briefcase className="w-5 h-5 text-blue-400" /> : <UserCog className="w-5 h-5 text-blue-400" />}
                    <div className="text-base font-semibold text-white">{approver.name}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {approver.rank} - {approver.army_no}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Leave Type <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.leave_type_id}
                      onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                      required
                    >
                    <option value="" className="bg-gray-800 text-white">Select Leave Type</option>
                    {leaveTypes.map((leaveType) => (
                      <option key={leaveType.id} value={leaveType.id} className="bg-gray-800 text-white">
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={getServerDate().toISOString().split('T')[0]}
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
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || getServerDate().toISOString().split('T')[0]}
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
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-300 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Submit Request
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
                onClick={() => {
                  setShowNotification(false);
                  setNotificationMessage('');
                }}
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
    </div>
  );
}
