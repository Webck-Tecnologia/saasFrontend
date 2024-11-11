import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

export function useInstanceQRCode(instanceId) {
  const [qrCode, setQRCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authUser } = useAuthContext();

  useEffect(() => {
    let intervalId;

    const fetchQRCode = async () => {
      if (!instanceId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/instances/${instanceId}/qr-code`, {
          headers: {
            'Authorization': `Bearer ${authUser.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar o QR code');
        }

        const data = await response.json();

        if (data.qrcode && data.qrcode.base64) {
          setQRCode(data.qrcode.base64);
          clearInterval(intervalId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (instanceId) {
      fetchQRCode();
      intervalId = setInterval(fetchQRCode, 5000); // Tenta buscar o QR code a cada 5 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [instanceId, authUser.token]);

  return { qrCode, isLoading, error };
}
