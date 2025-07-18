import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import userSubscriptionService, { UserUsage } from '../services/userSubscriptionService'

export const useUsage = () => {
   const { user } = useAuth()
   const [usage, setUsage] = useState<UserUsage | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      if (!user?.id) {
         setUsage(null)
         setLoading(false)
         return
      }

      const fetchUsage = async () => {
         try {
            console.log('📊 Fetching usage data for user:', user.id)
            const usageData = await userSubscriptionService.getUserUsage(user.id)
            console.log('📊 Usage data fetched:', usageData)
            setUsage(usageData)
            setError(null)
         } catch (err) {
            console.error('Error fetching usage:', err)
            setError('Failed to fetch usage data')
         } finally {
            setLoading(false)
         }
      }

      fetchUsage()

      // Refresh usage data every 5 seconds to show real-time updates
      const interval = setInterval(fetchUsage, 5000)

      return () => clearInterval(interval)
   }, [user?.id])

   const refreshUsage = async () => {
      if (!user?.id) return
      
      try {
         const usageData = await userSubscriptionService.getUserUsage(user.id)
         setUsage(usageData)
         setError(null)
      } catch (err) {
         console.error('Error refreshing usage:', err)
         setError('Failed to refresh usage data')
      }
   }

   return {
      usage,
      loading,
      error,
      refreshUsage,
   }
}
