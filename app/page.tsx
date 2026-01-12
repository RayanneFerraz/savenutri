"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Droplets, Scale, Play, Pause } from "lucide-react"

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [waterCount, setWaterCount] = useState(0)
  const [timeDisplay, setTimeDisplay] = useState("16:00:00")

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading SaveNutri...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">SaveNutri</h1>
          <p className="text-gray-600">Your companion for intermittent fasting</p>
        </header>

        {/* Timer Card */}
        <Card className="mb-6 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Fasting Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 mb-4">{timeDisplay}</div>
              <p className="text-gray-600 mb-4">
                {isTimerActive ? "Fasting in progress..." : "Ready to start your fast"}
              </p>
              <Button
                onClick={() => setIsTimerActive(!isTimerActive)}
                className={`${isTimerActive ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"} text-white px-8 py-3`}
              >
                {isTimerActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    End Fast
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Fast
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          {/* Water Intake */}
          <Card className="shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                <Droplets className="w-4 h-4" />
                Water
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">{waterCount}/8</p>
                <p className="text-xs text-gray-500 mb-2">glasses today</p>
                <Button
                  size="sm"
                  onClick={() => setWaterCount((w) => Math.min(w + 1, 8))}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  + Add Glass
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weight */}
          <Card className="shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                <Scale className="w-4 h-4" />
                Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">--</p>
                <p className="text-xs text-gray-500 mb-2">kg today</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  Log Weight
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-6 shadow-md border-0 bg-orange-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-orange-800 mb-2">Did you know?</h3>
            <p className="text-sm text-orange-700">
              Intermittent fasting can help improve insulin sensitivity, boost metabolism, and support cellular repair
              through autophagy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
