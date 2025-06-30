"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * A simple responsive wrapper that centers page content and adds
 * consistent horizontal & vertical padding.
 * Used by pages like /profile to avoid repeating layout classes.
 */
export const Shell = React.forwardRef<HTMLDivElement, ShellProps>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12 space-y-8", className)} {...props}>
    {children}
  </div>
))

Shell.displayName = "Shell"
