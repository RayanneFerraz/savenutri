import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#F2AEE7] to-[#F24E29] rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl font-bold text-white">404</span>
          </div>
          <CardTitle className="text-2xl text-gray-900">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            {"The page you're looking for doesn't exist or has been moved. Let's get you back on track!"}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/" className="w-full">
              <Button className="w-full bg-[#F24E29] hover:bg-[#F24E29]/90">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
            <Link href="/timer" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#F24E29] text-[#F24E29] hover:bg-[#F24E29]/10 bg-transparent"
              >
                <Search className="w-4 h-4 mr-2" />
                Start Fasting
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 text-center mb-3">Quick Links</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/progress" className="text-sm text-[#F24E29] hover:underline">
                Progress
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/recipes" className="text-sm text-[#F24E29] hover:underline">
                Recipes
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/learn" className="text-sm text-[#F24E29] hover:underline">
                Learn
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/settings" className="text-sm text-[#F24E29] hover:underline">
                Settings
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
