import React from 'react';
import { MessageSquare, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const IconSidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center space-y-4 py-4 bg-secondary w-16">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActiveTab('conversations')}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeTab === 'conversations' ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
              )}
            >
              <MessageSquare size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Conversas</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setActiveTab('contacts')}
              className={cn(
                "p-2 rounded-full transition-colors",
                activeTab === 'contacts' ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
              )}
            >
              <Users size={24} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Contatos</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar size={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Settings size={24} />
              <p>Configurações</p>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut size={24} />
              <p>Sair</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};

export default IconSidebar;