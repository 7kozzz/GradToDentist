'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ArrowLeft, CreditCard, Lock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function Payment() {
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const { currentUser, userDoc } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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

    checkPaymentStatus()
  }, [currentUser, userDoc, router, searchParams])

  async function checkPaymentStatus() {
    // Log all parameters to see what PayTabs actually sends
    console.log('All URL parameters:', Array.from(searchParams.entries()))
    
    // Check for success parameter
    const success = searchParams.get('success')
    const tranRef = searchParams.get('tranRef')
    const cartId = searchParams.get('cartId')
    
    console.log('Payment success:', success)
    console.log('Transaction ref:', tranRef)
    console.log('Cart ID:', cartId)
    
    // Check if payment was successful
    if (success === 'true' && currentUser) {
      setProcessingPayment(true)
      try {
        const userRef = doc(db, 'Users', currentUser.uid)
        const renewDate = new Date()
        renewDate.setMonth(renewDate.getMonth() + 3)

        await updateDoc(userRef, {
          isPremium: true,
          renewDate: renewDate,
          paymentDate: new Date(),
          transactionId: tranRef || 'completed',
          cartId: cartId || null,
          paymentCompleted: true
        })

        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (error) {
        console.error('Error updating user:', error)
        alert('Payment was successful but there was an error updating your account. Please contact support.')
      }
    } else if (success === 'false') {
      alert('Payment was not successful. Please try again.')
    }
  }

  function handlePayment() {
    setLoading(true)
    window.location.href = 'https://secure.clickpay.com.sa/payment/link/47313/393283'
  }

  if (processingPayment) {
    return (
      <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been upgraded to Premium. Redirecting to dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e4b8ae] mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7ccc5]">
      <div className="bg-[#e4b8ae] px-4 py-4 flex items-center justify-between">
        <Link href="/course-details">
          <ArrowLeft className="w-6 h-6 text-white cursor-pointer" />
        </Link>
        <h1 className="text-white text-lg font-medium">Complete Payment</h1>
        <div className="w-6 h-6"></div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-[#e4b8ae]" />
            <h2 className="text-xl font-bold text-gray-900">Premium Access</h2>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's included:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Full access to all course episodes</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Lifetime access to course materials</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Download supplementary materials</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Premium support access</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">3 months premium membership</span>
              </div>
            </div>
          </div>

          <div className="bg-[#f7ccc5] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Course Price</span>
              <span className="text-2xl font-bold text-gray-900">649.00 SAR</span>
            </div>
            <p className="text-sm text-gray-600">One-time payment for 3 months access</p>
          </div>

          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium mb-1">Secure Payment</p>
              <p className="text-xs text-blue-700">
                Your payment is processed securely through PayTabs. We never store your card details.
              </p>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#e4b8ae] text-white font-medium py-4 rounded-xl text-base hover:bg-[#d4a89e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Proceed to Payment</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}