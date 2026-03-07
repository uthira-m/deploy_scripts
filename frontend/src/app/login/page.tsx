"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import logo1Image from "@/assets/Garhwal_Crest-White.png";
import { imageService, getAppSettings } from "@/lib/api";
import { config } from "@/config/env";
import "./page.css";

interface LoginImage {
  filename: string;
  file_path: string;
  file_size?: number;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [armyNo, setArmyNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [animationStage, setAnimationStage] = useState<
    "initial" | "rotating" | "complete"
  >("initial");
  const router = useRouter();
  const { login, isAuthenticated, isLoading, requiresPasswordChange, user } =
    useAuth();

      const text = "BORN FOR BATTLE";
  const [animate, setAnimate] = useState(false);
  const [animateYear, setAnimateYear] = useState(false);
  const [loginImages, setLoginImages] = useState<LoginImage[]>([]);
  const [leftPersonnel, setLeftPersonnel] = useState({ name: "", armyNumber: "", rank: "" });
  const [rightPersonnel, setRightPersonnel] = useState({ name: "", armyNumber: "", rank: "" });
  const BACKEND_URL = config.BACKEND_URL;
  const configLeft = config.LOGIN_LEFT_PERSONNEL ?? { name: "", armyNumber: "", rank: "" };
  const configRight = config.LOGIN_RIGHT_PERSONNEL ?? { name: "", armyNumber: "", rank: "" };

  useEffect(() => {
    const fetchLoginImages = async () => {
      try {
        const res = await imageService.getLoginImages();
        if (res?.status === "success" && Array.isArray(res.data)) {
          setLoginImages(res.data);
        }
      } catch {
        // Ignore - login page works without images
      }
    };
    fetchLoginImages();
  }, []);

  useEffect(() => {
    const fetchAppSettings = async () => {
      try {
        const result = await getAppSettings();
        if (result.success && result.settings) {
          const s = result.settings as Record<string, string>;
          if (s.login_left_name || s.login_left_army_number || s.login_left_rank) {
            setLeftPersonnel({
              name: s.login_left_name ?? configLeft.name,
              armyNumber: s.login_left_army_number ?? configLeft.armyNumber ?? "",
              rank: s.login_left_rank ?? configLeft.rank,
            });
          } else {
            setLeftPersonnel(configLeft);
          }
          if (s.login_right_name || s.login_right_army_number || s.login_right_rank) {
            setRightPersonnel({
              name: s.login_right_name ?? configRight.name,
              armyNumber: s.login_right_army_number ?? configRight.armyNumber ?? "",
              rank: s.login_right_rank ?? configRight.rank,
            });
          } else {
            setRightPersonnel(configRight);
          }
        } else {
          setLeftPersonnel(configLeft);
          setRightPersonnel(configRight);
        }
      } catch {
        setLeftPersonnel(configLeft);
        setRightPersonnel(configRight);
      }
    };
    fetchAppSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Start animation on load
    setAnimate(true);

    // Stop animation after 3 seconds
    const stopTimeout = setTimeout(() => {
      setAnimate(false);
    }, 3000);

    // Repeat animation every 8 seconds
    const interval = setInterval(() => {
      setAnimate(true);

      setTimeout(() => {
        setAnimate(false);
      }, 3000);
    }, 8000);

    return () => {
      clearTimeout(stopTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Wait for animation stage to complete before starting year animation
    if (animationStage !== "complete") return;

    // Start year animation after a delay
    const initialDelay = setTimeout(() => {
      setAnimateYear(true);
    }, 1000);

    // Stop animation after it completes (0.8s animation + 0.5s delay = ~1.3s)
    const stopTimeout = setTimeout(() => {
      setAnimateYear(false);
    }, 2000);

    // Repeat animation every 8 seconds (same as BORN FOR BATTLE)
    const interval = setInterval(() => {
      // Reset to false first to ensure animation resets
      setAnimateYear(false);
      
      // Small delay to allow reset, then start animation
      setTimeout(() => {
        setAnimateYear(true);

        setTimeout(() => {
          setAnimateYear(false);
        }, 2000);
      }, 50);
    }, 8000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(stopTimeout);
      clearInterval(interval);
    };
  }, [animationStage]);

  useEffect(() => {
    const rotateTimer = setTimeout(() => {
      setAnimationStage("rotating");
    }, 100);

    const completeTimer = setTimeout(() => {
      setAnimationStage("complete");
    }, 2200);

    return () => {
      clearTimeout(rotateTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && requiresPasswordChange) {
      router.push("/change-password");
    } else if (!isLoading && isAuthenticated && user) {
      // Redirect all users to dashboard
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, requiresPasswordChange, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] login-wrapper flex items-center justify-center overflow-y-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  async function handleButtonClick() {
    setError("");
    setLoading(true);

    if (!armyNo || !password) {
      setError("Please enter both Army Number and password");
      setLoading(false);
      return;
    }

    try {
      await login(armyNo, password, true);
      // Redirect will be handled by useEffect after user state updates
    } catch (err: any) {
      if (err.message) {
        setError(err.message);
      } else if (err.status === "error") {
        setError(err.message || "Login failed");
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen min-h-[100dvh] login-wrapper flex items-center justify-center relative overflow-y-auto">
      {animationStage !== "complete" && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
            animationStage === "initial" || animationStage === "rotating"
              ? "opacity-100"
              : "opacity-0"
          } pointer-events-none`}
        >
          <div
            className={`logo-animation-wrapper  ${
              animationStage === "rotating" ? "rotating" : ""
            }`}
          >
            <Image
              src={logo1Image}
              alt="IPMAS Logo"
              width={250}
              height={180}
              className={`logo-image ${
                animationStage === "initial" ? "logo-initial" : ""
              } ${animationStage === "rotating" ? "logo-rotating" : ""}`}
              priority
            />
          </div>
        </div>
      )}

      <div
        className={`relative z-10 w-full max-w-full px-4 sm:px-6 transition-all duration-700 ${
          animationStage === "complete"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <div className="login-three-column w-full">
          <div className="bg-overlay" />

          {/* Left portrait - CEO (only show circle when image is uploaded) */}
          <div className="login-side-image login-image-left left-section-animate">
            <div className="login-portrait-wrapper">
              {loginImages[0] && (
                <>
                  <div className="login-portrait-circle">
                    <Image
                      src={`${BACKEND_URL}${loginImages[0].file_path}`}
                      alt={leftPersonnel.name}
                      width={170}
                      height={170}
                      className="login-portrait-img"
                    />
                  </div>
                  <div className="login-portrait-info">
                    <div className="login-portrait-name">{leftPersonnel.name}</div>
                    {leftPersonnel.armyNumber && (
                      <div className="login-portrait-army">{leftPersonnel.armyNumber}</div>
                    )}
                    <div className="login-portrait-rank">{leftPersonnel.rank}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Login form */}
          <div className="login-form-center">
          <div className="login-content">
            <div className="login-logo">
              <Image
                src={logo1Image}
                alt="IPMAS Logo"
                width={200}
                height={80}
                className={`logo-image`}
                priority
              />
            </div>
            <h1 className="login-title uppercase">towering twelfth</h1>
            <div className="tagline">
              <div className="premium-typography-container animate-fade-in">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-px w-20 premium-gold-line"></div>
                  <div className="mx-4 premium-star">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="h-px w-20 premium-gold-line"></div>
                </div>
                {/* <h1 className="premium-title">BORN FOR BATTLE</h1> */}
                  <h1 className={`premium-title ${animate ? "wave-active" : ""}`}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          style={{ animationDelay: `${index * 0.15}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h1>
                <div className="flex items-center justify-center mt-6 mb-4">
                  <div className="h-px w-20 premium-gold-line"></div>
                  <div className="mx-4 premium-star">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="h-px w-20 premium-gold-line"></div>
                </div>
                <div className={`premium-year ${animateYear ? "year-animate" : ""}`}>
                  <span className="year-left">19</span>
                  <span className="year-right">71</span>
                </div>
              </div>
            </div>
            <form
              className="input-box"
              onSubmit={(e) => {
                e.preventDefault();
                handleButtonClick();
              }}
            >
              <div>
                <input
                  id="army_no"
                  name="army_no"
                  type="text"
                  autoComplete="username"
                  required
                  value={armyNo}
                  onChange={(e) => setArmyNo(e.target.value)}
                  onInput={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    if (v !== armyNo) setArmyNo(v);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Army Number"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInput={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    if (v !== password) setPassword(v);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute cursor-pointer right-14 top-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            {error && (
              <div
                className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center"
                role="alert"
              >
                {error}
              </div>
            )}
            <div className="flex justify-center">
            <button
              type="submit"
              className=" login-btn w-full cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:bg-white/15 hover:border-white/30 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg shadow-black/20 flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              )}
              Sign In
            </button>
            </div>
            </form>
          </div>
          </div>

          {/* Right portrait - Director (only show circle when image is uploaded) */}
          <div className="login-side-image login-image-right form-container">
            <div className="login-portrait-wrapper">
              {loginImages[1] && (
                <>
                  <div className="login-portrait-circle">
                    <Image
                      src={`${BACKEND_URL}${loginImages[1].file_path}`}
                      alt={rightPersonnel.name}
                      width={170}
                      height={170}
                      className="login-portrait-img"
                    />
                  </div>
                  <div className="login-portrait-info">
                    <div className="login-portrait-name">{rightPersonnel.name}</div>
                    {rightPersonnel.armyNumber && (
                      <div className="login-portrait-army">{rightPersonnel.armyNumber}</div>
                    )}
                    <div className="login-portrait-rank">{rightPersonnel.rank}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
