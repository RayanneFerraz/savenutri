"use client";

import type React from "react";
import { useEffect } from "react";
import { AnalyticsService } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/admin")) {
      AnalyticsService.initializeSession();
    }
  }, []);

  return <>{children}</>;
}
