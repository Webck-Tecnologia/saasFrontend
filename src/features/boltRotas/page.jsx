'use client'

import React, { useMemo, useState } from 'react'
import { LayoutDashboard, Send, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCampaignSocket } from '@/hooks/useCampaignSocket'
import { CampaignDetailsDialog } from "@/components/ui/campaign-details-dialog"
import { useMessageStats } from '@/hooks/useMessageStats';
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function DashboardRotas() {
  const navigate = useNavigate();
  const { campaigns, campaignsStatus } = useCampaignSocket();
  const { messageStats, isLoading: statsLoading } = useMessageStats();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const hasNoCampaigns = campaigns.length === 0;

  // Cálculo das estatísticas gerais
  const stats = useMemo(() => {
    if (!messageStats?.stats) return {
      totalCampaigns: 0,
      totalMessages: 0,
      totalDelivered: 0,
      deliveryRate: "0%"
    };

    return {
      totalCampaigns: messageStats.stats.totalCampaigns,
      totalMessages: messageStats.stats.messageStats.total,
      totalDelivered: messageStats.stats.messageStats.delivered,
      deliveryRate: messageStats.stats.messageStats.successRate
    };
  }, [messageStats]);

  // Dados para o gráfico de barras
  const campaignPerformance = useMemo(() => {
    return campaigns
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3)
      .map(camp => ({
        name: camp.name.length > 20 ? camp.name.substring(0, 20) + '...' : camp.name,
        enviadas: camp.totalMessages || 0,
        entregues: camp.successCount || 0,
        falhas: camp.failureCount || 0,
        campaignData: camp // Guardamos a referência completa da campanha
      }))
      .reverse();
  }, [campaigns]);

  // Últimas 5 campanhas
  const recentCampaigns = useMemo(() => {
    return campaigns
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [campaigns]);

  // Handler para click na barra
  const handleBarClick = (data) => {
    if (data?.campaignData) {
      setSelectedCampaign(data.campaignData);
      setShowDetailsDialog(true);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard de Campanhas WhatsApp</h2>
          
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats.totalCampaigns}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Entregues</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats.totalDelivered}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  De um total de {stats.totalMessages} mensagens
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                <PlusCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats.deliveryRate}
                </div>
              </CardContent>
            </Card>
          </div>

          {hasNoCampaigns ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Send className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Nenhuma campanha encontrada</h3>
                    <p className="text-sm text-muted-foreground">
                      Você ainda não criou nenhuma campanha. Comece agora mesmo!
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/app/campanhas/disparador')} 
                    className="mt-4"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Nova Campanha
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Gráficos e Últimas Campanhas */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Barras */}
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho das Últimas 3 Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="enviadas" 
                        fill="#8884d8" 
                        name="Total" 
                        onClick={(data) => handleBarClick(data.payload)}
                        style={{ cursor: 'pointer' }}
                      />
                      <Bar 
                        dataKey="entregues" 
                        fill="#82ca9d" 
                        name="Entregues"
                        onClick={(data) => handleBarClick(data.payload)}
                        style={{ cursor: 'pointer' }}
                      />
                      <Bar 
                        dataKey="falhas" 
                        fill="#ff8042" 
                        name="Falhas"
                        onClick={(data) => handleBarClick(data.payload)}
                        style={{ cursor: 'pointer' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Últimas Campanhas (substituindo o gráfico de pizza) */}
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Campanhas</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  <div className="space-y-3">
                    {recentCampaigns.map((campaign) => (
                      <div 
                        key={campaign.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-sm">{campaign.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                            campaign.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status === 'COMPLETED' ? 'Concluída' :
                             campaign.status === 'ERROR' ? 'Erro' :
                             campaign.status === 'PROCESSING' ? 'Em Andamento' :
                             campaign.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="block">Total</span>
                            <span className="font-medium">{campaign.totalMessages}</span>
                          </div>
                          <div>
                            <span className="block text-green-600">Entregues</span>
                            <span className="font-medium">{campaign.successCount || 0}</span>
                          </div>
                          <div>
                            <span className="block text-red-600">Falhas</span>
                            <span className="font-medium">{campaign.failureCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Detalhes da Campanha */}
      <CampaignDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        campaign={selectedCampaign}
        status={selectedCampaign ? campaignsStatus[selectedCampaign.id] : null}
      />
    </div>
  );
}
