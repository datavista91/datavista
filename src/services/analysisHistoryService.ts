import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  limit,
  onSnapshot,
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { AnalysisHistoryItem } from '../context/AnalysisContext';

export interface FirebaseAnalysisItem extends Omit<AnalysisHistoryItem, 'uploadDate'> {
  uploadDate: Timestamp;
  createdAt: Timestamp;
}

// Helper function to sanitize data for Firestore (removes nested arrays and functions)
const sanitizeDataForFirestore = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    // Convert arrays to objects to avoid nested array issues
    return data.slice(0, 100).map((item, index) => ({ // Limit to 100 items
      index,
      ...sanitizeDataForFirestore(item)
    }));
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function') {
        continue; // Skip functions
      }
      if (Array.isArray(value)) {
        // Convert large arrays to summary data to avoid Firestore limits
        if (value.length > 50) {
          sanitized[key] = {
            type: 'array_summary',
            length: value.length,
            sample: value.slice(0, 10), // First 10 items
            isLargeArray: true
          };
        } else {
          sanitized[key] = sanitizeDataForFirestore(value);
        }
      } else {
        sanitized[key] = sanitizeDataForFirestore(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

class AnalysisHistoryService {
  // Get reference to user's analysisHistory subcollection
  private getUserAnalysisCollection(userId: string) {
    return collection(db, 'users', userId, 'analysisHistory');
  }

  // Get reference to user document
  private getUserDocument(userId: string) {
    return doc(db, 'users', userId);
  }

  // Update or create user document with email
  async updateUserEmail(userId: string, email: string): Promise<void> {
    try {
      const userDocRef = this.getUserDocument(userId);
      
      // Get existing user document to preserve other fields
      const userDoc = await getDoc(userDocRef);
      const existingData = userDoc.exists() ? userDoc.data() : {};
      
      // Update the document with email while preserving existing fields
      await setDoc(userDocRef, {
        ...existingData,
        email: email,
        lastUpdated: Timestamp.now()
      }, { merge: true });
      
      console.log('User email updated successfully:', email);
    } catch (error) {
      console.error('Error updating user email:', error);
      throw error;
    }
  }

  // Get user email from document
  async getUserEmail(userId: string): Promise<string | null> {
    try {
      const userDocRef = this.getUserDocument(userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.email || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  // Save analysis to Firebase as subcollection under user
  async saveAnalysisToFirebase(
    userId: string, 
    analysisItem: Omit<AnalysisHistoryItem, 'id'>,
    userEmail?: string
  ): Promise<string> {
    try {
      // Update user email if provided
      if (userEmail) {
        await this.updateUserEmail(userId, userEmail);
      }

      // Sanitize the analysis data to avoid nested array issues
      const sanitizedData = {
        fileName: analysisItem.fileName,
        fileSize: analysisItem.fileSize,
        uploadDate: Timestamp.fromDate(new Date(analysisItem.uploadDate)),
        createdAt: Timestamp.now(),
        analysisData: {
          ...analysisItem.analysisData,
          sample: analysisItem.analysisData.sample.length > 100 ? 
            analysisItem.analysisData.sample.slice(0, 100) : 
            analysisItem.analysisData.sample,
          summary: sanitizeDataForFirestore(analysisItem.analysisData.summary)
        }
      };

      const userAnalysisCollection = this.getUserAnalysisCollection(userId);
      const docRef = await addDoc(userAnalysisCollection, sanitizedData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving analysis to Firebase:', error);
      throw error;
    }
  }

  // Get user's analysis history from Firebase subcollection
  async getUserAnalysisHistory(userId: string): Promise<AnalysisHistoryItem[]> {
    try {
      const userAnalysisCollection = this.getUserAnalysisCollection(userId);
      const q = query(
        userAnalysisCollection,
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data.fileName,
          uploadDate: data.uploadDate.toDate().toISOString(),
          fileSize: data.fileSize,
          analysisData: data.analysisData,
        };
      }) as AnalysisHistoryItem[];

      // Sort on client side by uploadDate (most recent first)
      return results.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } catch (error) {
      console.error('Error fetching analysis history from Firebase:', error);
      throw error;
    }
  }

  // Delete analysis from Firebase subcollection
  async deleteAnalysisFromFirebase(userId: string, analysisId: string): Promise<void> {
    try {
      const analysisDoc = doc(db, 'users', userId, 'analysisHistory', analysisId);
      await deleteDoc(analysisDoc);
    } catch (error) {
      console.error('Error deleting analysis from Firebase:', error);
      throw error;
    }
  }

  // Real-time listener for user's analysis history subcollection
  subscribeToUserAnalysisHistory(
    userId: string, 
    callback: (history: AnalysisHistoryItem[]) => void
  ): () => void {
    const userAnalysisCollection = this.getUserAnalysisCollection(userId);
    const q = query(
      userAnalysisCollection,
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data.fileName,
          uploadDate: data.uploadDate.toDate().toISOString(),
          fileSize: data.fileSize,
          analysisData: data.analysisData,
        };
      }) as AnalysisHistoryItem[];
      
      // Sort on client side
      const sortedHistory = history.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
      
      callback(sortedHistory);
    }, (error) => {
      console.error('Error in real-time listener:', error);
    });
  }

  // Clear all user's analysis history subcollection
  async clearUserAnalysisHistory(userId: string): Promise<void> {
    try {
      const userAnalysisCollection = this.getUserAnalysisCollection(userId);
      const querySnapshot = await getDocs(userAnalysisCollection);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing user analysis history:', error);
      throw error;
    }
  }
}

export const analysisHistoryService = new AnalysisHistoryService();
