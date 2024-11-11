import { create } from "zustand"

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),

  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((state) => ({
    conversations: [...state.conversations, conversation],
  })),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  updateConversationWithNewMessage: (newMessage) => set((state) => ({
    conversations: state.conversations.map(conv => 
      conv.id === newMessage.conversationId 
        ? { ...conv, lastMessage: newMessage }
        : conv
    )
  })),
  clearSelectedConversation: () => set({ selectedConversation: null }),
}))

export default useConversation
