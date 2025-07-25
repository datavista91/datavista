import { useState } from 'react'
import { useAIResponses } from '../context/AIResponseContext'
import { useAnalysis } from '../context/AnalysisContext'
import MarkdownRenderer from './MarkdownRenderer'
import {
   Presentation,
   Sparkles,
   Clock,
   Download,
   Share,
   ChevronLeft,
   ChevronRight,
   Maximize2,
   BarChart3,
   TrendingUp,
   Eye,
   PieChart,
} from 'lucide-react'
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   PieChart as RechartsPieChart,
   Pie,
   Cell,
} from 'recharts'

const COLORS = ['#6d28d9', '#0d9488', '#f97316', '#8b5cf6', '#14b8a6']

interface Slide {
   type: string
   title: string
   subtitle?: string
   content: string
   chartType?: 'bar' | 'pie'
}

const Presentations = () => {
   const { getResponsesByType } = useAIResponses()
   const { analysisData } = useAnalysis()
   const aiPresentations = getResponsesByType('presentation')
   const [selectedPresentation, setSelectedPresentation] = useState<any>(null)
   const [currentSlide, setCurrentSlide] = useState(0)
   const [isFullscreen, setIsFullscreen] = useState(false)
   const [showExportMenu, setShowExportMenu] = useState<string | null>(null)
   const [showPresentationExportMenu, setShowPresentationExportMenu] = useState(false)

   const hasData = analysisData?.summary !== null

   // Export functions
   const exportToPDF = (presentation: any) => {
      const content = `
      ${presentation.title}
      
      Generated: ${new Date(presentation.timestamp).toLocaleString()}
      
      ${presentation.content}
      
      ${
         presentation.data?.sections
            ? 'Sections:\n' + presentation.data.sections.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
            : ''
      }
      
      ${
         presentation.data?.keyPoints
            ? 'Key Points:\n' + presentation.data.keyPoints.map((p: string) => `• ${p}`).join('\n')
            : ''
      }
    `

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
   }
   const exportToPPT = (presentation: any) => {
      // For PPT, we'll create a structured text that could be imported into PowerPoint
      const slides = generateSlides(presentation)
      const pptContent = slides
         .map(
            (slide: Slide, index: number) => `
SLIDE ${index + 1}: ${slide.title}
${slide.subtitle ? slide.subtitle : ''}

${slide.content}

---
`
         )
         .join('\n')

      const blob = new Blob([pptContent], {
         type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_presentation.pptx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
   }

   const sharePresentation = (presentation: any) => {
      if (navigator.share) {
         navigator
            .share({
               title: presentation.title,
               text: `Check out this AI-generated presentation: ${presentation.title}`,
               url: window.location.href,
            })
            .catch(console.error)
      } else {
         // Fallback - copy to clipboard
         const shareText = `${presentation.title}\n\nGenerated: ${new Date(
            presentation.timestamp
         ).toLocaleString()}\n\n${presentation.content.substring(0, 200)}...`
         navigator.clipboard
            .writeText(shareText)
            .then(() => {
               alert('Presentation details copied to clipboard!')
            })
            .catch(() => {
               alert('Unable to copy to clipboard. Please copy manually.')
            })
      }
   }

   // Generate sample data from analysisData for charts
   const generateChartData = () => {
      if (!analysisData?.summary?.statistics) return []

      const stats = analysisData.summary.statistics
      const numericColumns = Object.entries(stats)
         .filter(([_, stat]: [string, any]) => stat.type === 'numeric')
         .slice(0, 6)

      return numericColumns.map(([name, stat]: [string, any]) => ({
         name: name.length > 10 ? name.substring(0, 10) + '...' : name,
         value: Math.round(stat.mean || stat.max || 100),
      }))
   }

   const chartData = generateChartData()
   // Generate slides from AI presentation data
   const generateSlides = (presentation: any): Slide[] => {
      const slides: Slide[] = [
         {
            type: 'title',
            title: presentation.title,
            subtitle: `Data Analysis Presentation - ${new Date(presentation.timestamp).toLocaleDateString()}`,
            content: `Generated from ${analysisData?.fileName || 'your dataset'}`,
         },
         {
            type: 'overview',
            title: 'Dataset Overview',
            content: `
### Dataset Summary
- **Total Rows**: ${analysisData?.summary?.overview?.totalRows?.toLocaleString() || 'N/A'}
- **Total Columns**: ${analysisData?.summary?.overview?.totalColumns || 'N/A'}
- **File Size**: ${formatFileSize(analysisData?.fileSize)}
- **Analysis Date**: ${new Date().toLocaleDateString()}

### Key Columns
${
   analysisData?.summary?.overview?.columns
      ?.slice(0, 5)
      .map((col: string) => `- ${col}`)
      .join('\n') || 'No columns available'
}
        `,
         },
         {
            type: 'insights',
            title: 'AI-Generated Insights',
            content: presentation.content,
         },
      ]

      // Add chart slides if we have data
      if (chartData.length > 0) {
         slides.push({
            type: 'chart',
            title: 'Data Visualization',
            chartType: 'bar',
            content: 'Key metrics from your dataset visualized as a bar chart.',
         })

         slides.push({
            type: 'chart',
            title: 'Distribution Analysis',
            chartType: 'pie',
            content: 'Data distribution showing the relative proportions of key metrics.',
         })
      }

      // Add recommendations slide
      if (presentation.data?.keyPoints) {
         slides.push({
            type: 'recommendations',
            title: 'Key Recommendations',
            content: `
### Action Items
${presentation.data.keyPoints
   .slice(0, 5)
   .map((point: string) => `- ${point}`)
   .join('\n')}

### Next Steps
- Review the data quality and completeness
- Consider additional data collection if needed
- Implement the recommended actions
- Monitor results and iterate
        `,
         })
      }

      slides.push({
         type: 'conclusion',
         title: 'Thank You',
         content: `
### Summary
This presentation was generated automatically from your data analysis.

### Questions?
Feel free to ask the AI for more specific insights or analysis.

**Generated by DataVista AI**
      `,
      })

      return slides
   }

   const formatFileSize = (bytes?: number): string => {
      if (!bytes) return 'Unknown'
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
   }
   const handleExport = async () => {
      if (!selectedPresentation) return

      // Toggle export menu instead of direct export
      setShowPresentationExportMenu(!showPresentationExportMenu)
   }

   const handleShare = async () => {
      if (!selectedPresentation) return

      try {
         // Create a shareable link/text
         const shareText = `Check out this AI-generated presentation: "${selectedPresentation.title}"`
         const shareUrl = window.location.href

         // Use Web Share API if available
         if (navigator.share) {
            await navigator.share({
               title: selectedPresentation.title,
               text: shareText,
               url: shareUrl,
            })
         } else {
            // Fallback: copy to clipboard
            const shareContent = `${shareText}\n\nView at: ${shareUrl}`
            await navigator.clipboard.writeText(shareContent)
            alert('Presentation link copied to clipboard! You can now share it with others.')
         }
      } catch (error) {
         console.error('Share failed:', error)
         // Fallback fallback: show the text
         const shareContent = `${selectedPresentation.title}\n\nGenerated on: ${new Date(
            selectedPresentation.timestamp
         ).toLocaleDateString()}\n\nView at: ${window.location.href}`
         prompt('Copy this text to share:', shareContent)
      }
   }

   if (!hasData) {
      return (
         <div className='flex flex-col items-center justify-center h-96 text-center'>
            <Presentation className='w-16 h-16 text-gray-400 mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Data Available</h2>
            <p className='text-gray-600 mb-4'>Upload a dataset to start creating presentations from your data.</p>
         </div>
      )
   }

   if (aiPresentations.length === 0) {
      return (
         <div className='space-y-6'>
            {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Presentations</h1>
            <p className="text-gray-600">AI-generated presentations and reports</p>
          </div>
        </div> */}

            <div className='flex flex-col items-center justify-center h-96 text-center bg-white rounded-lg border border-gray-200'>
               <Sparkles className='w-16 h-16 text-purple-400 mb-4' />
               <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Presentations Yet</h2>
               <p className='text-gray-600 mb-4 max-w-md'>
                  Ask the AI to create presentations or reports from your data analysis. These will appear here for easy
                  sharing and export.
               </p>
               <div className='flex flex-col space-y-2 text-sm text-gray-500'>
                  <p>💡 Try asking:</p>
                  <p>"Create a presentation of my data"</p>
                  <p>"Generate a report summary"</p>
                  <p>"Make slides from this analysis"</p>
               </div>
            </div>
         </div>
      )
   }

   // If a presentation is selected, show the slide view
   if (selectedPresentation) {
      const slides = generateSlides(selectedPresentation)
      const slide = slides[currentSlide]

      return (
         <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            {/* Presentation Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white'>
               <div className='flex items-center space-x-4'>
                  <button
                     onClick={() => setSelectedPresentation(null)}
                     className='flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg'
                  >
                     <ChevronLeft className='w-4 h-4' />
                     <span>Back to List</span>
                  </button>
                  <div>
                     <h2 className='font-semibold text-gray-900'>{selectedPresentation.title}</h2>
                     <p className='text-sm text-gray-500'>
                        Slide {currentSlide + 1} of {slides.length}
                     </p>
                  </div>
               </div>
               <div className='flex items-center space-x-2'>
                  <button
                     onClick={() => setIsFullscreen(!isFullscreen)}
                     className='p-2 text-gray-600 hover:bg-gray-100 rounded-lg'
                  >
                     <Maximize2 className='w-4 h-4' />
                  </button>{' '}
                  <button
                     onClick={handleShare}
                     className='flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200'
                  >
                     <Share className='w-4 h-4' />
                     <span>Share</span>
                  </button>
                  <div className='relative'>
                     <button
                        onClick={handleExport}
                        className='flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200'
                     >
                        <Download className='w-4 h-4' />
                        <span>Export</span>
                     </button>

                     {showPresentationExportMenu && (
                        <div className='absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]'>
                           <button
                              onClick={() => {
                                 exportToPDF(selectedPresentation)
                                 setShowPresentationExportMenu(false)
                              }}
                              className='w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg'
                           >
                              Export as PDF
                           </button>
                           <button
                              onClick={() => {
                                 exportToPPT(selectedPresentation)
                                 setShowPresentationExportMenu(false)
                              }}
                              className='w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg'
                           >
                              Export as PPTX
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Slide Content */}
            <div className='flex-1 flex items-center justify-center p-8 bg-gray-50'>
               <div className='w-full max-w-4xl bg-white rounded-lg shadow-lg aspect-video p-8 flex flex-col justify-center'>
                  {slide.type === 'title' && (
                     <div className='text-center'>
                        <h1 className='text-4xl font-bold text-gray-900 mb-4'>{slide.title}</h1>
                        <p className='text-xl text-gray-600 mb-2'>{slide.subtitle}</p>
                        <p className='text-gray-500'>{slide.content}</p>
                     </div>
                  )}

                  {slide.type === 'overview' && (
                     <div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-6'>{slide.title}</h2>
                        <div className='prose prose-lg max-w-none'>
                           <MarkdownRenderer content={slide.content} />
                        </div>
                     </div>
                  )}

                  {slide.type === 'insights' && (
                     <div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center'>
                           <Sparkles className='w-8 h-8 mr-3 text-purple-600' />
                           {slide.title}
                        </h2>
                        <div className='prose prose-lg max-w-none'>
                           <MarkdownRenderer content={slide.content} />
                        </div>
                     </div>
                  )}

                  {slide.type === 'chart' && (
                     <div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center'>
                           {slide.chartType === 'bar' ? (
                              <BarChart3 className='w-8 h-8 mr-3 text-blue-600' />
                           ) : (
                              <PieChart className='w-8 h-8 mr-3 text-green-600' />
                           )}
                           {slide.title}
                        </h2>
                        <div className='h-96 mb-4'>
                           <ResponsiveContainer
                              width='100%'
                              height='100%'
                           >
                              {slide.chartType === 'bar' ? (
                                 <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='name' />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                       dataKey='value'
                                       fill='#6d28d9'
                                       radius={[4, 4, 0, 0]}
                                    />
                                 </BarChart>
                              ) : (
                                 <RechartsPieChart>
                                    <Pie
                                       data={chartData}
                                       cx='50%'
                                       cy='50%'
                                       outerRadius={120}
                                       fill='#8884d8'
                                       dataKey='value'
                                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                       {chartData.map((_, index) => (
                                          <Cell
                                             key={`cell-${index}`}
                                             fill={COLORS[index % COLORS.length]}
                                          />
                                       ))}
                                    </Pie>
                                    <Tooltip />
                                 </RechartsPieChart>
                              )}
                           </ResponsiveContainer>
                        </div>
                        <p className='text-gray-600'>{slide.content}</p>
                     </div>
                  )}

                  {slide.type === 'recommendations' && (
                     <div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center'>
                           <TrendingUp className='w-8 h-8 mr-3 text-green-600' />
                           {slide.title}
                        </h2>
                        <div className='prose prose-lg max-w-none'>
                           <MarkdownRenderer content={slide.content} />
                        </div>
                     </div>
                  )}

                  {slide.type === 'conclusion' && (
                     <div className='text-center'>
                        <h2 className='text-4xl font-bold text-gray-900 mb-6'>{slide.title}</h2>
                        <div className='prose prose-lg max-w-none mx-auto'>
                           <MarkdownRenderer content={slide.content} />
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Slide Navigation */}
            <div className='flex items-center justify-between p-4 border-t border-gray-200 bg-white'>
               <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className='flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
               >
                  <ChevronLeft className='w-4 h-4' />
                  <span>Previous</span>
               </button>

               <div className='flex space-x-2'>
                  {slides.map((_, index) => (
                     <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-purple-600' : 'bg-gray-300'}`}
                     />
                  ))}
               </div>

               <button
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className='flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
               >
                  <span>Next</span>
                  <ChevronRight className='w-4 h-4' />
               </button>
            </div>
         </div>
      )
   }

   // Presentation list view
   return (
      <div className='space-y-6'>
         <div className='flex items-center justify-between'>
            {/* <div>
               <h1 className='text-2xl font-bold text-gray-900'>Presentations</h1>
               <p className='text-gray-600'>AI-generated presentations and reports</p>
            </div> */}
            <div className='flex items-center space-x-2 text-sm text-gray-600'>
               <Sparkles className='w-4 h-4' />
               <span>{aiPresentations.length} presentations</span>
            </div>
         </div>

         <div className='grid gap-6'>
            {aiPresentations.map((presentation) => (
               <div
                  key={presentation.id}
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow'
               >
                  <div className='flex items-start justify-between mb-4'>
                     <div className='flex items-center space-x-3'>
                        <div className='flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-700'>
                           <Presentation className='w-6 h-6' />
                        </div>
                        <div>
                           <h3 className='dashboard-heading text-gray-900'>{presentation.title}</h3>
                           <div className='flex items-center space-x-2 dashboard-body text-gray-500'>
                              <Clock className='w-3 h-3' />
                              <span>{new Date(presentation.timestamp).toLocaleString()}</span>
                              <span>•</span>
                              <span>{generateSlides(presentation).length} slides</span>
                           </div>
                        </div>
                     </div>
                     <div className='flex items-center space-x-2'>
                        {presentation.isNew && (
                           <span className='inline-flex items-center px-2 py-1 rounded-full dashboard-small-text font-medium bg-green-100 text-green-700'>
                              New
                           </span>
                        )}
                     </div>
                  </div>

                  <p className='dashboard-body text-gray-600 mb-4 line-clamp-2'>{presentation.content.substring(0, 150)}...</p>

                  <div className='flex items-center justify-between'>
                     <button
                        onClick={() => {
                           setSelectedPresentation(presentation)
                           setCurrentSlide(0)
                        }}
                        className='flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                     >
                        <Eye className='w-4 h-4' />
                        <span>View Presentation</span>
                     </button>
                     <div className='flex items-center space-x-2'>
                        <button
                           onClick={() => sharePresentation(presentation)}
                           className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'
                           title='Share presentation'
                        >
                           <Share className='w-4 h-4' />
                        </button>
                        <div className='relative'>
                           <button
                              onClick={() =>
                                 setShowExportMenu(showExportMenu === presentation.id ? null : presentation.id)
                              }
                              className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'
                              title='Export presentation'
                           >
                              <Download className='w-4 h-4' />
                           </button>

                           {showExportMenu === presentation.id && (
                              <div className='absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]'>
                                 <button
                                    onClick={() => {
                                       exportToPDF(presentation)
                                       setShowExportMenu(null)
                                    }}
                                    className='w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg'
                                 >
                                    Export as PDF
                                 </button>
                                 <button
                                    onClick={() => {
                                       exportToPPT(presentation)
                                       setShowExportMenu(null)
                                    }}
                                    className='w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg'
                                 >
                                    Export as PPT
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default Presentations
