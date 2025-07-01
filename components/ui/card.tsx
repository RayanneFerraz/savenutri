import * as React from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
  showReadButton?: boolean
  articleUrl?: string
  buttonText?: string
  buttonVariant?: "default" | "outline" | "ghost"
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      className,
      showReadButton = false,
      articleUrl,
      buttonText = "Read Article",
      buttonVariant = "outline",
      children,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
      {showReadButton && articleUrl && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link href={articleUrl} className="inline-block w-full">
            <button
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                buttonVariant === "default" && "bg-[#F24E29] text-white hover:bg-[#F24E29]/90",
                buttonVariant === "outline" &&
                  "border border-[#F24E29] text-[#F24E29] hover:bg-[#F24E29] hover:text-white",
                buttonVariant === "ghost" && "text-[#F24E29] hover:bg-[#F24E29]/10",
              )}
            >
              {buttonText}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
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

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardContentProps }
