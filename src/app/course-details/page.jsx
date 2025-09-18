'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Clock, Play, Lock, CheckCircle, Star, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetails() {
  const [courses, setCourses] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser, userDoc, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    // If user is premium, redirect to dashboard
    if (userDoc?.isPremium) {
      router.push('/dashboard');
      return;
    }
    
    fetchCourseData();
    fetchPricing();
  }, [currentUser, userDoc, router]);

  async function fetchCourseData() {
    try {
      console.log('Fetching course data...');
      // First, try without orderBy in case "order" field doesn't exist
      const querySnapshot = await getDocs(collection(db, 'Course1'));
      console.log('Query snapshot size:', querySnapshot.size);
      
      const coursesData = querySnapshot.docs.map(doc => {
        console.log('Course doc:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      });
      
      // Sort manually if order field exists, otherwise by id
      coursesData.sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return a.id.localeCompare(b.id);
      });
      
      console.log('Courses data:', coursesData);
      setCourses(coursesData);
    } catch (error) {
      setError('Failed to load course data: ' + error.message);
      console.error('Error fetching courses:', error);
    }
  }

  async function fetchPricing() {
    try {
      const docRef = doc(db, 'Course1Pricing', 'kYeng6r86NpQHxgKKbDC');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPricing(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(duration) {
    if (!duration) return '00:00';
    
    // If duration is already a string in MM:SS format, return it
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    
    // If duration is a number (seconds), convert to MM:SS
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return '00:00';
  }

  function getTotalDuration() {
    let totalSeconds = 0;
    
    courses.forEach(course => {
      if (course.duration) {
        if (typeof course.duration === 'string' && course.duration.includes(':')) {
          // Convert MM:SS string to seconds
          const [minutes, seconds] = course.duration.split(':').map(Number);
          totalSeconds += (minutes * 60) + seconds;
        } else if (typeof course.duration === 'number') {
          totalSeconds += course.duration;
        }
      }
    });
    
    return totalSeconds;
  }

  function formatTotalDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function handlePayment() {
    // Redirect to payment page or integrate your payment gateway
    router.push('/payment');
  }

  async function handleLogout() {
    try {
      await logout();
      // Small delay to ensure Firebase auth state is cleared
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7ccc5]">
      {/* Header */}
      <div className="bg-[#e4b8ae] px-4 py-4 flex items-center justify-between">
        <div className="w-6 h-6"></div> {/* Left spacer */}
        <h1 className="text-white text-lg font-medium">Course Details</h1>
        <button onClick={handleLogout} className="p-1">
          <LogOut className="w-6 h-6 text-white cursor-pointer hover:opacity-70 transition-opacity" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 pb-24">{/* Added pb-24 for bottom padding */}
        {/* Course Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Complete Dental Procedures & Techniques
          </h2>
          
          {/* Course Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1 text-blue-500">
              <Play className="w-4 h-4" />
              <span>{courses.length} Episodes</span>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Clock className="w-4 h-4" />
              <span>{formatTotalDuration(getTotalDuration())}</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Star className="w-4 h-4" />
              <span>Premium</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Master essential dental procedures through comprehensive video tutorials designed for dental students and practicing professionals. This course covers fundamental to advanced techniques used in modern dental practice.
          </p>

          {/* What you'll learn */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What you'll learn:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Professional dental procedures and techniques</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Root Canal Therapy (RCT) with rotary instruments</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Patient management and communication skills</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Modern dental materials and equipment usage</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Clinical best practices and safety protocols</span>
              </div>
            </div>
          </div>

          {/* Premium Access Required Banner */}
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800 font-medium">Premium Access Required</span>
          </div>
        </div>

        {/* Episodes List Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Course Episodes ({courses.length})</h3>
          </div>

          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={course.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Episode {course.order || index + 1}: {course.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {course.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDuration(course.duration)}
                  </span>
                </div>
                <Lock className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handlePayment}
          className="w-full bg-[#e4b8ae] text-white font-medium py-4 rounded-xl text-base hover:bg-[#d4a89e] transition-colors flex items-center justify-center gap-2"
        >
          <span>💳</span>
          <span>Unlock {pricing?.Price || '649.00'} SAR</span>
        </button>
      </div>
    </div>
  );
}