import { create } from "zustand";

const useWorkspaceInstances = create((set) => ({
  instances: [],
  setInstances: (instances) => set({ instances }),
  
  // Adiciona uma nova instância com os novos campos
  addInstance: (instance) => set((state) => ({
    instances: [...state.instances, {
      ...instance,
      qrCode: instance.qrCode || '',        // Adiciona qrCode
      status: instance.status || '',        // Adiciona status
      numeroConectado: instance.numeroConectado || '' // Adiciona numeroConectado
    }],
  })),
  
  // Atualiza uma instância existente
  updateInstance: (updatedInstance) => set((state) => ({
    instances: state.instances.map(instance => 
      instance.id === updatedInstance.id 
        ? { ...instance, ...updatedInstance }
        : instance
    )
  })),
  
  // Remove uma instância pelo ID
  removeInstance: (instanceId) => set((state) => ({
    instances: state.instances.filter(instance => instance.id !== instanceId),
  })),
}));

export default useWorkspaceInstances;
