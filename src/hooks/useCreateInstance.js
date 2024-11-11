import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

function generateInstanceId(name) {
  return name.toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

export function useCreateInstance() {
  const [isLoading, setIsLoading] = useState(false);
  const { authUser } = useAuthContext();
  const { toast } = useToast();
  const workspaceId  = authUser.activeWorkspaceId;

  const createInstance = async (instanceName) => {
    setIsLoading(true);
    const instanceId = generateInstanceId(instanceName);

    try {
      const response = await fetch(`/api/instances/${workspaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser.token}`
        },
        body: JSON.stringify({
          name: instanceName,
          instanceId,
          workspaceId: authUser.activeWorkspaceId,
          status: 'WAITING_QR'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Instância criada com sucesso!",
          description: `A instância ${instanceName} foi criada.`,
          variant: "default",
        });
        return data;
      } else {
        throw new Error(data.message || 'Erro ao criar instância');
      }
    } catch (error) {
      toast({
        title: "Erro ao criar instância",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createInstance, isLoading };
}
