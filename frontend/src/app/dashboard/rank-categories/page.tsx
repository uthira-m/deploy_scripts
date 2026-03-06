"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { rankCategoryService } from "@/lib/api";
import { Award } from 'lucide-react';

interface RankCategory {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ranks?: {
    id: number;
    name: string;
    is_active: boolean;
  }[];
}

export default function RankCategoriesPage() {
  const [rankCategories, setRankCategories] = useState<RankCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RankCategory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<RankCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(paginationConfig.DEFAULT_PAGE);
  const [limit] = useState(paginationConfig.DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { user } = useAuth();
  const { canModify } = usePermissions();

  const [formData, setFormData] = useState({
    name: "",
    is_active: true
  });

  // Fetch rank categories on mount and when page/search changes
  useEffect(() => {
    fetchRankCategories();
  }, [page, searchTerm]);

  const fetchRankCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await api.get(`/rank-categories?${params.toString()}`);
      
      if (response.status === 'success' && response.data) {
        setRankCategories(response.data.rankCategories || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error: any) {
      console.error('Error fetching rank categories:', error);
      setError(error.response?.data?.message || 'Failed to fetch rank categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      if (editingCategory) {
        // Update existing category
        const response = await rankCategoryService.updateRankCategory(editingCategory.id, formData);
        if (response.status === 'success') {
          setSuccess('Rank category updated successfully');
          await fetchRankCategories();
          handleCancel();
        }
      } else {
        // Create new category
        const response = await rankCategoryService.createRankCategory(formData);
        if (response.status === 'success') {
          setSuccess('Rank category created successfully');
          await fetchRankCategories();
          handleCancel();
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save rank category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: RankCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      is_active: category.is_active
    });
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = (category: RankCategory) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setFormLoading(true);
      const response = await rankCategoryService.deleteRankCategory(categoryToDelete.id);
      if (response.status === 'success') {
        setSuccess('Rank category deleted successfully');
        await fetchRankCategories();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete rank category');
    } finally {
      setFormLoading(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      is_active: true
    });
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Search is now handled by backend, no client-side filtering needed
  const filteredCategories = rankCategories;

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="mx-auto p-4 lg:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Loading ranks...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Ranks Management
          </h1>
          <p className="text-gray-300 text-sm lg:text-base">
            View and manage ranks organized by categories
          </p>
        </div>

        {/* Add Category Button */}
        {canModify && (
          <div className="mb-6 lg:mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Rank Category
            </button>
          </div>
        )}

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

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ranks and categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(paginationConfig.DEFAULT_PAGE);
              }}
              className="w-full px-4 py-3 pl-10 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories and Ranks List */}
        <div className="grid gap-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Award className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Ranks Found</h3>
              <p className="text-gray-300">
                {searchTerm ? "No ranks match your search criteria" : "No ranks available"}
              </p>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                {/* Category Title Only */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  {category.name}
                </h3>

                {/* Ranks List - Simple */}
                {category.ranks && category.ranks.length > 0 ? (
                  <div className="space-y-1">
                    {category.ranks
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((rank) => (
                        <div key={rank.id} className="text-gray-300 pl-4">
                          • {rank.name}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-gray-400 pl-4">
                    No ranks in this category
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-300 text-sm">
              Showing {filteredCategories.length} of {total} rank categories
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

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {editingCategory ? 'Edit Rank Category' : 'Add New Rank Category'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>


                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {formLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
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
          isOpen={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Rank Category"
          message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </ProtectedRoute>
  );
}
