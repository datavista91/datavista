import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

// History interfaces
interface AnalysisHistoryItem {
   id: string
   fileName: string
   uploadDate: string
   fileSize: number
   analysisData: any
}

// LocalStorage utility functions
const STORAGE_KEY = 'datavista_analysis_history'

const saveAnalysisToHistory = (historyItem: AnalysisHistoryItem) => {
   try {
      const existingHistory = getAnalysisHistory()
      const updatedHistory = [historyItem, ...existingHistory.slice(0, 9)] // Keep only 10 most recent
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
   } catch (error) {
      console.error('Failed to save analysis to history:', error)
   }
}

const getAnalysisHistory = (): AnalysisHistoryItem[] => {
   try {
      const history = localStorage.getItem(STORAGE_KEY)
      return history ? JSON.parse(history) : []
   } catch (error) {
      console.error('Failed to get analysis history:', error)
      return []
   }
}

const clearAnalysisHistory = () => {
   try {
      localStorage.removeItem(STORAGE_KEY)
   } catch (error) {
      console.error('Failed to clear analysis history:', error)
   }
}

const deleteAnalysisItem = (id: string) => {
   try {
      const existingHistory = getAnalysisHistory()
      const updatedHistory = existingHistory.filter(item => item.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
   } catch (error) {
      console.error('Failed to delete analysis item:', error)
   }
}

const formatFileSize = (bytes: number): string => {
   if (bytes === 0) return '0 Bytes'
   const k = 1024
   const sizes = ['Bytes', 'KB', 'MB', 'GB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Define interfaces
interface ColumnStats {
   type: 'numeric' | 'categorical' | 'date'
   count: number
   mean?: number
   median?: number
   min?: number
   max?: number
   stdDev?: number
   quartiles?: number[]
   unique?: number
   topValues?: [string, number][]
}

interface AnalysisData {
   sample: any[]
   summary: DataSummary | null
   isProcessing: boolean
   progress: number
   fileName: string
   fileSize: number
}

interface DataSummary {
   overview: {
      totalRows: number
      totalColumns: number
      columns: string[]
      fileSize?: string
      sampleSize: number
   }
   statistics: Record<string, ColumnStats>
   patterns: {
      correlations: Record<string, number>
      trends: any[]
      outliers: any[]
   }
   dataQuality: {
      missingValues: Record<string, number>
      duplicates: number
      dataTypes: Record<string, string>
   }
}

interface AnalysisContextType {
   analysisData: AnalysisData
   analyzeData: (csvData: any[], fileName: string, fileSize: number) => Promise<void>
}

// Create context
const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

// Custom hook to use analysis context
export const useAnalysis = () => {
   const context = useContext(AnalysisContext)
   if (context === undefined) {
      throw new Error('useAnalysis must be used within an AnalysisProvider')
   }
   return context
}

// Fallback processing function for main thread
const processDataMainThread = async (csvData: any[]) => {
   // Simple fallback implementation
   const sample = csvData.slice(0, Math.min(1000, csvData.length))
   const columns = Object.keys(csvData[0] || {})

   const summary: DataSummary = {
      overview: {
         totalRows: csvData.length,
         totalColumns: columns.length,
         columns: columns,
         sampleSize: sample.length,
      },
      statistics: {},
      patterns: {
         correlations: {},
         trends: [],
         outliers: [],
      },
      dataQuality: {
         missingValues: {},
         duplicates: 0,
         dataTypes: {},
      },
   }

   return { sample, summary }
}

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
   const [analysisData, setAnalysisData] = useState<AnalysisData>({
      sample: [],
      summary: null,
      isProcessing: false,
      progress: 0,
      fileName: '',
      fileSize: 0,
   })

   const analyzeData = useCallback(async (csvData: any[], fileName: string, fileSize: number) => {
      setAnalysisData((prev) => ({ ...prev, isProcessing: true, progress: 0, fileName, fileSize }))

      if ('Worker' in window) {
         // Use Web Worker for analysis
         const worker = new Worker('/workers/analysisWorker.js')

         worker.postMessage({ csvData })

         worker.onmessage = (event) => {
            const { type, data, progress, error } = event.data

            if (type === 'PROGRESS') {
               setAnalysisData((prev) => ({ ...prev, progress }))
            } else if (type === 'COMPLETE') {
               setAnalysisData((prev) => ({
                  ...prev,
                  sample: data.sample,
                  summary: data.summary,
                  isProcessing: false,
                  progress: 100,
               }))
               worker.terminate()
            } else if (type === 'ERROR') {
               console.error('Worker error:', error)
               // Fallback to main thread processing
               processDataMainThread(csvData)
                  .then((result) => {
                     setAnalysisData((prev) => ({
                        ...prev,
                        sample: result.sample,
                        summary: result.summary,
                        isProcessing: false,
                        progress: 100,
                     }))
                  })
                  .catch((fallbackError) => {
                     console.error('Fallback processing failed:', fallbackError)
                     setAnalysisData((prev) => ({ ...prev, isProcessing: false, progress: 0 }))
                  })
               worker.terminate()
            }
         }

         worker.onerror = (error) => {
            console.error('Worker failed:', error)
            // Fallback to main thread processing
            processDataMainThread(csvData)
               .then((result) => {
                  setAnalysisData((prev) => ({
                     ...prev,
                     sample: result.sample,
                     summary: result.summary,
                     isProcessing: false,
                     progress: 100,
                  }))
               })
               .catch((fallbackError) => {
                  console.error('Fallback processing failed:', fallbackError)
                  setAnalysisData((prev) => ({ ...prev, isProcessing: false, progress: 0 }))
               })
            worker.terminate()
         }
      } else {
         // Fallback: Process on main thread
         const result = await processDataMainThread(csvData)
         setAnalysisData((prev) => ({
            ...prev,
            sample: result.sample,
            summary: result.summary,
            isProcessing: false,
            progress: 100,
         }))
      }
   }, [])

   // Save analysis to history when analysis is complete
   useEffect(() => {
      if (analysisData.summary && !analysisData.isProcessing && analysisData.fileName && analysisData.fileSize > 0) {
         console.log('Saving analysis to history...')
         const historyItem: AnalysisHistoryItem = {
            id: Date.now().toString(),
            fileName: analysisData.fileName,
            uploadDate: new Date().toISOString(),
            fileSize: analysisData.fileSize,
            analysisData: analysisData,
         }
         saveAnalysisToHistory(historyItem)
         console.log('Analysis saved to history:', historyItem)
         console.log('Current history length:', getAnalysisHistory().length)
      }
   }, [analysisData])

   return <AnalysisContext.Provider value={{ analysisData, analyzeData }}>{children}</AnalysisContext.Provider>
}

// Export utility functions for use in other components
export { getAnalysisHistory, clearAnalysisHistory, formatFileSize, deleteAnalysisItem }
export type { AnalysisHistoryItem }
