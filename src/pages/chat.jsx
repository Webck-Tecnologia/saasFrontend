import React, { useState } from 'react';
import Sidebar from "@/features/chat/components/sidebar";
import imagemdeFundo from "@/assets/bg.jpg";
import IconSidebar from "@/features/chat/components/IconSidebar";
import useConversation from "@/zustand/useConversation";
import MessageContainer from '@/features/chat/components/chat/MessageContainer';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('conversations');

  return (
    <div
      className="min-h-screen bg-cover flex items-center justify-center p-4 pb-20"
      style={{
        backgroundImage: `url(${imagemdeFundo})`,
        backgroundRepeat: 'repeat', // Faz a imagem repetir
        backgroundSize: 'auto', // Define o tamanho da imagem como auto
        backgroundPosition: 'center', // Centraliza a imagem
      }}
    >
      <div className="bg-background rounded-lg shadow-xl w-full max-w-[90vw] h-[85vh] flex overflow-hidden">
        <IconSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <Sidebar activeTab={activeTab} />
        <MessageContainer/>
      </div>
    </div>
  );
}
