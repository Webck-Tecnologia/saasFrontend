import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ConversationItem from "./conversationItem";
import useGetContacts from "@/hooks/useGetContacts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useConversation from "@/zustand/useConversation";
import { useAuthContext } from "@/context/AuthContext";
import { useSocketContext } from "@/context/SocketContext";
import useListenMessages from '@/hooks/useListenMessages';
import useGetListConversations from '@/hooks/useGetListConversations';

export default function Sidebar({ activeTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { conversations } = useConversation();
  const { loading: loadingContacts, contacts } = useGetContacts();
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { authUser } = useAuthContext();
  const { onlineUsers } = useSocketContext();
  const { loading: loadingConversations, error: conversationsError } = useGetListConversations();

  useListenMessages();

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => 
      (conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participants.some(p => p.username.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [conversations, searchTerm]);

  const groupConversations = useMemo(() => {
    return filteredConversations.filter(conv => conv.isGroup);
  }, [filteredConversations]);

  const individualConversations = useMemo(() => {
    return filteredConversations.filter(conv => !conv.isGroup);
  }, [filteredConversations]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => 
      contact.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contacts, searchTerm]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const renderConversations = (conversationList) => (
    <div className="space-y-2 p-2">
      {loadingConversations ? (
        <div className="text-center">Carregando conversas...</div>
      ) : conversationsError ? (
        <div className="text-center text-red-500">Erro ao carregar conversas: {conversationsError}</div>
      ) : conversationList.length === 0 ? (
        <div className="text-center">Nenhuma conversa encontrada.</div>
      ) : (
        conversationList.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={{
              ...conversation,
              otherParticipant: conversation.participants.find(p => p.id !== authUser.id) || conversation.participants[0],
              status: onlineUsers.includes(conversation.participants.find(p => p.id !== authUser.id)?.id.toString()) ? 'online' : 'offline'
            }}
            isSelected={selectedConversation?.id === conversation.id}
            onClick={() => handleSelectConversation(conversation)}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col border-r h-full bg-background min-w-[250px]">
      <div className="p-4">
        <h1 className="text-xl font-bold">{activeTab === 'conversations' ? 'Conversas' : 'Contatos'}</h1>
        <div className="mt-4">
          <Input 
            type="search" 
            placeholder="Pesquisar" 
            className="w-full" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {activeTab === 'conversations' && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="individual">Individuais</TabsTrigger>
            <TabsTrigger value="groups">Grupos</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ScrollArea className="h-[calc(100vh-200px)] min-h-[200px]">
              {renderConversations(filteredConversations)}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="individual">
            <ScrollArea className="h-[calc(100vh-200px)] min-h-[200px]">
              {renderConversations(individualConversations)}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="groups">
            <ScrollArea className="h-[calc(100vh-200px)] min-h-[200px]">
              {renderConversations(groupConversations)}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
      {activeTab === 'contacts' && (
        <ScrollArea className="flex-1 min-h-[200px]">
          <div className="space-y-2 p-2">
            {loadingContacts ? (
              <div className="text-center">Carregando contatos...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center">Nenhum contato encontrado.</div>
            ) : (
              filteredContacts.map((contact) => (
                <ConversationItem
                  key={contact.id}
                  conversation={{
                    otherParticipant: contact,
                    lastMessage: null,
                    status: onlineUsers.includes(contact.id.toString()) ? 'online' : 'offline'
                  }}
                  isSelected={selectedConversation?.id === contact.id}
                  onClick={() => handleSelectConversation({
                    id: contact.id,
                    otherParticipant: contact
                  })}
                />
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
