import { useEffect } from 'react'
import { Crown, Zap, AlertCircle, Check, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { useUsage } from '../hooks/useUsage'
import userSubscriptionService from '../services/userSubscriptionService'

const SubscriptionStatus = () => {
   const { user } = useAuth()
   const navigate = useNavigate()
   const { subscription } = useSubscription()
   const { usage, loading, refreshUsage } = useUsage()

   useEffect(() => {
      // Component is now using hooks, no need for manual data loading
   }, [user])

   const getPlanIcon = (plan: string) => {
      switch (plan) {
         case 'pro':
            return <Zap className="w-5 h-5 text-purple-600" />
         case 'enterprise':
            return <Crown className="w-5 h-5 text-indigo-600" />
         default:
            return <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">F</div>
      }
   }

   const getPlanColor = (plan: string) => {
      switch (plan) {
         case 'pro':
            return 'bg-purple-50 border-purple-200 text-purple-800'
         case 'enterprise':
            return 'bg-indigo-50 border-indigo-200 text-indigo-800'
         default:
            return 'bg-gray-50 border-gray-200 text-gray-800'
      }
   }

   const getUsagePercentage = (used: number, limit: number | 'unlimited') => {
      if (limit === 'unlimited') return 0
      return Math.min((used / limit) * 100, 100)
   }

   const getUsageColor = (percentage: number) => {
      if (percentage >= 90) return 'bg-red-500'
      if (percentage >= 70) return 'bg-yellow-500'
      return 'bg-green-500'
   }

   if (loading) {
      return (
         <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse">
               <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
               <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
         </div>
      )
   }

   if (!subscription || !usage) {
      return null
   }

   const isExpired = userSubscriptionService.isSubscriptionExpired(subscription)
   const dailyLimit = subscription.features.aiRequestsPerDay
   const dailyUsagePercentage = getUsagePercentage(usage.aiRequestsToday, dailyLimit)

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
      >
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
               {getPlanIcon(subscription.plan)}
               <div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full dashboard-small-text font-medium ${getPlanColor(subscription.plan)}`}>
                     {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                  </div>
                  {isExpired && (
                     <div className="flex items-center mt-1 text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span className="dashboard-small-text">Expired</span>
                     </div>
                  )}
               </div>
            </div>
            
            {subscription.plan === 'free' && (
               <button
                  onClick={() => navigate('/pricing')}
                  className="dashboard-body font-medium text-purple-600 hover:text-purple-700 transition-colors"
               >
                  Upgrade
               </button>
            )}
         </div>

         {/* Usage Stats */}
         <div className="space-y-3">
            {/* Daily AI Requests */}
            <div>
               <div className="flex justify-between items-center mb-1">
                  <span className="dashboard-body font-medium text-gray-700">Daily AI Requests</span>
                  <div className="flex items-center space-x-2">
                     <span className="dashboard-body text-gray-500">
                        {usage.aiRequestsToday} / {dailyLimit === 'unlimited' ? '∞' : dailyLimit}
                     </span>
                     <button
                        onClick={refreshUsage}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Refresh usage data"
                     >
                        <RefreshCw size={14} />
                     </button>
                  </div>
               </div>
               {dailyLimit !== 'unlimited' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                        className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(dailyUsagePercentage)}`}
                        style={{ width: `${dailyUsagePercentage}%` }}
                     />
                  </div>
               )}
            </div>

            {/* Dataset Uploads */}
            <div>
               <div className="flex justify-between items-center mb-1">
                  <span className="dashboard-body font-medium text-gray-700">Datasets Uploaded</span>
                  <span className="dashboard-body text-gray-500">
                     {usage.datasetsUploaded} / {subscription.features.datasetLimit === 'unlimited' ? '∞' : subscription.features.datasetLimit}
                  </span>
               </div>
            </div>

            {/* Features */}
            <div className="pt-3 border-t border-gray-100">
               <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                     <Check className={`w-4 h-4 ${subscription.features.advancedInsights ? 'text-green-500' : 'text-gray-300'}`} />
                     <span className="dashboard-small-text text-gray-600">Advanced Insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Check className={`w-4 h-4 ${subscription.features.customCharts ? 'text-green-500' : 'text-gray-300'}`} />
                     <span className="text-xs text-gray-600">Custom Charts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Check className={`w-4 h-4 ${subscription.features.prioritySupport ? 'text-green-500' : 'text-gray-300'}`} />
                     <span className="text-xs text-gray-600">Priority Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Check className={`w-4 h-4 ${subscription.features.teamCollaboration !== 1 ? 'text-green-500' : 'text-gray-300'}`} />
                     <span className="text-xs text-gray-600">Team Collaboration</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Expiry Date */}
         {subscription.expiryDate && (
            <div className="mt-4 pt-3 border-t border-gray-100">
               <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Next Billing</span>
                  <span className="text-xs text-gray-600">
                     {new Date(subscription.expiryDate).toLocaleDateString()}
                  </span>
               </div>
            </div>
         )}
      </motion.div>
   )
}

export default SubscriptionStatus
