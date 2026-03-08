"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { Pagination } from "@/components/Pagination";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import DateOfEntryInput from "@/components/DateOfEntryInput";
import { adminsService, api, dashboardService } from "@/lib/api";
import { paginationConfig } from "@/config/pagination";
import { validatePersonnelDob } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  company_personnel?: Array<{ company_id?: number; company?: { id: number; company_name: string } }>;
  dynamic_status?: string;
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
}

interface Company {
  id: number;
  company_name: string;
}

export default function AdminsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    army_no: "",
    name: "",
    role: "Admin",
    rank: "General",
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
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const router = useRouter();
  const { user } = useAuth();
  const { canModify, isAdmin } = usePermissions();
  const startIndex = (page - 1) * limit;

  useEffect(() => {
    if (isAdmin) {
      fetchAdmins();
      fetchCompanies();
    }
  }, [page, limit, searchTerm, isAdmin]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminsService.getAllAdmins(page, limit, searchTerm);
      if (response.status === 'success' && response.data) {
        setPersonnel(response.data.personnel || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotal(response.data.pagination?.total || 0);
      } else {
        setError("Failed to fetch admins data");
      }
    } catch (err: any) {
      if (err.message.includes('Authentication failed')) {
        setError("Session expired. Please login again.");
      } else {
        setError(err.message || "Failed to fetch admins data");
      }
    } finally {
      setLoading(false);
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
        rank: "General"
      };
      
      if (editingPersonnel) {
        const response = await adminsService.updateAdmin(editingPersonnel.id, cleanedFormData);
        if (response.status === 'success') {
          setShowAddForm(false);
          setEditingPersonnel(null);
          resetForm();
          await fetchAdmins();
        } else {
          setError(response.message || "Failed to update admin");
        }
      } else {
        const response = await adminsService.createAdmin(cleanedFormData);
        if (response.status === 'success') {
          setShowAddForm(false);
          resetForm();
          await fetchAdmins();
        } else {
          setError(response.message || "Failed to create admin");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save admin");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Admin",
      message: "Are you sure you want to delete this admin? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          const response = await adminsService.deleteAdmin(id);
          if (response.status === 'success') {
            await fetchAdmins();
          } else {
            setError(response.message || "Failed to delete admin");
          }
        } catch (err: any) {
          setError(err.message || "Failed to delete admin");
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      army_no: "",
      name: "",
      role: "Admin",
      rank: "General",
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
    const personAny = person as any;
    const firstCompanyId = personAny.company_personnel?.[0]?.company_id ?? personAny.company_personnel?.[0]?.company?.id ?? person.companies?.[0]?.id;
    const userRole = (person as any).user?.role;
    setFormData({
      army_no: person.army_no || "",
      name: person.name || "",
      role: userRole === "super_admin" ? "Super Admin" : "Admin",
      rank: person.rankInfo?.name || person.rank || "General",
      unit: person.unit || "",
      email: person.email || "",
      phone: person.phone || "",
      dob: person.dob || "",
      doe: person.doe || "",
      company_id: firstCompanyId?.toString() || ""
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
    // API returns company_personnel with nested company
    const companies = (person as any).company_personnel?.map((cp: any) => cp.company).filter((c: any) => c) || person.companies || [];
    if (companies.length === 0) return "-";
    return companies.map((c: any) => c.company_name).join(", ");
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Access Denied. Admin access required.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Admins page: only accessible if user name is "Super Admin" (check by name, not role)
  if (user?.name !== "Super Admin") {
    return (
      <ProtectedRoute>
        <div className="mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Access Denied. Super Admin access required.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
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

        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Admins Management</h1>
          <p className="text-gray-300 text-sm lg:text-base">Manage admin records and information</p>
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
              Add Admin
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-4 lg:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by Admin Id"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading admins...</p>
          </div>
        ) : personnel.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No admins found</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">S.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Admin Id</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300  tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {personnel.map((person, index) => (
                    <tr key={person.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{person.army_no || '-'}</td>
                      <td className="px-4 py-3 text-sm text-white">{person.name || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3 ">
                          <Link
                            href={`/dashboard/personnel/${person.id}?from=admins`}
                            className="text-blue-400 hover:text-blue-300 hidden transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {canModify && (
                            <>
                              {/* <button
                                onClick={() => handleEdit(person)}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button> */}
                              {user?.id !== person.user_id && (
                                <button
                                  onClick={() => handleDelete(person.id)}
                                  className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
          className="mt-6"
        />

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingPersonnel ? 'Edit Admin' : 'Add New Admin'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Army No<span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.army_no}
                      onChange={(e) => setFormData({ ...formData, army_no: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Admin Name <span className="text-red-400">*</span></label>
                    <select
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Select Name</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
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
                      className="px-4 py-2 bg-gray-700/50 border-gray-600"
                      required
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
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <div className="relative">
                      <select
                        value={formData.company_id}
                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                        className="w-full px-4 py-2 pr-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="">Select Company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>{company.company_name}</option>
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
                  </div> */}
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
      </div>
    </ProtectedRoute>
  );
}


