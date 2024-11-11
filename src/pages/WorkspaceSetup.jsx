import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import ModalWorkspace from '@/features/workspaces/modalWorkspace'
import { LogIn, PlusCircle, LogOut } from 'lucide-react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useAuthContext } from '@/context/AuthContext'
import useLogout from '@/hooks/useLogout'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const WorkspaceSetup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalView, setModalView] = useState('')
  const { authUser } = useAuthContext()
  const { logout } = useLogout()

  const openModal = (view) => {
    setModalView(view)
    setIsModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Função para obter as iniciais do nome do usuário
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-gray-100 p-6">
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-center mb-4">
          🚀 Bem-vindo ao Workspace 360!
        </h1>
        <p className="text-lg text-center text-muted-foreground mb-6">
          Antes de começar, você precisa <span className="font-semibold">entrar</span> em uma empresa ou <span className="font-semibold">cadastrar</span> uma nova.
        </p>
        <div className="flex space-x-4">
          <Button 
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow"
            onClick={() => openModal('enter')}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Entrar em Empresa Existente
          </Button>
          <Button 
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow"
            onClick={() => openModal('create')}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Criar Nova Empresa
          </Button>
        </div>

        <ModalWorkspace 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialView={modalView}
        />
      </div>

      <div className="mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={authUser?.avatarUrl} alt={authUser?.username} />
              <AvatarFallback>{getInitials(authUser?.username || 'User')}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default WorkspaceSetup