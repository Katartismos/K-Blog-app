/**
 * Session Wrapper Component
 * 
 * Provides a clean wrapper for global client providers.
 */

"use client";

import React from "react";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
