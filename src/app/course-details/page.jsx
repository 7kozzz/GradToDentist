'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Crown, Lock, PlayCircle, ArrowLeft, Clock, FileText, Download } from 'lucide-react';
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
        
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'Users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Check if subscription expired
          if (data.isPremium && data.renewDate) {
            const renewDate = data.renewDate.toDate();
            if (renewDate < new Date()) {
              router.push('/subscription-expired');
              return;
            }
          }
        }

        // Fetch course episodes from Firebase
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard">
          <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Course 1: Advanced Dental Procedures
          </h1>
          <p className="text-gray-600">
            Welcome back, {userData?.firstName || 'Student'}! 👋
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {episodes.length} episodes available
          </p>
        </div>

        {/* Premium Status Card */}
        <div className={`rounded-xl shadow-lg p-6 mb-8 ${
          userData?.isPremium 
            ? 'bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5]' 
            : 'bg-white border-2 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {userData?.isPremium ? (
                <Crown className="w-12 h-12 text-white" />
              ) : (
                <Lock className="w-12 h-12 text-gray-400" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${userData?.isPremium ? 'text-white' : 'text-gray-800'}`}>
                  {userData?.isPremium ? 'Premium Access Active' : 'Free User'}
                </h3>
                <p className={`text-sm ${userData?.isPremium ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                  {userData?.isPremium 
                    ? userData?.renewDate 
                      ? `Access until: ${userData.renewDate.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : 'Premium access active'
                    : 'Upgrade to access all episodes'
                  }
                </p>
              </div>
            </div>
            {!userData?.isPremium && (
              <Link href="/payment">
                <button className="bg-[#e4b8ae] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#d4a89e] transition-all shadow-md hover:shadow-lg">
                  Upgrade Now
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Course Episodes */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Episodes</h2>
          
          {episodes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-600">No episodes available yet.</p>
            </div>
          ) : (
            episodes.map((episode) => {
              const episodeNum = parseInt(episode.id);
              const isFree = episodeNum === 1;
              const canAccess = isFree || userData?.isPremium;

              return (
                <Link 
                  key={episode.docId}
                  href={canAccess ? `/course1/episode${episodeNum}` : '#'}
                  onClick={(e) => {
                    if (!canAccess) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className={`bg-white rounded-xl shadow-md p-6 transition-all border-2 ${
                    canAccess 
                      ? 'hover:shadow-lg cursor-pointer border-transparent hover:border-[#e4b8ae]' 
                      : 'opacity-60 cursor-not-allowed border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isFree 
                            ? 'bg-green-100'
                            : canAccess 
                              ? 'bg-[#f7ccc5]' 
                              : 'bg-gray-100'
                        }`}>
                          {canAccess ? (
                            <PlayCircle className={`w-8 h-8 ${isFree ? 'text-green-600' : 'text-[#e4b8ae]'}`} />
                          ) : (
                            <Lock className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {episode.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {episode.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {episode.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{episode.duration}</span>
                              </div>
                            )}
                            {episode.pdf && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                <span>PDF included</span>
                              </div>
                            )}
                            {episode.zip && (
                              <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                <span>Files included</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isFree ? (
                          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                            FREE
                          </span>
                        ) : (
                          <span className="bg-[#f7ccc5] text-[#e4b8ae] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                            <Crown className="w-4 h-4" />
                            PREMIUM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* CTA for Free Users */}
        {!userData?.isPremium && (
          <div className="mt-8 bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5] rounded-xl p-8 text-center">
            <Crown className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Unlock All Episodes</h3>
            <p className="text-white text-opacity-90 mb-6">
              Get unlimited access to all episodes for 3 months
            </p>
            <Link href="/payment">
              <button className="bg-white text-[#e4b8ae] px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-lg text-lg">
                Upgrade to Premium - 299 SAR
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}