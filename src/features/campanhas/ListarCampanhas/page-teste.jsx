'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useFetchCampaign } from '@/hooks/useFetchCampaign'
import { useCampaignSocket } from '@/hooks/useCampaignSocket'
import { Loader2, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDeleteCampaign } from '@/hooks/useDeleteCampaign'
import { CampaignDetailsDialog } from "@/components/ui/campaign-details-dialog"

// Função para traduzir os status
const getStatusLabel = (status) => {
    const statusMap = {
        'PENDING': 'Pendente',
        'PROCESSING': 'Em Andamento',
        'COMPLETED': 'Concluída',
        'COMPLETED_WITH_ERRORS': 'Concluída com Erros',
        'ERROR': 'Erro',
        'FAILED': 'Falhou',
        'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
};

const CampanhaCard = ({ campanha, onDelete, status }) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const { deleteCampaign, isLoading } = useDeleteCampaign()
    const isProcessing = campanha.status === 'PROCESSING'

    const handleDelete = async () => {
        try {
            await deleteCampaign(campanha.workspaceId, campanha.id)
            setShowDeleteDialog(false)
            onDelete?.()
        } catch (error) {
            console.error('Erro ao excluir:', error)
        }
    }

    return (
        <>
            <Card 
                className={`transition-shadow ${
                    isProcessing ? 'border-blue-400 shadow-blue-100' : ''
                } hover:shadow-lg`}
            >
                <div 
                    className="cursor-pointer"
                    onClick={() => setShowDetailsDialog(true)}
                >
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{campanha.name}</span>
                            <span className={`text-sm px-2 py-1 rounded ${
                                campanha.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                campanha.status === 'ERROR' ? 'bg-red-100 text-red-800' :
                                campanha.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {getStatusLabel(campanha.status)}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isProcessing && (
                            <div className="space-y-2">
                                <Progress 
                                    value={status?.progress || 0} 
                                    className="w-full" 
                                />
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span>Progresso:</span>
                                        <span>{status?.progress || 0}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Mensagens:</span>
                                        <span>
                                            {status?.currentMessage || 0}/
                                            {status?.totalMessages || campanha.totalMessages || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Sucesso:</span>
                                        <span>{status?.stats?.sent || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <span>Falhas:</span>
                                        <span>{status?.stats?.failed || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isProcessing && (
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span>{campanha.totalMessages}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Enviadas:</span>
                                    <span>{campanha.successCount || 0}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Falhas:</span>
                                    <span>{campanha.failureCount || 0}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>

                <div className="px-6 pb-4 pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteDialog(true)
                        }}
                        disabled={isProcessing}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Campanha
                    </Button>
                </div>
            </Card>

            <CampaignDetailsDialog
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}
                campaign={campanha}
                status={status}
            />

            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Excluir Campanha"
                description="Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita."
                onConfirm={handleDelete}
                isLoading={isLoading}
            />
        </>
    )
}

const ListarCampanhas = () => {
    const { campaigns, campaignsStatus } = useCampaignSocket();
    
    // Use useMemo para evitar re-renders desnecessários
    const filteredCampaigns = useMemo(() => {
        return campaigns;
    }, [campaigns]);

    const renderCampanhas = (filteredCampaigns) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map(campanha => (
                <CampanhaCard 
                    key={campanha.id} 
                    campanha={campanha}
                    status={campaignsStatus[campanha.id]}
                />
            ))}
        </div>
    );

    return (
        <div className="h-screen overflow-hidden">
            <main className="h-full overflow-y-auto">
                <div className="p-4 pb-[30px] space-y-6">
                    <Tabs defaultValue="em_andamento" className="w-full">
                        <TabsList>
                            <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
                            <TabsTrigger value="completed">Concluídas</TabsTrigger>
                            <TabsTrigger value="failed">Falhas</TabsTrigger>
                            <TabsTrigger value="todas">Todas</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="em_andamento" className="mt-4">
                            {renderCampanhas(filteredCampaigns.filter(c => c.status === 'PROCESSING'))}
                        </TabsContent>

                        <TabsContent value="completed" className="mt-4">
                            {renderCampanhas(filteredCampaigns.filter(c => c.status === 'COMPLETED'))}
                        </TabsContent>

                        <TabsContent value="failed" className="mt-4">
                            {renderCampanhas(filteredCampaigns.filter(c => 
                                c.status === 'ERROR' || c.status === 'COMPLETED_WITH_ERRORS'
                            ))}
                        </TabsContent>

                        <TabsContent value="todas" className="mt-4">
                            {renderCampanhas(filteredCampaigns)}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default ListarCampanhas
