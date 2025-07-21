import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { analysisHistoryService } from '../services/analysisHistoryService'
import { useAuth } from './AuthContext'

// History interfaces
interface AnalysisHistoryItem {
   id: string
   fileName: string
   uploadDate: string
   fileSize: number
   analysisData: any
}

let skipNextSaveToHistory = false

// LocalStorage utility functions
const STORAGE_KEY = 'datavista_analysis_history'

const saveAnalysisToHistory = async (historyItem: AnalysisHistoryItem, userId?: string, userEmail?: string) => {
   try {
      // Always save to localStorage first (guaranteed to work)
      const existingHistory = getAnalysisHistory()
      const updatedHistory = [historyItem, ...existingHistory.slice(0, 9)] // Keep only 10 most recent
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
      console.log('Analysis saved to local storage successfully')

      // Try to save to Firebase if user is authenticated
      if (userId) {
         try {
            await analysisHistoryService.saveAnalysisToFirebase(
               userId,
               {
                  fileName: historyItem.fileName,
                  uploadDate: historyItem.uploadDate,
                  fileSize: historyItem.fileSize,
                  analysisData: historyItem.analysisData,
               },
               userEmail
            )
            console.log('Analysis saved to Firebase successfully')
         } catch (firebaseError) {
            console.warn('Failed to save to Firebase, but local storage succeeded:', firebaseError)
            // Don't throw error - local storage save was successful
         }
      }
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

const clearAnalysisHistory = async (userId?: string) => {
   try {
      // Always clear localStorage first
      localStorage.removeItem(STORAGE_KEY)
      console.log('Local storage cleared successfully')

      // Try to clear Firebase if user is authenticated
      if (userId) {
         try {
            await analysisHistoryService.clearUserAnalysisHistory(userId)
            console.log('Firebase history cleared successfully')
         } catch (firebaseError) {
            console.warn('Failed to clear Firebase history, but local storage cleared:', firebaseError)
            // Don't throw error - local storage clearing was successful
         }
      }
   } catch (error) {
      console.error('Failed to clear analysis history:', error)
   }
}

const deleteAnalysisItem = async (id: string, userId?: string) => {
   try {
      // Always delete from localStorage first
      const existingHistory = getAnalysisHistory()
      const updatedHistory = existingHistory.filter((item) => item.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory))
      console.log('Analysis deleted from local storage successfully')

      // Try to delete from Firebase if user is authenticated
      if (userId) {
         try {
            await analysisHistoryService.deleteAnalysisFromFirebase(userId, id)
            console.log('Analysis deleted from Firebase successfully')
         } catch (firebaseError) {
            console.warn('Failed to delete from Firebase, but local storage succeeded:', firebaseError)
            // Don't throw error - local storage deletion was successful
         }
      }
   } catch (error) {
      console.error('Failed to delete analysis item:', error)
   }
}

// Sync Firebase history to localStorage
const syncFirebaseToLocal = async (userId: string) => {
   try {
      const firebaseHistory = await analysisHistoryService.getUserAnalysisHistory(userId)
      const mergedHistory = mergeHistories(getAnalysisHistory(), firebaseHistory)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedHistory.slice(0, 10)))
      console.log('Successfully synced Firebase to local storage')
   } catch (error) {
      console.warn('Failed to sync Firebase to local - falling back to local storage only:', error)
      // Don't throw error, just continue with local storage
   }
}

// Helper function to merge local and Firebase histories without duplicates
const mergeHistories = (
   localHistory: AnalysisHistoryItem[],
   firebaseHistory: AnalysisHistoryItem[]
): AnalysisHistoryItem[] => {
   const merged = [...firebaseHistory]

   // Add local items that aren't in Firebase (by fileName and uploadDate)
   localHistory.forEach((localItem) => {
      const exists = firebaseHistory.some(
         (fbItem) =>
            fbItem.fileName === localItem.fileName &&
            Math.abs(new Date(fbItem.uploadDate).getTime() - new Date(localItem.uploadDate).getTime()) < 1000
      )
      if (!exists) {
         merged.push(localItem)
      }
   })

   // Sort by upload date (most recent first)
   return merged.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
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
   loadAnalysisData: (historyItem: AnalysisHistoryItem) => void
   syncWithFirebase: () => Promise<void>
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
   const { user } = useAuth()
   const [analysisData, setAnalysisData] = useState<AnalysisData>({
      sample: [],
      summary: null,
      isProcessing: false,
      progress: 0,
      fileName: '',
      fileSize: 0,
   })

   // Load analysis data from history item
   const loadAnalysisData = useCallback((historyItem: AnalysisHistoryItem) => {
      skipNextSaveToHistory = true // Skip next save to history
      setAnalysisData({
         sample: historyItem.analysisData.sample,
         summary: historyItem.analysisData.summary,
         isProcessing: false,
         progress: 100,
         fileName: historyItem.fileName,
         fileSize: historyItem.fileSize,
      })
   }, [])

   // Sync with Firebase
   const syncWithFirebase = useCallback(async () => {
      if (user?.id) {
         await syncFirebaseToLocal(user.id)
      }
   }, [user?.id])

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
      if (skipNextSaveToHistory) {
         skipNextSaveToHistory = false
         return
      }
      if (analysisData.summary && !analysisData.isProcessing && analysisData.fileName && analysisData.fileSize > 0) {
         console.log('Saving analysis to history...')
         const historyItem: AnalysisHistoryItem = {
            id: Date.now().toString(),
            fileName: analysisData.fileName,
            uploadDate: new Date().toISOString(),
            fileSize: analysisData.fileSize,
            analysisData: analysisData,
         }
         saveAnalysisToHistory(historyItem, user?.id, user?.email)
         console.log('Analysis saved to history:', historyItem)
         console.log('Current history length:', getAnalysisHistory().length)
      }
   }, [analysisData, user?.id])

   // Sync with Firebase on user login
   useEffect(() => {
      if (user?.id) {
         syncWithFirebase()
      }
   }, [user?.id, syncWithFirebase])

   return (
      <AnalysisContext.Provider value={{ analysisData, analyzeData, loadAnalysisData, syncWithFirebase }}>
         {children}
      </AnalysisContext.Provider>
   )
}

// Export utility functions for use in other components
export { getAnalysisHistory, clearAnalysisHistory, formatFileSize, deleteAnalysisItem, syncFirebaseToLocal }
export type { AnalysisHistoryItem }
