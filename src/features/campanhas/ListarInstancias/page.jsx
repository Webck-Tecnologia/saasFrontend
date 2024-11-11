'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSocketContext } from '@/context/SocketContext'
import { useInstancesFetch } from '@/hooks/useInstancesFetch'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, QrCode, Power, Trash2, Plus, Search, Loader2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import CreateInstanceModal from '@/components/CreateInstanceModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function ListarInstancias() {
  const { 
    instances: initialInstances, 
    isLoading, 
    error, 
    updateInstance, 
    addInstance, 
    removeInstance, 
    fetchSpecificInstance,
    disconnectInstance,
    deleteInstance
  } = useInstancesFetch();
  const [instances, setInstances] = useState(initialInstances);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const { socket } = useSocketContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [instanceToDelete, setInstanceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setInstances(initialInstances);
  }, [initialInstances]);

  const handleConnectionUpdate = useCallback(async (data) => {
    const instanceName = data.instance ? data.instance.split('-').pop() : data.instance;
    
    // Atualizar o estado imediatamente com as informações básicas
    updateInstance({
      name: instanceName,
      connectionStatus: data.state
    });

    // Se a instância foi conectada, aguarde 2 segundos antes de buscar informações adicionais
    if (data.state === 'open') {
      setTimeout(async () => {
        try {
          const updatedInstance = await fetchSpecificInstance(instanceName);
          if (updatedInstance) {
            updateInstance({
              ...updatedInstance,
              name: instanceName,
              connectionStatus: 'open',
              ownerJid: updatedInstance.ownerJid
            });
          }
        } catch (error) {
          console.error('Erro ao buscar informações atualizadas da instância:', error);
        }
      }, 2000); // 2 segundos de delay
    }
  }, [updateInstance, fetchSpecificInstance]);

  useEffect(() => {
    if (socket) {
      const handleInstanceUpdate = async (updatedInstance) => {
        const instanceName = updatedInstance.name ? updatedInstance.name.split('-').pop() : updatedInstance.name;
        updateInstance({
          ...updatedInstance,
          name: instanceName,
          connectionStatus: updatedInstance.connectionStatus || updatedInstance.state,
          ownerJid: updatedInstance.ownerJid || null
        });

        // Se a instância foi conectada, busque informações atualizadas
        if (updatedInstance.connectionStatus === 'open' || updatedInstance.state === 'open') {
          await fetchSpecificInstance(instanceName);
        }
      };

      const handleConnectionUpdate = async (data) => {
        const instanceName = data.instance ? data.instance.split('-').pop() : data.instance;
        
        // Atualizar o estado imediatamente com as informações básicas
        updateInstance({
          name: instanceName,
          connectionStatus: data.state
        });

        // Se a instância foi conectada, aguarde 2 segundos antes de buscar informações adicionais
        if (data.state === 'open') {
          setTimeout(async () => {
            try {
              const updatedInstance = await fetchSpecificInstance(instanceName);
              if (updatedInstance) {
                updateInstance({
                  ...updatedInstance,
                  name: instanceName,
                  connectionStatus: 'open',
                  ownerJid: updatedInstance.ownerJid
                });
              }
            } catch (error) {
              console.error('Erro ao buscar informações atualizadas da instância:', error);
            }
          }, 2000); // 2 segundos de delay
        }
      };

      const handleQRCodeUpdate = (data) => {
        const instanceName = data.instance ? data.instance.split('-').pop() : data.instance;
        updateInstance({
          name: instanceName,
          qrCode: data.qrcode,
          connectionStatus: 'qrcode'
        });
      };

      socket.on('instanceUpdated', handleInstanceUpdate);
      socket.on('connectionUpdate', handleConnectionUpdate);
      socket.on('qrcodeUpdated', handleQRCodeUpdate);

      return () => {
        socket.off('instanceUpdated', handleInstanceUpdate);
        socket.off('connectionUpdate', handleConnectionUpdate);
        socket.off('qrcodeUpdated', handleQRCodeUpdate);
        socket.off('instanceDisconnected');
      };
    }
  }, [socket, updateInstance, fetchSpecificInstance]);

  const handleInstanceEvent = (eventData) => {
    const { event, instance, data } = eventData;
    
    updateInstance({
      id: instance,
      name: instance.split('-').pop(),
      ...data
    });
  };

  const getStatusBadge = (status) => {
    if (status === "open") {
      return <Badge className="bg-green-500">Conectado</Badge>
    } else {
      return <Badge className="bg-red-500">Desconectado</Badge>
    }
  }

  const formatPhoneNumber = (ownerJid) => {
    if (!ownerJid) return '';
    const number = ownerJid.split('@')[0];
    return number.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
  }

  const isConnected = (status) => {
    return status === "open";
  }

  const sortedAndFilteredInstances = useMemo(() => {
    return instances
      .filter(instance => {
        const matchesSearch = 
          (instance.name && instance.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (instance.ownerJid && instance.ownerJid.includes(searchTerm));
        const matchesStatus = 
          statusFilter === 'all' || 
          (statusFilter === 'connected' && isConnected(instance.connectionStatus)) ||
          (statusFilter === 'disconnected' && !isConnected(instance.connectionStatus));
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Primeiro, ordenar por status de conexão
        if (isConnected(a.connectionStatus) && !isConnected(b.connectionStatus)) return -1;
        if (!isConnected(a.connectionStatus) && isConnected(b.connectionStatus)) return 1;
        
        // Se o status de conexão for o mesmo, ordenar por createdAt (do mais recente para o mais antigo)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [instances, searchTerm, statusFilter]);

  const handleGenerateQR = (instance) => {
    setSelectedInstance(instance);
    setIsCreateModalOpen(true);
  }

  const handleDisconnect = async (instanceName) => {
    const success = await disconnectInstance(instanceName);
    if (success) {
      toast.success('Instância desconectada com sucesso');
      // Você pode adicionar uma notificação de sucesso aqui
    } else {
      toast.error('Falha ao desconectar instância');
      // Você pode adicionar uma notificação de erro aqui
    }
  };

  const handleDelete = (instance) => {
    setInstanceToDelete(instance);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (instanceToDelete) {
      setIsDeleting(true);
      try {
        // Primeiro, desconectar a instância
        await disconnectInstance(instanceToDelete.name);
        
        // Esperar 1 segundo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Agora, deletar a instância
        const success = await deleteInstance(instanceToDelete.name);
        if (success) {
          setInstances(prevInstances => prevInstances.filter(instance => instance.name !== instanceToDelete.name));
          // Você pode adicionar uma notificação de sucesso aqui
        } else {
          // Você pode adicionar uma notificação de erro aqui
        }
      } catch (error) {
        console.error(`Falha ao deletar instância ${instanceToDelete.name}:`, error);
        // Você pode adicionar uma notificação de erro aqui
      } finally {
        setIsDeleting(false);
        setDeleteModalOpen(false);
        setInstanceToDelete(null);
      }
    }
  };

  // Função de formatação melhorada
  const formatInstanceName = (fullName) => {
    if (!fullName) return '';
    
    // Encontra o primeiro hífen e retorna tudo depois dele
    const parts = fullName.split('-');
    if (parts.length < 2) return fullName;
    
    // Remove a primeira parte (número) e junta o resto
    return parts.slice(1).join('-');
  };

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex flex-col bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Listar Instâncias</h2>
            <Button onClick={() => {
              setSelectedInstance(null);
              setIsCreateModalOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Criar Instância
            </Button>
          </div>
          
          <div className="mb-4 flex space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="connected">Conectado</SelectItem>
                <SelectItem value="disconnected">Desconectado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 overflow-hidden bg-white shadow-md rounded-lg mb-4">
            {sortedAndFilteredInstances.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xl text-gray-500">Nenhuma instância encontrada</p>
              </div>
            ) : (
              <div className="overflow-y-auto h-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky top-0 bg-white">Nome da Instância</TableHead>
                      <TableHead className="sticky top-0 bg-white">Número Conectado</TableHead>
                      <TableHead className="sticky top-0 bg-white">Status</TableHead>
                      <TableHead className="sticky top-0 bg-white text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAndFilteredInstances.map((instance) => (
                      <TableRow key={instance.id || instance.name}>
                        <TableCell className="font-medium">
                          {instance.name}
                        </TableCell>
                        <TableCell>
                          {isConnected(instance.connectionStatus) 
                            ? formatPhoneNumber(instance.ownerJid) 
                            : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(instance.connectionStatus)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!isConnected(instance.connectionStatus) && (
                                <DropdownMenuItem onClick={() => handleGenerateQR(instance)}>
                                  <QrCode className="mr-2 h-4 w-4" />
                                  <span>Gerar QR Code</span>
                                </DropdownMenuItem>
                              )}
                              {isConnected(instance.connectionStatus) && (
                                <DropdownMenuItem onClick={() => handleDisconnect(instance.name)}>
                                  <Power className="mr-2 h-4 w-4" />
                                  <span>Desconectar</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(instance)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Deletar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateInstanceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedInstance(null);
        }}
        selectedInstance={selectedInstance}
      />
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a instância {instanceToDelete?.name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteModalOpen(false)} variant="outline" disabled={isDeleting}>
              Cancelar
            </Button>
            <Button onClick={confirmDelete} variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
