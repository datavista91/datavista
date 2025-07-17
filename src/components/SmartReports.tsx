import { useState } from 'react'
import { useAIResponses } from '../context/AIResponseContext'
import { useAnalysis } from '../context/AnalysisContext'
import InsightCard from './InsightCard'
import MarkdownRenderer from './MarkdownRenderer'
import {
   FileText,
   Sparkles,
   Clock,
   TrendingUp,
   AlertTriangle,
   CheckCircle,
   MessageSquare,
   ChevronDown,
} from 'lucide-react'

const SmartReports = () => {
   const { getResponsesByType } = useAIResponses()
   const { analysisData } = useAnalysis()
   const aiInsights = getResponsesByType('insights')
   const generalResponses = getResponsesByType('general')
   const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set())
   const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set())

   const hasData = analysisData?.summary !== null

   const toggleInsight = (id: string) => {
      const newExpanded = new Set(expandedInsights)
      if (newExpanded.has(id)) {
         newExpanded.delete(id)
      } else {
         newExpanded.add(id)
      }
      setExpandedInsights(newExpanded)
   }

   const toggleResponse = (id: string) => {
      const newExpanded = new Set(expandedResponses)
      if (newExpanded.has(id)) {
         newExpanded.delete(id)
      } else {
         newExpanded.add(id)
      }
      setExpandedResponses(newExpanded)
   }
   if (!hasData) {
      return (
         <div className='flex flex-col items-center justify-center h-96 text-center'>
            <FileText className='w-16 h-16 text-gray-400 mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Data Available</h2>
            <p className='text-gray-600 mb-4'>Upload a dataset to start generating smart reports and insights.</p>
         </div>
      )
   }

   if (aiInsights.length === 0 && generalResponses.length === 0) {
      return (
         <div className='space-y-6'>
            {/* <div className='flex items-center justify-between'>
               <div>
                  <h1 className='text-2xl font-bold text-gray-900'>Smart Reports</h1>
                  <p className='text-gray-600'>AI-powered insights and analysis</p>
               </div>
            </div> */}

            <div className='flex flex-col items-center justify-center h-96 text-center bg-white rounded-lg border border-gray-200'>
               <Sparkles className='w-16 h-16 text-purple-400 mb-4' />
               <h2 className='text-xl font-semibold text-gray-900 mb-2'>No AI Insights Yet</h2>
               <p className='text-gray-600 mb-4 max-w-md'>
                  Ask the AI questions about your data to generate insights that will appear here. Try asking for
                  summaries, trends, or analysis of your dataset.
               </p>
               <div className='flex flex-col space-y-2 text-sm text-gray-500'>
                  <p>💡 Try asking:</p>
                  <p>"Summarize my data"</p>
                  <p>"What insights do you see?"</p>
                  <p>"Analyze trends in this dataset"</p>
               </div>
            </div>

            {/* Default insight cards when no AI content */}
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
               <InsightCard
                  title='Data Overview'
                  description='Basic statistics and data quality metrics from your uploaded dataset.'
                  icon={<TrendingUp className='w-5 h-5' />}
                  color='blue'
               />
               <InsightCard
                  title='Pattern Detection'
                  description='Ask AI to identify patterns and relationships in your data.'
                  icon={<AlertTriangle className='w-5 h-5' />}
                  color='amber'
               />
               <InsightCard
                  title='Recommendations'
                  description='Get AI-powered recommendations based on your data analysis.'
                  icon={<CheckCircle className='w-5 h-5' />}
                  color='emerald'
               />
            </div>
         </div>
      )
   }

   return (
      <div className='space-y-6 h-full overflow-y-auto custom-scrollbar'>
         <div className='flex items-center justify-between'>
            {/* <div>
               <h1 className='text-2xl font-bold text-gray-900'>Smart Reports</h1>
               <p className='text-gray-600'>AI-powered insights and analysis</p>
            </div> */}
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
               <Sparkles className='w-4 h-4' />
               <span>{aiInsights.length + generalResponses.length} AI responses</span>
            </div>
         </div>

         {/* AI Insights Section */}
         {aiInsights.length > 0 && (
            <div className='space-y-4'>
               <div className='flex items-center space-x-2'>
                  <TrendingUp className='w-5 h-5 text-purple-600' />
                  <h2 className='text-lg font-semibold text-gray-900'>Data Insights</h2>
               </div>
               <div className='space-y-3'>
                  {aiInsights.map((insight) => {
                     const isExpanded = expandedInsights.has(insight.id)
                     return (
                        <div
                           key={insight.id}
                           className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
                        >
                           {/* Accordion Header */}
                           <div
                              className='p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ease-in-out accordion-header'
                              onClick={() => toggleInsight(insight.id)}
                           >
                              <div className='flex items-center justify-between'>
                                 <div className='flex items-center space-x-3'>
                                    <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-purple-100 text-purple-700 transition-colors duration-200'>
                                       <Sparkles className='w-4 h-4' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                       <h3 className='font-semibold text-gray-900 truncate'>{insight.title}</h3>
                                       <div className='flex items-center space-x-2 text-sm text-gray-500'>
                                          <Clock className='w-3 h-3' />
                                          <span>{new Date(insight.timestamp).toLocaleString()}</span>
                                          {insight.isNew && (
                                             <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
                                                <CheckCircle className='w-3 h-3 mr-1' />
                                                New
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 <div className='flex items-center space-x-2'>
                                    <div
                                       className={`transition-transform duration-300 ease-in-out ${
                                          isExpanded ? 'rotate-180' : 'rotate-0'
                                       }`}
                                    >
                                       <ChevronDown className='w-5 h-5 text-gray-400' />
                                    </div>
                                 </div>
                              </div>
                           </div>{' '}
                           {/* Accordion Content */}
                           <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                 isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                              }`}
                           >
                              <div className='px-6 pb-6 border-t border-gray-100 max-h-96 overflow-y-auto custom-scrollbar'>
                                 <div
                                    className={`prose prose-sm max-w-none mt-4 ${
                                       isExpanded ? 'animate-slide-down' : ''
                                    }`}
                                 >
                                    <MarkdownRenderer content={insight.content} />
                                 </div>
                                 {/* Key Metrics Display */}
                                 {insight.data?.keyMetrics && insight.data.keyMetrics.length > 0 && (
                                    <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                                       <h4 className='text-sm font-medium text-gray-900 mb-3 flex items-center'>
                                          <TrendingUp className='w-4 h-4 mr-2' />
                                          Key Metrics
                                       </h4>
                                       <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-60 overflow-y-auto custom-scrollbar'>
                                          {insight.data.keyMetrics.map((metric: any, index: number) => {
                                             // Clean up metric text by removing markdown formatting
                                             const getCleanText = (text: string) => {
                                                return text.replace(/\*\*|\*/g, '').trim()
                                             }

                                             const getMetricTitle = () => {
                                                if (typeof metric === 'object') {
                                                   return metric.column || 'Metric'
                                                }
                                                // Extract title from string like "**Title:** value"
                                                if (typeof metric === 'string' && metric.includes(':')) {
                                                   return getCleanText(metric.split(':')[0])
                                                }
                                                return 'Finding'
                                             }

                                             const getMetricValue = () => {
                                                if (typeof metric === 'string') {
                                                   if (metric.includes(':')) {
                                                      return getCleanText(metric.split(':').slice(1).join(':'))
                                                   }
                                                   return getCleanText(metric)
                                                }
                                                if (metric.text) {
                                                   return getCleanText(metric.text)
                                                }
                                                if (metric.mean) {
                                                   return `Avg: ${metric.mean.toFixed(2)}`
                                                }
                                                return 'N/A'
                                             }

                                             return (
                                                <div
                                                   key={index}
                                                   className='bg-white rounded-lg p-3 border border-gray-200'
                                                >
                                                   <div className='text-xs font-medium text-gray-700 mb-1'>
                                                      {getMetricTitle()}
                                                   </div>
                                                   <div className='text-sm font-semibold text-gray-900'>
                                                      {getMetricValue()}
                                                   </div>
                                                </div>
                                             )
                                          })}
                                       </div>
                                    </div>
                                 )}{' '}
                                 {/* Recommendations Display */}
                                 {insight.data?.recommendations && insight.data.recommendations.length > 0 && (
                                    <div className='mt-4 p-4 bg-blue-50 rounded-lg'>
                                       <h4 className='text-sm font-medium text-gray-900 mb-3 flex items-center'>
                                          <AlertTriangle className='w-4 h-4 mr-2' />
                                          Recommendations
                                       </h4>
                                       <ul className='space-y-2 max-h-48 overflow-y-auto custom-scrollbar'>
                                          {insight.data.recommendations.map((rec: string, index: number) => {
                                             // Clean up recommendation text
                                             const cleanRec = rec
                                                .replace(/\*\*|\*/g, '')
                                                .replace(/^[•\-\*]\s*/, '')
                                                .trim()
                                             return (
                                                <li
                                                   key={index}
                                                   className='text-sm text-gray-700 flex items-start'
                                                >
                                                   <span className='text-blue-500 mr-2 flex-shrink-0'>•</span>
                                                   <span>{cleanRec}</span>
                                                </li>
                                             )
                                          })}
                                       </ul>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>
         )}

         {/* General AI Responses Section */}
         {generalResponses.length > 0 && (
            <div className='space-y-4'>
               <div className='flex items-center space-x-2'>
                  <MessageSquare className='w-5 h-5 text-blue-600' />
                  <h2 className='text-lg font-semibold text-gray-900'>AI Analysis Reports</h2>
               </div>
               <div className='space-y-3'>
                  {generalResponses.slice(0, 5).map((response) => {
                     const isExpanded = expandedResponses.has(response.id)
                     return (
                        <div
                           key={response.id}
                           className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'
                        >
                           {/* Accordion Header */}
                           <div
                              className='p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ease-in-out accordion-header'
                              onClick={() => toggleResponse(response.id)}
                           >
                              <div className='flex items-center justify-between'>
                                 <div className='flex items-center space-x-3'>
                                    <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-700 transition-colors duration-200'>
                                       <MessageSquare className='w-4 h-4' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                       <h3 className='font-medium text-gray-900 truncate'>{response.title}</h3>
                                       <div className='flex items-center space-x-2 text-sm text-gray-500'>
                                          <Clock className='w-3 h-3' />
                                          <span>{new Date(response.timestamp).toLocaleString()}</span>
                                          {response.isNew && (
                                             <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
                                                New
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 <div className='flex items-center space-x-2'>
                                    <div
                                       className={`transition-transform duration-300 ease-in-out ${
                                          isExpanded ? 'rotate-180' : 'rotate-0'
                                       }`}
                                    >
                                       <ChevronDown className='w-5 h-5 text-gray-400' />
                                    </div>
                                 </div>
                              </div>
                           </div>{' '}
                           {/* Accordion Content */}
                           <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                 isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                              }`}
                           >
                              <div className='px-6 pb-6 border-t border-gray-100 max-h-96 overflow-y-auto custom-scrollbar'>
                                 <div
                                    className={`prose prose-sm max-w-none mt-4 ${
                                       isExpanded ? 'animate-slide-down' : ''
                                    }`}
                                 >
                                    <MarkdownRenderer content={response.content} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     )
                  })}
               </div>
            </div>
         )}
      </div>
   )
}

export default SmartReports
