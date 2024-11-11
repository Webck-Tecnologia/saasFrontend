import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const useGetContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { authUser } = useAuthContext();
    const { toast } = useToast();
    
    const fetchContacts = async () => {
        if (!authUser || !authUser.activeWorkspaceId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/contacts/workspace/${authUser.activeWorkspaceId}`, {
                headers: {
                    'Authorization': `Bearer ${authUser.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }

            const data = await response.json();
            setContacts(data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast({
                title: 'Erro ao buscar contatos',
                description: 'Não foi possível carregar seus contatos. Por favor, tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [authUser?.activeWorkspaceId]);

    return { contacts, loading, refetchContacts: fetchContacts };
};

export default useGetContacts;
