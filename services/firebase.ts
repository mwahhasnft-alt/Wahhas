import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, UserRole } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Error handling helper
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or waiting for network connection.');
      return false;
    }
    // If permission denied on test doc, that is expected because test isn't in allow rules,
    // which confirms server reachability
    return true;
  }
}
testConnection();

// --- Auth Utilities ---
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await syncUserProfile(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// --- User Profile Operations ---
export async function syncUserProfile(fbUser: FirebaseUser, roleOverride?: UserRole): Promise<void> {
  const path = `users/${fbUser.uid}`;
  const userRef = doc(db, 'users', fbUser.uid);
  try {
    const snapshot = await getDoc(userRef);
    const existing = snapshot.exists() ? snapshot.data() : null;
    const role: UserRole = roleOverride || (existing?.role as UserRole) || (fbUser.email === 'm-w781@hotmail.com' ? 'admin' : 'buyer');

    const profileData = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      phone: fbUser.phoneNumber || existing?.phone || '',
      role: role,
      photoURL: fbUser.photoURL || '',
      updatedAt: serverTimestamp(),
      ...(!snapshot.exists() ? { createdAt: serverTimestamp() } : {})
    };

    await setDoc(userRef, profileData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        avatar: data.photoURL || '',
        role: (data.role as UserRole) || 'buyer'
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// --- Saved Properties ---
export async function savePropertyToFirestore(userId: string, property: any): Promise<void> {
  const docId = `${userId}_${property.id}`;
  const path = `saved_properties/${docId}`;
  try {
    await setDoc(doc(db, 'saved_properties', docId), {
      id: docId,
      userId,
      propertyId: property.id,
      title: property.title || 'Untitled',
      price: property.price || 0,
      city: property.city || 'Riyadh',
      type: property.type || 'Villa',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeSavedPropertyFromFirestore(userId: string, propertyId: string): Promise<void> {
  const docId = `${userId}_${propertyId}`;
  const path = `saved_properties/${docId}`;
  try {
    await deleteDoc(doc(db, 'saved_properties', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getSavedPropertiesFromFirestore(userId: string): Promise<string[]> {
  const path = 'saved_properties';
  try {
    const q = query(collection(db, 'saved_properties'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const ids: string[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.propertyId) ids.push(data.propertyId);
    });
    return ids;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// --- Chat Sessions Persistence ---
export async function persistChatSession(userId: string, sessionId: string, title: string, mode: string): Promise<void> {
  const path = `chat_sessions/${sessionId}`;
  try {
    await setDoc(doc(db, 'chat_sessions', sessionId), {
      id: sessionId,
      userId,
      title: title.slice(0, 250),
      mode: ['smart', 'fast', 'thinking', 'search', 'maps', 'science'].includes(mode) ? mode : 'smart',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function persistChatMessage(
  userId: string,
  sessionId: string,
  messageId: string,
  role: 'user' | 'model',
  content: string,
  extra?: { groundingSources?: any[]; scienceData?: any }
): Promise<void> {
  const path = `chat_sessions/${sessionId}/messages/${messageId}`;
  try {
    const docData: any = {
      id: messageId,
      sessionId,
      userId,
      role,
      content: content.slice(0, 19500),
      createdAt: serverTimestamp()
    };
    if (extra?.groundingSources) docData.groundingSources = extra.groundingSources;
    if (extra?.scienceData) docData.scienceData = extra.scienceData;

    await setDoc(doc(db, 'chat_sessions', sessionId, 'messages', messageId), docData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function loadUserChatSessions(userId: string): Promise<any[]> {
  const path = 'chat_sessions';
  try {
    const q = query(collection(db, 'chat_sessions'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const sessions: any[] = [];
    for (const sessionDoc of snapshot.docs) {
      const sData = sessionDoc.data();
      const messagesSnapshot = await getDocs(
        collection(db, 'chat_sessions', sessionDoc.id, 'messages')
      );
      const messages: any[] = [];
      messagesSnapshot.forEach(mDoc => {
        const mData = mDoc.data();
        messages.push({
          id: mData.id || mDoc.id,
          role: mData.role,
          content: mData.content,
          timestamp: mData.createdAt?.toDate ? mData.createdAt.toDate() : new Date(),
          groundingSources: mData.groundingSources,
          scienceData: mData.scienceData
        });
      });
      // Sort messages
      messages.sort((a, b) => (a.timestamp?.getTime?.() || 0) - (b.timestamp?.getTime?.() || 0));

      sessions.push({
        id: sessionDoc.id,
        title: sData.title || 'Chat',
        updatedAt: sData.updatedAt?.toMillis ? sData.updatedAt.toMillis() : Date.now(),
        messages
      });
    }
    return sessions;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// --- Consultation Inquiries ---
export async function submitConsultationInquiry(inquiry: {
  userId: string;
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  message?: string;
}): Promise<string> {
  const id = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `inquiries/${id}`;
  try {
    await setDoc(doc(db, 'inquiries', id), {
      id,
      userId: inquiry.userId,
      propertyId: inquiry.propertyId,
      propertyTitle: inquiry.propertyTitle,
      userName: inquiry.userName,
      userPhone: inquiry.userPhone || '',
      userEmail: inquiry.userEmail || '',
      message: inquiry.message || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
