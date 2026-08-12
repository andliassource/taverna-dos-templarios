import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, Auth,
  signInWithPopup, signOut, onAuthStateChanged, User,
} from 'firebase/auth';
import {
  getFirestore, Firestore,
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { SaveData, SaveManager } from '../systems/SaveManager';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

const isConfigured = !!firebaseConfig.apiKey;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

if (isConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
}

export const FirebaseService = {
  get isAvailable(): boolean {
    return isConfigured;
  },

  get currentUser(): User | null {
    return isConfigured ? auth.currentUser : null;
  },

  onAuthChange(callback: (user: User | null) => void): () => void {
    if (!isConfigured) { callback(null); return () => {}; }
    return onAuthStateChanged(auth, callback);
  },

  async loginWithGoogle(): Promise<User | null> {
    if (!isConfigured) return null;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (e) {
      console.warn('[Firebase] Login falhou:', e);
      return null;
    }
  },

  async logout(): Promise<void> {
    if (!isConfigured) return;
    await signOut(auth);
  },

  async saveToCloud(data: SaveData): Promise<void> {
    if (!isConfigured || !auth.currentUser) return;
    try {
      const ref = doc(db, 'saves', auth.currentUser.uid);
      await setDoc(ref, { ...data, savedAt: serverTimestamp() });
    } catch (e) {
      console.warn('[Firebase] Falha ao salvar na nuvem:', e);
    }
  },

  async loadFromCloud(): Promise<SaveData | null> {
    if (!isConfigured || !auth.currentUser) return null;
    try {
      const ref = doc(db, 'saves', auth.currentUser.uid);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as SaveData) : null;
    } catch (e) {
      console.warn('[Firebase] Falha ao carregar da nuvem:', e);
      return null;
    }
  },

  /** Salva local + nuvem (nuvem é best-effort) */
  async save(data: Omit<SaveData, 'version' | 'savedAt'>): Promise<void> {
    const uid = auth?.currentUser?.uid;
    const displayName = auth?.currentUser?.displayName ?? undefined;
    SaveManager.save({ ...data, uid, displayName });
    if (uid) {
      const full = SaveManager.load()!;
      await this.saveToCloud(full);
    }
  },

  /** Carrega: prefere nuvem se logado, fallback para local */
  async load(): Promise<SaveData | null> {
    if (isConfigured && auth?.currentUser) {
      const cloud = await this.loadFromCloud();
      if (cloud) {
        SaveManager.save(cloud); // sincroniza local
        return cloud;
      }
    }
    return SaveManager.load();
  },
};
