import { createContext, useContext, useState, ReactNode } from 'react'

export interface AIResponse {
   id: string
   type: 'general' | 'visualization' | 'insights' | 'presentation'
   title: string
   content: string
   data?: any
   timestamp: Date
   isNew?: boolean
}

interface AIResponseContextType {
   responses: AIResponse[]
   addResponse: (response: Omit<AIResponse, 'id' | 'timestamp'>) => void
   markAsViewed: (id: string) => void
   getResponsesByType: (type: AIResponse['type']) => AIResponse[]
   clearResponses: () => void
}

const AIResponseContext = createContext<AIResponseContextType | undefined>(undefined)

export const useAIResponses = () => {
   const context = useContext(AIResponseContext)
   if (context === undefined) {
      throw new Error('useAIResponses must be used within an AIResponseProvider')
   }
   return context
}

interface AIResponseProviderProps {
   children: ReactNode
}

export const AIResponseProvider = ({ children }: AIResponseProviderProps) => {
   const [responses, setResponses] = useState<AIResponse[]>([])

   const addResponse = (response: Omit<AIResponse, 'id' | 'timestamp'>) => {
      const newResponse: AIResponse = {
         ...response,
         id: Date.now().toString(),
         timestamp: new Date(),
         isNew: true
      }
      
      setResponses(prev => [newResponse, ...prev])
      
      // Auto-mark as not new after 5 seconds
      setTimeout(() => {
         markAsViewed(newResponse.id)
      }, 5000)
   }

   const markAsViewed = (id: string) => {
      setResponses(prev => 
         prev.map(response => 
            response.id === id 
               ? { ...response, isNew: false }
               : response
         )
      )
   }

   const getResponsesByType = (type: AIResponse['type']) => {
      return responses.filter(response => response.type === type)
   }

   const clearResponses = () => {
      setResponses([])
   }

   const value: AIResponseContextType = {
      responses,
      addResponse,
      markAsViewed,
      getResponsesByType,
      clearResponses
   }

   return (
      <AIResponseContext.Provider value={value}>
         {children}
      </AIResponseContext.Provider>
   )
}

// Helper function to determine response type based on user query
export const categorizeQuery = (query: string): AIResponse['type'] => {
   const lowerQuery = query.toLowerCase()
   
   if (lowerQuery.includes('chart') || 
       lowerQuery.includes('graph') || 
       lowerQuery.includes('visualiz') || 
       lowerQuery.includes('plot') ||
       lowerQuery.includes('dashboard')) {
      return 'visualization'
   }
   
   if (lowerQuery.includes('insight') || 
       lowerQuery.includes('summary') || 
       lowerQuery.includes('overview') ||
       lowerQuery.includes('analysis') ||
       lowerQuery.includes('trend') ||
       lowerQuery.includes('pattern')) {
      return 'insights'
   }
   
   if (lowerQuery.includes('presentation') || 
       lowerQuery.includes('report') || 
       lowerQuery.includes('slide') ||
       lowerQuery.includes('export')) {
      return 'presentation'
   }
   
   return 'general'
}
