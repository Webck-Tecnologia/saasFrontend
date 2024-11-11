import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import FormattedMessage from "@/components/FormattedMessage";

const ConversationItem = ({ conversation, isSelected, onClick }) => {
  if (!conversation) {
    return null;
  }

  const { isGroup, name, participants, lastMessage, groupProfilePhoto } = conversation;
  
  const displayName = isGroup ? name : conversation.otherParticipant?.username;
  const avatarSrc = isGroup ? groupProfilePhoto : conversation.otherParticipant?.profilePicture;
  
  const truncate = (str, length) => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[auto,1fr,auto] gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer items-center",
        isSelected && "bg-accent"
      )}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
          <AvatarImage src={avatarSrc} alt={displayName} />
          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
        </Avatar>
        {!isGroup && conversation.status && (
          <span 
            className={cn(
              "absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-white",
              conversation.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
            )}
          />
        )}
      </div>
      <div className="min-w-0 overflow-hidden flex flex-col justify-center">
        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
          {displayName}
        </p>
        {lastMessage && (
          <p className="text-2xs sm:text-xs text-gray-500 truncate">
            {isGroup && (
              <span className="font-medium mr-1">
                {truncate(lastMessage.sender.username, 10)}:
              </span>
            )}
            <FormattedMessage content={truncate(lastMessage.content, 20)} />
          </p>
        )}
      </div>
      {lastMessage && (
        <span className="text-2xs sm:text-xs text-gray-400 whitespace-nowrap">
          {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
};

export default ConversationItem;
