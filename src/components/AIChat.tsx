import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface Message {
   id: string
   type: 'user' | 'ai'
   content: string
   timestamp: Date
}

function AIChat() {
   const [messages, setMessages] = useState<Message[]>([
      {
         id: '1',
         type: 'ai',
         content:
            "Hello! I'm your AI assistant. I can help you analyze your data, create insights, and answer questions about your datasets. What would you like to know?",
         timestamp: new Date(),
      },
   ])
   const [input, setInput] = useState('')
   const [isTyping, setIsTyping] = useState(false)
   const messagesEndRef = useRef<HTMLDivElement>(null)

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
   }

   useEffect(() => {
      scrollToBottom()
   }, [messages])

   const handleSendMessage = async () => {
      if (!input.trim()) return

      const userMessage: Message = {
         id: Date.now().toString(),
         type: 'user',
         content: input.trim(),
         timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsTyping(true)

      // Simulate AI response delay
      setTimeout(() => {
         const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content:
               'This is a simulated AI response. In a real implementation, this would connect to your AI service to provide data insights and analysis.',
            timestamp: new Date(),
         }
         setMessages((prev) => [...prev, aiMessage])
         setIsTyping(false)
      }, 1500)
   }

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault()
         handleSendMessage()
      }
   }

   return (
      <div className='flex flex-col h-[500px] bg-gray-50 rounded-lg overflow-hidden border border-gray-200'>
         {/* Header */}
         <div className='bg-white border-b border-gray-200 px-6 py-4'>
            <div className='flex items-center space-x-3'>
               <div className='flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg'>
                  <Sparkles className='w-4 h-4 text-white' />
               </div>
               <div>
                  <h2 className='text-lg font-semibold text-gray-900'>AI Assistant</h2>
                  <p className='text-sm text-gray-500'>Ask questions about your data</p>
               </div>
            </div>
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
                     </div>

                     {/* Message Bubble */}
                     <div
                        className={`px-4 py-3 rounded-2xl ${
                           message.type === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                     >
                        <p className='text-sm leading-relaxed'>{message.content}</p>
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
                     placeholder='Ask me about your data...'
                     className='w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'
                     rows={1}
                     style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
               </div>
               <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className='flex-shrink-0 flex items-center justify-center w-11 h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors mb-1.5'
               >
                  <Send className='w-4 h-4' />
               </button>
            </div>
         </div>
      </div>
   )
}

export default AIChat
