import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from "sonner"

export const useDeleteCampaign = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { authUser } = useAuthContext();

    const deleteCampaign = async (workspaceId, campaignId) => {

        try {
            setIsLoading(true);
            
            const response = await axios.delete(
                `/api/campaigns/${workspaceId}/${campaignId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authUser.token}`
                    }
                }
            );

            toast.success('Campanha excluída com sucesso');
            return response.data;
        } catch (error) {
            console.error('Erro ao excluir campanha:', error);
            
            const errorMessage = error.response?.data?.message || 
                               'Não foi possível excluir a campanha. Tente novamente.';
            
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { deleteCampaign, isLoading };
}; 