import { db } from '../firebase'
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore'

export interface UserSubscription {
   plan: 'free' | 'pro' | 'enterprise'
   status: 'active' | 'inactive' | 'expired'
   startDate?: string
   expiryDate?: string
   features: {
      datasetLimit: number | 'unlimited'
      aiRequestsPerDay: number | 'unlimited'
      advancedInsights: boolean
      customCharts: boolean
      prioritySupport: boolean
      teamCollaboration: number | 'unlimited'
      dedicatedManager?: boolean
      customIntegrations?: boolean
      slaGuarantees?: boolean
   }
   lastUpdated: string
}

export interface UserUsage {
   aiRequestsToday: number
   aiRequestsThisMonth: number
   datasetsUploaded: number
   lastResetDate: string
}

export interface PaymentHistory {
   paymentId: string
   amount: number
   currency: string
   planType: string
   status: 'completed' | 'failed' | 'pending'
   timestamp: string
   indianTime: string
   provider: string
   metadata?: any
}

class UserSubscriptionService {
   /**
    * Get user subscription data
    */
   async getUserSubscription(userId: string): Promise<UserSubscription | null> {
      try {
         const userRef = doc(db, 'users', userId)
         const userDoc = await getDoc(userRef)
         
         if (userDoc.exists()) {
            const data = userDoc.data()
            return data.subscription || this.getDefaultSubscription()
         }
         
         return this.getDefaultSubscription()
      } catch (error) {
         console.error('❌ Error fetching user subscription:', error)
         return this.getDefaultSubscription()
      }
   }

   /**
    * Get user usage data
    */
   async getUserUsage(userId: string): Promise<UserUsage> {
      try {
         const userRef = doc(db, 'users', userId)
         const userDoc = await getDoc(userRef)
         
         if (userDoc.exists()) {
            const data = userDoc.data()
            return data.usage || this.getDefaultUsage()
         }
         
         return this.getDefaultUsage()
      } catch (error) {
         console.error('❌ Error fetching user usage:', error)
         return this.getDefaultUsage()
      }
   }

   /**
    * Get payment history for user
    */
   async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
      try {
         const userRef = doc(db, 'users', userId)
         const userDoc = await getDoc(userRef)
         
         if (userDoc.exists()) {
            // In a real implementation, you would query the subcollection
            // For now, return empty array
            return []
         }
         
         return []
      } catch (error) {
         console.error('❌ Error fetching payment history:', error)
         return []
      }
   }

   /**
    * Check if user can make AI request
    */
   async canMakeAIRequest(userId: string): Promise<{ allowed: boolean; message?: string }> {
      try {
         const subscription = await this.getUserSubscription(userId)
         const usage = await this.getUserUsage(userId)
         
         if (!subscription) {
            return { allowed: false, message: 'Subscription not found' }
         }

         // Check daily limits
         const dailyLimit = subscription.features.aiRequestsPerDay
         
         if (dailyLimit === 'unlimited') {
            return { allowed: true }
         }
         
         if (typeof dailyLimit === 'number' && usage.aiRequestsToday >= dailyLimit) {
            return { 
               allowed: false, 
               message: `Daily limit of ${dailyLimit} AI requests reached. Upgrade your plan for more requests.` 
            }
         }
         
         return { allowed: true }
      } catch (error) {
         console.error('❌ Error checking AI request permission:', error)
         return { allowed: false, message: 'Error checking permissions' }
      }
   }

   /**
    * Increment AI request usage
    */
   async incrementAIUsage(userId: string): Promise<void> {
      try {
         console.log('🔢 Starting AI usage increment for user:', userId)
         const userRef = doc(db, 'users', userId)
         
         // Check if we need to reset daily counters
         const usage = await this.getUserUsage(userId)
         console.log('📊 Current usage before increment:', usage)
         
         const today = new Date().toDateString()
         const lastResetDate = new Date(usage.lastResetDate).toDateString()
         
         if (today !== lastResetDate) {
            console.log('🔄 Resetting daily counter for new day')
            // Reset daily counter
            await updateDoc(userRef, {
               'usage.aiRequestsToday': 1,
               'usage.aiRequestsThisMonth': increment(1),
               'usage.lastResetDate': new Date().toISOString()
            })
         } else {
            console.log('➕ Incrementing daily counter')
            // Increment counters
            await updateDoc(userRef, {
               'usage.aiRequestsToday': increment(1),
               'usage.aiRequestsThisMonth': increment(1)
            })
         }
         
         console.log('✅ AI usage incremented successfully')
         
      } catch (error) {
         console.error('❌ Error incrementing AI usage:', error)
      }
   }

   /**
    * Initialize user subscription (for new users)
    */
   async initializeUserSubscription(userId: string): Promise<void> {
      try {
         const userRef = doc(db, 'users', userId)
         const userDoc = await getDoc(userRef)
         
         if (!userDoc.exists()) {
            await setDoc(userRef, {
               subscription: this.getDefaultSubscription(),
               usage: this.getDefaultUsage()
            })
         }
      } catch (error) {
         console.error('❌ Error initializing user subscription:', error)
      }
   }

   /**
    * Reset monthly usage counters
    */
   async resetMonthlyUsage(userId: string): Promise<void> {
      try {
         const userRef = doc(db, 'users', userId)
         await updateDoc(userRef, {
            'usage.aiRequestsThisMonth': 0,
            'usage.lastResetDate': new Date().toISOString()
         })
      } catch (error) {
         console.error('❌ Error resetting monthly usage:', error)
      }
   }

   /**
    * Check if subscription is expired
    */
   isSubscriptionExpired(subscription: UserSubscription): boolean {
      if (subscription.plan === 'free') return false
      if (!subscription.expiryDate) return true
      
      return new Date(subscription.expiryDate) < new Date()
   }

   /**
    * Get default free subscription
    */
   private getDefaultSubscription(): UserSubscription {
      return {
         plan: 'free',
         status: 'active',
         features: {
            datasetLimit: 5,
            aiRequestsPerDay: 10,
            advancedInsights: false,
            customCharts: false,
            prioritySupport: false,
            teamCollaboration: 1
         },
         lastUpdated: new Date().toISOString()
      }
   }

   /**
    * Get default usage
    */
   private getDefaultUsage(): UserUsage {
      return {
         aiRequestsToday: 0,
         aiRequestsThisMonth: 0,
         datasetsUploaded: 0,
         lastResetDate: new Date().toISOString()
      }
   }
}

// Export singleton instance
export default new UserSubscriptionService()
