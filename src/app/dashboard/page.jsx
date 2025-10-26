'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Play, Clock, CheckCircle, LogOut, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [episodes, setEpisodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { currentUser, userDoc, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (userDoc && userDoc.isPremium === false) {
      if (userDoc.subscriptionExpired) {
        router.push('/subscription-expired')
        return
      }
      router.push('/course-details')
      return
    }

    if (userDoc?.isPremium && userDoc.renewDate) {
      const renewDate = userDoc.renewDate.toDate()
      const now = new Date()
      
      if (renewDate < now) {
        router.push('/subscription-expired')
        return
      }
    }

    if (userDoc?.isPremium) {
      fetchEpisodes()
    }
  }, [currentUser, userDoc, router])

  async function fetchEpisodes() {
    try {
      const querySnapshot = await getDocs(collection(db, 'Course1'))
      const episodesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      episodesData.sort((a, b) => (a.order || 0) - (b.order || 0))
      
      setEpisodes(episodesData)
    } catch (error) {
      setError('Failed to load episodes')
      console.error('Error fetching episodes:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDuration(duration) {
    if (!duration) return '00:00'
    
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration
    }
    
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    return '00:00'
  }

  function getDaysRemaining() {
    if (!userDoc?.renewDate) return null
    
    const renewDate = userDoc.renewDate.toDate()
    const now = new Date()
    const diffTime = renewDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  async function handleLogout() {
    try {
      await logout()
      setTimeout(() => {
        router.push('/')
      }, 100)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="min-h-screen bg-[#f7ccc5]">
      <div className="bg-[#e4b8ae] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-lg font-medium">My Courses</h1>
          <button onClick={handleLogout} className="p-1">
            <LogOut className="w-6 h-6 text-white cursor-pointer hover:opacity-70 transition-opacity" />
          </button>
        </div>

        {daysRemaining !== null && (
          <div className={`rounded-lg p-3 flex items-center gap-2 ${
            daysRemaining <= 7 
              ? 'bg-orange-100 border border-orange-300' 
              : 'bg-white/20'
          }`}>
            <AlertCircle className={`w-4 h-4 ${
              daysRemaining <= 7 ? 'text-orange-600' : 'text-white'
            }`} />
            <span className={`text-sm font-medium ${
              daysRemaining <= 7 ? 'text-orange-800' : 'text-white'
            }`}>
              {daysRemaining <= 0 
                ? 'Subscription expired' 
                : `${daysRemaining} days remaining in your subscription`}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">Premium Member</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Welcome back, {userDoc?.firstName || 'Student'}!
          </h2>
          <p className="text-gray-600 text-sm">
            Continue your learning journey with complete access to all course materials.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-[#e4b8ae]" />
            <h3 className="font-semibold text-gray-900">Course Episodes ({episodes.length})</h3>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {episodes.map((episode, index) => (
              <Link key={episode.id} href={`/watch/${episode.id}`}>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#e4b8ae] hover:bg-[#f7ccc5]/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-[#e4b8ae] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold">{episode.order || index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-1 truncate">
                      {episode.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {episode.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {formatDuration(episode.duration)}
                      </span>
                    </div>
                  </div>

                  <Play className="w-6 h-6 text-[#e4b8ae] flex-shrink-0 group-hover:scale-110 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {userDoc?.renewDate && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Subscription Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Renewal Date:</span>
                <span className="text-gray-900 font-medium">
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).format(userDoc.renewDate.toDate())}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}