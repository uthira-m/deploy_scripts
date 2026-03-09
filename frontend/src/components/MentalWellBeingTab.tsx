"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { personnelService } from "@/lib/api";
import { formatDate, toDateInputValue } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";

interface MentalWellBeingRecord {
  id: number;
  person_id: number;
  last_assessment_date: string | null;
  assessment_conducted_by: string | null;
  mental_status: "Green" | "Yellow" | "Orange" | "Red" | null;
  overall_stress_level: "Low" | "Moderate" | "High" | null;
  primary_stress_factors: string | null;
  sleep_quality: string | null;
  fatigue_level: string | null;
  counseling_required: boolean | null;
  counseling_conducted: boolean | null;
  counseling_date: string | null;
  behavioral_observations: string | null;
  welfare_interaction_date: string | null;
  follow_up_required: boolean | null;
  operational_readiness_recommendation: string | null;
  next_review_date: string | null;
  remarks: string | null;
  deployment_duration_days: number | null;
  leave_gap_days: number | null;
  stress_risk_alert: string | null;
  medical_officer_remarks: string | null;
}

interface MentalWellBeingTabProps {
  personId: number;
  canEdit: () => boolean;
}

type FormState = {
  last_assessment_date: string;
  assessment_conducted_by: string;
  mental_status: string;
  overall_stress_level: string;
  primary_stress_factors: string;
  sleep_quality: string;
  fatigue_level: string;
  counseling_required: "true" | "false";
  counseling_conducted: "true" | "false";
  counseling_date: string;
  behavioral_observations: string;
  welfare_interaction_date: string;
  follow_up_required: "true" | "false";
  operational_readiness_recommendation: string;
  next_review_date: string;
  remarks: string;
  stress_risk_alert: string;
};

const defaultFormState: FormState = {
  last_assessment_date: "",
  assessment_conducted_by: "",
  mental_status: "",
  overall_stress_level: "",
  primary_stress_factors: "",
  sleep_quality: "",
  fatigue_level: "",
  counseling_required: "false",
  counseling_conducted: "false",
  counseling_date: "",
  behavioral_observations: "",
  welfare_interaction_date: "",
  follow_up_required: "false",
  operational_readiness_recommendation: "",
  next_review_date: "",
  remarks: "",
  stress_risk_alert: "Normal",
};

function computeStressRiskAlert(
  overall_stress_level: string,
  sleep_quality: string,
  fatigue_level: string
): string {
  if (
    overall_stress_level === "High" &&
    sleep_quality.trim().toLowerCase() === "poor"
  ) {
    return "High Risk";
  }
  if (fatigue_level === "High") {
    return "Medium Risk";
  }
  return "Normal";
}

function getStatusColor(mental_status: string | null | undefined) {
  switch (mental_status) {
    case "Green":
      return { bg: "#16a34a1a", border: "#16a34a33", text: "#16a34a" };
    case "Yellow":
      return { bg: "#eab3081a", border: "#eab30833", text: "#eab308" };
    case "Orange":
      return { bg: "#f973161a", border: "#f9731633", text: "#f97316" };
    case "Red":
      return { bg: "#dc26261a", border: "#dc262633", text: "#dc2626" };
    default:
      return {
        bg: "rgba(148, 163, 184, 0.15)",
        border: "rgba(148, 163, 184, 0.35)",
        text: "#e5e7eb",
      };
  }
}

export default function MentalWellBeingTab({
  personId,
  canEdit,
}: MentalWellBeingTabProps) {
  const [records, setRecords] = useState<MentalWellBeingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: number | null }>({
    show: false,
    id: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await personnelService.getMentalWellBeing(personId);
        if (res.status === "success" && res.data) {
          const data = res.data as any;
          const raw = data?.mentalWellBeing ?? data?.records ?? data;
          setRecords(Array.isArray(raw) ? raw : []);
        } else {
          setError(res.message || "Failed to load mental well-being data");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load mental well-being data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [personId]);

  const resetForm = () => {
    setFormState(defaultFormState);
    setFormErrors({});
    setSubmitError(null);
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (record: MentalWellBeingRecord) => {
    const toStr = (v: any) => (v == null ? "" : String(v));
    setFormState({
      last_assessment_date: toDateInputValue(record.last_assessment_date),
      assessment_conducted_by: toStr(record.assessment_conducted_by),
      mental_status: toStr(record.mental_status),
      overall_stress_level: toStr(record.overall_stress_level),
      primary_stress_factors: toStr(record.primary_stress_factors),
      sleep_quality: toStr(record.sleep_quality),
      fatigue_level: toStr(record.fatigue_level),
      counseling_required: record.counseling_required ? "true" : "false",
      counseling_conducted: record.counseling_conducted ? "true" : "false",
      counseling_date: toDateInputValue(record.counseling_date),
      behavioral_observations: toStr(record.behavioral_observations),
      welfare_interaction_date: toDateInputValue(record.welfare_interaction_date),
      follow_up_required: record.follow_up_required ? "true" : "false",
      operational_readiness_recommendation: toStr(
        record.operational_readiness_recommendation
      ),
      next_review_date: toDateInputValue(record.next_review_date),
      remarks: toStr(record.remarks),
      stress_risk_alert: record.stress_risk_alert || "Normal",
    });
    setFormErrors({});
    setEditingId(record.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const nextState = { ...formState, [name]: value };

    if (
      name === "overall_stress_level" ||
      name === "sleep_quality" ||
      name === "fatigue_level"
    ) {
      nextState.stress_risk_alert = computeStressRiskAlert(
        nextState.overall_stress_level,
        nextState.sleep_quality,
        nextState.fatigue_level
      );
    }

    setFormState(nextState);
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formState.last_assessment_date) {
      errors.last_assessment_date = "Last assessment date is required";
    }
    if (!formState.assessment_conducted_by) {
      errors.assessment_conducted_by = "Assessment conducted by is required";
    }
    if (!formState.mental_status) {
      errors.mental_status = "Mental status is required";
    }
    if (!formState.overall_stress_level) {
      errors.overall_stress_level = "Overall stress level is required";
    }

    if (
      formState.counseling_conducted === "true" &&
      !formState.counseling_date
    ) {
      errors.counseling_date = "Counseling date is required when conducted";
    }

    if (formState.last_assessment_date && formState.next_review_date) {
      const last = new Date(formState.last_assessment_date);
      const next = new Date(formState.next_review_date);
      if (!(next > last)) {
        errors.next_review_date =
          "Next review date must be greater than last assessment date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    const payload: any = {
      person_id: personId,
      last_assessment_date: formState.last_assessment_date || null,
      assessment_conducted_by: formState.assessment_conducted_by || null,
      mental_status: formState.mental_status || null,
      overall_stress_level: formState.overall_stress_level || null,
      primary_stress_factors: formState.primary_stress_factors || null,
      sleep_quality: formState.sleep_quality || null,
      fatigue_level: formState.fatigue_level || null,
      counseling_required: formState.counseling_required === "true",
      counseling_conducted: formState.counseling_conducted === "true",
      counseling_date: formState.counseling_date || null,
      behavioral_observations: formState.behavioral_observations || null,
      welfare_interaction_date: formState.welfare_interaction_date || null,
      follow_up_required: formState.follow_up_required === "true",
      operational_readiness_recommendation:
        formState.operational_readiness_recommendation || null,
      next_review_date: formState.next_review_date || null,
      remarks: formState.remarks || null,
      stress_risk_alert: computeStressRiskAlert(
        formState.overall_stress_level,
        formState.sleep_quality,
        formState.fatigue_level
      ),
    };

    try {
      let res;
      if (editingId) {
        res = await personnelService.updateMentalWellBeing(editingId, payload);
      } else {
        res = await personnelService.createMentalWellBeing(payload);
      }

      if (res.status === "success" && res.data) {
        const data = res.data as any;
        const raw = data?.mentalWellBeing ?? data?.records;
        if (Array.isArray(raw)) {
          setRecords(raw);
        } else if (raw && typeof raw === "object" && "id" in raw) {
          // Backend returns single record for create/update
          const updated = raw as MentalWellBeingRecord;
          if (editingId) {
            setRecords((prev) =>
              prev.map((r) => (r.id === editingId ? updated : r))
            );
          } else {
            setRecords((prev) => [updated, ...prev]);
          }
        }
        closeForm();
      } else {
        setSubmitError(res.message || "Failed to save record");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: number) => {
    setDeleteConfirm({ show: true, id });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    const id = deleteConfirm.id;
    try {
      const res = await personnelService.deleteMentalWellBeing(id);
      if (res.status === "success") {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirm({ show: false, id: null });
      } else {
        setError(res.message || "Failed to delete record");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete record");
    }
  };

  const renderStatusBadge = (status: string | null | undefined) => {
    const { bg, border, text } = getStatusColor(status);
    return (
      <span
        className="inline-flex px-3 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: bg,
          border: `1px solid ${border}`,
          color: text,
        }}
      >
        {status || "N/A"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg lg:text-xl font-semibold text-white">
          Mental Well-Being
        </h3>
        {canEdit() && (
          <button
            onClick={openAddForm}
            className="px-4 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium cursor-pointer text-sm"
          >
             Add Mental Well-Being Record
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-gray-300 text-sm">
            Loading mental well-being records...
          </div>
        ) : !Array.isArray(records) || records.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No mental well-being records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-xs lg:text-sm">
                    Last Assessment Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-xs lg:text-sm">
                    Mental Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-xs lg:text-sm">
                    Overall Stress Level
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-xs lg:text-sm">
                    Counseling Required
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-white font-semibold text-xs lg:text-sm">
                    Next Review Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-white font-semibold text-xs lg:text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(Array.isArray(records) ? records : []).map((record) => {
                  const isExpanded = expandedId === record.id;
                  return (
                    <React.Fragment key={record.id}>
                      <tr
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedId((prev) =>
                            prev === record.id ? null : record.id
                          )
                        }
                      >
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-200 text-sm">
                          {record.last_assessment_date
                            ? formatDate(record.last_assessment_date)
                            : "-"}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm">
                          {renderStatusBadge(record.mental_status)}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-200 text-sm">
                          {record.overall_stress_level || "-"}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-200 text-sm">
                          {record.counseling_required ? "Yes" : "No"}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-200 text-sm">
                          {record.next_review_date
                            ? formatDate(record.next_review_date)
                            : "-"}
                        </td>
                        <td
                          className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end space-x-3">
                            <button
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() =>
                                setExpandedId((prev) =>
                                  prev === record.id ? null : record.id
                                )
                              }
                            >
                              {isExpanded ? "Collapse" : "Expand"}
                            </button>
                            {canEdit() && (
                              <>
                                <button
                                  className="text-emerald-400 hover:text-emerald-300"
                                  onClick={() => openEditForm(record)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => openDeleteConfirm(record.id)}
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-900/60">
                          <td
                            colSpan={6}
                            className="px-4 lg:px-6 pb-6 pt-0 text-sm text-gray-200"
                          >
                            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 mb-1">
                                  Assessment Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="text-gray-400">
                                      Conducted By:{" "}
                                    </span>
                                    {record.assessment_conducted_by || "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Mental Status:{" "}
                                    </span>
                                    {renderStatusBadge(record.mental_status)}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Overall Stress Level:{" "}
                                    </span>
                                    {record.overall_stress_level || "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Stress Risk:{" "}
                                    </span>
                                    {record.stress_risk_alert || "Normal"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 mb-1">
                                  Symptoms & Factors
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="text-gray-400">
                                      Primary Stress Factors:{" "}
                                    </span>
                                    {record.primary_stress_factors || "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Sleep Quality:{" "}
                                    </span>
                                    {record.sleep_quality || "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Fatigue Level:{" "}
                                    </span>
                                    {record.fatigue_level || "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Behavioral Observations:{" "}
                                    </span>
                                    {record.behavioral_observations || "-"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 mb-1">
                                  Counseling & Welfare
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="text-gray-400">
                                      Counseling Required:{" "}
                                    </span>
                                    {record.counseling_required ? "Yes" : "No"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Counseling Conducted:{" "}
                                    </span>
                                    {record.counseling_conducted ? "Yes" : "No"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Counseling Date:{" "}
                                    </span>
                                    {record.counseling_date
                                      ? formatDate(record.counseling_date)
                                      : "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Welfare Interaction Date:{" "}
                                    </span>
                                    {record.welfare_interaction_date
                                      ? formatDate(
                                          record.welfare_interaction_date
                                        )
                                      : "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Follow-up Required:{" "}
                                    </span>
                                    {record.follow_up_required ? "Yes" : "No"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 mb-1">
                                  Recommendations & Admin
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="text-gray-400">
                                      Operational Readiness Recommendation:{" "}
                                    </span>
                                    {record.operational_readiness_recommendation ||
                                      "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Next Review Date:{" "}
                                    </span>
                                    {record.next_review_date
                                      ? formatDate(record.next_review_date)
                                      : "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Deployment Duration (days):{" "}
                                    </span>
                                    {record.deployment_duration_days ?? "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Leave Gap (days):{" "}
                                    </span>
                                    {record.leave_gap_days ?? "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Medical Officer Remarks:{" "}
                                    </span>
                                    {record.medical_officer_remarks || "-"}
                                  </p>
                                  <p>
                                    <span className="text-gray-400">
                                      Remarks:{" "}
                                    </span>
                                    {record.remarks || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm  flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-4 lg:p-6 w-full max-w-4xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                {editingId
                  ? "Edit Mental Well-Being Record"
                  : "Add Mental Well-Being Record"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Last Mental Well-Being Assessment Date *
                  </label>
                  <input
                    type="date"
                    name="last_assessment_date"
                    value={formState.last_assessment_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                  {formErrors.last_assessment_date && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.last_assessment_date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Assessment Conducted By *
                  </label>
                  <input
                    type="text"
                    name="assessment_conducted_by"
                    maxLength={150}
                    value={formState.assessment_conducted_by}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                  {formErrors.assessment_conducted_by && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.assessment_conducted_by}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Mental Well-Being Status *
                  </label>
                  <div className="relative">
                    <select
                      name="mental_status"
                      value={formState.mental_status}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select</option>
                      <option value="Green">Green</option>
                      <option value="Yellow">Yellow</option>
                      <option value="Orange">Orange</option>
                      <option value="Red">Red</option>
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
                  {formErrors.mental_status && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.mental_status}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Overall Stress Level *
                  </label>
                  <div className="relative">
                    <select
                      name="overall_stress_level"
                      value={formState.overall_stress_level}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
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
                  {formErrors.overall_stress_level && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.overall_stress_level}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Primary Stress Factors
                  </label>
                    <input
                    type="text"
                    name="primary_stress_factors"
                    value={formState.primary_stress_factors}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Sleep Quality
                  </label>
                  <div className="relative">
                    <select
                      name="sleep_quality"
                      value={formState.sleep_quality}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Poor">Poor</option>
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
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Fatigue Level
                  </label>
                  <div className="relative">
                    <select
                      name="fatigue_level"
                      value={formState.fatigue_level}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
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
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Counseling Required
                  </label>
                  <div className="relative">
                    <select
                      name="counseling_required"
                      value={formState.counseling_required}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
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
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Counseling Conducted
                  </label>
                  <div className="relative">
                    <select
                      name="counseling_conducted"
                      value={formState.counseling_conducted}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 pr-10 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
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
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Counseling Date
                  </label>
                  <input
                    type="date"
                    name="counseling_date"
                    value={formState.counseling_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                  {formErrors.counseling_date && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.counseling_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Welfare Interaction Date
                  </label>
                  <input
                    type="date"
                    name="welfare_interaction_date"
                    value={formState.welfare_interaction_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                <div className="relative">
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Follow-up Required
                  </label>
                  <select
                    name="follow_up_required"
                    value={formState.follow_up_required}
                    onChange={handleChange}
                    className="w-full appearance-none px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                   <svg
                      className="absolute right-3 top-13 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Next Review Date
                  </label>
                  <input
                    type="date"
                    name="next_review_date"
                    value={formState.next_review_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  />
                  {formErrors.next_review_date && (
                    <p className="text-xs text-red-400 mt-1">
                      {formErrors.next_review_date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 text-sm font-medium">
                    Stress Risk Alert (auto)
                  </label>
                  <input
                    type="text"
                    name="stress_risk_alert"
                    value={formState.stress_risk_alert}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-gray-300 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-200 mb-2 text-sm font-medium">
                  Behavioral Observations
                </label>
                <textarea
                  name="behavioral_observations"
                  value={formState.behavioral_observations}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-200 mb-2 text-sm font-medium">
                  Operational Readiness Recommendation
                </label>
                <textarea
                  name="operational_readiness_recommendation"
                  value={formState.operational_readiness_recommendation}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-200 mb-2 text-sm font-medium">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formState.remarks}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-3 cursor-pointer text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? editingId
                      ? "Updating..."
                      : "Saving..."
                    : editingId
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </form>
            </div>
          </div>,
          document.body
        )}

      <ConfirmModal
        isOpen={deleteConfirm.show}
        title="Delete Mental Well-Being Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: null })}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
}
