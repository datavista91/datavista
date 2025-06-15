import { useState } from 'react'
import FileUploader from './FileUploader'
import DataPreview from './DataPreview'
import ChartPanel from './ChartPanel'
import { useData } from '../context/DataContext'
import { useAnalysis } from '../context/AnalysisContext'
import { motion } from 'framer-motion'
import AIChat from './AIChat'

const Dashboard = () => {
   const { hasData } = useData()
   const { analysisData } = useAnalysis()
   const [activeSection, setActiveSection] = useState('data')
   console.log('Analysis Data:', analysisData)

   return (
      <div className='h-full'>
         {!hasData ? (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className='flex h-full items-center justify-center'
            >
               <FileUploader />
            </motion.div>
         ) : (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.5 }}
               className='space-y-6'
            >
               {' '}
               <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
                  <div>
                     <h1
                        className='text-2xl font-bold text-gray-900'
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                     >
                        Dashboard
                     </h1>
                     <p className='text-gray-600'>Your AI-powered analytics and insights</p>
                  </div>
                  {/* <div className='mt-4 md:mt-0 flex space-x-3'>
                     <button className='px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
                        Download PDF
                     </button>
                     <button className='px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-md text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700'>
                        Create Presentation
                     </button>
                  </div> */}
               </div>
               {/* Analysis Progress Bar */}
               {analysisData.isProcessing && (
                  <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'
                  >
                     <div className='flex items-center justify-between mb-2'>
                        <span className='text-sm font-medium text-gray-700'>Analyzing data...</span>
                        <span className='text-sm text-gray-500'>{analysisData.progress}%</span>
                     </div>
                     <div className='w-full bg-gray-200 rounded-full h-2'>
                        <motion.div
                           className='bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full'
                           style={{ width: `${analysisData.progress}%` }}
                           transition={{ duration: 0.3 }}
                        />
                     </div>
                  </motion.div>
               )}
               {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleInsights.map((insight, index) => (
              <InsightCard 
                key={index}
                title={insight.title}
                description={insight.description}
                icon={insight.icon}
                color={insight.color}
              />
            ))}
          </div> */}
               <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                  <div className='border-b border-gray-200'>
                     <nav className='flex'>
                        <button
                           onClick={() => setActiveSection('data')}
                           className={`px-4 py-3 text-sm font-medium ${
                              activeSection === 'data'
                                 ? 'border-b-2 border-purple-600 text-purple-600'
                                 : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           Data Preview
                        </button>
                        {/* <button
                  onClick={() => setActiveSection('charts')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeSection === 'charts'
                      ? 'border-b-2 border-purple-600 text-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Visualizations
                </button> */}
                        <button
                           onClick={() => setActiveSection('upload')}
                           className={`px-4 py-3 text-sm font-medium ${
                              activeSection === 'upload'
                                 ? 'border-b-2 border-purple-600 text-purple-600'
                                 : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           Upload New
                        </button>{' '}
                        <button
                           onClick={() => setActiveSection('chat')}
                           className={`px-4 py-3 text-sm font-medium ${
                              activeSection === 'chat'
                                 ? 'border-b-2 border-purple-600 text-purple-600'
                                 : 'text-gray-500 hover:text-gray-700'
                           }`}
                        >
                           Chat with AI
                        </button>
                     </nav>
                  </div>{' '}
                  <div className='p-4'>
                     {activeSection === 'data' && <DataPreview />}
                     {activeSection === 'charts' && <ChartPanel />}
                     {activeSection === 'chat' && (
                        <div className='flex justify-center'>
                           <div className='w-full max-w-4xl'>
                              <AIChat />
                           </div>
                        </div>
                     )}
                     {activeSection === 'upload' && (
                        <div className='py-8 flex justify-center'>
                           <FileUploader compact />
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
         )}
      </div>
   )
}

export default Dashboard
