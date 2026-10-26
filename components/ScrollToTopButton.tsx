/**
 * ScrollToTopButton Component
 *
 * A floating action button (FAB) that appears when the user scrolls down.
 * It provides a quick way to return to the top of the page with a smooth animation.
 */

"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  // State to track if the button should be visible
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Effect: Scroll Listener
   *
   * Monitors the window scroll position and toggles visibility
   * when the user has scrolled past a certain threshold (300px).
   */
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    // Cleanup listener on component unmount
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  /**
   * scrollToTop
   *
   * Triggers the native browser smooth scroll to the top of the document.
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-99 flex items-center justify-center w-9 h-9 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 hover:shadow-amber-600/40 transition-all duration-400 ease-out cursor-pointer active:scale-95 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-6 scale-90 pointer-events-none"
      }`}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}
