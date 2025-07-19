import { useState } from 'react'
import { useData } from '../context/DataContext'
import { useAnalysis } from '../context/AnalysisContext'

const DataPreview = () => {
   const { data } = useData()
   const { analysisData } = useAnalysis()
   const [page, setPage] = useState(1)
   const rowsPerPage = 10

   if (!data || !data.length) {
      return <div className='py-8 text-center dashboard-body text-gray-500'>No data available. Please upload a CSV file.</div>
   }

   // Get headers from the first row
   const headers = Object.keys(data[0])

   // Calculate pagination
   const totalPages = Math.ceil(data.length / rowsPerPage)
   const startIdx = (page - 1) * rowsPerPage
   const displayData = data.slice(startIdx, startIdx + rowsPerPage)
   return (
      <div className='space-y-6'>
         {/* Analysis Insights Section */}
         {analysisData.summary && !analysisData.isProcessing && (
            <div className='bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200'>
               <h3 className='dashboard-heading text-gray-900 mb-4'>📊 Data Analysis Summary</h3>

               <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                  <div className='bg-white rounded-lg p-3 shadow-sm'>
                     <div className='text-2xl font-bold text-purple-600'>
                        {analysisData.summary.overview.totalRows.toLocaleString()}
                     </div>
                     <div className='dashboard-body text-gray-600'>Total Rows</div>
                  </div>
                  <div className='bg-white rounded-lg p-3 shadow-sm'>
                     <div className='text-2xl font-bold text-indigo-600'>
                        {analysisData.summary.overview.totalColumns}
                     </div>
                     <div className='dashboard-body text-gray-600'>Columns</div>
                  </div>
                  <div className='bg-white rounded-lg p-3 shadow-sm'>
                     <div className='text-2xl font-bold text-green-600'>
                        {analysisData.summary.overview.sampleSize.toLocaleString()}
                     </div>
                     <div className='dashboard-body text-gray-600'>Sample Size</div>
                  </div>
                  <div className='bg-white rounded-lg p-3 shadow-sm'>
                     <div className='text-2xl font-bold text-orange-600'>
                        {analysisData.summary.dataQuality.duplicates}
                     </div>
                     <div className='dashboard-body text-gray-600'>Duplicates</div>
                  </div>
               </div>

               {Object.keys(analysisData.summary.dataQuality.missingValues).length > 0 && (
                  <div className='bg-white rounded-lg p-4 shadow-sm'>
                     <h4 className='dashboard-section-title text-gray-900 mb-2'>Missing Values</h4>
                     <div className='flex flex-wrap gap-2'>
                        {Object.entries(analysisData.summary.dataQuality.missingValues).map(([column, count]) => (
                           <span
                              key={column}
                              className='px-2 py-1 bg-red-100 text-red-800 rounded dashboard-small-text'
                           >
                              {column}: {count}
                           </span>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* Data Table */}
         <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
            <div className='px-6 py-4 border-b border-gray-200'>
               <h3 className='dashboard-heading text-gray-900'>Data Preview</h3>
            </div>{' '}
            <div className='overflow-x-auto'>
               <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                     <tr>
                        {headers.map((header, index) => (
                           <th
                              key={index}
                              scope='col'
                              className='px-6 py-3 text-left dashboard-small-text font-medium text-gray-500 uppercase tracking-wider'
                           >
                              {header}
                           </th>
                        ))}
                     </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                     {displayData.map((row, rowIndex) => (
                        <tr
                           key={rowIndex}
                           className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                           {headers.map((header, cellIndex) => (
                              <td
                                 key={cellIndex}
                                 className='px-6 py-4 whitespace-nowrap dashboard-body text-gray-500'
                              >
                                 {String(row[header])}
                              </td>
                           ))}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
               <div className='flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4'>
                  <div className='flex flex-1 justify-between sm:hidden'>
                     <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 dashboard-body font-medium text-gray-700 hover:bg-gray-50'
                     >
                        Previous
                     </button>
                     <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 dashboard-body font-medium text-gray-700 hover:bg-gray-50'
                     >
                        Next
                     </button>
                  </div>
                  <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
                     <div>
                        <p className='dashboard-body text-gray-700'>
                           Showing <span className='font-medium'>{startIdx + 1}</span> to{' '}
                           <span className='font-medium'>{Math.min(startIdx + rowsPerPage, data.length)}</span> of{' '}
                           <span className='font-medium'>{data.length}</span> results
                        </p>
                     </div>
                     <div>
                        <nav
                           className='isolate inline-flex -space-x-px rounded-md shadow-sm'
                           aria-label='Pagination'
                        >
                           <button
                              onClick={() => setPage(Math.max(1, page - 1))}
                              disabled={page === 1}
                              className='relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                           >
                              <span className='sr-only'>Previous</span>
                              <svg
                                 className='h-5 w-5'
                                 viewBox='0 0 20 20'
                                 fill='currentColor'
                                 aria-hidden='true'
                              >
                                 <path
                                    fillRule='evenodd'
                                    d='M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z'
                                    clipRule='evenodd'
                                 />
                              </svg>
                           </button>

                           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                 pageNum = i + 1
                              } else if (page <= 3) {
                                 pageNum = i + 1
                              } else if (page >= totalPages - 2) {
                                 pageNum = totalPages - 4 + i
                              } else {
                                 pageNum = page - 2 + i
                              }

                              return (
                                 <button
                                    key={i}
                                    onClick={() => setPage(pageNum)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                       pageNum === page
                                          ? 'z-10 bg-purple-600 text-white focus:z-20'
                                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20'
                                    }`}
                                 >
                                    {pageNum}
                                 </button>
                              )
                           })}

                           <button
                              onClick={() => setPage(Math.min(totalPages, page + 1))}
                              disabled={page === totalPages}
                              className='relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                           >
                              <span className='sr-only'>Next</span>
                              <svg
                                 className='h-5 w-5'
                                 viewBox='0 0 20 20'
                                 fill='currentColor'
                                 aria-hidden='true'
                              >
                                 <path
                                    fillRule='evenodd'
                                    d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                                    clipRule='evenodd'
                                 />
                              </svg>
                           </button>
                        </nav>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}

export default DataPreview
