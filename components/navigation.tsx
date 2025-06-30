"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, User, Clock, BarChart3, BookOpen, Menu, LogIn, ChefHat } from "lucide-react"
import { useLanguage } from "@/context/languageContext" // Import useLanguage

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage() // Use the t function

  const navItems = [
    { href: "/", labelKey: "home" as const, icon: Home },
    { href: "/timer", labelKey: "timer" as const, icon: Clock },
    { href: "/progress", labelKey: "progress" as const, icon: BarChart3 },
    { href: "/learn", labelKey: "learn" as const, icon: BookOpen },
    { href: "/recipes", labelKey: "recipes" as const, icon: ChefHat },
    { href: "/profile", labelKey: "profile" as const, icon: User },
  ]

  const NavLink = ({
    href,
    labelKey,
    icon: Icon,
    mobile = false,
  }: {
    href: string
    labelKey: "home" | "timer" | "progress" | "learn" | "recipes" | "profile"
    icon: any
    mobile?: boolean
  }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        pathname === href ? "bg-[#F2AEE7] text-[#F24E29]" : "text-gray-600 hover:bg-[#F2EAE4] hover:text-[#F24E29]"
      } ${mobile ? "w-full justify-start" : ""}`}
      onClick={() => mobile && setIsOpen(false)}
    >
      <Icon className="w-4 h-4" />
      <span className={mobile ? "" : "hidden md:inline"}>{t(labelKey)}</span>
    </Link>
  )

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span style={{ color: "#F2AEE7" }}>Save</span>
              <span style={{ color: "#F27D16" }}>Nutri</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} labelKey={item.labelKey} icon={item.icon} />
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:block">
            <Link href="/auth">
              {/* Assuming "Entrar" is a general "Login" or "Sign In" */}
              <Button className="bg-gradient-to-r from-[#F27D16] to-[#F24E29] hover:from-[#F27D16]/90 hover:to-[#F24E29]/90 text-white">
                <LogIn className="w-4 h-4 mr-2" />
                {t("login")} {/* Placeholder, ideally a "login" key */}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <NavLink key={item.href} href={item.href} labelKey={item.labelKey} icon={item.icon} mobile />
                ))}
                <div className="pt-4 border-t">
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-[#F27D16] to-[#F24E29] hover:from-[#F27D16]/90 hover:to-[#F24E29]/90 text-white">
                      <LogIn className="w-4 h-4 mr-2" />
                      {t("login")} {/* Placeholder */}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
