"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/context/languageContext"

export default function VerifyEmailPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#F24E29] mb-2">FastTrack</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-[#F2AEE7] to-[#F2C12E] text-white rounded-t-lg">
            <CardTitle className="text-center text-xl">{t("checkYourEmail")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#F2EAE4] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#F24E29]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("verificationEmailSent")}</h2>
              <p className="text-gray-600">{t("clickLinkToVerify")}</p>
            </div>

            <div className="bg-[#F2EAE4] p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-700">{t("didntReceiveEmail")}</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>{t("checkSpamFolder")}</li>
                <li>{t("checkEmailAddress")}</li>
                <li>{t("waitFewMinutes")}</li>
              </ul>
            </div>

            <Link href="/auth">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("backToLogin")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
