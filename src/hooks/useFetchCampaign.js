import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from '@/context/AuthContext';
import { useSocketContext } from '@/context/SocketContext';

export const useFetchCampaign = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campanhas, setCampanhas] = useState([]);
  const [campanhasStatus, setCampanhasStatus] = useState({});
  const { toast } = useToast();
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();
  const workspaceId = authUser.activeWorkspaceId;

  // Busca inicial das campanhas
  useEffect(() => {
    fetchCampanhas();
  }, [workspaceId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Atualização de progresso da campanha
    socket.on('campaignUpdate', handleCampaignUpdate);
    socket.on('campaignComplete', handleCampaignComplete);
    socket.on('campaignError', handleCampaignError);

    return () => {
      if (socket) {
        socket.off('campaignUpdate', handleCampaignUpdate);
        socket.off('campaignComplete', handleCampaignComplete);
        socket.off('campaignError', handleCampaignError);
      }
    };
  }, [socket]); // Adiciona socket como dependência

  const handleCampaignUpdate = (data) => {
    setCampanhasStatus(prev => ({
      ...prev,
      [data.campaignId]: {
        status: data.status,
        progress: Math.round((data.currentMessage / data.totalMessages) * 100),
        successCount: data.successCount,
        failureCount: data.failureCount,
        totalMessages: data.totalMessages,
        currentMessage: data.currentMessage
      }
    }));

    // Atualiza também o status na lista de campanhas
    setCampanhas(prev => prev.map(camp => 
      camp.id === data.campaignId 
        ? { 
            ...camp, 
            status: data.status,
            successCount: data.successCount,
            failureCount: data.failureCount
          }
        : camp
    ));
  };

  const handleCampaignComplete = (data) => {
    setCampanhas(prev => prev.map(camp => 
      camp.id === data.campaignId 
        ? { 
            ...camp, 
            status: data.status,
            successCount: data.successCount,
            failureCount: data.failureCount,
            totalMessages: data.totalMessages,
            error: data.error
          }
        : camp
    ));

    setCampanhasStatus(prev => ({
      ...prev,
      [data.campaignId]: {
        status: data.status,
        progress: 100,
        successCount: data.successCount,
        failureCount: data.failureCount,
        totalMessages: data.totalMessages,
        error: data.error
      }
    }));

    toast({
      title: data.status === 'FAILED' ? "Erro na Campanha" : "Campanha Finalizada",
      description: data.error || 
        `Status: ${data.status}, Sucesso: ${data.successCount}, Falhas: ${data.failureCount}`,
      variant: data.status === 'FAILED' ? "destructive" : "default",
    });
  };

  const handleCampaignError = (data) => {
    // Atualiza o status da campanha com erro
    setCampanhas(prev => prev.map(camp => 
      camp.id === data.campaignId 
        ? { ...camp, status: 'FAILED', error: data.error }
        : camp
    ));

    toast({
      title: "Erro na Campanha",
      description: data.error,
      variant: "destructive",
    });
  };

  const fetchCampanhas = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
        const response = await fetch(`/api/campaigns/${workspaceId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (!response.ok) {
            throw new Error('Falha ao buscar campanhas');
        }
        
        const data = await response.json();
        setCampanhas(data);
    } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
        toast({
            title: "Erro",
            description: "Falha ao carregar campanhas. Tente novamente mais tarde.",
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const determineMessageType = (selectedType) => {
    switch (selectedType) {
      case 'mensagem_imagem':
      case 'mensagem_documento':
        return 'MEDIA';
      case 'audio':
        return 'AUDIO';
      case 'mensagem':
      default:
        return 'TEXT';
    }
  };

  const createCampaign = async (formData) => {
    setIsLoading(true);
    
    try {
      const payload = new FormData();
      
      // Log para debug
      console.log('Tipo da campanha:', formData.tipo);
      console.log('Arquivo:', formData.arquivo);
      
      // Dados básicos
      payload.append("name", formData.nome);
      payload.append("messageInterval", formData.intervalo);
      payload.append("startImmediately", formData.inicioImediato);
      
      // Data de agendamento
      const scheduledDate = formData.inicioImediato 
        ? new Date() 
        : new Date(formData.dataInicio);
      payload.append("scheduledTo", scheduledDate.toISOString());

      // Define o tipo baseado na seleção do dropdown
      const campaignType = determineMessageType(formData.tipo);
      payload.append('type', campaignType);

      // Adiciona o arquivo como 'media' se for tipo MEDIA
      if (campaignType === 'MEDIA') {
        if (!formData.arquivo) {
          throw new Error('É necessário anexar um arquivo para campanhas do tipo MEDIA');
        }
        
        // Anexa o arquivo sempre como 'media'
        payload.append('media', formData.arquivo);
        console.log('Arquivo anexado ao payload como media:', formData.arquivo.name);
      }

      // Adicionar mensagens
      const messages = formData.mensagens.map(msg => ({
        type: campaignType,
        content: msg.principal,
        variations: msg.alternativas.filter(alt => alt.trim() !== '')
      }));
      
      payload.append('messages', JSON.stringify(messages));
      payload.append('instanceIds', JSON.stringify([formData.instancia]));
      
      // Arquivo CSV
      if (formData.csvFile) {
        payload.append('csv', formData.csvFile);
      }

      // Log do payload final
      for (let pair of payload.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await fetch(`/api/campaigns/${workspaceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: payload
      });

      const data = await response.json();
      console.log('Resposta do servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao criar campanha');
      }

      setCampanhas(prev => [data.data, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Campanha criada com sucesso",
      });

      return data.data;

    } catch (error) {
      console.error('Erro detalhado ao criar campanha:', error);
      
      let errorMessage = 'Ocorreu um erro ao criar a campanha';
      
      if (error.message.includes('arquivo')) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.message === 'string') {
        errorMessage = error.message;
      }

      toast({
        title: "Erro ao criar campanha",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createCampaign, 
    isLoading, 
    campanhas, 
    campanhasStatus,
    fetchCampanhas
  };
};
