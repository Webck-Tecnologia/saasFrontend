import React, { useEffect, useRef } from 'react';
import Message from "../message";
import ChatInput from "./chatInput";
import ChatHeader from "./chatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGetMessages from '@/hooks/useGetMessages';
import useConversation from "@/zustand/useConversation";
import { MessageSquare } from 'lucide-react';
import useListenMessages from '@/hooks/useListenMessages';
import { useAuthContext } from "@/context/AuthContext";

const MessageContainer = () => {
    const { messages, getMessages, addMessage } = useGetMessages();
    const { selectedConversation } = useConversation();
    const scrollAreaRef = useRef(null);
    const { authUser } = useAuthContext();

    useListenMessages();

    useEffect(() => {
        if (selectedConversation?.id && authUser?.activeWorkspaceId) {
            getMessages(authUser.activeWorkspaceId, selectedConversation.id);
        }
    }, [selectedConversation, authUser.activeWorkspaceId, getMessages]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const uniqueMessages = messages.filter((message, index, self) =>
        index === self.findIndex((t) => t.id === message.id)
    );

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-100">
                <MessageSquare size={64} className="text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Nenhuma conversa selecionada</h2>
                <p className="text-gray-500">Selecione uma conversa para começar a enviar mensagens</p>
            </div>
        );
    }

    return (
        <div className='flex-1 flex flex-col h-full'>
            {/* Define altura fixa para o ChatHeader */}
            <div className="flex-shrink-0">
                <ChatHeader />
            </div>

            {/* ScrollArea ocupa todo o espaço restante */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
                <div className="flex flex-col space-y-4">
                    {uniqueMessages.length === 0 ? (
                        <p className='text-center text-muted-foreground font-small'>
                            Inicie uma conversa enviando uma mensagem
                        </p>
                    ) : (
                        uniqueMessages.map((message) => (
                            <Message key={message.id.toString()} message={message} />
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* ChatInput na parte inferior */}
            <div className="flex-shrink-0">
                <ChatInput onSendMessage={addMessage} />
            </div>
        </div>
    );
};

export default MessageContainer;
