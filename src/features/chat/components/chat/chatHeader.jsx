import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useConversation from "@/zustand/useConversation";
import { useSocketContext } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import ParticipantsModal from './ParticipantsModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ChatHeader = () => {
  const { selectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!selectedConversation) return null;

  const isGroup = selectedConversation.isGroup;
  const otherParticipant = isGroup ? null : selectedConversation.participants.find(p => p.id !== selectedConversation.id);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isOnline = otherParticipant && onlineUsers.includes(otherParticipant.id.toString());

  return (
    <>
      <div className="bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={isGroup ? null : otherParticipant?.profilePicture} alt={selectedConversation.name} />
            <AvatarFallback>{getInitials(selectedConversation.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{selectedConversation.name}</h2>
            {!isGroup && (
              <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            )}
          </div>
        </div>
        {isGroup && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
                  <Users className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver participantes do grupo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {isGroup && (
        <ParticipantsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          participants={selectedConversation.participants}
        />
      )}
    </>
  );
};

export default ChatHeader;
