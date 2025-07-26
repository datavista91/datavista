import { createContext, useContext, useState, ReactNode } from 'react'

export interface FileData {
  id: string
  name: string
  size: number
  uploadDate: string
  data: any[]
  columns: string[]
  rowCount: number
  relationships?: {
    relatedFiles: string[]
    commonColumns: string[]
    possibleJoins: {
      file: string
      column: string
      matchCount: number
    }[]
  }
}

interface DataContextType {
  files: FileData[]
  addFile: (file: FileData) => void
  removeFile: (fileId: string) => void
  updateFileData: (fileId: string, newData: any[]) => void
  hasData: boolean
  clearAllData: () => void
  findRelationships: () => void
  getFileById: (fileId: string) => FileData | undefined
  getCombinedData: () => any[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<FileData[]>([])

  const addFile = (file: FileData) => {
    setFiles(prev => {
      const updated = [...prev, file]
      return updated
    })
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const updateFileData = (fileId: string, newData: any[]) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { 
            ...f, 
            data: newData, 
            rowCount: newData.length,
            columns: Object.keys(newData[0] || {})
          } 
        : f
    ))
  }

  const getFileById = (fileId: string) => {
    return files.find(f => f.id === fileId)
  }

  const getCombinedData = () => {
    return files.reduce((acc, file) => [...acc, ...file.data], [])
  }

  const findRelationships = () => {
    if (files.length < 2) return

    setFiles(prev => prev.map(file => {
      const relationships = {
        relatedFiles: [] as string[],
        commonColumns: [] as string[],
        possibleJoins: [] as { file: string; column: string; matchCount: number }[]
      }

      // Find relationships with other files
      prev.forEach(otherFile => {
        if (otherFile.id === file.id) return

        // Find common columns
        const commonCols = file.columns.filter(col => 
          otherFile.columns.includes(col)
        )

        if (commonCols.length > 0) {
          relationships.relatedFiles.push(otherFile.id)
          relationships.commonColumns.push(...commonCols)

          // Check for possible joins
          commonCols.forEach(col => {
            const fileValues = new Set(file.data.map(row => row[col]))
            const otherFileValues = new Set(otherFile.data.map(row => row[col]))
            const intersection = new Set([...fileValues].filter(x => otherFileValues.has(x)))
            
            if (intersection.size > 0) {
              relationships.possibleJoins.push({
                file: otherFile.id,
                column: col,
                matchCount: intersection.size
              })
            }
          })
        }
      })

      return { ...file, relationships }
    }))
  }

  const hasData = files.length > 0 && files.some(f => f.data.length > 0)

  const clearAllData = () => {
    setFiles([])
  }

  return (
    <DataContext.Provider value={{ 
      files, 
      addFile, 
      removeFile, 
      updateFileData,
      hasData, 
      clearAllData,
      findRelationships,
      getFileById,
      getCombinedData
    }}>
      {children}
    </DataContext.Provider>
  )
}