import { useEffect } from "react"
import { useSocketContext } from "@/context/SocketContext"
import useConversation from "@/zustand/useConversation"

const useListenMessages = () => {
  const { socket } = useSocketContext()
  const { 
    messages,
    setMessages,
    selectedConversation, 
    addMessage, 
    updateConversationWithNewMessage 
  } = useConversation()

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedConversation && newMessage.conversationId === selectedConversation.id) {
        // Verifica se a mensagem já existe no array de mensagens
        const messageExists = messages.some(msg => msg.id === newMessage.id);
        if (!messageExists) {
          addMessage(newMessage)
        }
      }
      updateConversationWithNewMessage(newMessage)
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedConversation, messages, addMessage, updateConversationWithNewMessage])
}

export default useListenMessages
