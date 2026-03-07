"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { config } from "@/config/env";
import DateOfBirthInput from "@/components/DateOfBirthInput";
import { validatePersonnelDob } from "@/lib/utils";
import DateOfEntryInput from "@/components/DateOfEntryInput";
import {
  administratorStaticLogin,
  administratorUploadLogo,
  administratorGetAdmins,
  administratorCreateAdmin,
  getLicensing,
  updateLicensing,
  validateLicensingKey,
  type AdministratorAdmin,
} from "@/lib/api";
import {
  ShieldCheck,
  UserPlus,
  Type,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Home,
  LogOut,
  Lock,
  Users,
  Trash2,
  Key,
} from "lucide-react";

function AdminContent({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { appName, appLogoUrl, setAppName, setAppLogoUrl } = useAppSettings();
  const [nameInput, setNameInput] = useState(appName);
  const [logoUrlInput, setLogoUrlInput] = useState(appLogoUrl || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingLogo, setSavingLogo] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  
  // Admin management state
  const [admins, setAdmins] = useState<AdministratorAdmin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    army_no: "",
    name: "",
    rank: "General",
    unit: "",
    email: "",
    phone: "",
    dob: "",
    doe: "",
  });

  // Licensing key state
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [licenseOs, setLicenseOs] = useState<string>("");
  const [loadingLicense, setLoadingLicense] = useState(true);
  const [savingLicense, setSavingLicense] = useState(false);
  const [licenseSaved, setLicenseSaved] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [validatingKey, setValidatingKey] = useState(false);
  const [validateResult, setValidateResult] = useState<{ valid: boolean; decrypted_value: string; error?: string } | null>(null);

  useEffect(() => {
    setNameInput(appName);
  }, [appName]);

  useEffect(() => {
    setLogoUrlInput(appLogoUrl || "");
  }, [appLogoUrl]);

  useEffect(() => {
    loadAdmins();
  }, []);

  useEffect(() => {
    loadLicensing();
  }, []);

  const loadLicensing = async () => {
    setLoadingLicense(true);
    setLicenseError(null);
    try {
      const result = await getLicensing();
      if (result.success && result.data) {
        setLicenseKeyInput(result.data.license_key || "");
        setLicenseOs(result.data.os === "Linux" ? "Linux" : result.data.os === "Windows" ? "Windows" : "");
      }
    } catch (err) {
      setLicenseError(err instanceof Error ? err.message : "Failed to load licensing");
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleSaveLicense = async () => {
    setLicenseError(null);
    setSavingLicense(true);
    try {
      const result = await updateLicensing(licenseKeyInput.trim(), licenseOs || undefined);
      if (result.success) {
        setLicenseSaved(true);
        if (result.data?.os !== undefined) setLicenseOs(result.data.os === "Linux" ? "Linux" : result.data.os === "Windows" ? "Windows" : "");
        setTimeout(() => setLicenseSaved(false), 2000);
      } else {
        setLicenseError(result.message || "Failed to save licensing key");
      }
    } catch (err) {
      setLicenseError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingLicense(false);
    }
  };

  const handleValidateKey = async () => {
    setLicenseError(null);
    setValidateResult(null);
    if (!licenseKeyInput.trim()) {
      setLicenseError("Enter a key to validate");
      return;
    }
    setValidatingKey(true);
    try {
      const result = await validateLicensingKey(licenseKeyInput.trim());
      if (result.success && result.data) {
        setValidateResult(result.data);
      } else {
        setValidateResult({ valid: false, decrypted_value: "", error: result.message || "Validation failed" });
      }
    } catch (err) {
      setValidateResult({ valid: false, decrypted_value: "", error: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setValidatingKey(false);
    }
  };

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    setAdminError(null);
    try {
      const result = await administratorGetAdmins();
      if (result.success && result.admins) {
        setAdmins(result.admins);
      } else {
        setAdminError(result.message || "Failed to load admins");
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Failed to load admins");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    setAdminError(null);
    setAdminSuccess(null);

    if (adminFormData.dob) {
      const dobError = validatePersonnelDob(adminFormData.dob);
      if (dobError) {
        setAdminError(dobError);
        setCreatingAdmin(false);
        return;
      }
    }
    
    try {
      const result = await administratorCreateAdmin({
        army_no: adminFormData.army_no.trim(),
        name: adminFormData.name.trim(),
        rank: adminFormData.rank || "General",
        unit: adminFormData.unit.trim() || undefined,
        email: adminFormData.email.trim() || undefined,
        phone: adminFormData.phone.trim() || undefined,
        dob: adminFormData.dob || undefined,
        doe: adminFormData.doe || undefined,
      });
      
      if (result.success) {
        setAdminSuccess("Admin created successfully!");
        setAdminFormData({
          army_no: "",
          name: "",
          rank: "General",
          unit: "",
          email: "",
          phone: "",
          dob: "",
          doe: "",
        });
        setShowCreateForm(false);
        await loadAdmins();
        setTimeout(() => setAdminSuccess(null), 3000);
      } else {
        setAdminError(result.message || "Failed to create admin");
      }
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await setAppName(nameInput.trim() || "IPMAS");
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save app name:", err);
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveLogoUrl = async () => {
    setLogoError(null);
    const url = logoUrlInput.trim();
    try {
      await setAppLogoUrl(url || null);
      setLogoSaved(true);
      setTimeout(() => setLogoSaved(false), 2000);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Failed to save logo URL.");
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    setLogoError(null);
    setSavingLogo(true);
    try {
      const result = await administratorUploadLogo(logoFile);
      if (result.success && result.filePath) {
        const base = config.BACKEND_URL.replace(/\/$/, "");
        const fullUrl = result.filePath.startsWith("http") ? result.filePath : `${base}${result.filePath}`;
        await setAppLogoUrl(fullUrl);
        setLogoUrlInput(fullUrl);
        setLogoFile(null);
        setLogoSaved(true);
        setTimeout(() => setLogoSaved(false), 2000);
      } else {
        setLogoError(result.message || "Upload succeeded but could not get image URL.");
      }
    } catch (err: unknown) {
      setLogoError(err instanceof Error ? err.message : "Failed to upload logo.");
    } finally {
      setSavingLogo(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Administrator</h1>
            <p className="text-gray-400 text-sm">Application settings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 border border-rose-500/30 text-white font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Admin Management Section */}
        <section className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Admin Users</h2>
                <p className="text-gray-400 text-sm">Create and manage administrator accounts.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
            >
              <UserPlus className="w-4 h-4" />
              {showCreateForm ? "Cancel" : "Create Admin"}
            </button>
          </div>

          {adminSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm">
              {adminSuccess}
            </div>
          )}

          {adminError && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm">
              {adminError}
            </div>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreateAdmin} className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Army No *</label>
                  <input
                    type="text"
                    value={adminFormData.army_no}
                    onChange={(e) => setAdminFormData({ ...adminFormData, army_no: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rank</label>
                  <input
                    type="text"
                    value={adminFormData.rank}
                    onChange={(e) => setAdminFormData({ ...adminFormData, rank: e.target.value })}
                    placeholder="General"
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={adminFormData.unit}
                    onChange={(e) => setAdminFormData({ ...adminFormData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={adminFormData.phone}
                    onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <DateOfBirthInput
                    value={adminFormData.dob}
                    onChange={(value) => setAdminFormData({ ...adminFormData, dob: value })}
                    label="Date of Birth"
                    className="px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <DateOfEntryInput
                    label="Date of Entry"
                    value={adminFormData.doe}
                    onChange={(value) => setAdminFormData({ ...adminFormData, doe: value })}
                    className="px-3 py-2 rounded-lg bg-white/10 border-white/20 placeholder-gray-500 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creatingAdmin}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition disabled:opacity-50"
              >
                {creatingAdmin ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {creatingAdmin ? "Creating..." : "Create Admin"}
              </button>
            </form>
          )}

          {/* Admin List */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Existing Admins ({admins.length})</h3>
            {loadingAdmins ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : admins.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">No admins found.</p>
            ) : (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div>
                      <p className="text-white font-medium">{admin.name}</p>
                      <p className="text-gray-400 text-xs">
                        {admin.army_no} • {admin.rank} {admin.unit ? `• ${admin.unit}` : ""}
                      </p>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {admin.email && <p>{admin.email}</p>}
                      {admin.phone && <p>{admin.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Type className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Edit Dashboard Application name</h2>
              <p className="text-gray-400 text-sm">Default: IPMAS. This name appears in the sidebar and header.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="IPMAS"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSaveName}
              disabled={savingName}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50"
            >
              {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : nameSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
              {savingName ? "Saving..." : nameSaved ? "Saved" : "Save name"}
            </button>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <ImageIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Change the app logo</h2>
              <p className="text-gray-400 text-sm">Enter a logo URL or upload an image.</p>
            </div>
          </div>
          {logoError && <p className="text-rose-400 text-sm mb-3">{logoError}</p>}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                placeholder="https://... or upload below"
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                onClick={handleSaveLogoUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
              >
                {logoSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                {logoSaved ? "Saved" : "Save URL"}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="text-gray-300 text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-medium"
              />
              <button
                onClick={handleUploadLogo}
                disabled={!logoFile || savingLogo}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition disabled:opacity-50"
              >
                {savingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {savingLogo ? "Uploading..." : "Upload as logo"}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Licensing key</h2>
              <p className="text-gray-400 text-sm">Store and update the application licensing key. Saved in the licensing table.</p>
            </div>
          </div>
          {licenseError && <p className="text-rose-400 text-sm mb-3">{licenseError}</p>}
          {loadingLicense ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => {
                      setLicenseKeyInput(e.target.value);
                      setValidateResult(null);
                    }}
                    placeholder="Enter licensing key (24 characters)"
                    className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSaveLicense}
                    disabled={savingLicense}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition disabled:opacity-50"
                  >
                    {savingLicense ? <Loader2 className="w-4 h-4 animate-spin" /> : licenseSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                    {savingLicense ? "Saving..." : licenseSaved ? "Saved" : "Update key"}
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateKey}
                    disabled={validatingKey || !licenseKeyInput.trim()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-medium transition disabled:opacity-50"
                  >
                    {validatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    {validatingKey ? "Validating..." : "Validate key"}
                  </button>
                </div>
              </div>
              {validateResult && (
                <div className={`mt-4 p-4 rounded-lg border ${validateResult.valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                  {validateResult.valid ? (
                    <>
                      <p className="text-emerald-400 text-sm font-medium mb-1">Valid key</p>
                      <p className="text-white text-sm">Decrypted value: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">{validateResult.decrypted_value || "(empty)"}</span></p>
                    </>
                  ) : (
                    <>
                      <p className="text-rose-400 text-sm font-medium mb-1">Invalid or unable to decrypt</p>
                      {validateResult.error && <p className="text-gray-300 text-sm">{validateResult.error}</p>}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default function AdministratorPage() {
  // Always start with not authenticated - no localStorage persistence
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const result = await administratorStaticLogin(username.trim(), password);
    setLoginLoading(false);
    if (result.success && result.token) {
      // Don't save to localStorage - keep in memory only
      setIsAuthenticated(true);
    } else {
      setLoginError(result.message || "Invalid username or password");
    }
  };

  const handleLogout = () => {
    // Just reset state - no localStorage to clear
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setLoginError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8 lg:py-12">
        {!isAuthenticated && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Lock className="w-7 h-7 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Administrator Login</h1>
                  {/* <p className="text-gray-400 text-sm">Static login — no database</p> */}
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>

            <form
              onSubmit={handleLogin}
              className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 space-y-4"
            >
              {loginError && (
                <p className="text-rose-400 text-sm" role="alert">
                  {loginError}
                </p>
              )}
              <div>
                <label htmlFor="admin-username" className="block text-sm font-medium text-gray-300 mb-1">
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition disabled:opacity-50"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {loginLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </>
        )}

        {isAuthenticated && <AdminContent onLogout={handleLogout} />}
      </div>
    </div>
  );
}
