import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import userSubscriptionService, { UserSubscription } from '../services/userSubscriptionService'

export const useSubscription = () => {
   const { user } = useAuth()
   const [subscription, setSubscription] = useState<UserSubscription | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   useEffect(() => {
      if (!user?.id) {
         setSubscription(null)
         setLoading(false)
         return
      }

      const fetchSubscription = async () => {
         try {
            setLoading(true)
            const subData = await userSubscriptionService.getUserSubscription(user.id)
            setSubscription(subData)
            setError(null)
         } catch (err) {
            console.error('Error fetching subscription:', err)
            setError('Failed to fetch subscription data')
         } finally {
            setLoading(false)
         }
      }

      fetchSubscription()

      // Refresh subscription data every 10 seconds to catch updates more frequently
      const interval = setInterval(fetchSubscription, 10000)

      return () => clearInterval(interval)
   }, [user?.id])

   const refreshSubscription = async () => {
      if (!user?.id) return
      
      try {
         const subData = await userSubscriptionService.getUserSubscription(user.id)
         setSubscription(subData)
         setError(null)
      } catch (err) {
         console.error('Error refreshing subscription:', err)
         setError('Failed to refresh subscription data')
      }
   }

   return {
      subscription,
      loading,
      error,
      refreshSubscription,
      isProOrEnterprise: subscription?.plan === 'pro' || subscription?.plan === 'enterprise',
      isPro: subscription?.plan === 'pro',
      isEnterprise: subscription?.plan === 'enterprise',
      isFree: subscription?.plan === 'free' || !subscription,
   }
}
