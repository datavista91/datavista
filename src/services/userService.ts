import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export interface UserDocument {
   email: string
   lastUpdated: Timestamp
   subscription?: any
   usage?: any
}

class UserService {
   // Get reference to user document
   private getUserDocumentRef(userId: string) {
      return doc(db, 'users', userId)
   }

   // Create or update user document with basic info
   async createOrUpdateUser(userId: string, email: string): Promise<void> {
      try {
         const userDocRef = this.getUserDocumentRef(userId)

         // Get existing user document to preserve other fields
         const userDoc = await getDoc(userDocRef)
         const existingData = userDoc.exists() ? userDoc.data() : {}

         // Update the document with email while preserving existing fields
         await setDoc(
            userDocRef,
            {
               ...existingData,
               email: email,
               lastUpdated: Timestamp.now(),
            },
            { merge: true }
         )

         // console.log('User document updated successfully:', { userId, email });
      } catch (error) {
         console.error('Error updating user document:', error)
         throw error
      }
   }

   // Get user document data
   async getUserDocument(userId: string): Promise<UserDocument | null> {
      try {
         const userDocRef = this.getUserDocumentRef(userId)
         const userDoc = await getDoc(userDocRef)

         if (userDoc.exists()) {
            return userDoc.data() as UserDocument
         }

         return null
      } catch (error) {
         console.error('Error getting user document:', error)
         return null
      }
   }

   // Get user email
   async getUserEmail(userId: string): Promise<string | null> {
      try {
         const userData = await this.getUserDocument(userId)
         return userData?.email || null
      } catch (error) {
         console.error('Error getting user email:', error)
         return null
      }
   }

   // Update user subscription info
   async updateUserSubscription(userId: string, subscriptionData: any): Promise<void> {
      try {
         const userDocRef = this.getUserDocumentRef(userId)

         await setDoc(
            userDocRef,
            {
               subscription: subscriptionData,
               lastUpdated: Timestamp.now(),
            },
            { merge: true }
         )

         console.log('User subscription updated successfully')
      } catch (error) {
         console.error('Error updating user subscription:', error)
         throw error
      }
   }

   // Update user usage info
   async updateUserUsage(userId: string, usageData: any): Promise<void> {
      try {
         const userDocRef = this.getUserDocumentRef(userId)

         await setDoc(
            userDocRef,
            {
               usage: usageData,
               lastUpdated: Timestamp.now(),
            },
            { merge: true }
         )

         console.log('User usage updated successfully')
      } catch (error) {
         console.error('Error updating user usage:', error)
         throw error
      }
   }
}

export const userService = new UserService()
