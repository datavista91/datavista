import { createContext, useContext, useState, ReactNode } from 'react'

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  responseType?: 'general' | 'visualization' | 'insights' | 'presentation'
  actionData?: any
  hasAction?: boolean
}

interface ChatContextType {
  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  addMessages: (messages: ChatMessage[]) => void
  clearChat: () => void
  messageCount: number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI data analyst assistant. I can help you analyze your uploaded data, create insights, and answer questions about your datasets. Upload some data first, then ask me anything!",
      timestamp: new Date(),
    },
  ])

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message])
  }

  const addMessages = (newMessages: ChatMessage[]) => {
    setMessages(prev => [...prev, ...newMessages])
  }

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI data analyst assistant. I can help you analyze your uploaded data, create insights, and answer questions about your datasets. Upload some data first, then ask me anything!",
      timestamp: new Date(),
    }])
  }

  const value: ChatContextType = {
    messages,
    addMessage,
    addMessages,
    clearChat,
    messageCount: messages.length
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
