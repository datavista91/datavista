import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Dashboard from './components/Dashboard'
import SideNav from './components/SideNav'
import Header from './components/Header'
import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'
import { AnalysisProvider } from './context/AnalysisContext'
import { AIResponseProvider } from './context/AIResponseContext'
import LandingPage from './pages/LandingPage'
import GoogleSignInPage from './pages/GoogleSignInPage'
import PricingPage from './pages/PricingPage'
import ProtectedRoute from './components/ProtectedRoute'
import ChartPanel from './components/ChartPanel'
import AnalysisHistory from './components/AnalysisHistory'
import SmartReports from './components/SmartReports'
import Presentations from './components/Presentations'

// Dashboard layout component
const DashboardLayout = () => {
   const [sidebarOpen, setSidebarOpen] = useState(true)

   return (
      <div
         className='flex h-screen bg-light-bg overflow-hidden'
         style={{ fontFamily: 'Inter, sans-serif' }}
      >
         <SideNav
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
         />
         <div className='flex flex-col flex-1 overflow-hidden'>
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className='flex-1 overflow-y-auto p-4 md:p-6'>
               <Routes>
                  <Route
                     path='/dashboard'
                     element={<Dashboard />}
                  />
                  <Route
                     path='/visualizations'
                     element={<ChartPanel />}
                  />{' '}                  <Route
                     path='/reports'
                     element={<SmartReports />}
                  />
                  <Route
                     path='/history'
                     element={<AnalysisHistory />}
                  />                  <Route
                     path='/share'
                     element={<Presentations />}
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
      <BrowserRouter>         <AuthProvider>
            <DataProvider>
               <AnalysisProvider>
                  <AIResponseProvider>
                  <Routes>
                     <Route
                        path='/'
                        element={<LandingPage />}
                     />
                     <Route
                        path='/login'
                        element={<GoogleSignInPage />}
                     />
                     <Route
                        path='/signup'
                        element={<GoogleSignInPage />}
                     />
                     <Route
                        path='/*'
                        element={
                           <ProtectedRoute>
                              <DashboardLayout />
                           </ProtectedRoute>
                        }
                     />                  </Routes>
                  </AIResponseProvider>
               </AnalysisProvider>
            </DataProvider>
         </AuthProvider>
      </BrowserRouter>
   )
}

export default App
