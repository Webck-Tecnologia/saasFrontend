'use client'

import { useState } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, List, Send, Settings, LogOut, SendIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useLogout from '@/hooks/useLogout'
import { ListBulletIcon } from '@radix-ui/react-icons'
import { FaWhatsapp } from 'react-icons/fa'
import CreateInstanceModal from '@/components/CreateInstanceModal'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app/campanhas', end: true },
  { icon: List, label: 'Listar Instâncias', href: '/app/campanhas/listar-instancias' },
  { icon: Send, label: 'Disparador', href: '/app/campanhas/disparador' },
  { icon: FaWhatsapp, label: 'Campanhas', href: '/app/campanhas/listar-campanhas' },
]

export default function Sidebar() {
  const { logout } = useLogout()
  const [isCreateInstanceModalOpen, setIsCreateInstanceModalOpen] = useState(false)

  const handleOpenCreateInstanceModal = (e) => {
    e.preventDefault()
    setIsCreateInstanceModalOpen(true)
  }

  return (
    <aside className="bg-primary text-primary-foreground w-64 min-h-screen p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <div key={item.label} className="flex items-center">
            <NavLink
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center w-full px-2 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary-foreground text-primary"
                    : "text-primary-foreground hover:bg-primary-foreground/10"
                )
              }
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </NavLink>
            {item.label === 'Listar Instâncias' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleOpenCreateInstanceModal}
                      className="ml-2 p-2 rounded-full hover:bg-primary-foreground/10"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Criar Instância</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ))}
      </nav>
      <CreateInstanceModal
        isOpen={isCreateInstanceModalOpen}
        onClose={() => setIsCreateInstanceModalOpen(false)}
      />
    </aside>
  )
}
