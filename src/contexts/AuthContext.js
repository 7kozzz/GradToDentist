'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  async function signup(email, password, fullName) {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(user, { displayName: fullName });
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'Users', user.uid), {
        email: email,
        firstName: fullName.split(' ')[0] || fullName,
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        birthday: null,
        graduationYear: '',
        isPremium: false,
        joinedAt: new Date()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Sign in function
  async function signin(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Sign out function
  async function logout() {
    try {
      await signOut(auth);
      setUserDoc(null);
    } catch (error) {
      throw error;
    }
  }

  // Update user premium status
  async function updateUserPremium(status) {
    try {
      if (currentUser) {
        const userRef = doc(db, 'Users', currentUser.uid);
        await updateDoc(userRef, {
          isPremium: status,
          premiumActivatedAt: status ? new Date() : null
        });
        
        // Refresh user doc
        await fetchUserDoc(currentUser.uid);
      }
    } catch (error) {
      throw error;
    }
  }

  // Fetch user document from Firestore
  async function fetchUserDoc(uid) {
    try {
      const docRef = doc(db, 'Users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDoc(docSnap.data());
        return docSnap.data();
      }
    } catch (error) {
      console.error('Error fetching user doc:', error);
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserDoc(user.uid);
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userDoc,
    signup,
    signin,
    logout,
    updateUserPremium,
    fetchUserDoc,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}