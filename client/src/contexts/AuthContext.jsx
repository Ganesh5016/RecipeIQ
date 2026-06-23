import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, sendPasswordResetEmail, updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase.js';
import { authAPI } from '../services/api.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (firebaseUser) => {
    if (!firebaseUser) { setDbUser(null); return; }
    try {
      const { user: existing } = await authAPI.getMe().catch(() => ({ user: null }));
      if (existing) { setDbUser(existing); return; }
      const { user: created } = await authAPI.register({
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL || '',
      });
      setDbUser(created);
    } catch (err) {
      console.error('User sync error:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await syncUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [syncUser]);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await authAPI.updateLogin();
    return cred;
  };

  const register = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await authAPI.register({ firebaseUid: cred.user.uid, name, email, avatar: '' });
    return cred;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred;
  };

  const logout = async () => {
    await signOut(auth);
    setDbUser(null);
    toast.success('Logged out successfully');
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const updateDbUser = (updates) => setDbUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{
      user, dbUser, loading, login, register, loginWithGoogle, logout, resetPassword, updateDbUser, syncUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
