import { GoogleGenerativeAI } from '@google/generative-ai'

interface GeminiResponse {
   message: string
   timestamp: number
   requestCount: number
   responseType: 'general' | 'visualization' | 'insights' | 'presentation'
   title: string
   actionData?: any
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

         // Determine response type based on user message
         const responseType = this.categorizeQuery(message)
         const title = this.generateTitle(message, responseType)

         return {
            message: response.text(),
            timestamp: Date.now(),
            requestCount: this.requestCount,
            responseType,
            title,
            actionData: responseType !== 'general' ? this.extractActionData(response.text(), responseType, analysisData) : undefined
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
Please provide a comprehensive and well-formatted response using proper markdown. Your response should include:

1. **Direct Answer**: Address the user's specific question clearly and concisely
2. **Key Data Insights**: Highlight the most important findings from the dataset
3. **Actionable Recommendations**: Provide specific, practical suggestions
4. **Visualization Suggestions**: If relevant, recommend specific chart types

## FORMATTING REQUIREMENTS:
- Use clear markdown headers (##, ###) to organize sections
- Use bullet points (•) for lists and key points
- Use **bold** for emphasis on important numbers or findings
- Use code blocks for column names or specific data values
- Include relevant emojis to make the response engaging
- Keep paragraphs concise and readable
- Use tables when comparing multiple data points

## RESPONSE STRUCTURE:
Start with a brief summary, then provide detailed sections based on the user's question type.

For data analysis questions, structure your response as:
### 📊 Summary
### 🔍 Key Findings  
### 📈 Insights & Patterns
### 💡 Recommendations
### 📋 Next Steps

Make your response actionable and specific to the provided dataset.
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
   }   private categorizeQuery(query: string): 'general' | 'visualization' | 'insights' | 'presentation' {
      const lowerQuery = query.toLowerCase()
      
      // Visualization keywords - expanded
      if (lowerQuery.includes('chart') || 
          lowerQuery.includes('graph') || 
          lowerQuery.includes('visualiz') || 
          lowerQuery.includes('plot') ||
          lowerQuery.includes('dashboard') ||
          lowerQuery.includes('show me') && (lowerQuery.includes('data') || lowerQuery.includes('visual')) ||
          lowerQuery.includes('create') && (lowerQuery.includes('chart') || lowerQuery.includes('graph')) ||
          lowerQuery.includes('bar chart') ||
          lowerQuery.includes('pie chart') ||
          lowerQuery.includes('line chart') ||
          lowerQuery.includes('scatter') ||
          lowerQuery.includes('histogram') ||
          lowerQuery.includes('heatmap')) {
         return 'visualization'
      }      
      // Insights keywords - expanded
      if (lowerQuery.includes('insight') || 
          lowerQuery.includes('summary') || 
          lowerQuery.includes('overview') ||
          lowerQuery.includes('analysis') ||
          lowerQuery.includes('trend') ||
          lowerQuery.includes('pattern') ||
          lowerQuery.includes('summarize') ||
          lowerQuery.includes('analyze') ||
          lowerQuery.includes('tell me about') ||
          lowerQuery.includes('what do you see') ||
          lowerQuery.includes('findings') ||
          lowerQuery.includes('key points') ||
          lowerQuery.includes('important') ||
          lowerQuery.includes('correlation') ||
          lowerQuery.includes('relationship')) {
         return 'insights'
      }
      
      if (lowerQuery.includes('presentation') || 
          lowerQuery.includes('report') || 
          lowerQuery.includes('slide') ||
          lowerQuery.includes('export')) {
         return 'presentation'
      }
      
      return 'general'
   }   private generateTitle(query: string, type: string): string {
      const truncatedQuery = query.length > 50 ? query.substring(0, 50) + '...' : query
      
      switch (type) {
         case 'visualization':
            return `Data Visualization: ${truncatedQuery}`
         case 'insights':
            return `Data Insights: ${truncatedQuery}`
         case 'presentation':
            return `Presentation: ${truncatedQuery}`
         default:
            return `AI Analysis: ${truncatedQuery}`
      }
   }

   private extractActionData(response: string, type: string, analysisData: any): any {
      // Extract relevant data for different response types
      switch (type) {
         case 'visualization':
            return {
               suggestedCharts: this.extractChartSuggestions(response),
               dataColumns: analysisData?.summary?.overview?.columns || []
            }
         case 'insights':
            return {
               keyMetrics: this.extractKeyMetrics(response, analysisData),
               recommendations: this.extractRecommendations(response)
            }
         case 'presentation':
            return {
               sections: this.extractPresentationSections(response),
               keyPoints: this.extractKeyPoints(response)
            }
         default:
            return null
      }
   }

   private extractChartSuggestions(response: string): string[] {
      const chartTypes = ['bar', 'line', 'pie', 'scatter', 'histogram', 'heatmap', 'area']
      return chartTypes.filter(type => 
         response.toLowerCase().includes(type + ' chart') || 
         response.toLowerCase().includes(type + ' graph')
      )
   }   private extractKeyMetrics(response: string, analysisData: any): any[] {
      // Extract numerical insights from response and analysis data
      const metrics = []
      
      // Add metrics mentioned in the response
      const lines = response.split('\n')
      for (const line of lines) {
         if (line.includes('%') || line.includes('average') || line.includes('total') || 
             line.includes('mean') || line.includes('median') || line.includes('max') || line.includes('min')) {
            metrics.push({ text: line.trim(), source: 'ai_response' })
         }
      }
      
      // Add key statistics from analysis data
      const numericColumns = Object.entries(analysisData?.summary?.statistics || {})
         .filter(([_, stats]: [string, any]) => stats.type === 'numeric')
         .map(([col, stats]: [string, any]) => ({
            column: col,
            mean: stats.mean,
            max: stats.max,
            min: stats.min,
            source: 'data_analysis'
         }))
      
      // Combine both sources
      metrics.push(...numericColumns)
      
      return metrics.slice(0, 6) // Top 6 metrics
   }

   private extractRecommendations(response: string): string[] {
      // Extract recommendation sentences from response
      const sentences = response.split(/[.!?]+/)
      return sentences
         .filter(sentence => 
            sentence.toLowerCase().includes('recommend') ||
            sentence.toLowerCase().includes('suggest') ||
            sentence.toLowerCase().includes('should')
         )
         .map(sentence => sentence.trim())
         .filter(sentence => sentence.length > 10)
         .slice(0, 3)
   }

   private extractPresentationSections(response: string): string[] {
      // Extract main sections/headers from response
      const sections = response.match(/#+\s+(.+)/g) || []
      return sections.map(section => section.replace(/#+\s+/, '').trim())
   }

   private extractKeyPoints(response: string): string[] {
      // Extract bullet points or key insights
      const bullets = response.match(/[•\-*]\s+(.+)/g) || []
      return bullets
         .map(bullet => bullet.replace(/[•\-*]\s+/, '').trim())
         .slice(0, 5)
   }

   getRemainingRequests(): number {
      return this.maxRequests - this.requestCount
   }

   getRequestCount(): number {
      return this.requestCount
   }   resetRequestCount(): void {
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
