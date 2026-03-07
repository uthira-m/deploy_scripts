"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import ConfirmModal from '@/components/ConfirmModal';
import { useNotification } from '@/contexts/NotificationContext';
import { Building2 } from 'lucide-react';

interface Company {
  id: number;
  company_name: string;
  created_at: string;
  updated_at: string;
  personnelCategoryBreakdown?: string;
  personnelCategoryBreakdownNumeric?: string;
  personnelCategoryCounts?: Record<string, number>;
  commander?: {
    id: number;
    personnel_id: number;
    personnel: {
      id: number;
      army_no: string;
      name: string;
      rank: string;
    };
  };
}

interface CompanyFormData {
  company_name: string;
}

interface Personnel {
  id: number;
  army_no: string;
  name: string;
  rank: string;
  status: string;
}

interface AssignmentFormData {
  personnel_id: string;
  appointment_date: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const { success, error: notifyError } = useNotification();
  const { canModify, canAssignCompany } = usePermissions();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; company: Company | null }>({
    show: false,
    company: null
  });

  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: ''
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [personnelLoading, setPersonnelLoading] = useState(false);
  const [assignmentData, setAssignmentData] = useState<AssignmentFormData>({
    personnel_id: '',
    appointment_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100');

      const response = await api.get(`/company?${params.toString()}`);
      if (response.status === 'success') {
        // Add commander info to each company
        const companiesWithCommander = response.data.companies.map((company: any) => {
          const commander = company.company_personnel?.find((cp: any) => cp.role === 'Commander' && cp.status === 'Active');
          return {
            ...company,
            commander: commander || null
          };
        });
        setCompanies(companiesWithCommander);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      company_name: ''
    });
    setEditingCompany(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.put(`/company/${editingCompany.id}`, formData);
      } else {
        // Generate company_code from company name (first 3 letters + random number)
        const namePrefix = formData.company_name.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(Math.random() * 1000);
        const company_code = `${namePrefix}-${randomNum}`;
        
        await api.post('/company', {
          ...formData,
          company_code: company_code,
          company_type: 'Other', // Default type
          status: 'Active' // Default status
        });
      }

      setShowModal(false);
      resetForm();
      fetchCompanies();
      success(editingCompany ? 'Company updated successfully!' : 'Company created successfully!');
    } catch (err: any) {
      notifyError(err.response?.data?.message || 'Failed to save company');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.company) return;
    
    try {
      await api.delete(`/company/${deleteConfirm.company.id}`);
      setDeleteConfirm({ show: false, company: null });
      fetchCompanies();
      success('Company deleted successfully!');
    } catch (err: any) {
      notifyError(err.response?.data?.message || 'Failed to delete company');
    }
  };

  const confirmDelete = (company: Company) => {
    setDeleteConfirm({ show: true, company });
  };

  const handleAssign = async (company: Company) => {
    setSelectedCompany(company);
    setShowAssignModal(true);
    setPersonnelLoading(true);
    
    // Pre-select commander if exists, otherwise reset
    if (company.commander) {
      setAssignmentData({
        personnel_id: company.commander.personnel_id.toString(),
        appointment_date: new Date().toISOString().split('T')[0]
      });
    } else {
      setAssignmentData({
        personnel_id: '',
        appointment_date: new Date().toISOString().split('T')[0]
      });
    }
    
    await fetchCompanyPersonnel(company.id);
  };

  const fetchCompanyPersonnel = async (companyId: number) => {
    try {
      const response = await api.get(`/company/${companyId}`);
      if (response.status === 'success') {
        // Get personnel assigned to this company - filter to Officers rank category only (exclude JCO and Other Ranks)
        const allPersonnel = response.data.company.company_personnel
          ?.filter((cp: any) => cp.personnel)
          ?.map((cp: any) => ({
            id: cp.personnel.id,
            army_no: cp.personnel?.army_no,
            name: cp.personnel.name,
            rank: cp.personnel.rank,
            status: cp.personnel.status,
            rankCategoryName: cp.personnel.rank_info?.category?.name
          })) || [];
        const officersOnly = allPersonnel.filter((p: { rankCategoryName?: string }) => p.rankCategoryName === 'Officers');
        setPersonnel(officersOnly);
        setPersonnelLoading(false);
      }
    } catch (err: any) {
      console.error('Error fetching company personnel:', err);
      setPersonnelLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      await api.post(`/company/${selectedCompany.id}/personnel`, {
        personnel_id: parseInt(assignmentData.personnel_id), // Convert to integer
        appointment_date: assignmentData.appointment_date,
        role: 'Commander' // Assign as Company Commander
      });
      setShowAssignModal(false);
      setAssignmentData({
        personnel_id: '',
        appointment_date: new Date().toISOString().split('T')[0]
      });
      setPersonnel([]);
      await fetchCompanies(); // Refresh companies to update button state
      success('Commander assigned successfully!');
    } catch (err: any) {
      console.error('Assign error:', err);
      notifyError(err.response?.data?.message || 'Failed to assign personnel');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Companies</h1>
          <p className="text-gray-300 text-sm lg:text-base">Manage company records and information</p>
        </div>

        {/* Add Company Button - Only for Admin */}
        {canModify && (
          <div className="mb-6 lg:mb-8">
            <button
              onClick={handleAddNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Company
            </button>
          </div>
        )}
        
        {/* View-Only Notice for Commander/Personnel */}
        {!canModify && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
            <p className="text-sm">📖 You are viewing companies in read-only mode. Contact an administrator to make changes.</p>
          </div>
        )}

        {/* Search */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 mb-6 shadow-lg">
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Companies Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading companies...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Building2 className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-400">No companies found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                      Strength (Off-JCO-OR)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                      Commander
                    </th>
                    {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                      Created Date
                    </th> */}
                     {canAssignCompany && (
                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                         Assign Commander
                       </th>
                     )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                      View
                    </th>
                    {canModify && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300  tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {companies.map((company, index) => (
                    <tr key={company.id} className=" transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white">{company.company_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-blue-300">
                          {company.personnelCategoryBreakdownNumeric || '00-00-00'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {company.commander?.personnel ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {company.commander.personnel.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {company.commander.personnel.rank} • {company.commander.personnel.army_no}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Not assigned</span>
                        )}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {new Date(company.created_at).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      </td> */}
                      {canAssignCompany && (
                        <td className="px-6 py-4 whitespace-nowrap">
                         {company.commander ? (
                              <button
                                onClick={() => handleAssign(company)}
                                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg transition-colors"
                                title={`Commander: ${company.commander.personnel?.name ?? 'Unknown'}`}
                              >
                                Assigned
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAssign(company)}
                                className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg transition-colors"
                              >
                                Assign
                              </button>
                            )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => router.push(`/dashboard/companies/${company.id}`)}
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                      {canModify && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(company)}
                              className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(company)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {/* Company Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  {editingCompany ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Personnel Modal */}
      {showAssignModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {selectedCompany.commander ? 'Update' : 'Assign'} Company Commander - {selectedCompany.company_name}
              </h2>
              {selectedCompany.commander && (
                <p className="text-sm text-gray-400 mt-2">
                  Current Commander: {selectedCompany.commander.personnel?.name ?? 'Unknown'}
                </p>
              )}
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-6">
              <div className="space-y-4">
                {/* Personnel Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Personnel <span className="text-red-400">*</span>
                  </label>
                  {personnelLoading ? (
                    <div className="text-gray-400">Loading personnel...</div>
                  ) : personnel.length === 0 ? (
                    <div className="text-amber-400 text-sm">
                      No officers in this company. Only Officers rank category can be assigned as Commander. Add officers to the company first.
                    </div>
                  ) : (
                    <>
                      <select
                      value={assignmentData.personnel_id}
                      onChange={(e) => setAssignmentData({ ...assignmentData, personnel_id: e.target.value })}
                      required
                      className="w-full appearance-none px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Personnel</option>
                      {personnel.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.army_no} - {person.name} ({person.rank})
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
                    </>
                  
                    
                  )}
                </div>

                {/* Appointment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Appointment Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={assignmentData.appointment_date}
                    onChange={(e) => setAssignmentData({ ...assignmentData, appointment_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  {selectedCompany?.commander ? 'Update Commander' : 'Assign Commander'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCompany(null);
                    setPersonnel([]);
                    setAssignmentData({
                      personnel_id: '',
                      appointment_date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Company"
        message={deleteConfirm.company ? `Are you sure you want to delete ${deleteConfirm.company.company_name}? This action cannot be undone.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, company: null })}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}

