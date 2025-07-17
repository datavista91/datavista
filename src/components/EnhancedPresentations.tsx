import { useState, useEffect, useCallback } from 'react'
import { useAIResponses } from '../context/AIResponseContext'
import { useAnalysis } from '../context/AnalysisContext'
import SlideRenderer, { Slide } from './presentation/SlideRenderer'
import PresentationControls from './presentation/PresentationControls'
import { EnhancedSlideParser } from './presentation/SlideParser'
import { PresentationExporter } from './presentation/PresentationExporter'
import { Presentation, Sparkles, Clock, Eye, ArrowLeft } from 'lucide-react'

const THEMES = ['modern', 'corporate', 'dark', 'light', 'vibrant']

const EnhancedPresentations = () => {
   const { getResponsesByType, markAsViewed } = useAIResponses()
   const { analysisData } = useAnalysis()
   const aiPresentations = getResponsesByType('presentation')

   const [selectedPresentation, setSelectedPresentation] = useState<any>(null)
   const [slides, setSlides] = useState<Slide[]>([])
   const [currentSlide, setCurrentSlide] = useState(0)
   const [isPlaying, setIsPlaying] = useState(false)
   const [isFullscreen, setIsFullscreen] = useState(false)
   const [theme, setTheme] = useState('modern')
   const [autoPlayInterval] = useState(5000)

   const hasData = analysisData?.summary !== null

   // Auto-play functionality
   useEffect(() => {
      let interval: NodeJS.Timeout

      if (isPlaying && slides.length > 0) {
         interval = setInterval(() => {
            setCurrentSlide((prev) => {
               if (prev >= slides.length - 1) {
                  setIsPlaying(false)
                  return prev
               }
               return prev + 1
            })
         }, autoPlayInterval)
      }

      return () => {
         if (interval) clearInterval(interval)
      }
   }, [isPlaying, slides.length, autoPlayInterval])

   // Generate slides when presentation is selected
   useEffect(() => {
      if (selectedPresentation) {
         const generatedSlides = EnhancedSlideParser.parseAIResponseToSlides(selectedPresentation, analysisData)
         setSlides(generatedSlides)
         setCurrentSlide(0)
      }
   }, [selectedPresentation, analysisData])

   // Fullscreen handling
   useEffect(() => {
      const handleFullscreenChange = () => {
         setIsFullscreen(!!document.fullscreenElement)
      }

      document.addEventListener('fullscreenchange', handleFullscreenChange)
      return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
   }, [])

   const handleSlideChange = useCallback(
      (index: number) => {
         if (index >= 0 && index < slides.length) {
            setCurrentSlide(index)
         }
      },
      [slides.length]
   )

   const handlePlayToggle = useCallback(() => {
      setIsPlaying((prev) => !prev)
   }, [])

   const handleFullscreenToggle = useCallback(async () => {
      try {
         if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen()
         } else {
            await document.exitFullscreen()
         }
      } catch (error) {
         console.error('Fullscreen error:', error)
      }
   }, [])

   const handleThemeChange = useCallback((newTheme: string) => {
      setTheme(newTheme)
   }, [])

   const handleExport = useCallback(
      async (format: 'pdf' | 'pptx') => {
         if (!selectedPresentation || slides.length === 0) return

         try {
            if (format === 'pdf') {
               await PresentationExporter.exportToPDF(slides, selectedPresentation.title)
            } else {
               await PresentationExporter.exportToPPTX(slides, selectedPresentation.title)
            }
         } catch (error) {
            console.error('Export error:', error)
            alert('Export failed. Please try again.')
         }
      },
      [selectedPresentation, slides]
   )

   const handleShare = useCallback(async () => {
      if (!selectedPresentation || slides.length === 0) return

      try {
         await PresentationExporter.sharePresentation(slides, selectedPresentation.title)
      } catch (error) {
         console.error('Share error:', error)
      }
   }, [selectedPresentation, slides])

   const handleBackToList = useCallback(() => {
      setSelectedPresentation(null)
      setSlides([])
      setCurrentSlide(0)
      setIsPlaying(false)
   }, [])

   const handlePresentationSelect = useCallback(
      (presentation: any) => {
         setSelectedPresentation(presentation)
         setCurrentSlide(0)
         // Mark as viewed when presentation is opened
         markAsViewed(presentation.id)
      },
      [markAsViewed]
   )

   // Empty state
   if (!hasData) {
      return (
         <div className='flex flex-col items-center justify-center h-96 text-center'>
            <Presentation className='w-16 h-16 text-gray-400 mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Data Available</h2>
            <p className='text-gray-600 mb-4'>
               Upload a dataset to start generating presentations from your data insights.
            </p>
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
                  Ask the AI to create presentations about your data. Try requesting slide decks, reports, or visual
                  summaries of your analysis.
               </p>
               <div className='flex flex-col space-y-2 text-sm text-gray-500'>
                  <p>💡 Try asking:</p>
                  <p>"Create a presentation about my data"</p>
                  <p>"Generate slides showing key insights"</p>
                  <p>"Make a report presentation"</p>
               </div>
            </div>
         </div>
      )
   }

   // Presentation view
   if (selectedPresentation && slides.length > 0) {
      return (
         <div className='presentation-container'>
            {/* Back button (only in windowed mode) */}
            {!isFullscreen && (
               <button
                  onClick={handleBackToList}
                  className='fixed top-4 left-4 z-50 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-2 rounded-lg transition-all duration-200'
               >
                  <ArrowLeft className='w-5 h-5' />
               </button>
            )}

            {/* Slide Display */}
            <div className='slide-display'>
               {slides.map((slide, index) => (
                  <div
                     key={slide.id}
                     className={`slide-wrapper ${index === currentSlide ? 'active' : 'hidden'}`}
                     style={{ display: index === currentSlide ? 'block' : 'none' }}
                  >
                     <SlideRenderer
                        slide={slide}
                        theme={theme}
                        isActive={index === currentSlide}
                     />
                  </div>
               ))}
            </div>

            {/* Presentation Controls */}
            <PresentationControls
               slides={slides}
               currentSlide={currentSlide}
               isPlaying={isPlaying}
               isFullscreen={isFullscreen}
               theme={theme}
               themes={THEMES}
               onSlideChange={handleSlideChange}
               onPlayToggle={handlePlayToggle}
               onFullscreenToggle={handleFullscreenToggle}
               onThemeChange={handleThemeChange}
               onExport={handleExport}
               onShare={handleShare}
            />
         </div>
      )
   }

   // Presentation list view
   return (
      <div className='space-y-6'>
         <div className='flex items-center justify-between'>
            {/* <div>
          <h1 className="text-2xl font-bold text-gray-900">Presentations</h1>
          <p className="text-gray-600">AI-generated presentations and reports</p>
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
                  className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative'
               >
                  {/* New Tag - Top Right */}
                  {presentation.isNew && (
                     <div className='absolute top-4 right-4 z-10'>
                        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 shadow-sm'>
                           New
                        </span>
                     </div>
                  )}

                  <div className='flex items-start justify-between mb-4'>
                     <div className='flex items-center space-x-3'>
                        <div className='flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 text-purple-700'>
                           <Presentation className='w-6 h-6' />
                        </div>
                        <div>
                           <h3 className='font-semibold text-gray-900 text-lg'>{presentation.title}</h3>
                           <div className='flex items-center space-x-2 text-sm text-gray-500'>
                              <Clock className='w-3 h-3' />
                              <span>{new Date(presentation.timestamp).toLocaleString()}</span>
                              <span>•</span>
                              <span>AI Generated</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className='mb-4'>
                     <p className='text-gray-600 text-sm line-clamp-3'>{presentation.content.substring(0, 200)}...</p>
                  </div>

                  <div className='flex items-center justify-between'>
                     <button
                        onClick={() => handlePresentationSelect(presentation)}
                        className='flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
                     >
                        <Eye className='w-4 h-4' />
                        <span>View Presentation</span>
                     </button>

                     <div className='text-sm text-gray-500'>Enhanced with AI insights</div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   )
}

export default EnhancedPresentations
