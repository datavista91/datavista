import { GoogleGenerativeAI } from '@google/generative-ai'

interface GeminiResponse {
   message: string
   timestamp: number
   requestCount: number
}

class SafeGeminiClient {
   private genAI: GoogleGenerativeAI
   private requestCount = 0
   private maxRequests = 100 // Limit requests per session
   private isProduction = import.meta.env.PROD

   constructor() {
      // Block client-side API calls in production
      if (this.isProduction) {
         throw new Error('Client-side Gemini API calls are not allowed in production. Please use server-side API.')
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY

      if (!apiKey) {
         throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file')
      }

      this.genAI = new GoogleGenerativeAI(apiKey)
      console.log('🤖 Gemini Client initialized for development mode')
   }

   async generateResponse(message: string, analysisData: any): Promise<GeminiResponse> {
      // Rate limiting check
      if (this.requestCount >= this.maxRequests) {
         throw new Error(`Request limit reached for this session (${this.maxRequests} requests max)`)
      }

      this.requestCount++

      try {
         const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

         const prompt = this.createDataAnalysisPrompt(message, analysisData)

         console.log('🚀 Sending request to Gemini...', { requestCount: this.requestCount })

         const result = await model.generateContent(prompt)
         const response = await result.response

         console.log('✅ Gemini response received')

         return {
            message: response.text(),
            timestamp: Date.now(),
            requestCount: this.requestCount,
         }
      } catch (error: any) {
         console.error('❌ Gemini API Error:', error)

         // Handle specific error types
         if (error.message?.includes('API_KEY_INVALID')) {
            throw new Error('Invalid Gemini API key. Please check your .env file.')
         }

         if (error.message?.includes('QUOTA_EXCEEDED')) {
            throw new Error('Gemini API quota exceeded. Please try again later.')
         }

         if (error.message?.includes('SAFETY')) {
            throw new Error('Content was blocked by safety filters. Please rephrase your question.')
         }

         throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`)
      }
   }

   private createDataAnalysisPrompt(userMessage: string, analysisData: any): string {
      const overview = analysisData?.summary?.overview
      const statistics = analysisData?.summary?.statistics
      const dataQuality = analysisData?.summary?.dataQuality
      const sample = analysisData?.sample

      const prompt = `
You are an expert data analyst AI assistant specializing in data insights and analysis. Your role is to help users understand their data and provide actionable insights.

## DATASET CONTEXT:
**Overview:**
- Total Rows: ${overview?.totalRows?.toLocaleString() || 'Unknown'}
- Total Columns: ${overview?.totalColumns || 'Unknown'}
- Columns: ${overview?.columns?.join(', ') || 'Unknown'}
- File Name: ${analysisData?.fileName || 'Unknown'}
- File Size: ${this.formatFileSize(analysisData?.fileSize) || 'Unknown'}

**Sample Data (First 3 Rows):**
${
   sample
      ?.slice(0, 3)
      ?.map((row: any, index: number) => `Row ${index + 1}: ${JSON.stringify(row)}`)
      .join('\n') || 'No sample data available'
}

**Column Statistics:**
${
   Object.entries(statistics || {})
      .map(([columnName, stats]: [string, any]) => {
         if (stats.type === 'numeric') {
            return `• ${columnName} (Numeric): Mean: ${stats.mean?.toFixed(2)}, Min: ${stats.min}, Max: ${
               stats.max
            }, Std Dev: ${stats.stdDev?.toFixed(2)}`
         } else if (stats.type === 'categorical') {
            const topValues = stats.topValues
               ?.slice(0, 3)
               ?.map(([value, count]: [string, number]) => `${value}(${count})`)
               .join(', ')
            return `• ${columnName} (Categorical): ${stats.unique} unique values, Top values: ${topValues}`
         } else if (stats.type === 'date') {
            return `• ${columnName} (Date): ${stats.count} entries, Range: ${stats.min} to ${stats.max}`
         }
         return `• ${columnName}: ${stats.count} entries`
      })
      .join('\n') || 'No statistics available'
}

**Data Quality:**
- Missing Values: ${
         Object.entries(dataQuality?.missingValues || {})
            .map(([col, count]) => `${col}: ${count}`)
            .join(', ') || 'None'
      }
- Duplicate Rows: ${dataQuality?.duplicates || 0}

## USER QUESTION:
${userMessage}

## INSTRUCTIONS:
Please provide a comprehensive response that includes:

1. **Direct Answer**: Address the user's specific question clearly
2. **Data Insights**: Relevant insights from the provided dataset
3. **Recommendations**: Actionable suggestions based on the data
4. **Visualization Suggestions**: If applicable, suggest chart types or visualizations
5. **Follow-up Questions**: Suggest 2-3 follow-up questions the user might find interesting

## RESPONSE FORMAT:
Use clear markdown formatting with headers and bullet points. Keep the response informative but concise.

## IMPORTANT GUIDELINES:
- Base all insights on the actual data provided
- If data is insufficient, clearly state limitations
- Suggest specific column names and values when making recommendations
- Focus on practical, actionable insights
- If the question is unclear, ask for clarification
- Use professional but friendly tone
- Include numbers and statistics where relevant
      `

      return prompt
   }

   private formatFileSize(bytes?: number): string {
      if (!bytes) return 'Unknown'
      if (bytes === 0) return '0 Bytes'

      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
let geminiClient: SafeGeminiClient | null = null

export const getGeminiClient = (): SafeGeminiClient => {
   if (!geminiClient) {
      geminiClient = new SafeGeminiClient()
   }
   return geminiClient
}

export type { GeminiResponse }
