'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useCampaignSocket } from '@/hooks/useCampaignSocket'
import { Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useDeleteCampaign } from '@/hooks/useDeleteCampaign'
import { CampaignDetailsDialog } from "@/components/ui/campaign-details-dialog"
import { CountdownTimer } from './CountdownTimer'
import { Toaster } from 'react-hot-toast';
import { useSocketContext } from '@/context/SocketContext';
import { useToast } from "@/hooks/use-toast"
import Confetti from 'react-confetti';
import { useNavigate } from 'react-router-dom';
import { CelebrationModal } from '@/components/CelebrationModal';

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

const CampanhaCard = ({ campanha, status }) => {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = React.useState(false)
    const { deleteCampaign, isLoading } = useDeleteCampaign()
    const isProcessing = campanha.status === 'PROCESSING'

    const handleDelete = async () => {
        try {
            console.log('Deleting campaign with ID:', campanha.id);
            console.log('Workspace ID:', campanha.workspaceId);
            await deleteCampaign(campanha.workspaceId, campanha.id)
            setShowDeleteDialog(false)
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
                                        <span>{Math.round(status?.progress || 0)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Mensagens:</span>
                                        <span>
                                            {status?.stats?.sent || 0}/
                                            {campanha.totalMessages || 0}
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
                                    <CountdownTimer countdown={status?.countdown} />
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
                                    <span>{campanha.successCount || status?.stats?.sent || 0}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Falhas:</span>
                                    <span>{campanha.failureCount || status?.stats?.failed || 0}</span>
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
    const { 
        campaigns, 
        campaignsStatus,
        completedCampaign,
        showCelebration,
        handleCloseCelebration
    } = useCampaignSocket();
    const [activeTab, setActiveTab] = useState('em_andamento');
    const navigate = useNavigate();

    // Função para obter a mensagem de estado vazio
    const getEmptyMessage = (tab) => {
        const messages = {
            em_andamento: 'Nenhuma campanha em andamento no momento',
            agendadas: 'Nenhuma campanha agendada no momento',
            completed: 'Nenhuma campanha concluída ainda',
            failed: 'Nenhuma campanha com falhas',
            todas: 'Nenhuma campanha criada ainda'
        };
        return messages[tab] || 'Nenhuma campanha encontrada';
    };

    const renderEmptyState = (tab) => (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">{getEmptyMessage(tab)}</p>
            <Button 
                onClick={() => navigate('/app/campanhas/disparador')}
                className="flex items-center gap-2"
            >
                <Plus size={16} />
                Criar Nova Campanha
            </Button>
        </div>
    );

    const renderCampanhas = (campanhas, currentTab) => {
        if (!campanhas || campanhas.length === 0) {
            return renderEmptyState(currentTab);
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campanhas.map((campanha) => (
                    <CampanhaCard 
                        key={campanha.id} 
                        campanha={campanha} 
                        status={campaignsStatus[campanha.id]}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Modal de Celebração */}
            <CelebrationModal
                isOpen={showCelebration}
                onClose={handleCloseCelebration}
                campaign={completedCampaign}
                stats={completedCampaign?.stats}
            />

            <div className="h-screen overflow-hidden">
                <main className="h-full overflow-y-auto">
                    <div className="max-w-[1600px] pb-[60px] mx-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-semibold">Campanhas</h1>
                            <Button 
                                onClick={() => navigate('/app/campanhas/disparador')}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Nova Campanha
                            </Button>
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <Tabs 
                                value={activeTab} 
                                onValueChange={setActiveTab} 
                                className="w-full"
                            >
                                <div className="border-b">
                                    <TabsList className="h-12 w-full justify-start gap-4 rounded-none bg-transparent p-0">
                                        <TabsTrigger 
                                            value="em_andamento"
                                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-4"
                                        >
                                            Em Andamento
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="agendadas"
                                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-4"
                                        >
                                            Agendadas
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="completed"
                                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-4"
                                        >
                                            Concluídas
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="failed"
                                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-4"
                                        >
                                            Falhas
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="todas"
                                            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-4"
                                        >
                                            Todas
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-6">
                                    <TabsContent value="em_andamento" className="mt-4">
                                        {renderCampanhas(
                                            campaigns.filter(c => 
                                                c.status === 'PROCESSING' || 
                                                c.status === 'Finalizada 🎯'
                                            ),
                                            'em_andamento'
                                        )}
                                    </TabsContent>

                                    <TabsContent value="agendadas" className="mt-4">
                                        {renderCampanhas(
                                            campaigns.filter(c => c.status === 'SCHEDULED'),
                                            'agendadas'
                                        )}
                                    </TabsContent>

                                    <TabsContent value="completed" className="mt-4">
                                        {renderCampanhas(
                                            campaigns.filter(c => c.status === 'COMPLETED'),
                                            'completed'
                                        )}
                                    </TabsContent>

                                    <TabsContent value="failed" className="mt-4">
                                        {renderCampanhas(
                                            campaigns.filter(c => 
                                                c.status === 'ERROR' || 
                                                c.status === 'FAILED' ||
                                                c.status === 'COMPLETED_WITH_ERRORS'
                                            ),
                                            'failed'
                                        )}
                                    </TabsContent>

                                    <TabsContent value="todas" className="mt-4">
                                        {renderCampanhas(campaigns, 'todas')}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default ListarCampanhas;
