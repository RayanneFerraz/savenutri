import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string
  linkText?: string
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, href, linkText = "Read Article", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0 text-gray-700 leading-relaxed text-base font-normal tracking-wide", className)}
      {...props}
    >
      {children}
      {href && (
        <div className="mt-4">
          <a href={href} className="inline-block w-full text-center no-underline">
            <button className="w-full rounded-md bg-[#F24E29] px-4 py-2 font-medium text-white hover:bg-[#F27D16] transition-colors">
              {linkText}
            </button>
          </a>
        </div>
      )}
    </div>
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
