import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

export const useMessageStats = () => {
  const [messageStats, setMessageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authUser } = useAuthContext();
  const workspaceId = authUser?.activeWorkspaceId;

  const fetchMessageStats = async () => {
    if (!workspaceId) return;

    try {
      const response = await fetch(`/api/campaigns/${workspaceId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas');
      }

      const data = await response.json();
      setMessageStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessageStats();
  }, [workspaceId]);

  return { messageStats, isLoading, refetch: fetchMessageStats };
}; 