import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, Clock } from "lucide-react";
import { CampanhaDetailsModal } from './CampanhaDetailsModal';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useDeleteCampaign } from '@/hooks/useDeleteCampaign';
import { getStatusLabel } from './utils';
import { CountdownTimer } from './CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import Confetti from 'react-confetti';
import { Toaster } from 'react-hot-toast';
import { useSocketContext } from '@/context/SocketContext';

export const CampanhaCard = ({ campanha, status, isFinishing, isMoving }) => {
    console.log('🎨 CampanhaCard - Constructor:', {
        id: campanha.id,
        status: campanha.status
    });

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const { deleteCampaign, isLoading } = useDeleteCampaign();
    const [countdown, setCountdown] = useState(null);
    const cardRef = useRef(null);
    const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });
    const [showConfetti, setShowConfetti] = useState(false);
    const { socket } = useSocketContext();

    // Status checks
    const isProcessing = campanha.status === 'PROCESSING';


    // Calculate progress
    const progress = status?.progress || 0;
    const totalMessages = campanha.totalMessages || 0;
    const sentMessages = status?.stats?.sent || 0;
    const failedMessages = status?.stats?.failed || 0;

    // Get card dimensions for confetti
    useEffect(() => {
        if (cardRef.current) {
            const { width, height } = cardRef.current.getBoundingClientRect();
            setCardDimensions({ width, height });
        }
    }, []);

    // Log para debug
    console.log('🎯 Renderizando card:', {
        id: campanha.id,
        status: campanha.status,
        isFinishing
    });

    // Debug render
    console.log('🔄 Card Renderizado:', {
        id: campanha.id,
        status: campanha.status,
        isFinishing,
        showConfetti,
        countdown
    });

    // Log inicial para debug
    console.log('🎨 CampanhaCard Render:', {
        id: campanha.id,
        status: campanha.status,
        props: { campanha, status }
    });

    useEffect(() => {
        console.log('👀 CampanhaCard Status Effect:', {
            id: campanha.id,
            status: campanha.status,
            isFinishing
        });

        if (campanha.status === 'Finalizada 🎯' || isFinishing) {
            console.log('🎯 CampanhaCard - Iniciando animação:', campanha.id);
            setShowConfetti(true);
            setCountdown(3);
        }
    }, [campanha.status, campanha.id, isFinishing]);

    // Efeito para animação
    useEffect(() => {
        if (isFinishing) {
            console.log('🎉 Iniciando animação para campanha:', campanha.id);
            setShowConfetti(true);
        }
    }, [isFinishing, campanha.id]);

    useEffect(() => {
        console.log('Status alterado:', campanha.status);
    }, [campanha.status]);

    useEffect(() => {
        if (!socket) return;

        const handleCampaignStatus = (data) => {
            if (data.campaignId === campanha.id && data.status === 'COMPLETED') {
                console.log('🎯 CampanhaCard - Campanha concluída:', {
                    id: campanha.id,
                    status: data.status,
                    stats: data.stats
                });
            }
        };

        socket.on('campaign:completed', handleCampaignStatus);

        return () => {
            socket.off('campaign:completed', handleCampaignStatus);
        };
    }, [socket, campanha.id]);

    useEffect(() => {
        if (!socket) return;

        const handleCampaignFinishing = (data) => {
            if (data.campaignId === campanha.id) {
                console.log('🎯 CampanhaCard - Iniciando animação de finalização:', {
                    id: campanha.id
                });
                setShowConfetti(true);
                setCountdown(3);
            }
        };

        socket.on('campaign:finishing', handleCampaignFinishing);

        return () => {
            socket.off('campaign:finishing', handleCampaignFinishing);
        };
    }, [socket, campanha.id]);

    const handleDelete = async () => {
        try {
            await deleteCampaign(campanha.workspaceId, campanha.id);
            setShowDeleteDialog(false);
            onDelete?.();
        } catch (error) {
            console.error('Erro ao excluir:', error);
        }
    };

    const renderScheduledInfo = () => {
        if (campanha.scheduledTo) {
            const scheduledDate = new Date(campanha.scheduledTo);
            return (
                <div className="text-sm space-y-1 mt-2 p-2 bg-gray-50 rounded">
                    <div className="flex justify-between">
                        <span>Agendada para:</span>
                        <span>{scheduledDate.toLocaleString()}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const cardAnimation = {
        dance: {
            scale: [1, 1.02, 0.98, 1.02, 0.98, 1],
            rotate: [0, -1, 1, -1, 1, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        },
        normal: {
            scale: 1,
            rotate: 0
        }
    };

    return (
        <div 
            ref={cardRef} 
            className={`relative rounded-lg p-4 border ${
                isMoving ? 'animate-pulse bg-yellow-50' : ''
            }`}
        >
            {showConfetti && (
                <Confetti
                    width={cardDimensions.width}
                    height={cardDimensions.height}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                />
            )}
            
            <motion.div
                animate={isFinishing ? {
                    scale: [1, 1.1, 1],
                    y: [0, -10, 0],
                    transition: {
                        duration: 0.5,
                        repeat: 2,
                        repeatType: "reverse"
                    }
                } : {}}
            >
                <Card className={cn(
                    "transition-all duration-300",
                    isFinishing && "border-2 border-green-500 shadow-xl"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="text-lg font-semibold truncate">
                                {campanha.name}
                            </span>
                            {status?.messageInterval && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{status.messageInterval}s</span>
                                </div>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="relative">
                        <div className={isFinishing ? 'opacity-30' : ''}>
                            <div className="space-y-4">
                                {isProcessing && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Progresso</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <Progress value={progress} />
                                        
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium">{totalMessages}</div>
                                                <div className="text-muted-foreground">Total</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium text-green-600">{sentMessages}</div>
                                                <div className="text-muted-foreground">Enviadas</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className="font-medium text-red-600">{failedMessages}</div>
                                                <div className="text-muted-foreground">Falhas</div>
                                            </div>
                                        </div>
                                        
                                        {status?.countdown && (
                                            <CountdownTimer 
                                                endTime={status.countdown} 
                                                onComplete={() => console.log('Countdown completed')}
                                            />
                                        )}
                                    </div>
                                )}

                                {!isProcessing && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Status:</span>
                                        <span className="text-sm font-medium">
                                            {getStatusLabel(campanha.status)}
                                        </span>
                                    </div>
                                )}

                                {renderScheduledInfo()}
                            </div>
                        </div>

                        {isFinishing && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-green-50/90"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        y: [0, -5, 0]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <h3 className="text-2xl font-semibold text-green-600">
                                        Finalizada! 🎯
                                    </h3>
                                </motion.div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <div className="px-6 pb-6 pt-2 border-t">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isProcessing || isFinishing}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Campanha
                </Button>
            </div>

            <CampanhaDetailsModal
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

            <Toaster />
        </div>
    );
};

export default CampanhaCard;