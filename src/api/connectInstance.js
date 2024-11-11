export async function connectInstance(instanceName, token) {
  try {
    const response = await fetch(`/api/instances/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao conectar a instância');
    }

    const data = await response.json();
    return data.evolutionApiResponse.base64;
  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    throw error;
  }
}
