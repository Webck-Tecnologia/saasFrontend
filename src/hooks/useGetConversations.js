import { useState, useEffect } from "react";
import useConversation from "@/zustand/useConversation";

const useGetConversations = () => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    
    useEffect(() => {
        const getConversations = async () => {
            try {
                setLoading(true);

                const res = await fetch("/api/users");

                const data = await res.json();
                
                if(data.error) {
                    toast({
                        title: data.error,
                        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
                        variant: "destructive",
                    });
                }

                setConversations(data);
            } catch (error) {
                toast({
                    title: "Erro ao buscar conversas",
                    description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }

        getConversations();
    }, []);

    return {loading, conversations}
}

export default useGetConversations;