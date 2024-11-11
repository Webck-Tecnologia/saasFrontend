import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import useConversation from "@/zustand/useConversation";

const useGetListConversations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const { authUser } = useAuthContext();
    const { setConversations } = useConversation();
    
    useEffect(() => {
        if (!authUser || !authUser.activeWorkspaceId) return;

        const getConversations = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/conversations/workspace/${authUser.activeWorkspaceId}`, {
                    headers: {
                        'Authorization': `Bearer ${authUser.token}`
                    }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setConversations(data);
            } catch (error) {
                console.error("Erro ao buscar conversas:", error);
                setError(error.message);
                toast({
                    title: "Erro ao buscar conversas",
                    description: error.message || "Ocorreu um erro inesperado. Por favor, tente novamente.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }

        getConversations();
    }, [authUser, toast, setConversations]);

    return { loading, error };
}

export default useGetListConversations;
