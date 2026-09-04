/**
 * Welcome Client Component
 *
 * Implements the "App Welcome and Onboarding Page" based on Google Stitch design.
 * Features:
 * - Brand header with logo, dark/light theme switch, and quick guest entry CTA
 * - Left editorial pitch with dynamic category tags and article preview card
 * - Right authentication card with Google OAuth and Email/Password sign-in & registration
 * - Guest mode access ("Continue as Guest")
 * - GSAP entrance animations and responsive layout
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Sun,
  Moon,
  Eye,
  EyeClosed,
  ArrowRight,
  ChevronRight,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { CATEGORY_COLORS, type Article } from "@/lib/constants";

interface WelcomeClientProps {
  previewArticle?: Article | null;
}

export default function WelcomeClient({ previewArticle }: WelcomeClientProps) {
  const router = useRouter();

  // Tab & Form State
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Theme State
  const [isDark, setIsDark] = useState(false);

  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const authCardRef = useRef<HTMLElement>(null);
  const toggleIconRef = useRef<HTMLDivElement>(null);

  // Detect current theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      const timer = setTimeout(() => {
        setIsDark(isDarkTheme);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Theme Toggle with GSAP rotation
  const toggleTheme = () => {
    const nextDark = !isDark;
    if (toggleIconRef.current) {
      gsap.fromTo(
        toggleIconRef.current,
        { rotate: 0, scale: 1 },
        {
          rotate: 180,
          scale: 0,
          duration: 0.15,
          ease: "power2.in",
          onComplete: () => {
            setIsDark(nextDark);
            if (nextDark) {
              document.documentElement.classList.add("dark");
              localStorage.theme = "dark";
            } else {
              document.documentElement.classList.remove("dark");
              localStorage.theme = "light";
            }
            gsap.fromTo(
              toggleIconRef.current,
              { rotate: -180, scale: 0 },
              { rotate: 0, scale: 1, duration: 0.25, ease: "back.out(1.5)" },
            );
          },
        },
      );
    } else {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.theme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.theme = "light";
      }
    }
  };

  // GSAP Entrance Animations
  useGSAP(
    () => {
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      );

      gsap.fromTo(
        heroRef.current,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, delay: 0.2, ease: "power3.out" },
      );

      gsap.fromTo(
        authCardRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, delay: 0.3, ease: "power3.out" },
      );
    },
    { scope: containerRef },
  );

  // Guest entry handler
  const handleContinueAsGuest = () => {
    // Set guest_mode cookie valid for 30 days
    document.cookie = "guest_mode=true; path=/; max-age=2592000; SameSite=Lax";
    router.push("/");
    router.refresh();
  };

  // Google Social Sign In
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg("");
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/",
      });
    } catch (err) {
      console.error("Google sign in error:", err);
      setErrorMsg("Failed to authenticate with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Form Submission (Sign In or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (authMode === "signin") {
        const res = await signIn.email({
          email,
          password,
          rememberMe,
        });

        if (res.error) {
          setErrorMsg(
            res.error.message ||
              "Invalid email or password. Please check your credentials.",
          );
          setIsLoading(false);
        } else {
          // Clear guest cookie if any
          document.cookie =
            "guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          router.push("/");
          router.refresh();
        }
      } else {
        // Register flow
        if (!agreedToTerms) {
          setErrorMsg(
            "Please agree to the Terms of Service to create an account.",
          );
          setIsLoading(false);
          return;
        }

        const res = await signUp.email({
          name: name.trim() || email.split("@")[0],
          email,
          password,
        });

        if (res.error) {
          setErrorMsg(res.error.message || "Failed to create account.");
          setIsLoading(false);
        } else {
          setSuccessMsg(
            "Account created successfully! Taking you to the feed...",
          );
          // Clear guest cookie if any
          document.cookie =
            "guest_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 600);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const categories = [
    { name: "GAMING", color: CATEGORY_COLORS["GAMING"] || "bg-violet-600" },
    { name: "LIFESTYLE", color: CATEGORY_COLORS["LIFESTYLE"] || "bg-lime-600" },
    { name: "FOODS", color: CATEGORY_COLORS["FOODS"] || "bg-orange-600" },
    {
      name: "TECHNOLOGY",
      color: CATEGORY_COLORS["TECHNOLOGY"] || "bg-indigo-600",
    },
    { name: "TRAVEL", color: CATEGORY_COLORS["TRAVEL"] || "bg-sky-500" },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 selection:bg-amber-700 selection:text-white transition-colors duration-300 relative overflow-hidden"
    >
      {/* Subtle Warm Aura Backdrop Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-150 h-150 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-125 h-125 rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-[120px]" />
      </div>

      {/* BEGIN: Header */}
      <header
        ref={headerRef}
        className="w-full border-b border-gray-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/welcome"
            className="flex items-center space-x-2.5 group transition-transform focus:outline-none"
          >
            <Image
              src="/k-blog-icon.png"
              alt="K-Blog Logo"
              width={38}
              height={38}
              priority
              className="w-10 h-10 object-contain shrink-0 transform group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white font-sans">
              K-BLOG
            </span>
          </Link>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600/30 w-10 h-10 flex items-center justify-center cursor-pointer"
              aria-label="Toggle Theme"
              type="button"
            >
              <div
                ref={toggleIconRef}
                className="flex items-center justify-center w-full h-full"
              >
                {isDark ? (
                  <Sun size={20} className="text-amber-500" />
                ) : (
                  <Moon size={20} className="text-gray-600" />
                )}
              </div>
            </button>

            {/* Fast Guest Entry CTA */}
            <button
              onClick={handleContinueAsGuest}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-amber-400 bg-gray-50 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-amber-950/40 px-3.5 sm:px-4 py-2 rounded-full border border-gray-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-600/30 cursor-pointer shadow-sm"
              type="button"
            >
              <span>Continue as Guest</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      {/* END: Header */}

      {/* BEGIN: Main Content Area */}
      <main className="grow flex items-center justify-center py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* BEGIN: Left Editorial Pitch */}
          <section
            ref={heroRef}
            className="lg:col-span-6 flex flex-col justify-center text-left space-y-6"
          >
            {/* Brand Eyebrow */}
            <div className="inline-flex items-center gap-2 self-start bg-amber-50 dark:bg-amber-950/40 border border-amber-500 dark:border-amber-800/60 px-3.5 py-1.5 rounded-full text-amber-700 dark:text-amber-700 text-xs font-bold tracking-wide uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-700 dark:bg-amber-600 animate-pulse" />
              Editorial Community & Stories
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[2.85rem] font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.18]">
              Discover ideas, stories, and deep perspectives.
            </h1>

            {/* Subtitle */}
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Join readers and thought leaders uncovering curated journalism
              across modern technology, mindful living, culinary arts, and
              travel journeys.
            </p>

            {/* Category Badges */}
            <div className="pt-1 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mr-1">
                Trending:
              </span>
              {categories.map((cat) => (
                <span
                  key={cat.name}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold text-white shadow-xs ${cat.color}`}
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Sample/Featured Article Preview Card */}
            <div className="mt-4 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0 flex items-center justify-center text-xl border border-amber-100 dark:border-amber-900/40">
                {previewArticle?.category === "TECHNOLOGY" ? (
                  <Sparkles className="w-6 h-6 text-amber-600" />
                ) : (
                  <BookOpen className="w-6 h-6 text-amber-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300">
                    {previewArticle?.category || "LIFESTYLE"}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    • {previewArticle?.readTime || "2 min read"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {previewArticle?.title || "Health is Wealth"}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                  {previewArticle?.excerpt ||
                    "A brief explanation of why health can never be traded for anything."}
                </p>
              </div>
            </div>
          </section>
          {/* END: Left Editorial Pitch */}

          {/* BEGIN: Right Auth Card */}
          <section
            ref={authCardRef}
            className="lg:col-span-6 w-full max-w-md mx-auto"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl shadow-gray-900/5 dark:shadow-slate-950/50 p-6 sm:p-8 relative">
              {/* Tab Switcher */}
              <div
                className="flex border-b border-gray-200 dark:border-slate-800 mb-6"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "signin"}
                  onClick={() => {
                    setAuthMode("signin");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 pb-3 text-center transition-all focus:outline-none cursor-pointer ${
                    authMode === "signin"
                      ? "text-md font-semibold border-b-2 border-amber-700 dark:border-amber-500 text-gray-900 dark:text-white"
                      : "text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === "register"}
                  onClick={() => {
                    setAuthMode("register");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 pb-3 text-center transition-all focus:outline-none cursor-pointer ${
                    authMode === "register"
                      ? "text-md font-semibold border-b-2 border-amber-700 dark:border-amber-500 text-gray-900 dark:text-white"
                      : "text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Feedback Alerts */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium animate-in fade-in">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in">
                  {successMsg}
                </div>
              )}

              {/* Google Social Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-750 text-gray-800 dark:text-gray-100 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-600/30 shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-700 dark:text-amber-400" />
                ) : (
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>
                  {authMode === "signin"
                    ? "Continue with Google"
                    : "Sign up with Google"}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-gray-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase font-semibold tracking-wider text-gray-400 dark:text-gray-500 absolute">
                  or email
                </span>
              </div>

              {/* Email/Password Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name field (smoothly animated collapse/expand) */}
                <div
                  style={{
                    gridTemplateRows: authMode === "register" ? "1fr" : "0fr",
                  }}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                    authMode === "register"
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="pb-0.5">
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                      >
                        Full Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required={authMode === "register"}
                        tabIndex={authMode === "register" ? 0 : -1}
                        placeholder="e.g. John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-amber-700 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-700/20 transition-colors focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="emailInput"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="emailInput"
                    name="email"
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-amber-700 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-700/20 transition-colors focus:outline-none"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="passwordInput"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password <span className="text-red-600">*</span>
                    </label>
                    {authMode === "signin" && (
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="passwordInput"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-amber-700 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-700/20 transition-colors focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeClosed className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Contextual Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  {authMode === "signin" ? (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-amber-700 focus:ring-amber-600/30 transition cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Remember me
                      </span>
                    </label>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        required
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 text-amber-700 focus:ring-amber-600/30 transition cursor-pointer"
                      />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        I agree to the Terms of Service
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 shadow-md shadow-amber-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-amber-600/50 active:scale-[0.99] text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>
                        {authMode === "signin"
                          ? "Sign In to K-BLOG"
                          : "Create Account"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest Explore Callout in Card Footer */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Just exploring? No account needed to read.
                </p>
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer group"
                >
                  <span>Continue as Guest &amp; Browse Feed</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </section>
          {/* END: Right Auth Card */}
        </div>
      </main>
      {/* END: Main Content Area */}

      {/* BEGIN: Minimal Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-slate-800/80 py-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              K-BLOG
            </span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-6 font-medium">
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About Us
            </a>
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
      {/* END: Minimal Footer */}
    </div>
  );
}
