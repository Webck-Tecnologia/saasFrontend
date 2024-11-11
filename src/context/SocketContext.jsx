import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';
import { useToast } from "@/hooks/use-toast"

const SocketContext = createContext({});

export function SocketContextProvider({ children }) {
  const { authUser } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let socketInstance = null;

    const connectSocket = () => {
      if (!authUser?.id || !authUser?.activeWorkspaceId) {
        console.log('👤 Usuário não autenticado ou workspace não selecionado');
        return;
      }

      try {
        if (socketInstance) {
          socketInstance.disconnect();
        }

        socketInstance = io(import.meta.env.VITE_WS_URL || 'https://saas.bchat.com.br', {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          withCredentials: true,
          transports: ['websocket', 'polling'],
          query: {
            userId: authUser.id,
            workspaceId: authUser.activeWorkspaceId
          },
          cors: {
            origin: "https://disparador.bchat.lat",
            methods: ["GET", "POST"],
            allowedHeaders: ["content-type"],
            credentials: true
          }
        });

        socketInstance.on('connect', () => {
          console.log('✅ Socket conectado!');
          setIsConnected(true);
          setSocket(socketInstance);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('❌ Socket desconectado:', reason);
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('❌ Erro de conexão:', error);
          if (error.message.includes('CORS')) {
            console.error('Erro de CORS detectado. Verificando configurações...');
            toast({
              variant: "destructive",
              title: "Erro de CORS",
              description: "Erro de permissão de acesso ao servidor. Por favor, contate o suporte."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Erro de conexão",
              description: "Não foi possível conectar ao servidor. Tentando reconectar..."
            });
          }
        });

        socketInstance.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Reconectado após ${attemptNumber} tentativas`);
          toast({
            title: "Reconectado",
            description: "Reconectado ao servidor"
          });
        });

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 Tentativa de reconexão ${attemptNumber}`);
        });

        socketInstance.on('reconnect_error', (error) => {
          console.error('❌ Erro na reconexão:', error);
        });

        socketInstance.on('reconnect_failed', () => {
          console.error('❌ Falha na reconexão após todas as tentativas');
          toast({
            variant: "destructive",
            title: "Falha na reconexão",
            description: "Não foi possível reconectar ao servidor"
          });
        });

      } catch (error) {
        console.error('❌ Erro ao criar socket:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível estabelecer conexão com o servidor"
        });
      }
    };

    connectSocket();

    return () => {
      if (socketInstance) {
        console.log('👋 Desconectando socket...');
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [authUser?.id, authUser?.activeWorkspaceId, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext deve ser usado dentro de um SocketContextProvider');
  }
  return context;
};
