import React from 'react';
import useConversation from "@/zustand/useConversation";
import MessageContainer from "./MessageContainer";
import { MessageSquare } from 'lucide-react';
import { useSocketContext } from '@/context/SocketContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/context/AuthContext";

const ConversationContainer = () => {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const { authUser } = useAuthContext();

  const isOnline = onlineUsers.some(user => user.id === selectedConversation?.otherParticipant.id);

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
    <div className="flex-1 flex flex-col">
      <div className="bg-background border-b border-border p-4 flex items-center">
        <div className="relative">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={selectedConversation.otherParticipant.profilePicture} alt={selectedConversation.otherParticipant.username} />
            <AvatarFallback>{selectedConversation.otherParticipant.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
        </div>
        <div>
          <h2 className="font-semibold">{selectedConversation.otherParticipant.username}</h2>
          <p className="text-sm text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <MessageContainer />
    </div>
  );
};

export default ConversationContainer;
