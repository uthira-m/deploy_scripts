"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { dataManagementService, downloadBackup, type BackupItem } from "@/lib/api";
import { Download, RefreshCw, Loader2, Trash2 } from "lucide-react";

export default function DataManagementPage() {
  const { user } = useAuth();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dataManagementService.listBackups();
      if (res.status === "success" && res.data?.backups) {
        setBackups(res.data.backups);
      } else {
        setBackups([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load backups");
      setBackups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleTriggerBackup = async () => {
    try {
      setTriggering(true);
      setError(null);
      setSuccess(null);
      const res = await dataManagementService.triggerBackup();
      if (res.status === "success") {
        setSuccess(res.data?.filename ? `Backup created: ${res.data.filename}` : "Backup created successfully.");
        await fetchBackups();
      } else {
        setError(res.message || "Backup failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Backup failed");
    } finally {
      setTriggering(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      setDownloading(filename);
      setError(null);
      await downloadBackup(filename);
      setSuccess(`Downloaded ${filename}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const { filename } = deleteConfirm;
    try {
      setDeleting(filename);
      setError(null);
      const res = await dataManagementService.deleteBackup(filename);
      if (res.status === "success") {
        setSuccess(`Deleted ${filename}`);
        setDeleteConfirm(null);
        await fetchBackups();
      } else {
        setError(res.message || "Delete failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const isAdmin = user?.role === "admin";

  const formatDateReadable = (dateStr: string): string => {
    if (!dateStr) return "--";
    // Backup format: YYYY-MM-DD-HH-MM-SS (e.g. 2026-03-04-17-04-05)
    let iso = dateStr;
    const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})-(\d{2})$/);
    if (match) {
      iso = `${match[1]}T${match[2]}:${match[3]}:${match[4]}`;
    } else if (dateStr.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      iso = dateStr + "T00:00:00";
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Data Management</h1>
          <p className="text-gray-300 text-sm lg:text-base">
            Database dump and image backups. Last 15 days listed. Automatic backup daily at 10:00 PM IST.
          </p>
        </div>

        {/* Run Backup Button */}
        {isAdmin && (
          <div className="mb-6 lg:mb-8">
            <button
              onClick={handleTriggerBackup}
              disabled={triggering}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {triggering ? "Creating backup…" : "Run backup now"}
            </button>
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

        {/* Backups Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white text-lg">Backups (last 15 days)</h2>
            <p className="text-sm text-gray-400 mt-1">
              Each file is <code className="bg-slate-700/80 px-1.5 py-0.5 rounded text-gray-300">data.zip</code> containing{" "}
              <code className="bg-slate-700/80 px-1.5 py-0.5 rounded text-gray-300">Data.sql</code> and{" "}
              <code className="bg-slate-700/80 px-1.5 py-0.5 rounded text-gray-300">images.zip</code>.
            </p>
          </div>
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading backups…</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">No backups found. Run a backup to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {backups.map((item) => (
                    <tr key={item.filename} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-white">{item.filename}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">{formatDateReadable(item.date)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(item.filename)}
                            disabled={downloading === item.filename}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
                          >
                            {downloading === item.filename ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Download
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteConfirm({ filename: item.filename })}
                              disabled={deleting === item.filename}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
                            >
                              {deleting === item.filename ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteConfirm}
          title="Delete Backup"
          message={
            deleteConfirm
              ? `Are you sure you want to delete "${deleteConfirm.filename}"? This action cannot be undone.`
              : ""
          }
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
