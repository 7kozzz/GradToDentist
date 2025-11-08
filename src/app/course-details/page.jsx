'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Play, Clock, FileText, Download, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetails() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const userDocRef = doc(db, 'Users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          if (data.isPremium && data.renewDate) {
            const renewDate = data.renewDate.toDate();
            if (renewDate < new Date()) {
              router.push('/subscription-expired');
              return;
            }
          }

          if (data.isPremium) {
            router.push('/dashboard');
            return;
          }
        }

        await fetchEpisodes();
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchEpisodes = async () => {
    try {
      const episodesRef = collection(db, 'Course1');
      const q = query(episodesRef, orderBy('id', 'asc'));
      const snapshot = await getDocs(q);
      
      const episodesData = [];
      snapshot.forEach((doc) => {
        episodesData.push({
          docId: doc.id,
          ...doc.data()
        });
      });
      
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7ccc5]">
      {/* Header - Mobile Responsive */}
      <div className="bg-[#e4b8ae] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Course 1</h1>
            <p className="text-xs sm:text-sm text-white text-opacity-90 truncate">
              Welcome, {userData?.firstName || 'Student'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white text-[#e4b8ae] rounded-lg transition-colors hover:bg-opacity-90 font-medium text-sm ml-2 flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Premium Required Card - Mobile Responsive */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#e4b8ae] rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Premium Subscription Required
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 px-2">
            Get unlimited access to all course episodes for 3 months
          </p>
          
          <div className="bg-[#f7ccc5] rounded-xl p-4 sm:p-6 mb-6 max-w-md mx-auto">
            <div className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">649.00 SAR</div>
            <div className="text-xs sm:text-sm text-gray-600">3 months access • All episodes</div>
          </div>

          <Link href="/payment">
            <button className="w-full sm:w-auto bg-[#e4b8ae] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-[#d4a89e] transition-colors shadow-md">
              Subscribe Now
            </button>
          </Link>
        </div>

        {/* Course Content Preview - Mobile Responsive */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">What's Included</h3>
          <div className="grid gap-3 sm:gap-4">
            {episodes.map((episode) => (
              <div
                key={episode.docId}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 opacity-75"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                      {episode.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                      {episode.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                      {episode.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{episode.duration}</span>
                        </div>
                      )}
                      {episode.pdf && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>PDF</span>
                        </div>
                      )}
                      {episode.zip && (
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Files</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 text-[#e4b8ae] font-bold text-xs sm:text-sm flex-shrink-0">
                    <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">PREMIUM</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}