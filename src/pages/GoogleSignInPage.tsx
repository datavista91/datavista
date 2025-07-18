import { useAuth } from '../context/AuthContext'

const GoogleSignInPage = () => {
   const { login, isLoading } = useAuth()

   const handleGoogleSignIn = async () => {
      await login()
   }

   return (
      <div className='min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 '>
         <div className='sm:mx-auto sm:w-full sm:max-w-md bg-white/20 rounded-lg p-8 shadow-lg glassmorphism border border-blue-600'>
            <div className='flex justify-center'>
               <img
                  className='h-12 w-auto'
                  src='/logo2.png'
                  alt='DataVista Logo'
               />
            </div>
            <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-100'>Sign in to DataVista</h2>
            <p className='mt-2 text-center text-sm text-gray-400'>Use your Google account to continue</p>
            <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center'>
               <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className='w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
               >
                  <svg
                     className='w-5 h-5 mr-2'
                     viewBox='0 0 48 48'
                  >
                     <g>
                        <path
                           fill='#4285F4'
                           d='M24 9.5c3.54 0 6.36 1.22 8.3 2.97l6.18-6.18C34.64 2.7 29.74 0 24 0 14.82 0 6.88 5.8 2.69 14.09l7.19 5.58C12.01 13.6 17.56 9.5 24 9.5z'
                        />
                        <path
                           fill='#34A853'
                           d='M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.58C43.98 37.2 46.1 31.4 46.1 24.55z'
                        />
                        <path
                           fill='#FBBC05'
                           d='M9.88 28.67A14.5 14.5 0 019.5 24c0-1.62.28-3.19.78-4.67l-7.19-5.58A23.94 23.94 0 000 24c0 3.77.9 7.34 2.49 10.42l7.39-5.75z'
                        />
                        <path
                           fill='#EA4335'
                           d='M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.39-5.75c-2.06 1.39-4.7 2.22-8.5 2.22-6.44 0-12-4.1-14.12-9.67l-7.19 5.58C6.88 42.2 14.82 48 24 48z'
                        />
                        <path
                           fill='none'
                           d='M0 0h48v48H0z'
                        />
                     </g>
                  </svg>
                  {isLoading ? 'Signing in...' : 'Sign in with Google'}
               </button>
            </div>
         </div>
      </div>
   )
}

export default GoogleSignInPage
