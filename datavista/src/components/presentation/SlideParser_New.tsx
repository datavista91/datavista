import { AIResponse } from '../../context/AIResponseContext'
import { Slide } from './SlideRenderer'

export interface ParsedSlideContent {
   title: string
   content: string
   type: 'content' | 'chart' | 'metrics' | 'list'
   metrics?: Array<{
      label: string
      value: string | number
      trend?: 'up' | 'down' | 'neutral'
      change?: string
   }>
   chartData?: any[]
   chartType?: 'bar' | 'pie' | 'line'
}

export class EnhancedSlideParser {
   static parseAIResponseToSlides(response: AIResponse, analysisData?: any): Slide[] {
      const slides: Slide[] = []

      // Clean content - remove AI thinking messages and unwanted text
      const cleanContent = this.cleanAIContent(response.content)

      // Validate that we have meaningful content
      if (!cleanContent || cleanContent.length < 50) {
         return this.createFallbackSlides(response, analysisData)
      }

      // Extract key insights once for consolidation
      const insights = this.extractAllInsights(cleanContent)
      const recommendations = this.extractRecommendations(cleanContent)

      // 1. Title Slide with data-specific information
      slides.push({
         id: 'title',
         type: 'title',
         title: this.generateDataSpecificTitle(response, analysisData),
         subtitle: this.generateSubtitle(response, analysisData),
         content: '',
         layout: 'single',
      })

      // 2. Executive Summary Slide - consolidated overview
      slides.push({
         id: 'executive-summary',
         type: 'content',
         title: 'Executive Summary',
         content: this.createExecutiveSummary(cleanContent, analysisData, insights),
         layout: 'single',
      })

      // 3. Key Findings - consolidated into 1-2 slides maximum
      const findingsSlides = this.createConsolidatedKeyFindings(insights)
      slides.push(...findingsSlides)

      // 4. Data Insights - if we have specific data points
      const dataInsightsSlide = this.createDataInsightsSlide(cleanContent, analysisData)
      if (dataInsightsSlide) {
         slides.push(dataInsightsSlide)
      }

      // 5. Charts Slide (if data available)
      const chartSlides = this.createChartSlides(analysisData)
      slides.push(...chartSlides)

      // 6. Recommendations - consolidated actionable items
      if (recommendations.length > 0) {
         slides.push({
            id: 'recommendations',
            type: 'content',
            title: 'Recommendations',
            content: this.formatRecommendations(recommendations),
            layout: 'single',
         })
      }

      // 7. Conclusion Slide with key takeaways
      slides.push({
         id: 'conclusion',
         type: 'conclusion',
         title: 'Key Takeaways & Next Steps',
         content: this.generateConclusionContent(insights, recommendations, analysisData),
         layout: 'single',
      })

      return slides.length >= 3 ? slides : this.createFallbackSlides(response, analysisData)
   }

   private static createFallbackSlides(response: AIResponse, analysisData?: any): Slide[] {
      const slides: Slide[] = []

      // Basic title slide
      slides.push({
         id: 'title',
         type: 'title',
         title: this.generateDataSpecificTitle(response, analysisData),
         subtitle: this.generateSubtitle(response, analysisData),
         content: '',
         layout: 'single',
      })

      // Data overview if available
      if (analysisData?.summary) {
         const summary = analysisData.summary
         const overviewContent = [
            `Dataset contains ${summary.totalRows?.toLocaleString() || 'multiple'} records`,
            `Analysis covers ${Object.keys(summary.statistics || {}).length} data fields`,
            'AI-powered insights and recommendations generated',
            'Data patterns and trends identified',
         ].join('\n• ')

         slides.push({
            id: 'overview',
            type: 'content',
            title: 'Data Overview',
            content: '• ' + overviewContent,
            layout: 'single',
         })
      }

      // Simple content slide with basic response
      if (response.content && response.content.length > 50) {
         const basicContent = this.extractMeaningfulContent(response.content)
         if (basicContent) {
            slides.push({
               id: 'content',
               type: 'content',
               title: 'Analysis Results',
               content: basicContent,
               layout: 'single',
            })
         }
      }

      // Charts if available
      const chartSlides = this.createChartSlides(analysisData)
      slides.push(...chartSlides)

      return slides
   }

   private static cleanAIContent(content: string): string {
      // Remove AI thinking messages and unwanted patterns
      let cleaned = content
         // Remove AI introductory phrases
         .replace(
            /^(I'll|I will|Let me|I'm going to|I can see that|Looking at|Based on|From|According to).*?[.!]\s*/gim,
            ''
         )
         // Remove AI uncertainty and meta phrases
         .replace(
            /(It appears|It seems|It looks like|This suggests|Let me analyze|I'll examine|Here's what I found)/gi,
            ''
         )
         // Remove analysis explanations
         .replace(/^(The data shows|Analysis reveals|From the dataset|The analysis indicates).*?[.!]\s*/gim, '')
         // Remove meta-commentary and notes
         .replace(/\(Note:.*?\)/gi, '')
         .replace(/\[.*?\]/gi, '')
         .replace(/\*\*Note:\*\*.*$/gim, '')
         // Remove redundant AI phrases
         .replace(/^(Here are the|Here's a|Below are|The following).*?:\s*/gim, '')
         // Clean up markdown artifacts
         .replace(/\*\*(.*?)\*\*/g, '$1')
         .replace(/^\s*#+\s*/gm, '')
         // Clean up extra whitespace and line breaks
         .replace(/\n\s*\n\s*\n/g, '\n\n')
         .replace(/^\s+/gm, '')
         .trim()

      return cleaned
   }

   private static generateDataSpecificTitle(response: AIResponse, analysisData?: any): string {
      // Use actual data context for meaningful titles
      if (analysisData?.fileName) {
         const fileName = analysisData.fileName.replace(/\.(csv|xlsx|json)$/i, '')
         return `${fileName} Analysis Report`
      }

      if (analysisData?.summary?.tableName) {
         return `${analysisData.summary.tableName} Insights`
      }

      // Extract meaningful business context from the response
      const content = response.content.toLowerCase()

      // Look for business/domain-specific keywords
      if (content.includes('sales') || content.includes('revenue')) {
         return 'Sales Performance Analysis'
      } else if (content.includes('customer') || content.includes('user')) {
         return 'Customer Analytics Report'
      } else if (content.includes('marketing') || content.includes('campaign')) {
         return 'Marketing Insights Dashboard'
      } else if (content.includes('financial') || content.includes('profit')) {
         return 'Financial Analysis Report'
      } else if (content.includes('product') || content.includes('inventory')) {
         return 'Product Performance Analysis'
      } else if (content.includes('employee') || content.includes('hr')) {
         return 'HR Analytics Report'
      }

      // Use response title if meaningful
      if (response.title && !response.title.toLowerCase().includes('response')) {
         return response.title
      }

      // Default with data context
      const rowCount = analysisData?.summary?.totalRows
      if (rowCount) {
         return `Data Analysis Report (${rowCount.toLocaleString()} Records)`
      }

      return 'Business Intelligence Report'
   }

   private static generateSubtitle(response: AIResponse, analysisData?: any): string {
      const dataInfo = analysisData?.summary
         ? `Analysis of ${analysisData.summary.totalRows || 'your'} data points`
         : 'Data Analysis Report'

      return `${dataInfo} • Generated ${new Date(response.timestamp).toLocaleDateString()}`
   }

   private static extractMeaningfulContent(content: string): string {
      // Remove fluff and extract actionable content
      const meaningful = content
         .split('\n')
         .filter((line) => {
            const trimmed = line.trim()
            // Skip empty lines and fluff
            if (!trimmed || trimmed.length < 10) return false
            // Skip common AI phrases
            if (trimmed.match(/^(the|this|it|that|in|for|with|by|of|on|at|to|from)/i)) {
               return trimmed.length > 30 // Only if substantial
            }
            return true
         })
         .join('\n')
         .trim()

      return meaningful
   }

   // Extract all meaningful insights from content
   private static extractAllInsights(content: string): string[] {
      const insights: string[] = []

      // Extract bullet points
      const bulletMatches = content.match(/^\s*[-*•]\s+(.+)$/gm) || []
      bulletMatches.forEach((match) => {
         const insight = match.replace(/^\s*[-*•]\s+/, '').trim()
         if (
            insight.length > 15 &&
            !insight.toLowerCase().includes('ai') &&
            !insight.toLowerCase().includes('analysis shows')
         ) {
            insights.push(insight)
         }
      })

      // Extract numbered points
      const numberedMatches = content.match(/^\s*\d+\.\s+(.+)$/gm) || []
      numberedMatches.forEach((match) => {
         const insight = match.replace(/^\s*\d+\.\s+/, '').trim()
         if (insight.length > 15 && !insight.toLowerCase().includes('ai')) {
            insights.push(insight)
         }
      })

      // Extract key sentences with findings
      const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20)
      sentences.forEach((sentence) => {
         const trimmed = sentence.trim()
         if (
            trimmed.match(
               /\b(shows?|indicates?|reveals?|demonstrates?|suggests?|highest|lowest|increased?|decreased?|significant|trend|pattern)\b/i
            )
         ) {
            if (
               trimmed.length > 30 &&
               trimmed.length < 200 &&
               !trimmed.toLowerCase().includes('analysis') &&
               !trimmed.toLowerCase().includes('ai')
            ) {
               insights.push(trimmed)
            }
         }
      })

      // Remove duplicates and return top insights
      const uniqueInsights = [...new Set(insights)]
      return uniqueInsights.slice(0, 8)
   }

   // Extract actionable recommendations
   private static extractRecommendations(content: string): string[] {
      const recommendations: string[] = []

      // Look for recommendation patterns
      const recPatterns = [
         /(?:recommend|suggest|should|consider|propose|advise)([^.!?]+)/gi,
         /recommendation\s*\d*:?\s*([^.\n]+)/gi,
         /^\s*[-*•]\s*(?:recommend|suggest|should|consider)([^.\n]+)/gim,
      ]

      recPatterns.forEach((pattern) => {
         const matches = content.match(pattern) || []
         matches.forEach((match) => {
            const rec = match
               .replace(/^(recommend|suggest|should|consider|propose|advise|recommendation\s*\d*:?\s*|[-*•]\s*)/i, '')
               .trim()
            if (rec.length > 20 && rec.length < 200) {
               recommendations.push(rec)
            }
         })
      })

      return recommendations.slice(0, 6)
   }

   // Create comprehensive executive summary
   private static createExecutiveSummary(content: string, analysisData?: any, insights?: string[]): string {
      const summaryParts: string[] = []

      // Add data context if available
      if (analysisData?.summary) {
         const summary = analysisData.summary
         summaryParts.push(
            `Overview: This analysis examines ${
               summary.totalRows?.toLocaleString() || 'multiple'
            } data records, revealing key patterns and trends in the dataset.`
         )
      } else {
         summaryParts.push(
            'Overview: This presentation summarizes the key findings from comprehensive data analysis, highlighting critical insights and actionable recommendations.'
         )
      }

      // Add top 2-3 insights if available
      if (insights && insights.length > 0) {
         insights.slice(0, 3).forEach((insight, index) => {
            summaryParts.push(`Key Insight ${index + 1}: ${insight}`)
         })
      } else {
         // Extract summary from content
         const contentSummary = this.extractContentSummary(content)
         if (contentSummary) {
            summaryParts.push(contentSummary)
         }
      }

      return summaryParts.join('\n\n• ')
   }

   // Create consolidated key findings (max 2 slides)
   private static createConsolidatedKeyFindings(insights: string[]): Slide[] {
      const slides: Slide[] = []

      if (insights.length === 0) return slides

      // Group insights into 2 slides maximum
      const midPoint = Math.ceil(insights.length / 2)
      const firstGroup = insights.slice(0, midPoint)
      const secondGroup = insights.slice(midPoint)

      // First findings slide
      if (firstGroup.length > 0) {
         const content = firstGroup.map((insight, index) => `${index + 1}. ${insight}`).join('\n\n')
         slides.push({
            id: 'key-findings-1',
            type: 'content',
            title: 'Key Findings',
            content: content,
            layout: 'single',
         })
      }

      // Second findings slide (only if we have enough content)
      if (secondGroup.length > 0 && insights.length > 4) {
         const content = secondGroup.map((insight, index) => `${midPoint + index + 1}. ${insight}`).join('\n\n')
         slides.push({
            id: 'key-findings-2',
            type: 'content',
            title: 'Additional Key Findings',
            content: content,
            layout: 'single',
         })
      }

      return slides
   }

   // Create data insights slide with actual data context
   private static createDataInsightsSlide(content: string, analysisData?: any): Slide | null {
      const insights: string[] = []

      // Add data-specific insights
      if (analysisData?.summary) {
         const summary = analysisData.summary

         if (summary.totalRows) {
            insights.push(`Dataset Volume: ${summary.totalRows.toLocaleString()} total records analyzed`)
         }

         if (summary.statistics && Object.keys(summary.statistics).length > 0) {
            insights.push(`Data Coverage: ${Object.keys(summary.statistics).length} key variables examined`)

            // Add specific statistical insights
            const stats = summary.statistics
            Object.entries(stats)
               .slice(0, 3)
               .forEach(([field, data]: [string, any]) => {
                  if (data?.mean !== undefined) {
                     insights.push(
                        `${field}: Average value of ${typeof data.mean === 'number' ? data.mean.toFixed(2) : data.mean}`
                     )
                  } else if (data?.count !== undefined) {
                     insights.push(`${field}: ${data.count} unique values identified`)
                  }
               })
         }
      }

      // Extract data-related insights from content
      const dataPatterns = [
         /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:percent|%|records|rows|entries)/gi,
         /(?:average|mean|median|total|sum|count|maximum|minimum|highest|lowest)\s*(?:of|is|:)?\s*([^.\n]{10,50})/gi,
      ]

      dataPatterns.forEach((pattern) => {
         const matches = content.match(pattern) || []
         matches.slice(0, 2).forEach((match) => {
            insights.push(match.trim())
         })
      })

      if (insights.length === 0) return null

      return {
         id: 'data-insights',
         type: 'content',
         title: 'Data Insights',
         content: insights.map((insight) => `• ${insight}`).join('\n\n'),
         layout: 'single',
      }
   }

   // Format recommendations professionally
   private static formatRecommendations(recommendations: string[]): string {
      if (recommendations.length === 0) return ''

      return recommendations
         .slice(0, 5)
         .map((rec, index) => {
            const cleanRec = rec.replace(/^(that\s+|to\s+)/i, '').trim()
            const capitalizedRec = cleanRec.charAt(0).toUpperCase() + cleanRec.slice(1)
            return `${index + 1}. ${capitalizedRec}${capitalizedRec.endsWith('.') ? '' : '.'}`
         })
         .join('\n\n')
   }

   // Generate comprehensive conclusion
   private static generateConclusionContent(insights: string[], recommendations: string[], analysisData?: any): string {
      const conclusionParts: string[] = []

      // Summary of key findings
      if (insights.length > 0) {
         conclusionParts.push(`Key Findings: ${insights.length} critical insights identified from the analysis`)
         conclusionParts.push(`Primary Discovery: ${insights[0] || 'Significant patterns detected in the data'}`)
      }

      // Recommendations summary
      if (recommendations.length > 0) {
         conclusionParts.push(`Actionable Items: ${recommendations.length} specific recommendations provided`)
      }

      // Next steps
      conclusionParts.push('Next Steps: Review findings with stakeholders and implement recommended actions')

      // Data context
      if (analysisData?.summary?.totalRows) {
         conclusionParts.push(
            `Impact: Insights derived from ${analysisData.summary.totalRows.toLocaleString()} data points for informed decision-making`
         )
      }

      return conclusionParts.join('\n\n• ')
   }

   // Extract content summary for executive summary
   private static extractContentSummary(content: string): string {
      // Look for summary-like content
      const summaryPatterns = [
         /(?:summary|conclusion|overview|key findings?):\s*([^.\n]{30,200})/gi,
         /(?:in summary|to summarize|overall|in conclusion),?\s*([^.\n]{30,200})/gi,
      ]

      for (const pattern of summaryPatterns) {
         const match = content.match(pattern)
         if (match && match[1]) {
            return match[1].trim()
         }
      }

      // Fallback: extract first meaningful paragraph
      const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 50)
      if (paragraphs.length > 0) {
         return paragraphs[0].substring(0, 200) + (paragraphs[0].length > 200 ? '...' : '')
      }

      return 'Comprehensive analysis reveals important insights and patterns within the dataset'
   }

   private static createChartSlides(analysisData?: any): Slide[] {
      const slides: Slide[] = []

      if (!analysisData?.charts || !Array.isArray(analysisData.charts)) {
         return slides
      }

      // Group charts into slides (max 2 charts per slide)
      const chartGroups = []
      for (let i = 0; i < analysisData.charts.length; i += 2) {
         chartGroups.push(analysisData.charts.slice(i, i + 2))
      }

      chartGroups.forEach((group, index) => {
         if (group.length === 1) {
            // Single chart slide
            slides.push({
               id: `chart-${index + 1}`,
               type: 'chart',
               title: group[0].title || `Chart ${index + 1}`,
               content: group[0].description || '',
               chartData: group[0].data,
               chartType: group[0].type || 'bar',
               layout: 'chart-single',
            })
         } else {
            // Multiple charts slide
            slides.push({
               id: `charts-${index + 1}`,
               type: 'chart',
               title: 'Data Visualization',
               content: '',
               chartData: group,
               layout: 'chart-grid',
            })
         }
      })

      return slides
   }
}
