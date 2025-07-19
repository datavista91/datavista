import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
   children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
   const { isAuthenticated, isLoading } = useAuth()

   if (isLoading) {
      return (
         <div
            className='flex items-center justify-center h-screen'
            style={{
               fontFamily: 'Inter, sans-serif',
               backgroundColor: '#fdfeff',
               backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%230a4df1' fill-opacity='0.4' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E\")",
            }}
         >
            <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600'></div>
         </div>
      )
   }

   if (!isAuthenticated) {
      return (
         <Navigate
            to='/'
            replace
         />
      )
   }

   return <>{children}</>
}

export default ProtectedRoute
