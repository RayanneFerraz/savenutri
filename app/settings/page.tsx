import NotificationManager from "@/components/notification-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-600">Personalize sua experiência no FastTrack</p>
      </div>

      <div className="space-y-8">
        <NotificationManager />

        <Card>
          <CardHeader>
            <CardTitle>Outras Configurações</CardTitle>
            <CardDescription>Mais opções de personalização em breve...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Em desenvolvimento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
