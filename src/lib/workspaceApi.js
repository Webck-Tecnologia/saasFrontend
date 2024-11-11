export const changeActiveWorkspace = async (token, workspaceId) => {
    try {
      const response = await fetch('/api/users/active-workspace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ workspaceId })
      });
  
      if (!response.ok) {
        throw new Error('Falha ao trocar de workspace');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Erro ao trocar de workspace:', error);
      throw error;
    }
  };