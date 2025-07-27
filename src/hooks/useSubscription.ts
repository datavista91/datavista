import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import userSubscriptionService, { UserSubscription } from '../services/userSubscriptionService'

export const useSubscription = () => {
   const { user } = useAuth()
   const [subscription, setSubscription] = useState<UserSubscription | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const lastFetchRef = useRef<number>(0)

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
            lastFetchRef.current = Date.now()
         } catch (err) {
            console.error('Error fetching subscription:', err)
            setError('Failed to fetch subscription data')
         } finally {
            setLoading(false)
         }
      }

      // Only fetch if we haven't fetched recently (debounce)
      const timeSinceLastFetch = Date.now() - lastFetchRef.current
      if (timeSinceLastFetch > 5000) { // 5 seconds minimum between fetches
         fetchSubscription()
      } else {
         setLoading(false)
      }

      // Reduced polling frequency from 10s to 60s for better performance
      // Payment updates are handled by webhook, so frequent polling isn't necessary
      const interval = setInterval(() => {
         const timeSinceLastFetch = Date.now() - lastFetchRef.current
         if (timeSinceLastFetch > 30000) { // Only fetch if 30s since last fetch
            fetchSubscription()
         }
      }, 60000)

      return () => clearInterval(interval)
   }, [user?.id])

   const refreshSubscription = async () => {
      if (!user?.id) return
      
      try {
         const subData = await userSubscriptionService.getUserSubscription(user.id)
         setSubscription(subData)
         setError(null)
         lastFetchRef.current = Date.now()
      } catch (err) {
         console.error('Error refreshing subscription:', err)
         setError('Failed to refresh subscription data')
      }
   }

   // Memoize the computed subscription values to prevent unnecessary re-renders
   const subscriptionValues = useMemo(() => ({
      isProOrEnterprise: subscription?.plan === 'pro' || subscription?.plan === 'enterprise',
      isPro: subscription?.plan === 'pro',
      isEnterprise: subscription?.plan === 'enterprise',
      isFree: subscription?.plan === 'free' || !subscription,
   }), [subscription?.plan])

   return {
      subscription,
      loading,
      error,
      refreshSubscription,
      ...subscriptionValues,
   }
}
