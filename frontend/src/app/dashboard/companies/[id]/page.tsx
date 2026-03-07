"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import ConfirmModal from '@/components/ConfirmModal';
import { useNotification } from '@/contexts/NotificationContext';

interface CompanyPersonnel {
  id: number;
  role: string;
  appointment_date: string;
  status: string;
  personnel: {
    id: number;
    army_no: string;
    name: string;
    rank: string;
    status: string;
  };
}

interface Company {
  id: number;
  company_name: string;
  company_code: string;
  company_type: string;
  status: string;
  personnelCategoryBreakdown?: string;
  personnelCategoryBreakdownNumeric?: string;
  personnelCategoryCounts?: Record<string, number>;
  company_personnel: CompanyPersonnel[];
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: notifyError } = useNotification();
  const { canModify, canAssignCompany } = usePermissions();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState<{ show: boolean; personnel: any | null }>({
    show: false,
    personnel: null
  });

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetails();
    }
  }, [params.id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/company/${params.id}`);
      if (response.status === 'success') {
        setCompany(response.data.company);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch company details');
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (personnel: any) => {
    setRemoveConfirm({ show: true, personnel });
  };

  const handleRemovePersonnel = async () => {
    if (!removeConfirm.personnel) return;

    try {
      await api.delete(`/company/${params.id}/personnel/${removeConfirm.personnel.personnel.id}`);
      setRemoveConfirm({ show: false, personnel: null });
      fetchCompanyDetails(); // Refresh the data
      success('Personnel removed from company successfully!');
    } catch (err: any) {
      notifyError(err.response?.data?.message || 'Failed to remove personnel');
      setRemoveConfirm({ show: false, personnel: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/dashboard/companies')}
            className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
          >
            ← Back to Companies
          </button>
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error || 'Company not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/companies')}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Companies
        </button>

        {/* Company Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">{company.company_name}
          </h1>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Personnel Strength</p>
            <p className="text-xl font-semibold text-blue-400">
              {company.personnelCategoryBreakdownNumeric || '00-00-00'}
            </p>
          </div>
            {/* <span className={`px-6 py-1 ml-4 inline-flex text-xs leading-5 font-semibold rounded-full  ${
                company.status === 'Active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {company.status}
              </span> */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-gray-400 text-sm">Company Code</p>
              <p className="text-white font-medium">{company.company_code}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Type</p>
              <p className="text-white font-medium">{company.company_type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                company.status === 'Active'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}>
                {company.status}
              </span>
            </div>
          </div> */}
        </div>

        {/* View-Only Notice for Commander/Personnel */}
        {!canAssignCompany && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
            <p className="text-sm">📖 You are viewing this company in read-only mode. Contact an administrator to assign or remove personnel.</p>
          </div>
        )}

        {/* Commander Details Card */}
        {company.company_personnel?.find(cp => cp.role === 'Commander' && cp.status === 'Active') && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Company Commander</h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold">
                Commander
              </span>
            </div>
            {(() => {
              const commander = company.company_personnel.find(cp => cp.role === 'Commander' && cp.status === 'Active');
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Army No</p>
                    <p className="text-white font-medium">{commander?.personnel.army_no}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-semibold">{commander?.personnel.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Rank</p>
                    <p className="text-white font-medium">{commander?.personnel.rank}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Appointment Date</p>
                    <p className="text-white font-medium">
                      {commander ? new Date(commander.appointment_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '--'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Assigned Personnel List (Excluding Commander) */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Assigned Personnel</h2>
            <p className="text-gray-400 text-sm mt-1">
              Total: {company.company_personnel?.filter(cp => cp.role !== 'Commander').length || 0} personnel
            </p>
          </div>

          {!company.company_personnel || company.company_personnel.filter(cp => cp.role !== 'Commander').length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">No other personnel assigned to this company</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Army No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Appointment Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    {/* {canAssignCompany && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    )} */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {company.company_personnel
                    .filter(cp => cp.role !== 'Commander')
                    .map((cp) => (
                    <tr key={cp.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">{cp.personnel?.army_no}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white">{cp.personnel?.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">{cp.personnel?.rank}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cp.role === 'Second-in-Command'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {cp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {new Date(cp.appointment_date).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cp.status === 'Active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {cp.status}
                        </span>
                      </td>
                      {/* {canAssignCompany && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => confirmRemove(cp)}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      )} */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        isOpen={removeConfirm.show}
        title="Remove Personnel from Company"
        message={removeConfirm.personnel ? `Are you sure you want to remove ${removeConfirm.personnel.personnel.name} from this company? This will remove them completely from the company roster.` : ''}
        onConfirm={handleRemovePersonnel}
        onCancel={() => setRemoveConfirm({ show: false, personnel: null })}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
}

