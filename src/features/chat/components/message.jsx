import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthContext } from "@/context/AuthContext";
import useConversation from "@/zustand/useConversation";
import { formatTime } from "@/utils/formatTime";
import FormattedMessage from "@/components/FormattedMessage";

export function Message({ message }) {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();

  const isFromMe = message.senderId === authUser?.id;
  const sender = isFromMe ? authUser : selectedConversation.participants.find(p => p.id === message.senderId);

  const containerClassName = `flex ${isFromMe ? 'justify-end' : 'justify-start'} mb-4`;

  const bubbleClassName = `inline-block rounded-xl p-3 shadow-sm ${
    isFromMe ? 'bg-primary text-primary-foreground ml-2' : 'bg-muted text-muted-foreground mr-2'
  } min-w-[60px] max-w-full text-left break-words overflow-hidden`;

  const getInitials = (user) => {
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className={`${containerClassName} px-2 md:px-0`}>
      {!isFromMe && (
        <Avatar className="w-10 h-10 flex-shrink-0 rounded-full" aria-label={sender?.username}>
          <AvatarImage src={sender?.profilePicture} alt={sender?.username} className="rounded-full" />
          <AvatarFallback>{getInitials(sender)}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isFromMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        <div className={bubbleClassName} aria-label={`Mensagem de ${sender?.username}`}>
          <FormattedMessage content={message.content} />
          
          {message.hasImage && (
            <img
              src={message.imageUrl}
              alt="Imagem enviada"
              className="mt-2 rounded-md max-w-full"
              style={{ maxHeight: '200px', objectFit: "cover" }}
            />
          )}
        </div>

        <div className="text-xs text-gray-400 mt-1">
          {formatTime(message.createdAt)}
        </div>
      </div>

      {isFromMe && (
        <Avatar className="w-10 h-10 flex-shrink-0 rounded-full" aria-label={authUser?.username}>
          <AvatarImage src={authUser?.profilePicture} alt={authUser?.username} className="rounded-full" />
          <AvatarFallback>{getInitials(authUser)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default Message;
