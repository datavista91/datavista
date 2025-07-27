import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

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
  getNumericColumns: (fileId: string) => string[]
  getCategoricalColumns: (fileId: string) => string[]
  getCommonNumericColumns: (fileIds: string[]) => string[]
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

  const addFile = useCallback((file: FileData) => {
    setFiles(prev => {
      // Check if file already exists
      if (prev.some(f => f.id === file.id)) {
        return prev
      }
      return [...prev, file]
    })
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }, [])

  const updateFileData = useCallback((fileId: string, newData: any[]) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { 
            ...f, 
            data: newData, 
            rowCount: newData.length,
            columns: newData.length > 0 ? Object.keys(newData[0]) : []
          } 
        : f
    ))
  }, [])

  const getFileById = useCallback((fileId: string) => {
    return files.find(f => f.id === fileId)
  }, [files])

  const getCombinedData = useCallback((): any[] => {
    return files.reduce<any[]>((acc, file) => [...acc, ...file.data], []);
  }, [files]);

  const getNumericColumns = useCallback((fileId: string) => {
    const file = getFileById(fileId)
    if (!file) return []
    
    return file.columns.filter(col => 
      file.data.some(row => !isNaN(parseFloat(row[col]))))
  }, [getFileById])

  const getCategoricalColumns = useCallback((fileId: string) => {
    const file = getFileById(fileId)
    if (!file) return []
    
    return file.columns.filter(col => 
      !getNumericColumns(fileId).includes(col)
    )
  }, [getFileById, getNumericColumns])

  const getCommonNumericColumns = useCallback((fileIds: string[]) => {
    if (fileIds.length < 2) return []
    
    const numericColumnsList = fileIds.map(id => getNumericColumns(id))
    if (numericColumnsList.some(cols => cols.length === 0)) return []
    
    return numericColumnsList.reduce((common, current) => 
      common.filter(col => current.includes(col))
    )
  }, [getNumericColumns])

  const findRelationships = useCallback(() => {
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

          // Check for possible joins on each common column
          commonCols.forEach(col => {
            try {
              const fileValues = new Set(
                file.data
                  .map(row => row[col])
                  .filter(val => val !== undefined && val !== null)
                  .map(val => String(val))
              )
              
              const otherFileValues = new Set(
                otherFile.data
                  .map(row => row[col])
                  .filter(val => val !== undefined && val !== null)
                  .map(val => String(val))
              )
              
              const intersection = new Set(
                [...fileValues].filter(x => otherFileValues.has(x))
              )
              
              if (intersection.size > 0) {
                relationships.possibleJoins.push({
                  file: otherFile.id,
                  column: col,
                  matchCount: intersection.size
                })
              }
            } catch (error) {
              console.error(`Error comparing column ${col} between files:`, error)
            }
          })
        }
      })

      // Remove duplicate common columns
      relationships.commonColumns = [...new Set(relationships.commonColumns)]

      return { ...file, relationships }
    }))
  }, [files])

  const hasData = files.length > 0 && files.some(f => f.data.length > 0)

  const clearAllData = useCallback(() => {
    setFiles([])
  }, [])

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
      getCombinedData,
      getNumericColumns,
      getCategoricalColumns,
      getCommonNumericColumns
    }}>
      {children}
    </DataContext.Provider>
  )
}