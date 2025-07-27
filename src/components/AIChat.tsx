import { useState, useRef, useEffect } from 'react'
import {
   Send,
   Bot,
   User,
   Sparkles,
   AlertTriangle,
   Database,
   ExternalLink,
   BarChart3,
   Presentation,
   Lightbulb,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/AnalysisContext'
import { useAIResponses } from '../context/AIResponseContext'
import { useChat, ChatMessage } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { getGeminiClient, GeminiResponse } from '../utils/geminiClient'
import userSubscriptionService from '../services/userSubscriptionService'
import MarkdownRenderer from './MarkdownRenderer'

function AIChat() {
   const { analysisData } = useAnalysis()
   const { addResponse } = useAIResponses()
   const { messages, addMessage } = useChat()
   const { user } = useAuth()
   const navigate = useNavigate()
   const [input, setInput] = useState('')
   const [isTyping, setIsTyping] = useState(false)
   const [geminiClient, setGeminiClient] = useState<any>(null)
   const [error, setError] = useState<string | null>(null)
   const messagesEndRef = useRef<HTMLDivElement>(null)

   // Initialize Gemini client
   useEffect(() => {
      try {
         const client = getGeminiClient()
         setGeminiClient(client)
         setError(null)
      } catch (err: any) {
         console.error('Failed to initialize Gemini client:', err)
         setError(err.message)
      }
   }, []) // Update request count when messages change
   useEffect(() => {
      // Just for monitoring in dev mode
      if (geminiClient && import.meta.env.DEV) {
         console.log('Current request count:', geminiClient.getRequestCount())
      }
   }, [messages, geminiClient])

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }

   useEffect(() => {
      scrollToBottom()
   }, [messages])

   const hasData = analysisData?.summary !== null

   const handleSendMessage = async () => {
      if (!input.trim()) return

      // Check subscription limits
      if (user) {
         const canMakeRequest = await userSubscriptionService.canMakeAIRequest(user.id)
         if (!canMakeRequest.allowed) {
            const limitMessage: ChatMessage = {
               id: Date.now().toString(),
               type: 'ai',
               content: `⚠️ **Request Limit Reached**\n\n${canMakeRequest.message}\n\n[Upgrade your plan](/pricing) to get more AI requests and unlock advanced features.`,
               timestamp: new Date(),
            }
            addMessage(limitMessage)
            setError(canMakeRequest.message || 'Request limit reached')
            return
         }
      }

      const userMessage: ChatMessage = {
         id: Date.now().toString(),
         type: 'user',
         content: input.trim(),
         timestamp: new Date(),
      }

      addMessage(userMessage)
      const userQuery = input.trim()
      setInput('')
      setIsTyping(true)
      setError(null)

      try {
         if (!geminiClient) {
            throw new Error('AI service is not available. Please check your configuration.')
         }
         if (!hasData) {
            const noDataMessage: ChatMessage = {
               id: (Date.now() + 1).toString(),
               type: 'ai',
               content: `I'd love to help analyze your data, but I don't see any uploaded dataset yet. 
               
Please upload a CSV file first using the Data Upload section, and once it's analyzed, I'll be able to provide insights about:

📊 **Data Overview & Statistics**  
📈 **Trends & Patterns**  
🎯 **Recommendations & Insights**  
📋 **Data Quality Issues**  
💡 **Visualization Suggestions**

Once you have data loaded, feel free to ask questions like:
- "What are the main trends in this data?"
- "Are there any outliers or anomalies?"
- "What visualizations would work best?"
- "Summarize the key insights"`,
               timestamp: new Date(),
            }
            addMessage(noDataMessage)
            setIsTyping(false)
            return
         } // Call Gemini API with analysis context
         const response: GeminiResponse = await geminiClient.generateResponse(userQuery, analysisData)

         // Increment usage counter on successful request
         if (user) {
            console.log('🔢 Incrementing AI usage for user:', user.id)
            await userSubscriptionService.incrementAIUsage(user.id)
            console.log('✅ AI usage incremented successfully')
         } // Create AI message with enhanced data
         const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: response.message,
            timestamp: new Date(),
            responseType: response.responseType,
            actionData: response.actionData,
            hasAction: response.responseType !== 'general',
         }

         addMessage(aiMessage)

         // If it's not a general response, also add to appropriate context
         if (response.responseType !== 'general') {
            addResponse({
               type: response.responseType,
               title: response.title,
               content: response.message,
               data: response.actionData,
            })
         }
      } catch (err: any) {
         console.error('Error getting AI response:', err)
         const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: `I apologize, but I encountered an error: ${err.message}

${
   err.message.includes('API key')
      ? 'Please check that your Gemini API key is properly configured in the .env file.'
      : 'Please try again or rephrase your question.'
}`,
            timestamp: new Date(),
         }

         addMessage(errorMessage)
         setError(err.message)
      } finally {
         setIsTyping(false)
      }
   }

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault()
         handleSendMessage()
      }
   }

   const handleActionClick = (responseType: string, actionData: any) => {
      console.log('Navigating to:', responseType, 'with data:', actionData)

      // Navigate to the appropriate tab/page
      switch (responseType) {
         case 'visualization':
            navigate('/visualizations')
            break
         case 'insights':
            navigate('/reports')
            break
         case 'presentation':
            navigate('/share')
            break
         default:
            console.log('Unknown response type:', responseType)
      }
   }

   const getActionIcon = (responseType: string) => {
      switch (responseType) {
         case 'visualization':
            return <BarChart3 className='w-3 h-3' />
         case 'insights':
            return <Lightbulb className='w-3 h-3' />
         case 'presentation':
            return <Presentation className='w-3 h-3' />
         default:
            return <ExternalLink className='w-3 h-3' />
      }
   }

   const getTabName = (responseType: string) => {
      switch (responseType) {
         case 'visualization':
            return 'Charts'
         case 'insights':
            return 'Smart Reports'
         case 'presentation':
            return 'Presentations'
         default:
            return 'Tab'
      }
   }

   return (
      <div className='flex flex-col h-[500px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200'>
         {' '}
         {/* Header */}
         <div className='bg-white border-b border-gray-200 px-6 py-4'>
            <div className='flex items-center justify-between'>
               <div className='flex items-center space-x-3'>
                  <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg'>
                     <Sparkles className='w-4 h-4 text-white' />
                  </div>
                  <div>
                     <h2 className='dashboard-heading text-gray-900'>AI Data Analyst</h2>
                     <p className='dashboard-body text-gray-500'>
                        {hasData
                           ? `Analyzing ${
                                analysisData.fileName || 'your dataset'
                             } (${analysisData.summary?.overview?.totalRows?.toLocaleString()} rows)`
                           : 'Upload data to start analysis'}
                     </p>
                  </div>
               </div>

               {/* Status indicators */}
               <div className='flex items-center space-x-3'>
                  {/* Data status */}
                  <div
                     className={`flex items-center justify-center space-x-1 px-2 py-1 rounded-full dashboard-small-text font-medium w-28 ${
                        hasData ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                     }`}
                  >
                     <Database className='w-3 h-3' />
                     <span>{hasData ? 'Data Ready' : 'No Data'}</span>
                  </div>

                  {/* Request counter for development */}
                  {import.meta.env.DEV && geminiClient && (
                     <div className='flex items-center justify-center space-x-1 px-2 py-1 rounded-full dashboard-small-text font-medium bg-blue-100 text-blue-700 w-28'>
                        <span>{geminiClient.getRemainingRequests()} requests left</span>
                     </div>
                  )}

                  {/* Error indicator */}
                  {error && (
                     <div className='flex items-center space-x-1 px-2 py-1 rounded-full dashboard-small-text font-medium bg-red-100 text-red-700'>
                        <AlertTriangle className='w-3 h-3' />
                        <span>API Error</span>
                     </div>
                  )}
               </div>
            </div>{' '}
            {/* Development warning */}
            {import.meta.env.DEV && (
               <div className='mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                     <AlertTriangle className='w-4 h-4 text-blue-600' />
                     <span className='dashboard-body text-blue-700'>
                        Development Mode: AI responses powered by Gemini API (server-side)
                     </span>
                  </div>
               </div>
            )}
         </div>
         {/* Messages */}
         <div className='flex-1 overflow-y-auto p-6 space-y-4'>
            {messages.map((message) => (
               <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                  {' '}
                  <div
                     className={`flex max-w-xs lg:max-w-md ${
                        message.type === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                     } items-start space-x-3`}
                  >
                     {/* Avatar */}
                     <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                           message.type === 'user'
                              ? 'bg-gray-300 text-gray-600'
                              : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                        }`}
                     >
                        {message.type === 'user' ? <User className='w-4 h-4' /> : <Bot className='w-4 h-4' />}
                     </div>{' '}
                     {/* Message Bubble */}
                     <div
                        className={`px-4 py-3 rounded-2xl ${
                           message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                     >
                        {message.type === 'user' ? (
                           <p className='dashboard-body leading-relaxed'>{message.content}</p>
                        ) : (
                           <MarkdownRenderer content={message.content} />
                        )}

                        {/* Action buttons for AI responses */}
                        {message.hasAction && message.responseType !== 'general' && (
                           <div className='mt-3 pt-3 border-t border-gray-100'>
                              <div className='flex items-center space-x-2'>
                                 <button
                                    onClick={() => handleActionClick(message.responseType!, message.actionData)}
                                    className='flex items-center space-x-2 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg dashboard-small-text font-medium transition-colors'
                                 >
                                    {getActionIcon(message.responseType!)}
                                    <span>View in {getTabName(message.responseType!)}</span>
                                    <ExternalLink className='w-3 h-3' />
                                 </button>
                                 <div className='px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium'>
                                    ✓ Generated
                                 </div>
                              </div>
                           </div>
                        )}

                        <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                           {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
               </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex justify-start'
               >
                  <div className='flex items-start space-x-3'>
                     <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center'>
                        <Bot className='w-4 h-4' />
                     </div>
                     <div className='bg-white border border-gray-200 px-4 py-2 rounded-2xl'>
                        <div className='flex space-x-1'>
                           <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                           <div
                              className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                              style={{ animationDelay: '0.1s' }}
                           ></div>
                           <div
                              className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                              style={{ animationDelay: '0.2s' }}
                           ></div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
            <div ref={messagesEndRef} />
         </div>{' '}
         {/* Input */}
         <div className='bg-white border-t border-gray-200 p-4'>
            <div className='flex items-center space-x-3'>
               <div className='flex-1 relative'>
                  <textarea
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyPress={handleKeyPress}
                     placeholder={
                        hasData ? 'Ask me about your data...' : 'Upload data first to start asking questions...'
                     }
                     className={`w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                        hasData ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                     }`}
                     rows={1}
                     style={{ minHeight: '44px', maxHeight: '120px' }}
                     disabled={!hasData}
                  />
               </div>
               <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping || !hasData}
                  className='flex-shrink-0 flex items-center justify-center w-11 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors mb-1.5'
               >
                  <Send className='w-4 h-4' />
               </button>
            </div>

            {/* Helper text */}
            {!hasData && (
               <p className='text-xs text-gray-500 mt-2 flex items-center space-x-1'>
                  <Database className='w-3 h-3' />
                  <span>Upload a CSV file to start asking questions about your data</span>
               </p>
            )}

            {hasData && (
               <div className='flex flex-wrap gap-2 mt-2'>
                  <span className='text-xs text-gray-500 mt-1'>Try out:</span>
                  {[
                     'Summarize my data',
                     'What trends do you see?',
                     'Show visualizations',
                     'Create presentation',
                     'Generate report',
                  ].map((suggestion) => (
                     <button
                        key={suggestion}
                        type='button'
                        className='px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400'
                        onClick={() => {
                           setInput(suggestion)
                           handleSendMessage()
                           // setTimeout(() => {
                           //    // Wait for input to update, then send
                           //    handleSendMessage()
                           // }, 0)
                        }}
                        disabled={isTyping}
                     >
                        {suggestion}
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>
   )
}

export default AIChat
