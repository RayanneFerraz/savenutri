"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { useLanguage } from "@/context/languageContext"
import { useTranslation } from "@/lib/translations"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login, signup } = useAuth()
  const { language } = useLanguage()
  const t = useTranslation(language)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic validation
    if (!email) {
      setError(t("emailRequired"))
      setLoading(false)
      return
    }

    if (!password) {
      setError(t("passwordRequired"))
      setLoading(false)
      return
    }

    if (!isLogin) {
      if (!name) {
        setError(t("nameRequired"))
        setLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError(t("passwordMismatch"))
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
    } catch (err) {
      setError(isLogin ? t("loginError") : t("signupError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? t("loginTitle") : t("signupTitle")}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Welcome back to FastTrack" : "Start your fasting journey today"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("loading") : isLogin ? t("loginButton") : t("signupButton")}
            </Button>

            {isLogin && (
              <div className="text-center">
                <Button type="button" variant="link" className="text-sm text-muted-foreground">
                  {t("forgotPassword")}
                </Button>
              </div>
            )}

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setEmail("")
                  setPassword("")
                  setConfirmPassword("")
                  setName("")
                }}
                className="text-sm"
              >
                {isLogin ? t("switchToSignup") : t("switchToLogin")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
