import { GoogleGenerativeAI } from '@google/generative-ai'
import type { VercelRequest, VercelResponse } from '@vercel/node'

interface GeminiResponse {
   message: string
   timestamp: number
   responseType: 'general' | 'visualization' | 'insights' | 'presentation'
   title: string
   actionData?: any
}

class ServerGeminiClient {
   private genAI: GoogleGenerativeAI

   constructor() {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
         throw new Error('GEMINI_API_KEY not found in environment variables')
      }
      this.genAI = new GoogleGenerativeAI(apiKey)
   }

   async generateResponse(message: string, analysisData: any): Promise<GeminiResponse> {
      try {
         const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

         const prompt = this.createDataAnalysisPrompt(message, analysisData)

         // console.log('🚀 Sending request to Gemini from server...')

         const result = await model.generateContent(prompt)
         const response = await result.response

         // console.log('✅ Gemini response received on server')

         // Determine response type based on user message
         const responseType = this.categorizeQuery(message)
         const title = this.generateTitle(message, responseType)

         return {
            message: response.text(),
            timestamp: Date.now(),
            responseType,
            title,
            actionData:
               responseType !== 'general'
                  ? this.extractActionData(response.text(), responseType, analysisData)
                  : undefined,
         }
      } catch (error: any) {
         console.error('❌ Gemini API Error:', error)

         // Handle specific error types
         if (error.message?.includes('API_KEY_INVALID')) {
            throw new Error('Invalid Gemini API key. Please check your environment variables.')
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
      
      // Debug logging to understand the data structure on server
      // console.log('🔍 Server received analysisData:', {
      //    hasAnalysisData: !!analysisData,
      //    hasSummary: !!analysisData?.summary,
      //    summaryKeys: analysisData?.summary ? Object.keys(analysisData.summary) : 'N/A',
      //    statisticsType: typeof analysisData?.summary?.statistics,
      //    statisticsIsArray: Array.isArray(analysisData?.summary?.statistics),
      //    statisticsValue: analysisData?.summary?.statistics,
      //    dataQualityType: typeof analysisData?.summary?.dataQuality,
      //    missingValuesType: typeof analysisData?.summary?.dataQuality?.missingValues,
      //    missingValuesIsArray: Array.isArray(analysisData?.summary?.dataQuality?.missingValues),
      //    missingValuesValue: analysisData?.summary?.dataQuality?.missingValues
      // })
      
      // Defensive: statistics must be a plain object
      const statistics =
         analysisData?.summary?.statistics &&
         typeof analysisData.summary.statistics === 'object' &&
         !Array.isArray(analysisData.summary.statistics)
            ? analysisData.summary.statistics
            : {}
      const dataQuality = analysisData?.summary?.dataQuality || {}
      // Defensive: missingValues must be a plain object
      const missingValues =
         dataQuality.missingValues &&
         typeof dataQuality.missingValues === 'object' &&
         !Array.isArray(dataQuality.missingValues)
            ? dataQuality.missingValues
            : {}
      const sample = analysisData?.sample

      // Determine the response type to customize the prompt
      const responseType = this.categorizeQuery(userMessage)

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
   Object.entries(statistics)
      .map(([columnName, stats]: [string, any]) => {
         if (stats.type === 'numeric') {
            return `• ${columnName} (Numeric): Mean: ${stats.mean?.toFixed(2)}, Min: ${stats.min}, Max: ${
               stats.max
            }, Std Dev: ${stats.stdDev?.toFixed(2)}`
         } else if (stats.type === 'categorical') {
            // Debug the topValues structure
            // console.log(`🔍 Processing ${columnName} topValues:`, {
            //    hasTopValues: !!stats.topValues,
            //    isArray: Array.isArray(stats.topValues),
            //    length: stats.topValues?.length,
            //    firstItem: stats.topValues?.[0],
            //    topValuesStructure: stats.topValues
            // })
            
            let topValues = 'None'
            if (stats.topValues && Array.isArray(stats.topValues) && stats.topValues.length > 0) {
               try {
                  topValues = stats.topValues
                     .slice(0, 3)
                     .map((item: any) => {
                        // Handle different possible formats of topValues
                        if (Array.isArray(item) && item.length >= 2) {
                           return `${item[0]}(${item[1]})`
                        } else if (typeof item === 'object' && item.value !== undefined && item.count !== undefined) {
                           return `${item.value}(${item.count})`
                        } else {
                           return String(item)
                        }
                     })
                     .join(', ')
               } catch (error) {
                  console.warn('Error processing topValues:', error, stats.topValues)
                  topValues = 'Error processing values'
               }
            }
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
         Object.entries(missingValues)
            .map(([col, count]) => `${col}: ${count}`)
            .join(', ') || 'None'
      }
- Duplicate Rows: ${dataQuality?.duplicates || 0}

## USER QUESTION:
${userMessage}

## RESPONSE TYPE: ${responseType.toUpperCase()}

${this.getResponseTypeInstructions(responseType)}

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

   private getResponseTypeInstructions(responseType: string): string {
      switch (responseType) {
         case 'presentation':
            return `
## PRESENTATION INSTRUCTIONS:
You are creating content for a presentation. Structure your response as presentation slides:

### 🎯 Slide 1: Executive Summary
- Brief overview of key findings
- 2-3 most important insights

### 📊 Slide 2: Data Overview  
- Dataset size and structure
- Data quality highlights

### 🔍 Slide 3: Key Findings
- Top 3-4 insights from analysis
- Include specific numbers and percentages

### 📈 Slide 4: Trends & Patterns
- Notable trends in the data
- Relationships between variables

### 💡 Slide 5: Recommendations
- 3-4 actionable recommendations
- Next steps for analysis

### 🎯 Slide 6: Conclusion
- Summary of main points
- Call to action

**Format each slide with clear headers and bullet points suitable for presentation.**`

         case 'visualization':
            return `
## VISUALIZATION INSTRUCTIONS:
Focus on recommending specific charts and visual representations:

### 📊 Recommended Visualizations
- Suggest 2-3 specific chart types (bar chart, pie chart, line chart, etc.)
- Explain why each chart type is suitable for this data
- Identify which columns should be used for each visualization

### 📈 Chart Specifications
- Specify x-axis and y-axis for each chart
- Suggest appropriate titles and labels
- Recommend color schemes if relevant

**Use clear markdown formatting and be specific about implementation.**`

         case 'insights':
            return `
## INSIGHTS INSTRUCTIONS:
Provide comprehensive data analysis and insights:

### 📊 Summary
### 🔍 Key Findings  
### 📈 Insights & Patterns
### 💡 Recommendations
### 📋 Next Steps

**Focus on actionable insights and specific findings from the data.**`

         default:
            return `
## GENERAL INSTRUCTIONS:
Provide a comprehensive and well-formatted response using proper markdown:

### 📊 Summary
### 🔍 Analysis
### 💡 Recommendations

**Use clear markdown headers, bullet points, and emphasis for readability.**`
      }
   }

   private formatFileSize(bytes?: number): string {
      if (!bytes) return 'Unknown'
      if (bytes === 0) return '0 Bytes'

      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
   }

   private categorizeQuery(query: string): 'general' | 'visualization' | 'insights' | 'presentation' {
      const lowerQuery = query.toLowerCase()

      // Presentation keywords - CHECK FIRST but be more specific
      if (
         lowerQuery.includes('presentation') ||
         lowerQuery.includes('slide') ||
         lowerQuery.includes('ppt') ||
         lowerQuery.includes('powerpoint') ||
         lowerQuery.includes('slideshow') ||
         ((lowerQuery.includes('create') || lowerQuery.includes('make') || lowerQuery.includes('generate')) &&
            (lowerQuery.includes('presentation') || lowerQuery.includes('slide'))) ||
         (lowerQuery.includes('export') && (lowerQuery.includes('presentation') || lowerQuery.includes('slide')))
      ) {
         return 'presentation'
      }

      // Visualization keywords - expanded
      if (
         lowerQuery.includes('chart') ||
         lowerQuery.includes('graph') ||
         lowerQuery.includes('visualiz') ||
         lowerQuery.includes('plot') ||
         lowerQuery.includes('dashboard') ||
         (lowerQuery.includes('show me') && (lowerQuery.includes('data') || lowerQuery.includes('visual'))) ||
         (lowerQuery.includes('create') && (lowerQuery.includes('chart') || lowerQuery.includes('graph'))) ||
         lowerQuery.includes('bar chart') ||
         lowerQuery.includes('pie chart') ||
         lowerQuery.includes('line chart') ||
         lowerQuery.includes('scatter') ||
         lowerQuery.includes('histogram') ||
         lowerQuery.includes('heatmap')
      ) {
         return 'visualization'
      }

      // Insights keywords - expanded (moved after presentation check)
      if (
         lowerQuery.includes('insight') ||
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
         lowerQuery.includes('relationship') ||
         (lowerQuery.includes('report') && !lowerQuery.includes('presentation')) ||
         lowerQuery.includes('recommendations') ||
         lowerQuery.includes('smart report') ||
         ((lowerQuery.includes('show me') || lowerQuery.includes('give me')) &&
            (lowerQuery.includes('insight') || lowerQuery.includes('analysis') || lowerQuery.includes('report')))
      ) {
         return 'insights'
      }

      return 'general'
   }

   private generateTitle(query: string, type: string): string {
      const truncatedQuery = query.length > 50 ? query.substring(0, 50) + '...' : query

      switch (type) {
         case 'visualization':
            return `Data Visualization: ${truncatedQuery}`
         case 'insights':
            return `Data Insights: ${truncatedQuery}`
         case 'presentation':
            // Generate more descriptive titles for presentations
            const timestamp = new Date().toLocaleDateString()
            if (truncatedQuery.toLowerCase().includes('summary')) {
               return `Data Summary Report - ${timestamp}`
            } else if (truncatedQuery.toLowerCase().includes('analysis')) {
               return `Data Analysis Presentation - ${timestamp}`
            } else if (truncatedQuery.toLowerCase().includes('trend')) {
               return `Trend Analysis Report - ${timestamp}`
            } else if (truncatedQuery.toLowerCase().includes('insight')) {
               return `Key Insights Presentation - ${timestamp}`
            } else {
               return `Data Presentation - ${timestamp}`
            }
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
               dataColumns: analysisData?.summary?.overview?.columns || [],
            }
         case 'insights':
            return {
               keyMetrics: this.extractKeyMetrics(response, analysisData),
               recommendations: this.extractRecommendations(response),
            }
         case 'presentation':
            return {
               sections: this.extractPresentationSections(response),
               keyPoints: this.extractKeyPoints(response),
            }
         default:
            return null
      }
   }

   private extractChartSuggestions(response: string): string[] {
      const chartTypes = ['bar', 'line', 'pie', 'scatter', 'histogram', 'heatmap', 'area']
      return chartTypes.filter(
         (type) => response.toLowerCase().includes(type + ' chart') || response.toLowerCase().includes(type + ' graph')
      )
   }

   private extractKeyMetrics(response: string, analysisData: any): any[] {
      // Extract numerical insights from response and analysis data
      const metrics: any[] = []

      // Add metrics mentioned in the response
      const lines = response.split('\n')
      for (const line of lines) {
         if (
            line.includes('%') ||
            line.includes('average') ||
            line.includes('total') ||
            line.includes('mean') ||
            line.includes('median') ||
            line.includes('max') ||
            line.includes('min')
         ) {
            metrics.push({ text: line.trim(), source: 'ai_response' })
         }
      }

      // Add key statistics from analysis data
      const safeStatistics = (analysisData?.summary?.statistics && 
         typeof analysisData.summary.statistics === 'object' && 
         !Array.isArray(analysisData.summary.statistics))
         ? analysisData.summary.statistics
         : {}
      const numericColumns = Object.entries(safeStatistics)
         .filter(([_, stats]: [string, any]) => stats.type === 'numeric')
         .map(([col, stats]: [string, any]) => ({
            column: col,
            mean: stats.mean,
            max: stats.max,
            min: stats.min,
            source: 'data_analysis',
         }))

      // Combine both sources
      metrics.push(...numericColumns)

      return metrics.slice(0, 6) // Top 6 metrics
   }

   private extractRecommendations(response: string): string[] {
      // Extract recommendation sentences from response
      const sentences = response.split(/[.!?]+/)
      return sentences
         .filter(
            (sentence) =>
               sentence.toLowerCase().includes('recommend') ||
               sentence.toLowerCase().includes('suggest') ||
               sentence.toLowerCase().includes('should')
         )
         .map((sentence) => sentence.trim())
         .filter((sentence) => sentence.length > 10)
         .slice(0, 3)
   }

   private extractPresentationSections(response: string): string[] {
      // Extract main sections/headers from response
      const sections = response.match(/#+\s+(.+)/g) || []
      return sections.map((section) => section.replace(/#+\s+/, '').trim())
   }

   private extractKeyPoints(response: string): string[] {
      // Extract bullet points or key insights
      const bullets = response.match(/[•\-*]\s+(.+)/g) || []
      return bullets.map((bullet) => bullet.replace(/[•\-*]\s+/, '').trim()).slice(0, 5)
   }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
   // Only allow POST requests
   if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
   }

   try {
      const { message, analysisData } = req.body

      if (!message) {
         return res.status(400).json({ error: 'Message is required' })
      }

      const geminiClient = new ServerGeminiClient()
      const response = await geminiClient.generateResponse(message, analysisData)

      res.status(200).json(response)
   } catch (error: any) {
      console.error('Chat API Error:', error)
      res.status(500).json({
         error: error.message || 'Internal server error',
         details: error.stack,
      })
   }
}
