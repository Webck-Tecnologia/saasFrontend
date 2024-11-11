import { useCallback } from 'react';
import useConversation from '@/zustand/useConversation';
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";

const useGetMessages = () => {
    const { messages, setMessages, addMessage, selectedConversation } = useConversation();
    const { toast } = useToast();
    const { authUser } = useAuthContext();

    const getMessages = useCallback(async (workspaceId, conversationId) => {
        if (!conversationId || !authUser?.token) return;

        try {
            const res = await fetch(`/api/messages/workspace/${workspaceId}/conversation/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${authUser.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error('Falha ao buscar mensagens');
            }

            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erro ao obter mensagens:', error);
            toast({
                title: "Erro ao obter mensagens",
                description: error.message,
                variant: "destructive"
            });
            setMessages([]);
        }
    }, [setMessages, toast, authUser]);

    return { messages, getMessages, addMessage };
};

export default useGetMessages;
