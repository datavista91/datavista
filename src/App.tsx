import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './featureAnimations.css'
import Dashboard from './components/Dashboard'
import SideNav from './components/SideNav'
import Header from './components/Header'
import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'
import { AIResponseProvider } from './context/AIResponseContext'
import { ChatProvider } from './context/ChatContext'
import LandingPage from './pages/LandingPage'
import GoogleSignInPage from './pages/GoogleSignInPage'
import PricingPage from './pages/PricingPage'
import PaymentSuccess from './pages/PaymentSuccess'
import ProtectedRoute from './components/ProtectedRoute'
import ChartPanel from './components/ChartPanel'
import AnalysisHistory from './components/AnalysisHistory'
import SmartReports from './components/SmartReports'
import EnhancedPresentations from './components/EnhancedPresentations'

// Dashboard layout component
const DashboardLayout = () => {
   // const [sidebarOpen, setSidebarOpen] = useState(true)

   return (
      <div
         className='flex h-screen bg-light-bg overflow-hidden'
         style={{ fontFamily: 'Inter, sans-serif' }}
      >
         <SideNav />
         <div className='flex flex-col flex-1 overflow-hidden'>
            <Header />
            <main className='flex-1 overflow-y-auto p-4 md:p-6'>
               <Routes>
                  <Route
                     path='/dashboard'
                     element={<Dashboard />}
                  />
                  <Route
                     path='/visualizations'
                     element={<ChartPanel />}
                  />{' '}
                  <Route
                     path='/reports'
                     element={<SmartReports />}
                  />
                  <Route
                     path='/history'
                     element={<AnalysisHistory />}
                  />{' '}
                  <Route
                     path='/share'
                     element={<EnhancedPresentations />}
                  />
                  <Route
                     path='/settings'
                     element={<div>Settings</div>}
                  />
                  <Route
                     path='/pricing'
                     element={<PricingPage />}
                  />
                  <Route
                     path='*'
                     element={
                        <Navigate
                           to='/dashboard'
                           replace
                        />
                     }
                  />
               </Routes>
            </main>
         </div>
      </div>
   )
}

export function App() {
   return (
      <BrowserRouter>
         {' '}
         <AuthProvider>
            <DataProvider>
               {' '}
               <AnalysisProvider>
                  <AIResponseProvider>
                     <ChatProvider>
                        <Routes>
                           <Route
                              path='/'
                              element={<LandingPage />}
                           />
                           {/* <Route
                              path='/login'
                              element={<GoogleSignInPage />}
                           /> */}
                           {/* <Route
                              path='/signup'
                              element={<GoogleSignInPage />}
                           /> */}
                           <Route
                              path='/payment-success'
                              element={<PaymentSuccess />}
                           />
                           <Route
                              path='/*'
                              element={
                                 <ProtectedRoute>
                                    <DashboardLayout />
                                 </ProtectedRoute>
                              }
                           />{' '}
                        </Routes>
                     </ChatProvider>
                  </AIResponseProvider>
               </AnalysisProvider>
            </DataProvider>
         </AuthProvider>
      </BrowserRouter>
   )
}

export default App
