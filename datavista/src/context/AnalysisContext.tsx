import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

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

// Define analysis types
export type AnalysisType = 'quick' | 'full' | 'visualization' | 'chat-only' | 'none'

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
   analysisType: AnalysisType | null
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
   analyzeData: (csvData: any[], fileName: string, fileSize: number, analysisType?: AnalysisType) => Promise<void>
   setAnalysisType: (type: AnalysisType) => void
   resetAnalysis: () => void
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

// Analysis processing functions based on type
const processQuickAnalysis = async (csvData: any[]) => {
   const sample = csvData.slice(0, Math.min(100, csvData.length))
   const columns = Object.keys(csvData[0] || {})

   // Basic statistics only
   const statistics: Record<string, ColumnStats> = {}
   const missingValues: Record<string, number> = {}
   const dataTypes: Record<string, string> = {}

   columns.forEach(column => {
      const values = sample.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '')
      const missing = sample.length - values.length
      
      if (missing > 0) {
         missingValues[column] = missing
      }

      // Determine type and basic stats
      const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val))
      
      if (numericValues.length > values.length * 0.7) {
         // Numeric column
         dataTypes[column] = 'numeric'
         statistics[column] = {
            type: 'numeric',
            count: values.length,
            mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
         }
      } else {
         // Categorical column
         dataTypes[column] = 'categorical'
         const unique = new Set(values).size
         statistics[column] = {
            type: 'categorical',
            count: values.length,
            unique: unique
         }
      }
   })

   const summary: DataSummary = {
      overview: {
         totalRows: csvData.length,
         totalColumns: columns.length,
         columns: columns,
         sampleSize: sample.length,
      },
      statistics,
      patterns: {
         correlations: {},
         trends: [],
         outliers: [],
      },
      dataQuality: {
         missingValues,
         duplicates: 0,
         dataTypes,
      },
   }

   return { sample, summary }
}

const processFullAnalysis = async (csvData: any[]) => {
   const sample = csvData.slice(0, Math.min(1000, csvData.length))
   const columns = Object.keys(csvData[0] || {})

   // Comprehensive analysis
   const statistics: Record<string, ColumnStats> = {}
   const missingValues: Record<string, number> = {}
   const dataTypes: Record<string, string> = {}
   const correlations: Record<string, number> = {}

   columns.forEach(column => {
      const values = sample.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '')
      const missing = sample.length - values.length
      
      if (missing > 0) {
         missingValues[column] = missing
      }

      const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val))
      
      if (numericValues.length > values.length * 0.7) {
         // Numeric column - full stats
         dataTypes[column] = 'numeric'
         const sorted = numericValues.sort((a, b) => a - b)
         const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
         const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length
         
         statistics[column] = {
            type: 'numeric',
            count: values.length,
            mean: mean,
            median: sorted[Math.floor(sorted.length / 2)],
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            stdDev: Math.sqrt(variance),
            quartiles: [
               sorted[Math.floor(sorted.length * 0.25)],
               sorted[Math.floor(sorted.length * 0.5)],
               sorted[Math.floor(sorted.length * 0.75)]
            ]
         }
      } else {
         // Categorical column - detailed stats
         dataTypes[column] = 'categorical'
         const unique = new Set(values).size
         const valueCounts = values.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1
            return acc
         }, {} as Record<string, number>)
         
         const topValues = Object.entries(valueCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5) as [string, number][]

         statistics[column] = {
            type: 'categorical',
            count: values.length,
            unique: unique,
            topValues: topValues
         }
      }
   })

   // Calculate basic correlations for numeric columns
   const numericColumns = Object.keys(statistics).filter(col => statistics[col].type === 'numeric')
   numericColumns.forEach((col1, i) => {
      numericColumns.slice(i + 1).forEach(col2 => {
         const values1 = sample.map(row => Number(row[col1])).filter(val => !isNaN(val))
         const values2 = sample.map(row => Number(row[col2])).filter(val => !isNaN(val))
         
         if (values1.length > 10 && values2.length > 10) {
            // Simple correlation calculation
            const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length
            const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length
            
            let numerator = 0
            let denom1 = 0
            let denom2 = 0
            
            for (let i = 0; i < Math.min(values1.length, values2.length); i++) {
               const diff1 = values1[i] - mean1
               const diff2 = values2[i] - mean2
               numerator += diff1 * diff2
               denom1 += diff1 * diff1
               denom2 += diff2 * diff2
            }
            
            const correlation = numerator / Math.sqrt(denom1 * denom2)
            if (!isNaN(correlation)) {
               correlations[`${col1}_${col2}`] = correlation
            }
         }
      })
   })

   // Count duplicates
   const duplicates = csvData.length - new Set(csvData.map(row => JSON.stringify(row))).size

   const summary: DataSummary = {
      overview: {
         totalRows: csvData.length,
         totalColumns: columns.length,
         columns: columns,
         sampleSize: sample.length,
      },
      statistics,
      patterns: {
         correlations,
         trends: [],
         outliers: [],
      },
      dataQuality: {
         missingValues,
         duplicates,
         dataTypes,
      },
   }

   return { sample, summary }
}

const processVisualizationAnalysis = async (csvData: any[]) => {
   // Minimal processing - focus only on chart-ready data
   const sample = csvData.slice(0, Math.min(200, csvData.length))
   const columns = Object.keys(csvData[0] || {})

   // Only identify data types for visualization purposes
   const statistics: Record<string, ColumnStats> = {}
   const dataTypes: Record<string, string> = {}

   // Only process first 6 columns for visualization
   columns.slice(0, 6).forEach(column => {
      const values = sample.map(row => row[column]).filter(val => val !== null && val !== undefined && val !== '')
      const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val))
      
      if (numericValues.length > values.length * 0.7) {
         dataTypes[column] = 'numeric'
         statistics[column] = {
            type: 'numeric',
            count: values.length,
            mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
         }
      } else {
         dataTypes[column] = 'categorical'
         const unique = new Set(values).size
         statistics[column] = {
            type: 'categorical',
            count: values.length,
            unique: unique
         }
      }
   })

   // Minimal summary for visualization
   const summary: DataSummary = {
      overview: {
         totalRows: csvData.length,
         totalColumns: columns.length,
         columns: columns,
         sampleSize: sample.length,
      },
      statistics,
      patterns: {
         correlations: {},
         trends: [],
         outliers: [],
      },
      dataQuality: {
         missingValues: {},
         duplicates: 0,
         dataTypes,
      },
   }

   return { sample, summary }
}

// Fallback processing function for main thread
const processDataMainThread = async (csvData: any[], analysisType: AnalysisType = 'none') => {
   switch (analysisType) {
      case 'quick':
         return await processQuickAnalysis(csvData)
      case 'full':
         return await processFullAnalysis(csvData)
      case 'visualization':
         return await processVisualizationAnalysis(csvData)
      case 'chat-only':
      case 'none':
      default:
         // Minimal processing - just basic info
         const sample = csvData.slice(0, Math.min(50, csvData.length))
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
}

export const AnalysisProvider = ({ children }: { children: ReactNode }) => {
   const [analysisData, setAnalysisData] = useState<AnalysisData>({
      sample: [],
      summary: null,
      isProcessing: false,
      progress: 0,
      fileName: '',
      fileSize: 0,
      analysisType: null,
   })

   const setAnalysisType = useCallback((type: AnalysisType) => {
      setAnalysisData(prev => ({ ...prev, analysisType: type }))
   }, [])

   const resetAnalysis = useCallback(() => {
      setAnalysisData({
         sample: [],
         summary: null,
         isProcessing: false,
         progress: 0,
         fileName: '',
         fileSize: 0,
         analysisType: null,
      })
   }, [])

   const analyzeData = useCallback(async (csvData: any[], fileName: string, fileSize: number, analysisType: AnalysisType = 'none') => {
      setAnalysisData((prev) => ({ 
         ...prev, 
         isProcessing: analysisType !== 'none' && analysisType !== 'chat-only', 
         progress: 0, 
         fileName, 
         fileSize,
         analysisType 
      }))

      // For chat-only or none, just store the data without analysis
      if (analysisType === 'chat-only' || analysisType === 'none') {
         const sample = csvData.slice(0, Math.min(50, csvData.length))
         setAnalysisData((prev) => ({
            ...prev,
            sample: sample,
            summary: null,
            isProcessing: false,
            progress: 100,
         }))
         return
      }

      // Simulate progress for analysis types
      const progressSteps = analysisType === 'visualization' ? 3 : analysisType === 'quick' ? 5 : 10
      const progressIncrement = 90 / progressSteps
      
      const progressInterval = setInterval(() => {
         setAnalysisData(prev => {
            if (prev.progress < 90) {
               return { ...prev, progress: Math.min(90, prev.progress + progressIncrement) }
            }
            return prev
         })
      }, analysisType === 'visualization' ? 300 : analysisType === 'quick' ? 200 : 150)

      try {
         // Process data based on analysis type
         const result = await processDataMainThread(csvData, analysisType)
         
         clearInterval(progressInterval)
         
         setAnalysisData((prev) => ({
            ...prev,
            sample: result.sample,
            summary: result.summary,
            isProcessing: false,
            progress: 100,
         }))
      } catch (error) {
         console.error('Analysis failed:', error)
         clearInterval(progressInterval)
         setAnalysisData((prev) => ({ 
            ...prev, 
            isProcessing: false, 
            progress: 0 
         }))
      }
   }, [])

   // Save analysis to history when analysis is complete
   useEffect(() => {
      if (analysisData.fileName && analysisData.fileSize > 0 && !analysisData.isProcessing) {
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

   return (
      <AnalysisContext.Provider value={{ 
         analysisData, 
         analyzeData, 
         setAnalysisType, 
         resetAnalysis 
      }}>
         {children}
      </AnalysisContext.Provider>
   )
}

// Export utility functions for use in other components
export { clearAnalysisHistory, deleteAnalysisItem, formatFileSize, getAnalysisHistory }
export type { AnalysisData, AnalysisHistoryItem, ColumnStats, DataSummary }
