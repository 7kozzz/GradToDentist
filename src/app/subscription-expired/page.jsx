'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AlertCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionExpired() {
  const { currentUser, userDoc } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }

    if (userDoc?.isPremium) {
      const renewDate = userDoc.renewDate?.toDate()
      if (renewDate && renewDate > new Date()) {
        router.push('/dashboard')
        return
      }
    }
  }, [currentUser, userDoc, router])

  return (
    <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Subscription Expired
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Your premium subscription has expired. Renew now to continue accessing all premium content.
        </p>

        <div className="bg-[#f7ccc5] rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-700 font-medium mb-2">Premium benefits:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Full access to all course episodes</li>
            <li>• Downloadable materials</li>
            <li>• Premium support</li>
            <li>• 3 months of unlimited access</li>
          </ul>
        </div>

        <Link href="/payment">
          <button className="w-full bg-[#e4b8ae] text-white font-medium py-4 rounded-xl text-base hover:bg-[#d4a89e] transition-colors flex items-center justify-center gap-2 mb-3">
            <CreditCard className="w-5 h-5" />
            <span>Renew Subscription - 649.00 SAR</span>
          </button>
        </Link>

        <Link href="/">
          <button className="w-full text-gray-600 font-medium py-3 rounded-xl text-base hover:text-gray-800 transition-colors">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  )
}