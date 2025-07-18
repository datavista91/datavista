import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ChartBar, Check, CloudUpload, FileText, Squircle } from 'lucide-react'
import Papa, { ParseResult } from 'papaparse'
import { useData } from '../context/DataContext'
import { useAnalysis } from '../context/AnalysisContext'

interface FileUploaderProps {
   compact?: boolean
}

const FileUploader = ({ compact = false }: FileUploaderProps) => {
   const { setData } = useData()
   const { analysisData, analyzeData } = useAnalysis()
   const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'analyzing' | 'success' | 'error'>('idle')
   const [fileName, setFileName] = useState('')

   const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
         const file = acceptedFiles[0]
         if (!file) return

         // Check file size first!
         // const maxSize = 50 * 1024 * 1024 // 50MB limit
         // if (file.size > maxSize) {
         //    setUploadStatus('error')
         //    alert(`File too large! Maximum size is ${maxSize / 1024 / 1024}MB`)
         //    return
         // }

         setFileName(file.name)
         setUploadStatus('loading')

         // Parse CSV
         Papa.parse(file, {
            header: true,
            complete: async (results: ParseResult<any>) => {
               // Store raw data
               setData(results.data)

               // Start analysis in background
               setUploadStatus('analyzing')
               await analyzeData(results.data, file.name, file.size)

               setUploadStatus('success')
               // Mark analysis as complete
            },
            error: () => {
               setUploadStatus('error')
            },
         })
      },
      [setData, analyzeData]
   )

   // useEffect(() => {
   //    if (data && data.length > 0) {
   //       console.log('Data in context:', data)
   //       console.log('First row:', data[0])
   //       console.log('Column headers:', Object.keys(data[0]))
   //       console.log('Total rows:', data.length)
   //    }
   // }, [data]) // Watch data changes, not setData

   const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
         'text/csv': ['.csv'],
         'application/vnd.ms-excel': ['.xls'],
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      },
      maxFiles: 1,
   })

   if (compact) {
      return (
         <div className='w-full max-w-md'>
            <div
               {...getRootProps()}
               className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            >
               <input {...getInputProps()} />
               <CloudUpload className='mx-auto h-8 w-8 text-gray-400' />
               <p className='mt-2 text-sm text-gray-600'>
                  Drag & drop a CSV file, or <span className='text-blue-600 font-medium'>browse</span>
               </p>
            </div>{' '}
            {uploadStatus === 'loading' && (
               <div className='mt-4 flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2'></div>
                  <span className='text-sm text-gray-600'>Processing {fileName}...</span>
               </div>
            )}
            {uploadStatus === 'analyzing' && (
               <div className='mt-4'>
                  <div className='flex items-center justify-center mb-2'>
                     <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2'></div>
                     <span className='text-sm text-gray-600'>Analyzing data...</span>
                  </div>
                  {analysisData.progress > 0 && (
                     <div className='w-full bg-gray-200 rounded-full h-1.5'>
                        <div
                           className='bg-blue-600 h-1.5 rounded-full transition-all duration-300'
                           style={{ width: `${analysisData.progress}%` }}
                        ></div>
                     </div>
                  )}
               </div>
            )}
         </div>
      )
   }

   return (
      <div className='max-w-2xl w-full mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200'>
         <h2
            className='text-2xl font-bold text-center mb-2'
            style={{ fontFamily: 'Poppins, sans-serif' }}
         >
            Upload Your Data
         </h2>
         <p className='text-gray-600 text-center mb-8'>
            Upload a CSV file to generate AI-powered insights and visualizations
         </p>

         <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors 
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
         >
            <input {...getInputProps()} />
            {uploadStatus === 'idle' && (
               <>
                  <CloudUpload className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-4 text-gray-600'>
                     Drag & drop your CSV file here, or <span className='text-blue-600 font-medium'>browse</span>
                  </p>
                  <p className='mt-2 text-sm text-gray-500'>Supports CSV, XLS, XLSX (max 50MB)</p>
               </>
            )}{' '}
            {uploadStatus === 'loading' && (
               <>
                  <div className='mx-auto h-12 w-12 flex items-center justify-center'>
                     <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
                  </div>
                  <p className='mt-4 text-gray-600'>Processing your file...</p>
                  <p className='mt-2 text-sm text-gray-500'>Parsing CSV data</p>
               </>
            )}
            {uploadStatus === 'analyzing' && (
               <>
                  <div className='mx-auto h-12 w-12 flex items-center justify-center'>
                     <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
                  </div>
                  <p className='mt-4 text-gray-600'>Analyzing your data...</p>
                  <p className='mt-2 text-sm text-gray-500'>
                     {analysisData.isProcessing
                        ? `Creating insights... ${analysisData.progress}%`
                        : 'Preparing analysis...'}
                  </p>
                  {analysisData.progress > 0 && (
                     <div className='mt-3 w-48 mx-auto bg-gray-200 rounded-full h-2'>
                        <div
                           className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                           style={{ width: `${analysisData.progress}%` }}
                        ></div>
                     </div>
                  )}
               </>
            )}
            {uploadStatus === 'success' && (
               <>
                  <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
                     <Check className='h-6 w-6 text-green-600' />
                  </div>
                  <p className='mt-4 text-gray-600'>
                     <span className='font-medium'>{fileName}</span> successfully processed!
                  </p>
                  <p className='mt-2 text-sm text-gray-500'>Your insights are ready to view</p>
               </>
            )}
            {uploadStatus === 'error' && (
               <>
                  <div className='mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center'>
                     <Squircle className='h-6 w-6 text-red-600' />
                  </div>
                  <p className='mt-4 text-gray-600'>There was an error processing your file</p>
                  <p className='mt-2 text-sm text-gray-500'>Please check the format and try again</p>
               </>
            )}
         </div>

         <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='border border-gray-200 rounded-lg p-4 text-center'>
               <FileText className='mx-auto h-8 w-8 text-blue-600 mb-2' />
               <h3 className='font-medium'>Smart Reports</h3>
               <p className='text-sm text-gray-500'>Generate insights and recommendations</p>
            </div>
            <div className='border border-gray-200 rounded-lg p-4 text-center'>
               <ChartBar className='mx-auto h-8 w-8 text-teal-600 mb-2' />
               <h3 className='font-medium'>Visual Analytics</h3>
               <p className='text-sm text-gray-500'>Interactive charts and dashboards</p>
            </div>
            <div className='border border-gray-200 rounded-lg p-4 text-center'>
               <div className='mx-auto h-8 w-8 text-orange-600 mb-2 flex justify-center'>
                  <svg
                     width='24'
                     height='24'
                     viewBox='0 0 24 24'
                     fill='none'
                     xmlns='http://www.w3.org/2000/svg'
                  >
                     <path
                        d='M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                     />
                     <path
                        d='M12 10l4 4m0 -4l-4 4'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                     />
                  </svg>
               </div>
               <h3 className='font-medium'>Presentations</h3>
               <p className='text-sm text-gray-500'>Export as slides or PDF</p>
            </div>
         </div>
      </div>
   )
}

export default FileUploader
