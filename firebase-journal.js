// Firebase Journal Service
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase-config.js';
import { firebaseAuth } from './firebase-auth.js';

class FirebaseJournalService {
  constructor() {
    this.collectionName = 'journalEntries';
  }

  // Create a new journal entry
  async createEntry(entryData) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to create entries');
      }

      const entry = {
        ...entryData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), entry);
      
      return {
        success: true,
        id: docRef.id,
        entry: { ...entry, id: docRef.id },
        message: 'Journal entry created successfully!'
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create journal entry'
      };
    }
  }

  // Get a specific journal entry
  async getEntry(entryId) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const docRef = doc(db, this.collectionName, entryId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'Entry not found'
        };
      }

      const entryData = docSnap.data();
      
      // Check if user owns this entry
      if (entryData.userId !== user.uid) {
        return {
          success: false,
          message: 'Unauthorized access to entry'
        };
      }

      return {
        success: true,
        entry: { id: docSnap.id, ...entryData }
      };
    } catch (error) {
      console.error('Error getting entry:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve journal entry'
      };
    }
  }

  // Get all journal entries for current user
  async getUserEntries(limitCount = 50) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];
      
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        entries: entries,
        count: entries.length
      };
    } catch (error) {
      console.error('Error getting user entries:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve journal entries'
      };
    }
  }

  // Update a journal entry
  async updateEntry(entryId, updateData) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // First verify the entry exists and belongs to the user
      const entryCheck = await this.getEntry(entryId);
      if (!entryCheck.success) {
        return entryCheck;
      }

      const docRef = doc(db, this.collectionName, entryId);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updatedData);

      return {
        success: true,
        message: 'Journal entry updated successfully!'
      };
    } catch (error) {
      console.error('Error updating entry:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update journal entry'
      };
    }
  }

  // Delete a journal entry
  async deleteEntry(entryId) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // First verify the entry exists and belongs to the user
      const entryCheck = await this.getEntry(entryId);
      if (!entryCheck.success) {
        return entryCheck;
      }

      await deleteDoc(doc(db, this.collectionName, entryId));

      return {
        success: true,
        message: 'Journal entry deleted successfully!'
      };
    } catch (error) {
      console.error('Error deleting entry:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete journal entry'
      };
    }
  }

  // Search entries by content
  async searchEntries(searchTerm, limitCount = 20) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for better search, consider using Algolia or similar
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const searchFields = [
          data.title,
          data.situation?.description,
          data.inquiry?.story,
          data.cognitive?.thoughts,
          data.integration?.insights
        ].filter(Boolean).join(' ').toLowerCase();

        if (searchFields.includes(searchTerm.toLowerCase())) {
          entries.push({
            id: doc.id,
            ...data
          });
        }
      });

      return {
        success: true,
        entries: entries,
        count: entries.length
      };
    } catch (error) {
      console.error('Error searching entries:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to search journal entries'
      };
    }
  }

  // Get entries by date range
  async getEntriesByDateRange(startDate, endDate, limitCount = 50) {
    try {
      const user = firebaseAuth.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', user.uid),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const entries = [];
      
      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        entries: entries,
        count: entries.length
      };
    } catch (error) {
      console.error('Error getting entries by date range:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve entries for date range'
      };
    }
  }
}

// Export singleton instance
export const firebaseJournal = new FirebaseJournalService();
export default firebaseJournal;