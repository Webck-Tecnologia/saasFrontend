import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { useAuthContext } from '@/context/AuthContext';
import { useFetchCampaign } from './useFetchCampaign';
import { toast } from 'react-hot-toast';

export const useCampaignSocket = () => {
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const { campanhas: initialCampaigns, fetchCampanhas } = useFetchCampaign();
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsStatus, setCampaignsStatus] = useState({});
  const [finishingCampaigns, setFinishingCampaigns] = useState(new Set());
  const [movingCampaigns, setMovingCampaigns] = useState(new Set());
  const [completedCampaign, setCompletedCampaign] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Função para forçar atualização
  const refreshCampaigns = useCallback(async () => {
    const updatedCampaigns = await fetchCampanhas();
    setCampaigns(updatedCampaigns);
  }, [fetchCampanhas]);

  // Sincroniza campanhas iniciais
  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  // Handler para nova campanha
  const handleCampaignStarted = useCallback((data) => {
    console.log('🚀 Nova campanha iniciada com intervalo:', data.messageInterval);
    
    const messageInterval = data.messageInterval || 30;
    
    setCampaigns(prev => {
      const exists = prev.some(c => c.id === data.campaignId);
      if (exists) {
        return prev.map(c => 
          c.id === data.campaignId 
            ? {
                ...c,
                status: 'PROCESSING',
                totalMessages: data.totalMessages,
                messageInterval
              } 
            : c
        );
      }
      return [...prev, {
        id: data.campaignId,
        name: data.name,
        status: 'PROCESSING',
        workspaceId: data.workspaceId,
        totalMessages: data.totalMessages,
        totalContacts: data.totalContacts,
        messageInterval
      }];
    });

    setCampaignsStatus(prev => ({
      ...prev,
      [data.campaignId]: {
        progress: 0,
        currentCount: 0,
        totalMessages: data.totalMessages,
        stats: { sent: 0, failed: 0 },
        status: 'PROCESSING',
        messageInterval,
        countdown: messageInterval,
        lastUpdate: Date.now()
      }
    }));
  }, []);

  // Handler para mensagem enviada
  const handleMessageSent = useCallback((data) => {
    console.log('📨 Mensagem enviada, resetando countdown:', data);
    
    setCampaignsStatus(prev => {
      const currentStatus = prev[data.campaignId];
      if (!currentStatus) return prev;

      // Pega o intervalo original
      const messageInterval = currentStatus.messageInterval;
      console.log(`⚡ Intervalo original: ${messageInterval}s`);

      const stats = currentStatus.stats || { sent: 0, failed: 0 };
      const newStats = {
        sent: data.status === 'SENT' ? stats.sent + 1 : stats.sent,
        failed: data.status === 'FAILED' ? stats.failed + 1 : stats.failed
      };

      const totalProcessed = newStats.sent + newStats.failed;
      const progress = (totalProcessed / currentStatus.totalMessages) * 100;

      const newStatus = {
        ...currentStatus,
        progress,
        currentCount: totalProcessed,
        stats: newStats,
        lastMessageStatus: data.status,
        lastMessageContact: data.contact,
        lastMessageTime: data.sentAt,
        countdown: messageInterval,
        lastUpdate: Date.now()
      };

      console.log('🔄 Novo status:', {
        campaignId: data.campaignId,
        countdown: newStatus.countdown,
        messageInterval
      });

      return {
        ...prev,
        [data.campaignId]: newStatus
      };
    });
  }, []);

  // Handler para campanha concluída
  const handleCampaignCompleted = useCallback((data) => {
    console.log('✅ Socket - Campanha concluída:', data);
    
    // 1. Atualiza o status da campanha
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === data.campaignId 
        ? { ...campaign, status: 'Finalizada 🎯', stats: data.stats }
        : campaign
    ));
    
    // 2. Busca a campanha completa para mostrar no modal
    const completedCampaign = campaigns.find(c => c.id === data.campaignId);
    if (completedCampaign) {
      setCompletedCampaign({
        ...completedCampaign,
        stats: data.stats
      });
      setShowCelebration(true);
    }

    // 3. Após 5 segundos, move para concluídas
    setTimeout(() => {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === data.campaignId 
          ? { ...campaign, status: 'COMPLETED' }
          : campaign
      ));
    }, 5000);
  }, [campaigns]);

  // Função para fechar o modal de celebração
  const handleCloseCelebration = useCallback(() => {
    setShowCelebration(false);
    setCompletedCampaign(null);
  }, []);

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !authUser?.activeWorkspaceId) return;

    socket.emit('joinWorkspaceRoom', authUser.activeWorkspaceId);
    console.log('👋 Entrando na sala do workspace:', authUser.activeWorkspaceId);
    
    socket.on('campaignStarted', handleCampaignStarted);
    socket.on('messageSent', handleMessageSent);
    socket.on('campaignCompleted', handleCampaignCompleted);

    return () => {
      console.log('👋 Saindo da sala do workspace:', authUser.activeWorkspaceId);
      socket.off('campaignStarted', handleCampaignStarted);
      socket.off('messageSent', handleMessageSent);
      socket.off('campaignCompleted', handleCampaignCompleted);
      socket.emit('leaveWorkspaceRoom', authUser.activeWorkspaceId);
    };
  }, [
    socket, 
    authUser?.activeWorkspaceId, 
    handleCampaignStarted, 
    handleMessageSent,
    handleCampaignCompleted
  ]);

  // Timer para countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCampaignsStatus(prev => {
        const now = Date.now();
        let updated = false;
        
        const newStatus = Object.entries(prev).reduce((acc, [campaignId, status]) => {
          if (status.status === 'PROCESSING' && status.countdown > 0) {
            const elapsed = Math.floor((now - status.lastUpdate) / 1000);
            const newCountdown = Math.max(0, status.countdown - elapsed);
            
            if (newCountdown !== status.countdown) {
              updated = true;
              acc[campaignId] = {
                ...status,
                countdown: newCountdown,
                lastUpdate: now
              };
            } else {
              acc[campaignId] = status;
            }
          } else {
            acc[campaignId] = status;
          }
          return acc;
        }, {});

        return updated ? newStatus : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Timer independente que roda durante toda a vida do componente

  useEffect(() => {
    if (!socket) return;

    socket.on('campaignCompleted', handleCampaignCompleted);

    return () => {
      socket.off('campaignCompleted', handleCampaignCompleted);
    };
  }, [socket, handleCampaignCompleted]);

  return { 
    campaigns,
    campaignsStatus,
    finishingCampaigns: Array.from(finishingCampaigns),
    movingCampaigns: Array.from(movingCampaigns),
    completedCampaign,
    showCelebration,
    handleCloseCelebration
  };
};
