import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useCreateInstance } from '@/hooks/useCreateInstance';
import { connectInstance } from '@/api/connectInstance';
import { useAuthContext } from '@/context/AuthContext';
import { useSocketContext } from '@/context/SocketContext';
import { CheckCircle, Loader } from 'lucide-react';

export default function CreateInstanceModal({ isOpen, onClose, selectedInstance }) {
  const [instanceName, setInstanceName] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const { createInstance, isLoading } = useCreateInstance();
  const { authUser } = useAuthContext();
  const workspaceId = authUser.activeWorkspaceId;
  const { socket } = useSocketContext();
  const [connectionState, setConnectionState] = useState('disconnected');
  const [statusReason, setStatusReason] = useState(null);
  const [fullInstanceName, setFullInstanceName] = useState(null);
  const [closeProgress, setCloseProgress] = useState(0);

  useEffect(() => {
    if (selectedInstance) {
      const instanceNameParts = selectedInstance.name.split('-');
      const actualInstanceName = instanceNameParts.slice(1).join('-');
      
      setInstanceName(actualInstanceName || selectedInstance.name);
      setFullInstanceName(`${workspaceId}-${actualInstanceName || selectedInstance.name}`);
      handleConnectExistingInstance();
    } else {
      resetValues();
    }
  }, [selectedInstance, workspaceId]);

  const setupSocketListeners = useCallback(() => {
    if (socket && fullInstanceName) {
      const handleQRCodeUpdate = (data) => {
        if (data.instance === fullInstanceName) {
          setQrCode(data.qrcode);
        }
      };

      const handleConnectionUpdate = (data) => {
        if (data.instance === fullInstanceName) {
          setConnectionState(data.state);
          setStatusReason(data.statusReason);
          if (data.state === 'open') {
            setQrCode(null);
          }
        }
      };

      socket.on('qrcodeUpdated', handleQRCodeUpdate);
      socket.on('connectionUpdate', handleConnectionUpdate);

      return () => {
        socket.off('qrcodeUpdated', handleQRCodeUpdate);
        socket.off('connectionUpdate', handleConnectionUpdate);
      };
    }
  }, [socket, fullInstanceName]);

  useEffect(() => {
    const cleanup = setupSocketListeners();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupSocketListeners]);

  useEffect(() => {
    let intervalId;
    if (connectionState === 'open') {
      intervalId = setInterval(() => {
        setCloseProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalId);
            handleClose();
            return 100;
          }
          return prev + 2; // Aumenta 2% a cada 100ms
        });
      }, 100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionState]);

  const handleConnectExistingInstance = async () => {
    if (selectedInstance) {
      try {
        const instanceNameParts = selectedInstance.name.split('-');
        const actualInstanceName = instanceNameParts.slice(1).join('-');
        const newFullInstanceName = `${workspaceId}-${actualInstanceName || selectedInstance.name}`;
        
        setFullInstanceName(newFullInstanceName);
        
        socket.emit('joinQRCodeRoom', { instance: newFullInstanceName });
        socket.emit('joinInstanceRoom', { instance: newFullInstanceName });

        const qrCodeData = await connectInstance(newFullInstanceName, authUser.token, workspaceId);
        setQrCode(qrCodeData);
        setConnectionState('qr');
      } catch (error) {
        console.error('Erro ao conectar instância existente:', error);
      }
    }
  };

  const handleCreateInstance = async () => {
    try {
      await createInstance(instanceName, workspaceId);
      const newFullInstanceName = `${workspaceId}-${instanceName}`;
      setFullInstanceName(newFullInstanceName);
      
      socket.emit('joinQRCodeRoom', { instance: newFullInstanceName });
      socket.emit('joinInstanceRoom', { instance: newFullInstanceName });

      const qrCodeData = await connectInstance(newFullInstanceName, authUser.token, workspaceId);
      setQrCode(qrCodeData);
      setConnectionState('qr');
    } catch (error) {
      console.error('Erro ao criar instância:', error);
    }
  };

  const resetValues = () => {
    setInstanceName('');
    setQrCode(null);
    setConnectionState('disconnected');
    setStatusReason(null);
    setFullInstanceName(null);
    setCloseProgress(0);
  };

  const handleClose = () => {
    if (fullInstanceName) {
      socket.emit('leaveQRCodeRoom', { instance: fullInstanceName });
      socket.emit('leaveInstanceRoom', { instance: fullInstanceName });
    }
    resetValues();
    onClose();
  };

  const getConnectionStatus = (status) => {
    return status === 'open' ? 'Conectado' : 'Desconectado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-[425px] ${connectionState === 'open' ? 'bg-green-100' : ''}`}>
        <DialogHeader>
          <DialogTitle className={connectionState === 'open' ? 'text-green-700' : ''}>
            {connectionState === 'open' ? 'Instância Conectada' : (selectedInstance ? 'Conectar Instância Existente' : 'Criar Nova Instância')}
          </DialogTitle>
          <DialogDescription>
            {connectionState === 'open' 
              ? 'Sua instância do WhatsApp está pronta para uso.' 
              : (selectedInstance ? 'Conecte-se a uma instância existente.' : 'Crie uma nova instância do WhatsApp ou conecte-se a uma existente.')}
          </DialogDescription>
        </DialogHeader>
        {!qrCode && connectionState !== 'open' && !selectedInstance ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <Button onClick={handleCreateInstance} disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Instância'}
            </Button>
          </div>
        ) : connectionState === 'open' ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-24 h-24 text-green-500 animate-pulse" />
            <p className="mt-4 text-lg font-semibold text-green-700">Conectado com sucesso!</p>
            <p className="mt-2 text-sm text-green-600">
              Sua instância do WhatsApp está pronta para uso.
            </p>
            <Progress value={closeProgress} className="w-full mt-4 bg-green-200" />
            <p className="mt-2 text-sm text-green-600">
              O modal será fechado em {((100 - closeProgress) / 50).toFixed(1)} segundos
            </p>
          </div>
        ) : selectedInstance && connectionState === 'connecting' ? (
          <div className="flex flex-col items-center">
            <Loader className="w-24 h-24 text-blue-500 animate-spin" />
            <p className="mt-4 text-lg font-semibold text-blue-600">Carregando QR Code...</p>
          </div>
        ) : selectedInstance && qrCode ? (
          <div className="flex flex-col items-center">
            <img src={qrCode} alt="QR Code para conexão" className="w-64 h-64 mb-4" key={qrCode} />
            <p className="mt-4 text-sm text-gray-500 mb-4">
              Escaneie este QR Code com o WhatsApp no seu celular para conectar a instância.
            </p>
            <p className="text-sm font-semibold mb-2">
              Estado da conexão: {getConnectionStatus(connectionState)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img src={qrCode} alt="QR Code para conexão" className="w-64 h-64 mb-4" key={qrCode} />
            <p className="mt-4 text-sm text-gray-500 mb-4">
              Escaneie este QR Code com o WhatsApp no seu celular para conectar a instância.
            </p>
            <p className="text-sm font-semibold mb-2">
              Estado da conexão: {getConnectionStatus(connectionState)}
            </p>
            {statusReason && (
              <p className="text-sm text-gray-500 mb-4">
                Código de status: {statusReason}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
