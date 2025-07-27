import { useAuth } from '../context/AuthContext';

const GoogleSignInPage = () => {
  const { login, isLoading } = useAuth();

  const handleGoogleSignIn = async () => {
    await login();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl">
            {/* Logo SVG */}
            <svg width={20} height={20} viewBox="0 0 1920 1084" fill="white" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_6727_1730)">
                <path d="M496.36 933.52V714.848C496.36 561.289 291.434 507.242 214.842 640.703L139.842 771.304C118.857 807.887 71.5077 820.157 35.068 798.026C-0.0838509 776.723 -9.85666 729.978 10.5223 694.373L365.525 76.1461C442.117 -57.2398 647.043 -3.26819 647.043 150.367V369.866C647.043 523.35 851.893 577.397 928.56 444.162L1140.46 75.6945C1217.12 -57.6162 1421.97 -3.56926 1421.97 149.99V371.071C1421.97 524.555 1626.67 578.602 1703.42 445.442L1780.23 312.131C1801.29 275.623 1848.64 263.353 1885.01 285.559C1920.16 307.012 1929.86 353.682 1909.4 389.287L1552.73 1008.42C1475.99 1141.58 1271.29 1087.53 1271.29 934.047V713.719C1271.29 560.235 1066.44 506.188 989.773 639.423L777.877 1007.89C701.21 1141.2 496.36 1087.15 496.36 933.595V933.52Z" fill="white" />
              </g>
              <defs>
                <clipPath id="clip0_6727_1730">
                  <rect width="1920" height="1084" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to DataVista
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use your Google account to continue
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.36 1.22 8.3 2.97l6.18-6.18C34.64 2.7 29.74 0 24 0 14.82 0 6.88 5.8 2.69 14.09l7.19 5.58C12.01 13.6 17.56 9.5 24 9.5z" />
              <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.58C43.98 37.2 46.1 31.4 46.1 24.55z" />
              <path fill="#FBBC05" d="M9.88 28.67A14.5 14.5 0 019.5 24c0-1.62.28-3.19.78-4.67l-7.19-5.58A23.94 23.94 0 000 24c0 3.77.9 7.34 2.49 10.42l7.39-5.75z" />
              <path fill="#EA4335" d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.39-5.75c-2.06 1.39-4.7 2.22-8.5 2.22-6.44 0-12-4.1-14.12-9.67l-7.19 5.58C6.88 42.2 14.82 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </g>
          </svg>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
};

export default GoogleSignInPage;
