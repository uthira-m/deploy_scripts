"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { personnelService } from "@/lib/api";
import { formatDateShort, parseDate } from "@/lib/utils";
import { getServerDate } from "@/lib/serverTime";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNotification } from "@/contexts/NotificationContext";
import DateOfBirthInput from "@/components/DateOfBirthInput";

interface FamilyDetail {
  id: number;
  relationship_type: 'father' | 'mother' | 'spouse' | 'child' | 'brother' | 'sister';
  name: string;
  dob?: string;
  contact_number?: string;
  pan_card?: string;
  aadhar_card?: string;
  account_number?: string;
  blood_group?: string;
}

const MyFamilyDetailsPage = () => {
  const { user } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();

  const [familyDetails, setFamilyDetails] = useState<FamilyDetail[]>([]);
  const [personnelDateOfMarriage, setPersonnelDateOfMarriage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState<FamilyDetail | null>(null);

  const [formData, setFormData] = useState({
    relationship_type: '',
    name: '',
    dob: '',
    contact_number: '',
    pan_card: '',
    aadhar_card: '',
    account_number: '',
    blood_group: '',
  });

  const [validationErrors, setValidationErrors] = useState({
    aadhar_card: '',
    dob: '',
    pan_card: '',
    contact_number: '',
  });

  const validateAadharCard = (value: string) => {
    if (value && !/^\d{12}$/.test(value)) {
      return 'Aadhar card number must be exactly 12 digits';
    }
    return '';
  };

  const validatePanCard = (value: string) => {
    if (value && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
      return 'PAN card must be in format: AAAAA9999A (5 letters, 4 digits, 1 letter)';
    }
    return '';
  };

  const validateContactNumber = (value: string) => {
    if (value && value.length > 10) {
      return 'Contact number must be maximum 10 digits';
    }
    return '';
  };

  const validateDateOfBirth = (value: string) => {
    if (value) {
      const selectedDate = parseDate(value);
      const today = getServerDate();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      if (selectedDate && selectedDate > today) {
        return 'Date of birth cannot be in the future';
      }
    }
    return '';
  };

  const validateForm = () => {
    const errors = {
      aadhar_card: validateAadharCard(formData.aadhar_card),
      pan_card: validatePanCard(formData.pan_card),
      contact_number: validateContactNumber(formData.contact_number),
      dob: validateDateOfBirth(formData.dob),
    };

    setValidationErrors(errors);
    return !errors.aadhar_card && !errors.pan_card && !errors.contact_number && !errors.dob;
  };

  useEffect(() => {
    fetchFamilyDetails();
  }, []);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      // Get current user's personnel ID from their profile
      const profileResponse = await personnelService.getPersonalProfile();
      if (profileResponse.status === 'success' && profileResponse.data?.personnel) {
        const personnel = profileResponse.data.personnel as { id: number; date_of_marriage?: string };
        const personnelId = personnel.id;
        const dom = personnel?.date_of_marriage;
        setPersonnelDateOfMarriage(dom && String(dom).trim() ? String(dom) : null);
        const response = await personnelService.getPersonnelFamilyDetails(personnelId);
        if (response.status === 'success' && response.data) {
          setFamilyDetails(response.data.familyDetails || []);
        }
      }
    } catch (err: any) {
      notifyError(err.message || 'Failed to fetch family details');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      relationship_type: '',
      name: '',
      dob: '',
      contact_number: '',
      pan_card: '',
      aadhar_card: '',
      account_number: '',
      blood_group: '',
    });
    setValidationErrors({
      aadhar_card: '',
      pan_card: '',
      contact_number: '',
      dob: '',
    });
    setEditingDetail(null);
  };

  const handleAddFamilyDetail = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditFamilyDetail = (detail: FamilyDetail) => {
    setEditingDetail(detail);
    setFormData({
      relationship_type: detail.relationship_type,
      name: detail.name,
      dob: detail.dob || '',
      contact_number: detail.contact_number || '',
      pan_card: detail.pan_card || '',
      aadhar_card: detail.aadhar_card || '',
      account_number: detail.account_number || '',
      blood_group: detail.blood_group || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteFamilyDetail = async (detailId: number) => {
    if (!confirm('Are you sure you want to delete this family detail?')) return;

    try {
      await personnelService.deleteFamilyDetail(detailId);
      notifySuccess('Family detail deleted successfully');
      fetchFamilyDetails();
    } catch (err: any) {
      notifyError(err.message || 'Failed to delete family detail');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Spouse and child require personnel to have date of marriage
    const isSpouseOrChild = ['spouse', 'child'].includes(formData.relationship_type);
    if (isSpouseOrChild && !personnelDateOfMarriage) {
      notifyError('Spouse and Child can only be added when you have a Date of Marriage recorded in your profile.');
      return;
    }

    setSaving(true);

    try {
      // Get current user's personnel ID
      const profileResponse = await personnelService.getPersonalProfile();
      if (profileResponse.status === 'success' && profileResponse.data?.personnel) {
        const personnelId = profileResponse.data.personnel.id;

        if (editingDetail) {
          await personnelService.updateFamilyDetail(editingDetail.id, formData);
          notifySuccess('Family detail updated successfully');
        } else {
          await personnelService.createFamilyDetail(personnelId, formData);
          notifySuccess('Family detail added successfully');
        }

        setShowAddModal(false);
        resetForm();
        fetchFamilyDetails();
      }
    } catch (err: any) {
      notifyError(err.message || 'Failed to save family detail');
    } finally {
      setSaving(false);
    }
  };

  const getRelationshipLabel = (type: string) => {
    switch (type) {
      case 'father': return 'Father';
      case 'mother': return 'Mother';
      case 'spouse': return 'Spouse';
      case 'child': return 'Child';
      case 'brother': return 'Brother';
      case 'sister': return 'Sister';
      default: return type;
    }
  };

  const calculateAge = (dob: string | undefined): number | null => {
    if (!dob) return null;
    const birthDate = parseDate(dob);
    const today = getServerDate();
    if (!birthDate) return null;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const renderFamilyDetailCard = (detail: FamilyDetail) => {
    const isChild = detail.relationship_type.startsWith('child');
    const age = calculateAge(detail.dob);
    const initials = getInitials(detail.name);

    return (
      <div key={detail.id} className="relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-600/30">
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => handleEditFamilyDetail(detail)}
            className="px-3 py-1.5 bg-slate-600/70 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors duration-200"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteFamilyDetail(detail.id)}
            className="px-3 py-1.5 bg-red-600/70 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200"
            title="Delete"
          >
            Delete
          </button>
        </div>
        
        <div className="flex items-start gap-4 pr-24">
          {/* Circular Profile Picture */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0">
            {initials}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-white mb-3">
              {getRelationshipLabel(detail.relationship_type)}
            </h4>
            <div className="space-y-2 text-sm text-white/90">
              <div>
                <span className="text-white/70">Name: </span>
                <span className="font-medium">{detail.name || 'N/A'}</span>
              </div>
              {detail.dob && (
                <div>
                  <span className="text-white/70">Date of Birth: </span>
                  <span className="font-medium">{formatDateShort(detail.dob)}</span>
                  {isChild && age !== null && (
                    <span className="text-white/70 ml-2">({age} years)</span>
                  )}
                </div>
              )}
              {detail.contact_number && (
                <div>
                  <span className="text-white/70">Contact: </span>
                  <span className="font-medium">{detail.contact_number}</span>
                </div>
              )}
              {detail.pan_card && (
                <div>
                  <span className="text-white/70">PAN Card: </span>
                  <span className="font-medium">{detail.pan_card}</span>
                </div>
              )}
              {detail.aadhar_card && (
                <div>
                  <span className="text-white/70">Aadhar Card: </span>
                  <span className="font-medium">{detail.aadhar_card}</span>
                </div>
              )}
              {detail.account_number && (
                <div>
                  <span className="text-white/70">Account Number: </span>
                  <span className="font-medium">{detail.account_number}</span>
                </div>
              )}
              {detail.blood_group && (
                <div>
                  <span className="text-white/70">Blood Group: </span>
                  <span className="font-medium">{detail.blood_group}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getAvailableRelationshipTypes = () => {
    const existingTypes = familyDetails.map(d => d.relationship_type);
    const hasDateOfMarriage = !!personnelDateOfMarriage;
    // Spouse and child only available when personnel has date of marriage
    let allTypes = ['father', 'mother', 'brother', 'sister'];
    if (hasDateOfMarriage) {
      allTypes = ['father', 'mother', 'spouse', 'child', 'brother', 'sister'];
    }
    // Only remove Father, Mother, Spouse if already added (one per personnel). Always show Child, Brother, Sister.
    const typesToFilterIfExists = ['father', 'mother', 'spouse'];
    return allTypes.filter(type =>
      typesToFilterIfExists.includes(type) ? !existingTypes.includes(type as any) : true
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg font-medium">Loading family details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/my-profile"
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-white">Family Details</h1>
            </div>
            {familyDetails.length > 0 && (
              <button
                onClick={handleAddFamilyDetail}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-blue-600/25"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Family Member
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6">
          {familyDetails.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Family Details Recorded</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Add your family member details to keep track of important information including contact details, documents, and personal information.
                </p>
                <button
                  onClick={handleAddFamilyDetail}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-lg shadow-blue-600/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Family Member
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Father, Mother, Spouse (one each), then all Children, Brothers, Sisters - 2 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Father */}
                {familyDetails.find(d => d.relationship_type === 'father') && (
                  renderFamilyDetailCard(familyDetails.find(d => d.relationship_type === 'father')!)
                )}
                
                {/* Mother */}
                {familyDetails.find(d => d.relationship_type === 'mother') && (
                  renderFamilyDetailCard(familyDetails.find(d => d.relationship_type === 'mother')!)
                )}
                
                {/* Spouse */}
                {familyDetails.find(d => d.relationship_type === 'spouse') && (
                  renderFamilyDetailCard(familyDetails.find(d => d.relationship_type === 'spouse')!)
                )}
                
                {/* Children (multiple) */}
                {familyDetails.filter(d => d.relationship_type === 'child').map(detail => (
                  renderFamilyDetailCard(detail)
                ))}
                
                {/* Brothers (multiple) */}
                {familyDetails.filter(d => d.relationship_type === 'brother').map(detail => (
                  renderFamilyDetailCard(detail)
                ))}
                
                {/* Sisters (multiple) */}
                {familyDetails.filter(d => d.relationship_type === 'sister').map(detail => (
                  renderFamilyDetailCard(detail)
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {editingDetail ? 'Edit Family Member' : 'Add Family Member'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm font-medium">
                      Relationship Type *
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={formData.relationship_type}
                        onChange={(e) => setFormData({...formData, relationship_type: e.target.value})}
                        className="w-full appearance-none px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      >
                        <option value="">Select Relationship</option>
                        {editingDetail ? (
                          <option value={editingDetail.relationship_type}>
                            {getRelationshipLabel(editingDetail.relationship_type)}
                          </option>
                        ) : (
                          getAvailableRelationshipTypes().map(type => (
                            <option key={type} value={type}>
                              {getRelationshipLabel(type)}
                            </option>
                          ))
                        )}
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 mb-2 text-sm font-medium">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={formData.contact_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                        setFormData({...formData, contact_number: value});
                        setValidationErrors({...validationErrors, contact_number: validateContactNumber(value)});
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter contact number (max 10 digits)"
                      maxLength={10}
                    />
                    {validationErrors.contact_number && (
                      <p className="text-red-400 text-sm mt-1">{validationErrors.contact_number}</p>
                    )}
                  </div>

                  {/* Show date of birth for all relationship types */}
                  {formData.relationship_type && (
                    <div>
                      <DateOfBirthInput
                        value={formData.dob}
                        onChange={(value) => {
                          setFormData({...formData, dob: value});
                          setValidationErrors({...validationErrors, dob: validateDateOfBirth(value)});
                        }}
                        label="Date of Birth"
                        minAge={0}
                        maxAge={100}
                        error={validationErrors.dob}
                        className="px-4 py-3 rounded-lg bg-slate-700 border-slate-600"
                      />
                    </div>
                  )}
                </div>

                {/* Show additional fields for all relationship types */}
                {formData.relationship_type && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">
                          PAN Card Number
                        </label>
                        <input
                          type="text"
                          value={formData.pan_card}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Only allow letters and digits, convert to uppercase
                            setFormData({...formData, pan_card: value});
                            setValidationErrors({...validationErrors, pan_card: validatePanCard(value)});
                          }}
                          className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter PAN card (AAAAA9999A)"
                          maxLength={10}
                        />
                        {validationErrors.pan_card && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.pan_card}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">
                          Aadhar Card Number
                        </label>
                        <input
                          type="text"
                          value={formData.aadhar_card}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                            setFormData({...formData, aadhar_card: value});
                            setValidationErrors({...validationErrors, aadhar_card: validateAadharCard(value)});
                          }}
                          className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter Aadhar card number (12 digits)"
                          maxLength={12}
                        />
                        {validationErrors.aadhar_card && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.aadhar_card}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={formData.account_number}
                          onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter account number"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">
                          Blood Group
                        </label>
                        <select
                          value={formData.blood_group}
                          onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors duration-200 font-medium border border-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
                  >
                    {saving
                      ? (editingDetail ? 'Updating...' : 'Adding...')
                      : (editingDetail ? 'Update Member' : 'Add Member')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default MyFamilyDetailsPage;
