import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useSocketContext } from '@/context/SocketContext';
import axios from 'axios';

export const useInstancesFetch = () => {
  const [instances, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();

  const fetchInstances = useCallback(async () => {
    if (!authUser?.activeWorkspaceId || !authUser?.token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/instances/list/${authUser.activeWorkspaceId}`, {
        headers: { 
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar instâncias');
      }

      const data = await response.json();
      setInstances(data);
      setError(null);

    } catch (err) {
      setError('Erro ao carregar instâncias');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.activeWorkspaceId, authUser?.token]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  useEffect(() => {
    if (socket && authUser?.activeWorkspaceId) {
      socket.emit('joinListAllInstancesRoom', { workspaceId: authUser.activeWorkspaceId });

      const handleInstanceEvent = (eventData) => {
        const { event, instance, data } = eventData;
        setInstances(prev => prev.map(inst => 
          inst.name === instance ? { ...inst, ...data } : inst
        ));
      };

      const handleInstanceDisconnected = (instanceName) => {
        setInstances(prev => prev.map(inst => 
          inst.name === instanceName ? { ...inst, connectionStatus: 'closed' } : inst
        ));
      };

      socket.on('instanceEvent', handleInstanceEvent);
      socket.on('qrcodeUpdated', handleInstanceEvent);
      socket.on('connectionUpdate', handleInstanceEvent);
      socket.on('instanceDisconnected', handleInstanceDisconnected);

      const handleInstanceCreated = (newInstance) => {
        setInstances(prev => {
          const existingIndex = prev.findIndex(instance => instance.id === newInstance.id);
          if (existingIndex !== -1) {
            // Se a instância já existe, atualize-a
            return prev.map((instance, index) => 
              index === existingIndex ? { ...instance, ...newInstance, name: newInstance.name.split('-').pop() } : instance
            );
          } else {
            // Se a instância não existe, adicione-a
            return [...prev, { ...newInstance, name: newInstance.name.split('-').pop() }];
          }
        });
      };

      socket.on('instanceCreated', handleInstanceCreated);

      return () => {
        socket.emit('leaveListAllInstancesRoom', { workspaceId: authUser.activeWorkspaceId });
        socket.off('instanceEvent', handleInstanceEvent);
        socket.off('qrcodeUpdated', handleInstanceEvent);
        socket.off('connectionUpdate', handleInstanceEvent);
        socket.off('instanceDisconnected', handleInstanceDisconnected);
        socket.off('instanceCreated');
      };
    }
  }, [socket, authUser?.activeWorkspaceId]);

  const updateInstance = useCallback((updatedInstance) => {
    setInstances(prevInstances => {
      const index = prevInstances.findIndex(instance => instance.name === updatedInstance.name);
      if (index !== -1) {
        const newInstances = [...prevInstances];
        newInstances[index] = { ...newInstances[index], ...updatedInstance };
        return newInstances;
      }
      return [...prevInstances, updatedInstance];
    });
  }, []);

  const addInstance = useCallback((newInstance) => {
    setInstances(prev => [...prev, newInstance]);
  }, []);

  const removeInstance = useCallback((deletedId) => {
    setInstances(prev => prev.filter(instance => instance.id !== deletedId));
  }, []);

  const joinInstanceRoom = useCallback((instanceName) => {
    if (socket) {
      socket.emit('joinInstanceRoom', { instance: instanceName });
    }
  }, [socket]);

  const leaveInstanceRoom = useCallback((instanceName) => {
    if (socket) {
      socket.emit('leaveInstanceRoom', { instance: instanceName });
    }
  }, [socket]);

  const fetchSpecificInstance = useCallback(async (instanceName) => {
    try {
      const response = await axios.get(`/api/instances/list/${authUser.activeWorkspaceId}/${authUser.activeWorkspaceId}-${instanceName}`, {
        headers: {
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const updatedInstance = response.data;
        // Atualizar o estado da instância com as novas informações
        updateInstance({
          ...updatedInstance,
          name: instanceName,
          connectionStatus: 'open',
          ownerJid: updatedInstance.ownerJid
        });
        return updatedInstance;
      }
    } catch (error) {
      console.error('Erro ao buscar instância específica:', error);
    }
    return null;
  }, [authUser.activeWorkspaceId, authUser.token, updateInstance]);

  const disconnectInstance = useCallback(async (instanceName) => {
    try {
      const fullInstanceName = `${authUser.activeWorkspaceId}-${instanceName}`;
      const response = await axios.delete(`/api/instances/disconnect/${authUser.activeWorkspaceId}/${fullInstanceName}`, {
        headers: {
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        updateInstance({
          name: instanceName,
          connectionStatus: 'closed',
          ownerJid: null
        });
        return true;
      }
    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
    }
    return false;
  }, [authUser.activeWorkspaceId, authUser.token, updateInstance]);

  const deleteInstance = useCallback(async (instanceName) => {
    try {
      const fullInstanceName = `${authUser.activeWorkspaceId}-${instanceName}`;
      const response = await axios.delete(`/api/instances/delete/${authUser.activeWorkspaceId}/${fullInstanceName}`, {
        headers: {
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setInstances(prev => prev.filter(instance => instance.name !== instanceName));
        return true;
      }
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
    }
    return false;
  }, [authUser.activeWorkspaceId, authUser.token]);

  const connectInstance = useCallback(async (instanceName) => {
    try {
      const response = await axios.get(`/api/instances/connect/${authUser.activeWorkspaceId}-${instanceName}`, {
        headers: {
          'Authorization': `Bearer ${authUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
    }
    return null;
  }, [authUser.activeWorkspaceId, authUser.token]);

  return {
    instances,
    isLoading,
    error,
    fetchInstances,
    updateInstance,
    addInstance,
    removeInstance,
    fetchSpecificInstance,
    disconnectInstance,
    deleteInstance,
    connectInstance
  };
};
