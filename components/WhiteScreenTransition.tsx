/**
 * WhiteScreenTransition Component
 *
 * Provides a smooth "flash" transition between page loads or route changes.
 * Its primary purpose is to hide the "Flash of Unstyled Content" (FOUC) or
 * initial animation calculation glitches by covering the screen with a white overlay
 * and then fading it out once the new content is ready.
 */

"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function WhiteScreenTransition() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /**
   * Effect: Trigger transition on route change
   */
  useGSAP(
    () => {
      if (overlayRef.current) {
        // 1. Immediately show the white overlay
        gsap.set(overlayRef.current, { opacity: 1, display: "block" });

        // 2. Fade out the overlay after a short delay.
        // The delay (0.2s) allows other components (like Header/Main) to
        // initialize their GSAP 'from' states invisibly behind the curtain.
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.inOut",
          onComplete: () => {
            // 3. Hide the element entirely once the fade is finished to allow interactions
            gsap.set(overlayRef.current, { display: "none" });
          },
        });
      }
    },
    { dependencies: [pathname], scope: overlayRef },
  ); // Re-run whenever the route (pathname) changes

  return (
    <div
      ref={overlayRef}
      // Fixed overlay with high z-index to stay on top of all other elements
      className="fixed inset-0 bg-white dark:bg-[#0b0f19] z-9999 pointer-events-none"
    />
  );
}
