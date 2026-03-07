"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { rankService, rankCategoryService, api } from "@/lib/api";
import { Award } from 'lucide-react';

interface Rank {
  id: number;
  name: string;
  category_id?: number;
  hierarchy_order: number;
  description?: string;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
    description?: string;
    hierarchy_order: number;
  };
}

interface RankCategory {
  id: number;
  name: string;
  description?: string;
  hierarchy_order: number;
  is_active: boolean;
}

export default function RanksPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [rankCategories, setRankCategories] = useState<RankCategory[]>([]);
  const [personnelCounts, setPersonnelCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rankToDelete, setRankToDelete] = useState<Rank | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { user } = useAuth();
  const { canModify } = usePermissions();
  const hasInitiallyLoaded = useRef(false);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    is_active: true
  });

  // Fetch data on component mount and when search changes
  useEffect(() => {
    fetchRanks();
    fetchRankCategories();
    fetchPersonnelCounts();
  }, [searchTerm]);

  const fetchRanks = async () => {
    try {
      if (!hasInitiallyLoaded.current) {
        setLoading(true);
      }
      const params = new URLSearchParams({
        page: '1',
        limit: '1000', // Fetch all ranks in single page
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await api.get(`/ranks?${params.toString()}`);
      
      if (response.status === 'success' && response.data) {
        setRanks(response.data.ranks || []);
      }
    } catch (error: any) {
      console.error('Error fetching ranks:', error);
      setError(error.response?.data?.message || 'Failed to fetch ranks');
    } finally {
      setLoading(false);
      hasInitiallyLoaded.current = true;
    }
  };

  const fetchRankCategories = async () => {
    try {
      const response = await rankCategoryService.getAllRankCategories();
      if (response.status === 'success') {
        setRankCategories(response.data.rankCategories);
      }
    } catch (error: any) {
      console.error('Error fetching rank categories:', error);
    }
  };

  const fetchPersonnelCounts = async () => {
    try {
      const response = await api.get('/ranks/personnel-counts');
      if (response.status === 'success' && response.data?.counts) {
        const counts: Record<number, number> = {};
        for (const [rankId, count] of Object.entries(response.data.counts)) {
          counts[Number(rankId)] = Number(count);
        }
        setPersonnelCounts(counts);
      }
    } catch (error: any) {
      console.error('Error fetching personnel counts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) {
      setError('Name and category are required');
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      if (editingRank) {
        // Update existing rank
        const response = await rankService.updateRank(editingRank.id, formData);
        if (response.status === 'success') {
          setSuccess('Rank updated successfully');
          await fetchRanks();
          await fetchPersonnelCounts();
          handleCancel();
        }
      } else {
        // Create new rank
        const response = await rankService.createRank(formData);
        if (response.status === 'success') {
          setSuccess('Rank created successfully');
          await fetchRanks();
          await fetchPersonnelCounts();
          handleCancel();
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save rank');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (rank: Rank) => {
    setEditingRank(rank);
    setFormData({
      name: rank.name,
      category_id: rank.category_id?.toString() || "",
      is_active: rank.is_active
    });
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = (rank: Rank) => {
    setRankToDelete(rank);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!rankToDelete) return;

    try {
      setFormLoading(true);
      const response = await rankService.deleteRank(rankToDelete.id);
      if (response.status === 'success') {
        setSuccess('Rank deleted successfully');
        await fetchRanks();
        await fetchPersonnelCounts();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete rank');
    } finally {
      setFormLoading(false);
      setShowDeleteModal(false);
      setRankToDelete(null);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRank(null);
    setFormData({
      name: "",
      category_id: "",
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

  // Filter ranks by category (client-side filter, search is handled by backend)
  const filteredRanks = ranks.filter(rank => {
    const matchesCategory = !selectedCategory || rank.category_id?.toString() === selectedCategory;
    return matchesCategory;
  });

  // Group ranks by category
  const ranksByCategory = filteredRanks.reduce((acc, rank) => {
    const categoryName = rank.category?.name || 'No Category';
    const hierarchyOrder = rank.category?.hierarchy_order || 999;
    if (!acc[categoryName]) {
      acc[categoryName] = { ranks: [], hierarchyOrder };
    }
    acc[categoryName].ranks.push(rank);
    return acc;
  }, {} as Record<string, { ranks: Rank[], hierarchyOrder: number }>);

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
            Manage military ranks organized by categories. Counts show total personnel per rank.
          </p>
        </div>

        {/* Add Rank Button */}
        {canModify && (
          <div className="mb-6 lg:mb-8">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Rank
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

        {/* Search and Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ranks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {rankCategories
                .filter(category => category.is_active)
                .sort((a, b) => a.hierarchy_order - b.hierarchy_order)
                .map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Ranks List */}
        <div className="grid gap-6">
          {Object.keys(ranksByCategory).length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <Award className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Ranks Found</h3>
              <p className="text-gray-300">
                {searchTerm || selectedCategory ? "No ranks match your search criteria" : "No ranks available"}
              </p>
            </div>
          ) : (
            Object.entries(ranksByCategory)
              .sort(([, a], [, b]) => a.hierarchyOrder - b.hierarchyOrder)
              .map(([categoryName, categoryData]) => (
                <div key={categoryName} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                  {/* Category Title */}
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {categoryName}
                  </h3>

                  {/* Ranks List */}
                  <div className="space-y-1">
                    {categoryData.ranks
                      .sort((a, b) => {
                        const RANK_ORDER: Record<string, number> = {
                          'Colonel': 1, 'Lieutenant Colonel': 2, 'Major': 3, 'Captain': 4, 'Lieutenant': 5,
                          'Subedar Major': 1, 'Subedar': 2, 'Naib Subedar': 3,
                          'Havaldar': 1, 'Lance Havaldar': 2, 'Naik': 3, 'Lance Naik': 4, 'Rifleman': 5, 'Agniveer': 6
                        };
                        const order = (r: Rank) => { const o = (r as any).order ?? r.hierarchy_order; return (o != null && o > 0) ? o : (RANK_ORDER[r.name?.trim() ?? ''] ?? 999); };
                        return order(a) - order(b);
                      })
                        .map((rank) => (
                        <div key={rank.id} className="flex justify-between items-center text-gray-300 pl-4 py-1 hover:bg-white/5 rounded">
                          <span>• {rank.name} <span className="text-blue-400 font-medium">({personnelCounts[rank.id] ?? 0})</span></span>
                          {canModify && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(rank)}
                                className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                title="Edit rank"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(rank)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                                title="Delete rank"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingRank ? 'Edit Rank' : 'Add New Rank'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  >
                    <option value="" className="bg-gray-800 text-white">Select Category</option>
                    {rankCategories
                      .filter(category => category.is_active)
                      .sort((a, b) => a.hierarchy_order - b.hierarchy_order)
                      .map((category) => (
                        <option key={category.id} value={category.id} className="bg-gray-800 text-white">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rank Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    placeholder="Enter rank name"
                  />
                </div>

              

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    {formLoading ? 'Saving...' : (editingRank ? 'Update' : 'Create')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
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
          title="Delete Rank"
          message={`Are you sure you want to delete "${rankToDelete?.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </ProtectedRoute>
  );
}
