/**
 * Header Component
 *
 * The main navigation bar of the application. It features:
 * - Brand logo and navigation links
 * - Search bar integration
 * - Authentication controls (Sign In / Sign Out / User Profile) via Better Auth
 * - "Create a Post" shortcut for logged-in users
 * - GSAP entrance animations for a professional feel
 * - Responsive mobile menu
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Search, PenSquare, Menu, X, User2, Sun, Moon } from "lucide-react";
import { useSession, signIn, signOut } from "@/lib/auth-client";

const Header = () => {
  // Local state for toggling menus
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Access session data from Better Auth client
  const { data: session, isPending } = useSession();
  const isAuthenticated = !isPending && !!session?.user;

  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const toggleIconRef = useRef(null);

  // Set initial theme based on class name on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkTheme = document.documentElement.classList.contains("dark");
      const timer = setTimeout(() => {
        setIsDark(isDarkTheme);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;

    // Animate the icon using GSAP for a premium tactile feel!
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

  /**
   * GSAP Animations
   */
  useGSAP(
    () => {
      // Header container: slides down from top
      gsap.fromTo(
        headerRef.current,
        { y: -50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
        },
      );

      // Logo: slides in from the left
      gsap.fromTo(
        logoRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, delay: 0.3, clearProps: "all" },
      );

      // Nav items: staggered entrance from top
      gsap.fromTo(
        ".nav-item",
        { y: -10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.5,
          ease: "back.out(1.7)",
          clearProps: "all",
        },
      );
    },
    { scope: headerRef },
  );

  const handleSignIn = async () => {
    try {
      setIsUserMenuOpen(false);
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsUserMenuOpen(false);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navItems = [
    { name: "HOME", href: "/" },
    { name: "ABOUT", href: "/about" },
    { name: "CONTACT", href: "/contact" },
  ];

  return (
    <header
      className="bg-white dark:bg-slate-900 dark:border-slate-800/80 shadow-md dark:shadow-slate-950/20 sticky top-0 z-10"
      ref={headerRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-2" ref={logoRef}>
            <Image
              src="/k-blog-icon.png"
              alt="K-Blog Logo"
              width={40}
              height={40}
              priority
              className="w-12 h-12 object-contain shrink-0"
            />
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              K-BLOG
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-item text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-500 transition flex items-center"
              >
                {item.name}
              </Link>
            ))}

            {/* Inline Search Bar */}
            <div className="nav-item relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 text-sm text-black dark:text-white bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-amber-700 focus:border-amber-700 w-40"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
            </div>
          </nav>

          {/* User Actions & Mobile Menu Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="nav-item p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition focus:outline-none flex items-center justify-center relative w-10 h-10 overflow-hidden cursor-pointer"
              aria-label="Toggle Theme"
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

            {/* Show "Create a Post" only if authenticated */}
            {isAuthenticated && (
              <Link
                href="/new"
                className="nav-item hidden sm:flex items-center space-x-2 bg-amber-700 dark:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md hover:bg-amber-800 dark:hover:bg-amber-700 transition"
              >
                <PenSquare size={16} />
                <span>Create a Post</span>
              </Link>
            )}

            {/* User Avatar / Dropdown Trigger */}
            <div className="relative nav-item">
              <div
                className="h-10 w-10 bg-gray-100 dark:bg-slate-800 rounded-full cursor-pointer flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {isAuthenticated && session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <User2
                    size={20}
                    className="text-gray-400 dark:text-gray-500"
                  />
                )}
              </div>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-slate-700 z-20">
                  {isAuthenticated ? (
                    <>
                      {/* Authenticated State */}
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700">
                        <p className="font-semibold truncate">
                          {session?.user?.name || "User"}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-750 transition cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Guest State */}
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700">
                        <p className="font-semibold">Guest</p>
                      </div>
                      <button
                        onClick={handleSignIn}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-750 transition cursor-pointer"
                      >
                        Sign in with Google
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-xl p-4 transition-all duration-300">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 border-t border-gray-100 dark:border-slate-800 pt-4">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-black dark:text-white"
            />
            {isAuthenticated && (
              <Link
                href="/new"
                className="mt-2 w-full flex justify-center items-center space-x-2 bg-amber-700 dark:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <PenSquare size={16} />
                <span>Create a Post</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
