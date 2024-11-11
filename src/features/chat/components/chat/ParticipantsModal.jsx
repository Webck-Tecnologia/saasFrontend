import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const ParticipantsModal = ({ isOpen, onClose, participants }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Participantes do Grupo</DialogTitle>
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-[300px]">
          <div className="space-y-4">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={participant.profilePicture} alt={participant.username} />
                  <AvatarFallback>{participant.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{participant.username}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantsModal;
