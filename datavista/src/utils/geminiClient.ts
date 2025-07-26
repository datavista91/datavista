interface GeminiResponse {
   message: string
   timestamp: number
   requestCount?: number
   responseType: 'general' | 'visualization' | 'insights' | 'presentation'
   title: string
   actionData?: any
}

class ServerGeminiClient {
   private requestCount = 0
   private maxRequests = 100 // Limit requests per session (client-side tracking)

   constructor() {
      console.log('🤖 Server-side Gemini Client initialized')
   }

   async generateResponse(message: string, analysisData: any): Promise<GeminiResponse> {
      // Rate limiting check
      if (this.requestCount >= this.maxRequests) {
         throw new Error(`Request limit reached for this session (${this.maxRequests} requests max)`)
      }

      this.requestCount++

      try {
         console.log('🚀 Sending request to server API...', { requestCount: this.requestCount })

         const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               message,
               analysisData
            })
         })

         if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Server error: ${response.status}`)
         }

         const result = await response.json()
         console.log('✅ Server response received')

         return {
            ...result,
            requestCount: this.requestCount
         }
      } catch (error: any) {
         console.error('❌ Server API Error:', error)

         // Handle specific error types
         if (error.message?.includes('fetch')) {
            throw new Error('Unable to connect to server. Please check your internet connection.')
         }

         throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`)
      }
   }

   getRemainingRequests(): number {
      return this.maxRequests - this.requestCount
   }

   getRequestCount(): number {
      return this.requestCount
   }

   resetRequestCount(): void {
      this.requestCount = 0
      console.log('🔄 Request counter reset')
   }
}

// Export singleton instance
let geminiClient: ServerGeminiClient | null = null

export const getGeminiClient = (): ServerGeminiClient => {
   if (!geminiClient) {
      geminiClient = new ServerGeminiClient()
   }
   return geminiClient
}

export type { GeminiResponse }
