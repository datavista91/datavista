import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
   children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
   const { isAuthenticated, isLoading } = useAuth()

   if (isLoading) {
      return (
         <div className='flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
         </div>
      )
   }

   if (!isAuthenticated) {
      return (
         <Navigate
            to='/login'
            replace
         />
      )
   }

   return <>{children}</>
}

export default ProtectedRoute
