import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ChartBar, Check, CloudUpload, FileText, Squircle } from 'lucide-react'
import Papa from 'papaparse'
import { useData } from '../context/DataContext'

interface FileUploaderProps {
   compact?: boolean
}

const FileUploader = ({ compact = false }: FileUploaderProps) => {
   const { setData } = useData()
   const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
   const [fileName, setFileName] = useState('')

   const onDrop = useCallback(
      (acceptedFiles: File[]) => {
         const file = acceptedFiles[0]
         if (!file) return

         setFileName(file.name)
         setUploadStatus('loading')

         // Parse CSV
         Papa.parse(file, {
            header: true,
            complete: (results) => {
               // Process the data
               setTimeout(() => {
                  setData(results.data)
                  setUploadStatus('success')
               }, 1000) // Simulate processing time
            },
            error: () => {
               setUploadStatus('error')
            },
         })
      },
      [setData]
   )

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
            ${
               isDragActive
                  ? 'border-cyan bg-cyan/10'
                  : 'border-main hover:border-cyan hover:bg-cyan/10'
            }`}
            >
               <input {...getInputProps()} />
               <CloudUpload className='mx-auto h-8 w-8 text-secondary' />
               <p className='mt-2 text-sm text-secondary'>
                  Drag & drop a CSV file, or <span className='text-cyan font-medium'>browse</span>
               </p>
            </div>

            {uploadStatus === 'loading' && (
               <div className='mt-4 flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-dark mr-2'></div>
                  <span className='text-sm text-secondary'>Processing {fileName}...</span>
               </div>
            )}
         </div>
      )
   }

   return (
      <div className='max-w-2xl w-full mx-auto bg-surface p-8 rounded-xl shadow-sm border border-main'>
         <h2
            className='text-2xl font-bold text-center mb-2 text-main'
            style={{ fontFamily: 'Poppins, sans-serif' }}
         >
            Upload Your Data
         </h2>
         <p className='text-secondary text-center mb-8'>
            Upload a CSV file to generate AI-powered insights and visualizations
         </p>

         <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors 
          ${
             isDragActive
                ? 'border-cyan bg-cyan/10'
                : 'border-main hover:border-cyan hover:bg-cyan/10'
          }`}
         >
            <input {...getInputProps()} />

            {uploadStatus === 'idle' && (
               <>
                  <CloudUpload className='mx-auto h-12 w-12 text-secondary' />
                  <p className='mt-4 text-secondary'>
                     Drag & drop your CSV file here, or <span className='text-cyan font-medium'>browse</span>
                  </p>
                  <p className='mt-2 text-sm text-secondary'>Supports CSV, XLS, XLSX (max 10MB)</p>
               </>
            )}

            {uploadStatus === 'loading' && (
               <>
                  <div className='mx-auto h-12 w-12 flex items-center justify-center'>
                     <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-dark'></div>
                  </div>
                  <p className='mt-4 text-secondary'>Analyzing your data...</p>
                  <p className='mt-2 text-sm text-secondary'>This might take a few seconds</p>
               </>
            )}

            {uploadStatus === 'success' && (
               <>
                  <div className='mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
                     <Check className='h-6 w-6 text-green-600' />
                  </div>
                  <p className='mt-4 text-secondary'>
                     <span className='font-medium'>{fileName}</span> successfully processed!
                  </p>
                  <p className='mt-2 text-sm text-secondary'>Your insights are ready to view</p>
               </>
            )}

            {uploadStatus === 'error' && (
               <>
                  <div className='mx-auto h-12 w-12 bg-danger rounded-full flex items-center justify-center'>
                     <Squircle className='h-6 w-6 text-danger' />
                  </div>
                  <p className='mt-4 text-secondary'>There was an error processing your file</p>
                  <p className='mt-2 text-sm text-secondary'>Please check the format and try again</p>
               </>
            )}
         </div>

         <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='border border-main rounded-lg p-4 text-center'>
               <FileText className='mx-auto h-8 w-8 text-cyan mb-2' />
               <h3 className='font-medium text-main'>Smart Reports</h3>
               <p className='text-sm text-secondary'>Generate insights and recommendations</p>
            </div>
            <div className='border border-main rounded-lg p-4 text-center'>
               <ChartBar className='mx-auto h-8 w-8 text-cyan-dark mb-2' />
               <h3 className='font-medium text-main'>Visual Analytics</h3>
               <p className='text-sm text-secondary'>Interactive charts and dashboards</p>
            </div>
            <div className='border border-main rounded-lg p-4 text-center'>
               <div className='mx-auto h-8 w-8 text-danger mb-2 flex justify-center'>
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
               <h3 className='font-medium text-main'>Presentations</h3>
               <p className='text-sm text-secondary'>Export as slides or PDF</p>
            </div>
         </div>
      </div>
   )
}

export default FileUploader
