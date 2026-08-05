import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Configuração do Firebase.
 * IMPORTANTE: Substituir pelos valores reais do projeto Firebase.
 * Os valores abaixo são placeholders — NÃO funcionarão em produção.
 */
const firebaseConfig = {
  apiKey: 'AIzaSy_PLACEHOLDER_KEY',
  authDomain: 'taverna-dos-templarios.firebaseapp.com',
  projectId: 'taverna-dos-templarios',
  storageBucket: 'taverna-dos-templarios.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:placeholder',
  measurementId: 'G-PLACEHOLDER',
};

// Inicializa Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

/**
 * Inicializa todos os serviços do Firebase.
 * Deve ser chamado uma vez no boot do aplicativo.
 */
export function initFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
} {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();

  // Configurações do Google Provider
  googleProvider.addScope('profile');
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });

  console.log('[Firebase] Inicializado com sucesso');

  return { app, auth, db, googleProvider };
}

/**
 * Retorna a instância do Firebase Auth.
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase não inicializado. Chame initFirebase() primeiro.');
  }
  return auth;
}

/**
 * Retorna a instância do Firestore.
 */
export function getFirebaseDB(): Firestore {
  if (!db) {
    throw new Error('Firebase não inicializado. Chame initFirebase() primeiro.');
  }
  return db;
}

/**
 * Retorna o Google Auth Provider.
 */
export function getGoogleProvider(): GoogleAuthProvider {
  if (!googleProvider) {
    throw new Error('Firebase não inicializado. Chame initFirebase() primeiro.');
  }
  return googleProvider;
}
