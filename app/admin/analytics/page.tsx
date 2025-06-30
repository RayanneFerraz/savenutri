"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Globe, Smartphone, Clock, MapPin, Monitor, Activity, Eye, MousePointer, RefreshCw } from "lucide-react"
import { analytics } from "@/lib/analytics"
import Link from "next/link"

export default function AnalyticsDetailPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = () => {
    setLoading(true)
    setTimeout(() => {
      const data = analytics.getAnalyticsData()
      setAnalyticsData(data)
      setLoading(false)
    }, 1000)
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F24E29] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de analytics...</p>
        </div>
      </div>
    )
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2EAE4] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#F24E29] mb-2">Analytics Detalhado</h1>
              <p className="text-gray-600 text-lg">Análise completa do comportamento dos usuários</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadAnalytics} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
              <Link href="/admin">
                <Button variant="outline">Voltar ao Admin</Button>
              </Link>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F2AEE7] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#F24E29]" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">{analyticsData?.totalUsers || 0}</div>
                <div className="text-sm text-gray-600">Total de Usuários</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F2C12E] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-[#F24E29]" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">{analyticsData?.activeUsers || 0}</div>
                <div className="text-sm text-gray-600">Usuários Ativos (24h)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F27D16] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">
                  {formatTime(analyticsData?.behaviorStats?.averageSessionTime || 0)}
                </div>
                <div className="text-sm text-gray-600">Tempo Médio de Sessão</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#F24E29] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-[#F24E29]">
                  {Object.keys(analyticsData?.demographics?.topCountries || {}).length}
                </div>
                <div className="text-sm text-gray-600">Países Diferentes</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="demographics" className="mb-8">
            <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-4">
              <TabsTrigger value="demographics">Demografia</TabsTrigger>
              <TabsTrigger value="location">Localização</TabsTrigger>
              <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            </TabsList>

            <TabsContent value="demographics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Distribuição por Faixa Etária
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.demographics?.ageGroups || {}).map(([age, count]) => (
                        <div key={age} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{age} anos</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#F24E29] h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...Object.values(analyticsData?.demographics?.ageGroups || {}))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Distribuição por Gênero (Estimado)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.demographics?.genderDistribution || {}).map(([gender, count]) => (
                        <div key={gender} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{gender}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#F2AEE7] h-2 rounded-full"
                                style={{
                                  width: `${(count / Math.max(...Object.values(analyticsData?.demographics?.genderDistribution || {}))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        ⚠️ <strong>Aviso:</strong> Os dados de gênero são estimativas baseadas em padrões demográficos
                        gerais e não devem ser considerados precisos.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="location">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Top Países
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.demographics?.topCountries || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([country, count]) => (
                          <div key={country} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{country}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#F24E29] h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(analyticsData?.demographics?.topCountries || {}))) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Top Cidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.demographics?.topCities || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([city, count]) => (
                          <div key={city} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{city}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#F2C12E] h-2 rounded-full"
                                  style={{
                                    width: `${(count / Math.max(...Object.values(analyticsData?.demographics?.topCities || {}))) * 100}%`,
                                  }}
                                ></div>
                              </div>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="devices">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Tipos de Dispositivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.deviceStats?.deviceTypes || {}).map(([device, count]) => (
                        <div key={device} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{device}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Navegadores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.deviceStats?.browsers || {}).map(([browser, count]) => (
                        <div key={browser} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{browser}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Sistemas Operacionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.deviceStats?.operatingSystems || {}).map(([os, count]) => (
                        <div key={os} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{os}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="behavior">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Páginas Mais Visitadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.behaviorStats?.mostVisitedPages || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([page, count]) => (
                          <div key={page} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{page}</span>
                            <Badge variant="outline">{count} visitas</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#F24E29] flex items-center gap-2">
                      <MousePointer className="w-5 h-5" />
                      Ações Mais Comuns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(analyticsData?.behaviorStats?.commonActions || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([action, count]) => (
                          <div key={action} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{action}</span>
                            <Badge variant="outline">{count}x</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Aviso sobre Privacidade */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-blue-800 mb-2">🔒 Informações sobre Privacidade e Dados</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  <strong>Geolocalização por IP:</strong> Obtida através de APIs públicas (ipapi.co). Precisão varia
                  entre cidade/região.
                </p>
                <p>
                  <strong>Demografia:</strong> Estimativas baseadas em padrões demográficos gerais, não são dados reais
                  dos usuários.
                </p>
                <p>
                  <strong>Dispositivos:</strong> Detectados através do User-Agent do navegador.
                </p>
                <p>
                  <strong>Comportamento:</strong> Rastreado apenas durante a sessão ativa no site.
                </p>
                <p>
                  <strong>Armazenamento:</strong> Dados salvos localmente no navegador (localStorage).
                </p>
                <p>
                  <strong>LGPD/GDPR:</strong> Em produção, implemente consentimento explícito e política de privacidade.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
