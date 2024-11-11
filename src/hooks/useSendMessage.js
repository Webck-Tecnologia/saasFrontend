import useConversation from "@/zustand/useConversation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";

const useSendMessage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const { selectedConversation } = useConversation();
    const { authUser } = useAuthContext();

    const sendMessage = async (workspaceId, conversationId, content) => {
        if (!selectedConversation) {
            toast({
                title: 'Erro ao enviar mensagem',
                description: 'Nenhuma conversa selecionada',
                variant: 'destructive'
            });
            return null;
        }

        if (!authUser?.token || !authUser?.activeWorkspaceId) {
            toast({
                title: 'Erro ao enviar mensagem',
                description: 'Usuário não autenticado ou workspace não selecionado',
                variant: 'destructive'
            });
            return null;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/messages/workspace/${workspaceId}/conversation/${conversationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authUser.token}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const sentMessage = await response.json();
            return sentMessage; // Certifique-se de que está retornando a mensagem enviada
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading };
};

export default useSendMessage;
