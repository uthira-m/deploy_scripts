"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import RemarksTooltip from "@/components/RemarksTooltip";
import { courseService, api } from "@/lib/api";
import { paginationConfig } from "@/config/pagination";

interface Course {
  id: number;
  course_code: string;
  course_title: string;
  start_date?: string;
  end_date?: string;
  remarks?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(paginationConfig.DEFAULT_PAGE);
  const [limit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    course_title: "",
    remarks: ""
  });
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
  const { user, logout } = useAuth();
  const { canModify, isAdmin } = usePermissions();

  // Fetch courses data on component mount and when page/search changes
  useEffect(() => {
    fetchCourses();
  }, [page, searchTerm]);

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

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await api.get(`/courses?${params.toString()}`);
      
      if (response.status === 'success' && response.data) {
        setCourses(response.data.courses || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotal(response.data.pagination?.total || 0);
      } else {
        setError("Failed to fetch courses data");
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      if (err.message.includes('Authentication failed')) {
        setError("Session expired. Please login again.");
      } else if (err.message.includes('401')) {
        setError("Authentication failed. Please check your login status.");
      } else {
        setError(err.message || "Failed to fetch courses data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setError("");
      
      if (editingCourse) {
        // Update existing course
        const response = await courseService.updateCourse(editingCourse.id, formData);
        
        if (response.status === 'success') {
          setSuccess("Course updated successfully");
          setShowEditForm(false);
          setEditingCourse(null);
          resetForm();
          fetchCourses();
        } else {
          setError(response.message || "Failed to update course");
        }
      } else {
        // Create new course
        const response = await courseService.createCourse(formData);
        
        if (response.status === 'success') {
          setSuccess("Course created successfully");
          setShowAddForm(false);
          resetForm();
          fetchCourses();
        } else {
          setError(response.message || "Failed to create course");
        }
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      setError(err.message || "Failed to save course");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_title: course.course_title,
      remarks: course.remarks || ""
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (courseId: number) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Course",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        try {
          setError("");
          const response = await courseService.deleteCourse(courseId);
      
          if (response.status === 'success') {
            setSuccess("Course deleted successfully");
            fetchCourses();
          } else {
            setError(response.message || "Failed to delete course");
          }
        } catch (err: any) {
          console.error('Error deleting course:', err);
          setError(err.message || "Failed to delete course");
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      course_title: "",
      remarks: ""
    });
    setEditingCourse(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingCourse(null);
    resetForm();
  };


  // Search and filtering is now handled by backend
  const filteredCourses = courses;

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
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

        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Course Management</h1>
          <p className="text-gray-300 text-sm lg:text-base">Manage military courses and training programs</p>
        </div>

        {/* Add Course Button - Only for Admin */}
        {canModify && (
          <div className="mb-6 lg:mb-8">
            <button
              onClick={handleAddClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Course
            </button>
          </div>
        )}
        
        {/* View-Only Notice for Commander/Personnel */}
        {!canModify && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg">
            <p className="text-sm">📖 You are viewing courses in read-only mode. Contact an administrator to make changes.</p>
          </div>
        )}

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(paginationConfig.DEFAULT_PAGE);
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
              />
            </div>
            {/* <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-gray-700 border cursor-pointer border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Courses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select> */}
          </div>
        </div>


        {/* Courses Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading courses data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">S.No</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Course Title</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Remarks</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Status</th>
                    {canModify && <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-sm lg:text-base">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={canModify ? 5 : 4} className="px-4 lg:px-6 py-8 text-center text-gray-400">
                        {courses.length === 0 ? "No courses found." : "No courses match your search criteria"}
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((course,index) => (
                      <tr key={course.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-mono text-sm lg:text-base"># {(page - 1) * limit + index + 1}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm lg:text-base">{course.course_title}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-300 text-sm lg:text-base max-w-xs">
                          {course.remarks ? (
                            <RemarksTooltip text={course.remarks} truncateAt={50}>
                              <div className="truncate cursor-help">
                                {course.remarks.length > 50 
                                  ? `${course.remarks.substring(0, 50)}...` 
                                  : course.remarks
                                }
                              </div>
                            </RemarksTooltip>
                          ) : (
                            '--'
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.is_active 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {course.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {canModify && (
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEdit(course)}
                                className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors" 
                                title="Edit"
                              >
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(course.id)}
                                className="text-red-400  hover:text-red-300 transition-colors cursor-pointer" 
                                title="Delete"
                              >
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm">
              Showing {filteredCourses.length} of {total} courses
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

        {/* Add/Edit Course Modal */}
        {(showAddForm || showEditForm) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                  </h2>
                  <button
                    onClick={editingCourse ? handleCancelEdit : () => setShowAddForm(false)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-200 mb-1">Course Title <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.course_title}
                      onChange={(e) => setFormData({...formData, course_title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-200 mb-1">Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes or remarks"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-3 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                    </button>
                    <button
                      type="button"
                      onClick={editingCourse ? handleCancelEdit : () => setShowAddForm(false)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      Cancel
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