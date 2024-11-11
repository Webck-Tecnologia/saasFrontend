import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

export function useVerifyNumbers() {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { authUser } = useAuthContext();

  const verifyNumbers = async ({ numbers, instanceName }) => {
    const newInstanceName = authUser.activeWorkspaceId + '-' + instanceName;
    
    if (!numbers?.length) {
      toast({
        title: "Erro",
        description: "Nenhum número para verificar",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/whatsapp/verify-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authUser?.token}`
        },
        body: JSON.stringify({
          numbers,
          instanceName: newInstanceName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar números');
      }

      const data = await response.json();
      
      toast({
        title: "Sucesso",
        description: `${data.valid?.length || 0} números válidos encontrados`,
      });

      return data;
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na verificação",
        description: error.message || "Não foi possível verificar os números",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  return { verifyNumbers, isVerifying };
}
