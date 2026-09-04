/**
 * Root Layout
 * 
 * The primary layout for the entire application. It sets up:
 * - Global fonts (Archivo and Geist Mono)
 * - Global metadata (SEO title, description, and favicon)
 * - Session provider for authentication
 * - Global UI components (Transitions, Scroll to Top)
 */

import type { Metadata } from "next";
import { Archivo, Geist_Mono } from "next/font/google";
import "./globals.css";
import WhiteScreenTransition from "@/components/WhiteScreenTransition";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import SessionWrapper from "@/components/SessionWrapper";

// Configure the Archivo font for the main body text
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

// Configure Geist Mono for code or technical elements
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata
 * 
 * Defines the default SEO properties for the application.
 */
export const metadata: Metadata = {
  title: "K-Blog — The Modern Editor's Choice",
  description: "A modern blog platform",
  icons: {
    icon: '/k-blog-icon.png',
    apple: '/k-blog-icon.png',
  },
};

/**
 * RootLayout Component
 * 
 * Wraps all pages in the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* SessionWrapper provides authentication context to the entire app */}
        <SessionWrapper>
          {/* Animated page transition overlay */}
          <WhiteScreenTransition />
          
          {/* The actual page content */}
          {children}
          
          {/* Utility button to scroll back to the top of the page */}
          <ScrollToTopButton />
        </SessionWrapper>
      </body>
    </html>
  );
}
