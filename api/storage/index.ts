import { IStorage } from '../storage.js';
import { firestoreStorage } from '../firestore-storage.js';

// Export the Firestore storage implementation
export const storage: IStorage = firestoreStorage; 