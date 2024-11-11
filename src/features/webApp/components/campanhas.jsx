import { useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { useAuthContext } from '@/context/AuthContext';
import { Card } from "@/components/ui/card"

export default function Campanhas() {
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const [messageStats, setMessageStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    activeInstances: 0
  });

  const setupSocketListeners = useCallback(() => {
    if (!socket || !authUser?.activeWorkspaceId) return;

    // Eventos de instância
    const handleInstanceStatus = (data) => {
      console.log('Status da instância atualizado:', data);
      setMessageStats(prev => ({
        ...prev,
        activeInstances: data.activeInstances || prev.activeInstances
      }));
    };

    // Eventos de mensagens
    const handleMessageSuccess = (data) => {
      console.log('Mensagem enviada com sucesso:', data);
      setMessageStats(prev => ({
        ...prev,
        total: prev.total + 1,
        success: prev.success + 1
      }));
    };

    const handleMessageError = (data) => {
      console.log('Erro no envio da mensagem:', data);
      setMessageStats(prev => ({
        ...prev,
        total: prev.total + 1,
        error: prev.error + 1
      }));
    };

    socket.on('instanceStatusUpdate', handleInstanceStatus);
    socket.on('messageSuccess', handleMessageSuccess);
    socket.on('messageError', handleMessageError);

    return () => {
      socket.off('instanceStatusUpdate', handleInstanceStatus);
      socket.off('messageSuccess', handleMessageSuccess);
      socket.off('messageError', handleMessageError);
    };
  }, [socket, authUser?.activeWorkspaceId]);

  useEffect(() => {
    const cleanup = setupSocketListeners();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupSocketListeners]);

  // Atualizar os cards com as estatísticas
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3>Mensagens Enviadas</h3>
            <p>{messageStats.total}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3>Instâncias Ativas</h3>
            <p>{messageStats.activeInstances}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}