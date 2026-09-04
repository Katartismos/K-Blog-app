/**
 * Footer Component
 *
 * The global footer of the application. Includes:
 * - Brand logo and slogan
 * - Quick links and legal links
 * - Social media icons
 * - Copyright information
 * - GSAP entrance animation
 */

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const footerRef = useRef(null);

  /**
   * Animation: Footer slides up slightly and fades in after a short delay
   */
  useGSAP(
    () => {
      gsap.from(footerRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.5,
      });
    },
    { scope: footerRef },
  );

  return (
    <footer className="bg-gray-900 text-white mt-16" ref={footerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Grid: Logo and Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-gray-700 pb-8 mb-8">
          {/* Logo & Slogan */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-2">
              <Image
                src="/k-blog-icon.png"
                alt="K-Blog Logo"
                width={30}
                height={30}
                className="w-10 h-10 object-contain shrink-0"
              />
              <span className="text-xl font-bold">K-BLOG</span>
            </div>
            <p className="text-sm text-gray-400">
              Discover your daily source for templates.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="col-span-3 md:col-span-4 flex justify-between md:justify-end space-x-8 lg:space-x-12">
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-300">Quick Links</h5>
              {["About Us", "Contact", "Categories"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="block text-sm text-gray-400 hover:text-amber-500 transition"
                >
                  {link}
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-300">Legal</h5>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="block text-sm text-gray-400 hover:text-amber-500 transition"
                  >
                    {link}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Copyright and Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2026 K-BLOG. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Facebook
              size={20}
              className="social-icon hover:text-amber-500 transition cursor-pointer"
            />
            <Twitter
              size={20}
              className="social-icon hover:text-amber-500 transition cursor-pointer"
            />
            <Instagram
              size={20}
              className="social-icon hover:text-amber-500 transition cursor-pointer"
            />
            <Linkedin
              size={20}
              className="social-icon hover:text-amber-500 transition cursor-pointer"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
