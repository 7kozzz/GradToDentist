'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { currentUser, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        // Not logged in - redirect to login
        router.push('/login');
      } else if (!userDoc?.isPremium) {
        // Logged in but not premium - redirect to course details
        router.push('/course-details');
      } else {
        // Premium user - redirect to premium dashboard (we'll create this later)
        router.push('/premium-dashboard');
      }
    }
  }, [currentUser, userDoc, loading, router]);

  // Loading state
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e4b8ae] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}