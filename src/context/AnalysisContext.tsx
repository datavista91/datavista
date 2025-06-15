import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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
   analyzeData: (csvData: any[]) => Promise<void>
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
   })

   const analyzeData = useCallback(async (csvData: any[]) => {
      setAnalysisData((prev) => ({ ...prev, isProcessing: true, progress: 0 }))

      if ('Worker' in window) {
         // Use Web Worker for analysis
         const worker = new Worker('/workers/analysisWorker.js')

         worker.postMessage({ csvData })

         worker.onmessage = (event) => {
            const { type, data, progress, error } = event.data

            if (type === 'PROGRESS') {
               setAnalysisData((prev) => ({ ...prev, progress }))
            } else if (type === 'COMPLETE') {
               setAnalysisData({
                  sample: data.sample,
                  summary: data.summary,
                  isProcessing: false,
                  progress: 100,
               })
               worker.terminate()
            } else if (type === 'ERROR') {
               console.error('Worker error:', error)
               // Fallback to main thread processing
               processDataMainThread(csvData)
                  .then((result) => {
                     setAnalysisData({
                        sample: result.sample,
                        summary: result.summary,
                        isProcessing: false,
                        progress: 100,
                     })
                  })
                  .catch((fallbackError) => {
                     console.error('Fallback processing failed:', fallbackError)
                     setAnalysisData((prev) => ({ ...prev, isProcessing: false, progress: 0 }))
                  })
               worker.terminate()
            }
         }

         worker.onerror = async (error) => {
            console.error('Worker failed:', error)
            // Fallback to main thread processing
            try {
               const result = await processDataMainThread(csvData)
               setAnalysisData({
                  sample: result.sample,
                  summary: result.summary,
                  isProcessing: false,
                  progress: 100,
               })
            } catch (fallbackError) {
               console.error('Fallback processing failed:', fallbackError)
               setAnalysisData((prev) => ({ ...prev, isProcessing: false, progress: 0 }))
            }
            worker.terminate()
         }
      } else {
         // Fallback: Process on main thread
         const result = await processDataMainThread(csvData)
         setAnalysisData({
            sample: result.sample,
            summary: result.summary,
            isProcessing: false,
            progress: 100,
         })
      }
   }, [])

   return <AnalysisContext.Provider value={{ analysisData, analyzeData }}>{children}</AnalysisContext.Provider>
}
