import { useState, useEffect } from 'react'
import { FileText, Calendar, HardDrive, Trash2, X } from 'lucide-react'
import {
   getAnalysisHistory,
   clearAnalysisHistory,
   deleteAnalysisItem,
   formatFileSize,
   AnalysisHistoryItem,
} from '../context/AnalysisContext'

const AnalysisHistory = () => {
   const [history, setHistory] = useState<AnalysisHistoryItem[]>([])

   useEffect(() => {
      const loadHistory = () => {
         const currentHistory = getAnalysisHistory()
         setHistory(currentHistory)
      }

      loadHistory()

      // Listen for storage changes (if multiple tabs are open)
      const handleStorageChange = () => {
         loadHistory()
      }

      window.addEventListener('storage', handleStorageChange)

      // Also listen for focus (in case history was updated in another tab)
      window.addEventListener('focus', handleStorageChange)

      return () => {
         window.removeEventListener('storage', handleStorageChange)
         window.removeEventListener('focus', handleStorageChange)
      }
   }, [])

   const handleClearHistory = () => {
      if (window.confirm('Are you sure you want to clear all analysis history?')) {
         clearAnalysisHistory()
         setHistory([])
      }
   }

   const handleDeleteItem = (id: string, fileName: string) => {
      if (window.confirm(`Are you sure you want to delete the analysis for "${fileName}"?`)) {
         deleteAnalysisItem(id)
         // Update local state to reflect the change immediately
         setHistory(prevHistory => prevHistory.filter(item => item.id !== id))
      }
   }

   const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
   }

   if (history.length === 0) {
      return (
         <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>Analysis History</h3>
            <div className='text-center py-8'>
               <FileText className='mx-auto h-12 w-12 text-gray-400' />
               <h3 className='mt-2 text-sm font-medium text-gray-900'>No analysis history</h3>
               <p className='mt-1 text-sm text-gray-500'>Upload and analyze CSV files to see them here.</p>
            </div>
         </div>
      )
   }

   return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
         <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-medium text-gray-900'>Analysis History</h3>
            <button
               onClick={handleClearHistory}
               className='flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors'
            >
               <Trash2 className='h-4 w-4' />
               <span>Clear All</span>
            </button>
         </div>

         <div className='space-y-3'>
            {history.map((item) => (
               <div
                  key={item.id}
                  className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'
               >                  <div className='flex items-start justify-between'>
                     <div className='flex items-start space-x-3'>
                        <div className='flex-shrink-0'>
                           <FileText className='h-5 w-5 text-purple-600' />
                        </div>
                        <div className='flex-1 min-w-0'>
                           <p className='text-sm font-medium text-gray-900 truncate'>{item.fileName}</p>
                           <div className='flex items-center space-x-4 mt-1'>
                              <div className='flex items-center space-x-1 text-xs text-gray-500'>
                                 <Calendar className='h-3 w-3' />
                                 <span>{formatDate(item.uploadDate)}</span>
                              </div>
                              <div className='flex items-center space-x-1 text-xs text-gray-500'>
                                 <HardDrive className='h-3 w-3' />
                                 <span>{formatFileSize(item.fileSize)}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className='flex items-start space-x-2'>
                        <div className='flex-shrink-0 text-right'>
                           {item.analysisData.summary && (
                              <div>
                                 <p className='text-xs text-gray-500'>
                                    {item.analysisData.summary.overview.totalRows.toLocaleString()} rows
                                 </p>
                                 <p className='text-xs text-gray-500'>
                                    {item.analysisData.summary.overview.totalColumns} columns
                                 </p>
                              </div>
                           )}
                        </div>
                        <button
                           onClick={() => handleDeleteItem(item.id, item.fileName)}
                           className='flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
                           title={`Delete analysis for ${item.fileName}`}
                        >
                           <X className='h-4 w-4' />
                        </button>
                     </div>
                  </div>

                  {/* Analysis Summary Preview */}
                  {item.analysisData.summary && (
                     <div className='mt-3 pt-3 border-t border-gray-100'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                           <div className='text-center'>
                              <p className='text-xs font-medium text-purple-600'>
                                 {item.analysisData.summary.overview.totalRows.toLocaleString()}
                              </p>
                              <p className='text-xs text-gray-500'>Rows</p>
                           </div>
                           <div className='text-center'>
                              <p className='text-xs font-medium text-indigo-600'>
                                 {item.analysisData.summary.overview.totalColumns}
                              </p>
                              <p className='text-xs text-gray-500'>Columns</p>
                           </div>
                           <div className='text-center'>
                              <p className='text-xs font-medium text-green-600'>
                                 {item.analysisData.summary.overview.sampleSize?.toLocaleString() || 'N/A'}
                              </p>
                              <p className='text-xs text-gray-500'>Sample</p>
                           </div>
                           <div className='text-center'>
                              <p className='text-xs font-medium text-orange-600'>
                                 {item.analysisData.summary.dataQuality?.duplicates || 0}
                              </p>
                              <p className='text-xs text-gray-500'>Duplicates</p>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>

         {history.length >= 10 && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
               <p className='text-sm text-blue-800'>
                  📝 Only the 10 most recent analyses are kept. Older ones are automatically removed.
               </p>
            </div>
         )}
      </div>
   )
}

export default AnalysisHistory
