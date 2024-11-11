import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import axios from 'axios';

export const useSearchMessagesCampaign = () => {
    const [messageData, setMessageData] = useState({
        messages: [],
        total: 0,
        pages: 0,
        currentPage: 1
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authUser } = useAuthContext();

    const fetchMessages = async (workspaceId, campaignId, page = 1, limit = 4) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get(
                `/api/message-history/${workspaceId}/${campaignId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authUser.token}`
                    },
                    params: {
                        page,
                        limit
                    }
                }
            );

            setMessageData({
                messages: response.data.data,
                total: response.data.total,
                pages: response.data.pages,
                currentPage: response.data.currentPage
            });
            
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
            setError(error.response?.data?.message || 'Erro ao buscar mensagens');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { 
        messages: messageData.messages,
        total: messageData.total,
        pages: messageData.pages,
        currentPage: messageData.currentPage,
        isLoading, 
        error, 
        fetchMessages 
    };
}; 