"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { imageService, whatsNewService, getAppSettings, updateAppSettings } from "@/lib/api";
import { Upload, Trash2, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import Image from "next/image";
import { config } from "@/config/env";
import { useNotification } from "@/contexts/NotificationContext";

interface ImageFile {
  filename: string;
  file_path: string;
  file_size: number;
  created_at?: string;
  modified_at?: string;
  folder?: string; // login-left | login-right | login (legacy)
}

type TabType = 'dashboard' | 'personnel' | 'whats-new';

export default function ImageManagementPage() {
  const { user } = useAuth();
  const [whatsNewDocs, setWhatsNewDocs] = useState<ImageFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<'dashboard' | 'personnel' | 'login'>('dashboard');
  const [dashboardImages, setDashboardImages] = useState<ImageFile[]>([]);
  const [personnelImages, setPersonnelImages] = useState<ImageFile[]>([]);
  const [loginImages, setLoginImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const { success: notifySuccess, error: notifyError } = useNotification();
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [imageToDeleteFolder, setImageToDeleteFolder] = useState<string | null>(null);
  const [loginPersonnel, setLoginPersonnel] = useState({
    left: { name: "", armyNumber: "", rank: "" },
    right: { name: "", armyNumber: "", rank: "" },
  });
  const [savingLoginPersonnel, setSavingLoginPersonnel] = useState(false);

  const BACKEND_URL = config.BACKEND_URL;

  // Fetch images and docs
  // Fetch images for all folders
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardRes, personnelRes, loginRes, whatsNewRes] = await Promise.all([
        imageService.getImages('dashboard'),
        imageService.getImages('personnel'),
        imageService.getImages('login'),
        whatsNewService.getDocuments()
      ]);

      if (dashboardRes.status === 'success' && dashboardRes.data) {
        setDashboardImages(dashboardRes.data);
      }

      if (personnelRes.status === 'success' && personnelRes.data) {
        setPersonnelImages(personnelRes.data);
      }

      if (loginRes.status === 'success' && loginRes.data) {
        setLoginImages(loginRes.data);
      }
      if (whatsNewRes.status === 'success' && whatsNewRes.data) {
        setWhatsNewDocs(whatsNewRes.data);
      }
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError(err.message || 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (selectedFolder === "login") {
      getAppSettings().then((result) => {
        if (result.success && result.settings) {
          const s = result.settings as Record<string, string>;
          setLoginPersonnel({
            left: {
              name: s.login_left_name ?? "",
              armyNumber: s.login_left_army_number ?? "",
              rank: s.login_left_rank ?? "",
            },
            right: {
              name: s.login_right_name ?? "",
              armyNumber: s.login_right_army_number ?? "",
              rank: s.login_right_rank ?? "",
            },
          });
        }
      });
    }
  }, [selectedFolder]);

  const handleSaveLoginPersonnel = async () => {
    try {
      setSavingLoginPersonnel(true);
      setError(null);
      setSuccess(null);
      await updateAppSettings({
        login_left_name: loginPersonnel.left.name,
        login_left_army_number: loginPersonnel.left.armyNumber,
        login_left_rank: loginPersonnel.left.rank,
        login_right_name: loginPersonnel.right.name,
        login_right_army_number: loginPersonnel.right.armyNumber,
        login_right_rank: loginPersonnel.right.rank,
      });
      notifySuccess("Login personnel details saved successfully");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingLoginPersonnel(false);
    }
  };

  const handleFileSelectForLogin = async (files: FileList | null, position: 'left' | 'right') => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      notifyError(`"${file.name}" is not an image file`);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      notifyError(`"${file.name}" exceeds 20MB size limit`);
      return;
    }
    const folder = position === 'left' ? 'login-left' : 'login-right';
    try {
      setUploading(true);
      setUploadProgress({ current: 1, total: 1 });
      setError(null);
      setSuccess(null);
      await imageService.uploadImage(file, folder);
      notifySuccess(`${position === 'left' ? 'Left' : 'Right'} side image uploaded successfully`);
      setUploadProgress(null);
      await fetchImages();
    } catch (err: any) {
      notifyError(err.message || 'Failed to upload');
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Login tab uses handleFileSelectForLogin - should not reach here
    if (selectedFolder === 'login') {
      return;
    }

    const isWhatsNew = selectedFolder === 'whats-new';

    if (isWhatsNew) {
      if (fileArray.length > 10) {
        setError('Maximum 10 documents can be uploaded at a time');
        return;
      }
      const allowedExts = ['.pdf', '.doc', '.docx'];
      for (const file of fileArray) {
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        if (!allowedExts.includes(ext)) {
          setError(`File "${file.name}" is not allowed. Only PDF, DOC, DOCX are supported.`);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds 10MB size limit`);
          return;
        }
      }
    } else {
      // Dashboard: max 10 images total
      if (selectedFolder === 'dashboard') {
        const currentCount = dashboardImages.length;
        if (currentCount + fileArray.length > 10) {
          setError(`Maximum 10 images allowed for dashboard. You have ${currentCount} image(s). Delete some before uploading more.`);
          return;
        }
      }
      if (fileArray.length > 10) {
        setError('Maximum 10 images can be uploaded at a time');
        return;
      }
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          setError(`File "${file.name}" is not an image file`);
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          setError(`File "${file.name}" exceeds 20MB size limit`);
          return;
        }
      }
    }

    try {
      setUploading(true);
      setUploadProgress({ current: 0, total: fileArray.length });
      setError(null);
      setSuccess(null);

      if (isWhatsNew) {
        await whatsNewService.uploadDocuments(fileArray);
        setSuccess(fileArray.length === 1 ? 'Document uploaded successfully' : `${fileArray.length} documents uploaded successfully`);
      } else {
        await imageService.uploadImage(fileArray, selectedFolder);
        setSuccess(fileArray.length === 1
          ? `Image uploaded successfully to ${selectedFolder} folder`
          : `${fileArray.length} images uploaded successfully to ${selectedFolder} folder`);
      }
      setUploadProgress(null);
      await fetchImages();
    } catch (err: any) {
      console.error('Error uploading:', err);
      setError(err.message || 'Failed to upload');
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (filename: string, folder?: string) => {
    setImageToDelete(filename);
    setImageToDeleteFolder(folder ?? null);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;

    try {
      setDeleting(imageToDelete);
      setError(null);
      setSuccess(null);
      setShowDeleteConfirm(false);

      if (selectedFolder === 'whats-new') {
        await whatsNewService.deleteDocument(imageToDelete);
        setSuccess('Document deleted successfully');
      } else {
        const folder = selectedFolder === 'login' && imageToDeleteFolder
          ? imageToDeleteFolder as 'login-left' | 'login-right'
          : selectedFolder;
        await imageService.deleteImage(folder, imageToDelete);
        setSuccess('Image deleted successfully');
      }
      await fetchImages();
    } catch (err: any) {
      console.error('Error deleting:', err);
      setError(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
      setImageToDelete(null);
      setImageToDeleteFolder(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const currentImages = selectedFolder === 'dashboard' ? dashboardImages : selectedFolder === 'personnel' ? personnelImages : selectedFolder === 'login' ? loginImages : whatsNewDocs;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Docs Management</h1>
            <p className="text-gray-300 text-sm lg:text-base">Upload and manage images for dashboard carousel, personnel marquee, and What&apos;s New documents</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-400 hover:text-green-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Tab Selection */}
          <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedFolder('dashboard')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedFolder === 'dashboard'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                Dashboard Images
              </button>
              <button
                onClick={() => setSelectedFolder('personnel')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedFolder === 'personnel'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                Personnel Images
              </button>
              <button
                onClick={() => setSelectedFolder('login')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedFolder === 'login'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                Login Images
              </button>
               <button
                onClick={() => setSelectedFolder('whats-new')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedFolder === 'whats-new'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                What&apos;s New
              </button>
            </div>
          </div>

          {/* Upload Section - Login tab has separate Left/Right upload zones */}
          {selectedFolder === 'login' ? (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Left Side Image</h3>
                <p className="text-gray-400 text-sm mb-4">Upload image for the left portrait on the login page.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => { handleFileSelectForLogin(e.target.files, 'left'); e.target.value = ''; }}
                  className="hidden"
                  id="file-upload-left"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload-left"
                  className={`cursor-pointer flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-lg transition-all duration-300 ${uploading ? 'opacity-60 cursor-not-allowed' : 'border-white/20 hover:border-white/40'}`}
                >
                  {uploading ? <Loader2 className="w-10 h-10 text-blue-400 animate-spin" /> : <Upload className="w-10 h-10 text-gray-400" />}
                  <span className="text-white font-medium text-sm">Click to upload left image</span>
                  <span className="text-gray-400 text-xs">PNG, JPG, GIF up to 20MB</span>
                </label>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Right Side Image</h3>
                <p className="text-gray-400 text-sm mb-4">Upload image for the right portrait on the login page.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => { handleFileSelectForLogin(e.target.files, 'right'); e.target.value = ''; }}
                  className="hidden"
                  id="file-upload-right"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload-right"
                  className={`cursor-pointer flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-lg transition-all duration-300 ${uploading ? 'opacity-60 cursor-not-allowed' : 'border-white/20 hover:border-white/40'}`}
                >
                  {uploading ? <Loader2 className="w-10 h-10 text-blue-400 animate-spin" /> : <Upload className="w-10 h-10 text-gray-400" />}
                  <span className="text-white font-medium text-sm">Click to upload right image</span>
                  <span className="text-gray-400 text-xs">PNG, JPG, GIF up to 20MB</span>
                </label>
              </div>
            </div>
          ) : (
          <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {selectedFolder === 'whats-new' ? 'Upload Documents' : 'Upload Images'}
              </h2>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <span className="text-blue-400 text-sm font-medium">
                    Uploading to: {selectedFolder === 'whats-new' ? "What's New" : selectedFolder === 'dashboard' ? 'Dashboard' : 'Personnel'}
                  </span>
                </div>
                {selectedFolder === 'dashboard' && (
                <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <span className="text-amber-400 text-sm font-medium">Max 10 images total</span>
                </div>
                )}
              </div>
            </div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                selectedFolder === 'dashboard' && dashboardImages.length >= 10
                  ? 'border-white/10 opacity-60 cursor-not-allowed'
                  : dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 hover:border-white/40'
              }`}
            >
              <input
                type="file"
                accept={selectedFolder === 'whats-new' ? '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'image/*'}
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={uploading || (selectedFolder === 'dashboard' && dashboardImages.length >= 10)}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                    <div>
                      <p className="text-gray-300 font-medium mb-1">Uploading...</p>
                      {uploadProgress && (
                        <p className="text-gray-400 text-sm">
                          {uploadProgress.current} of {uploadProgress.total} file(s)
                        </p>
                      )}
                    </div>
                  </>
                ) : selectedFolder === 'whats-new' ? (
                  <>
                    <FileText className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-white font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-sm mb-1">
                        PDF, DOC, DOCX up to 10MB per file
                      </p>
                      <p className="text-blue-400 text-sm font-medium">
                        Maximum 10 documents at a time
                      </p>
                    </div>
                  </>
                ) : selectedFolder === 'dashboard' && dashboardImages.length >= 10 ? (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-amber-400 font-medium mb-1">Dashboard limit reached (10 images)</p>
                      <p className="text-gray-400 text-sm">Delete an image to upload more</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-white font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-400 text-sm mb-1">
                        PNG, JPG, GIF up to 20MB per file
                      </p>
                      <p className="text-blue-400 text-sm font-medium">
                        {selectedFolder === 'dashboard' ? 'Maximum 10 images total' : 'Maximum 10 images at a time'}
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
          )}

          {/* Login personnel config - shown when Login tab is selected */}
          {selectedFolder === "login" && (
            <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Login Page Personnel Details</h2>
              <p className="text-gray-400 text-sm mb-4">
                Configure name, army number, and rank shown below each portrait on the login screen.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-blue-400 font-medium">Left</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={loginPersonnel.left.name}
                    onChange={(e) => setLoginPersonnel((p) => ({ ...p, left: { ...p.left, name: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Army Number"
                    value={loginPersonnel.left.armyNumber}
                    onChange={(e) => setLoginPersonnel((p) => ({ ...p, left: { ...p.left, armyNumber: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Rank "
                    value={loginPersonnel.left.rank}
                    onChange={(e) => setLoginPersonnel((p) => ({ ...p, left: { ...p.left, rank: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-blue-400 font-medium">Right</h3>
                  <input
                    type="text"
                    placeholder="Name"
                    value={loginPersonnel.right.name}
                    onChange={(e) => setLoginPersonnel((p) => ({ ...p, right: { ...p.right, name: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Army Number"
                    value={loginPersonnel.right.armyNumber}
                    onChange={(e) => setLoginPersonnel((p) => ({ ...p, right: { ...p.right, armyNumber: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Rank "
                    value={loginPersonnel.right.rank}
                    onChange={(e) => setLoginPersonnel((p) => ({ ...p, right: { ...p.right, rank: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveLoginPersonnel}
                disabled={savingLoginPersonnel}
                className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white font-medium"
              >
                {savingLoginPersonnel ? "Saving..." : "Save Personnel Details"}
              </button>
            </div>
          )}

          {/* Files List */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {selectedFolder === 'dashboard' ? 'Dashboard' : selectedFolder === 'personnel' ? 'Personnel' : selectedFolder === 'login' ? 'Login' : "What's New"} {selectedFolder === 'whats-new' ? 'Documents' : 'Images'} {selectedFolder !== 'login' && `(${currentImages.length})`}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : currentImages.length === 0 ? (
              <div className="text-center py-12">
                {selectedFolder === 'whats-new' ? (
                  <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                )}
                <p className="text-gray-400">No {selectedFolder === 'whats-new' ? 'documents' : 'images'} uploaded yet</p>
              </div>
            ) : selectedFolder === 'whats-new' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentImages.map((doc) => (
                  <div
                    key={doc.filename}
                    className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group flex items-center gap-4 p-4"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate mb-1">
                        {doc.filename}
                      </p>
                      <p className="text-gray-400 text-xs mb-2">
                        {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={`${BACKEND_URL}${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDeleteClick(doc.filename)}
                          disabled={deleting === doc.filename}
                          className="text-red-400 hover:text-red-300 text-xs font-medium disabled:opacity-50"
                        >
                          {deleting === doc.filename ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-4  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7`}>
                {currentImages.map((image) => (
                  <div
                    key={image.filename}
                    className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="relative aspect-video bg-gray-800">
                      <Image
                        src={`${BACKEND_URL}${image.file_path}`}
                        alt={image.filename}
                        fill
                        className=""
                        sizes="(max-width: 340px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <button
                        onClick={() => handleDeleteClick(image.filename, image.folder)}
                        disabled={deleting === image.filename}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-50"
                      >
                        {deleting === image.filename ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title={selectedFolder === 'whats-new' ? 'Delete Document' : 'Delete Image'}
          message={`Are you sure you want to delete this ${selectedFolder === 'whats-new' ? 'document' : 'image'}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setImageToDelete(null);
          }}
          type="danger"
        />
      </div>
    </ProtectedRoute>
  );
}
