'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Clock, FileText, Download, LogOut, Tag, AlertCircle, CheckCircle } from 'lucide-react';

export default function CourseDetails() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValidation, setCodeValidation] = useState(null); // { valid: boolean, message: string, percentage: string }
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const router = useRouter();

  const FULL_PRICE = 649.00;

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
      const snapshot = await getDocs(episodesRef);
      
      const episodesData = [];
      snapshot.forEach((doc) => {
        episodesData.push({
          docId: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by order if available, otherwise by id
      episodesData.sort((a, b) => {
        if (a.order && b.order) return a.order - b.order;
        return (a.id || a.docId).localeCompare(b.id || b.docId);
      });
      
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setCodeValidation(null);
      setDiscountedPrice(null);
      return;
    }

    setValidatingCode(true);
    
    try {
      // Query DiscountCodes collection
      const codesRef = collection(db, 'DiscountCodes');
      const q = query(
        codesRef,
        where('title', '==', promoCode.trim()),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setCodeValidation({
          valid: false,
          message: 'Invalid or already used promo code',
          percentage: null
        });
        setDiscountedPrice(null);
      } else {
        const codeDoc = snapshot.docs[0];
        const codeData = codeDoc.data();
        const percentage = codeData.percentage;
        
        // Calculate discounted price
        const discount = (FULL_PRICE * parseFloat(percentage)) / 100;
        const finalPrice = FULL_PRICE - discount;
        
        setCodeValidation({
          valid: true,
          message: `${percentage}% discount applied!`,
          percentage: percentage,
          codeDocId: codeDoc.id
        });
        setDiscountedPrice(finalPrice);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setCodeValidation({
        valid: false,
        message: 'Error validating code. Please try again.',
        percentage: null
      });
      setDiscountedPrice(null);
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubscribe = async () => {
    setProcessingPayment(true);
    
    try {
      let paymentLink = '';
      let percentageToFind = "0"; // Default to full price
      
      // If there's a valid promo code, use its percentage
      if (codeValidation?.valid && codeValidation.percentage) {
        percentageToFind = codeValidation.percentage;
        
        // Mark the discount code as used (set isActive to false)
        const codeDocRef = doc(db, 'DiscountCodes', codeValidation.codeDocId);
        await updateDoc(codeDocRef, {
          isActive: false
        });
      }
      
      // Query Discounts collection for the payment link
      const discountsRef = collection(db, 'Discounts');
      const q = query(
        discountsRef,
        where('percentage', '==', percentageToFind)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const discountDoc = snapshot.docs[0];
        paymentLink = discountDoc.data().link;
      } else {
        // Fallback: if no link found for the percentage, try to get full price link
        const fallbackQuery = query(
          discountsRef,
          where('percentage', '==', "0")
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        if (!fallbackSnapshot.empty) {
          paymentLink = fallbackSnapshot.docs[0].data().link;
        } else {
          throw new Error('No payment link found');
        }
      }
      
      // Redirect to payment link
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Invalid payment link');
      }
      
    } catch (error) {
      console.error('Error processing subscription:', error);
      alert('Error processing payment. Please try again or contact support.');
      setProcessingPayment(false);
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
      <div className="min-h-screen bg-[#f7ccc5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7ccc5]">
      {/* Header */}
      <div className="bg-[#e4b8ae] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white text-opacity-90">
              Welcome, {userData?.firstName || 'Student'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#e4b8ae] rounded-lg transition-colors hover:bg-opacity-90 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Premium Required Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <div className="w-20 h-20 bg-[#e4b8ae] rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Premium Subscription Required
          </h2>
          <p className="text-gray-600 mb-6">
            Get unlimited access to all course episodes for 3 months
          </p>
          
          {/* Promo Code Section */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-[#e4b8ae]" />
              <label className="text-sm font-medium text-gray-700">
                Have a promo code?
              </label>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setCodeValidation(null);
                  setDiscountedPrice(null);
                }}
                placeholder="Enter promo code"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e4b8ae] focus:border-transparent text-gray-900 placeholder-gray-400 uppercase"
                disabled={validatingCode || processingPayment}
              />
              <button
                onClick={validatePromoCode}
                disabled={!promoCode.trim() || validatingCode || processingPayment}
                className="px-6 py-3 bg-[#e4b8ae] text-white rounded-lg hover:bg-[#d4a89e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {validatingCode ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
            
            {/* Validation Message */}
            {codeValidation && (
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                codeValidation.valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {codeValidation.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className={`text-sm font-medium ${
                  codeValidation.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {codeValidation.message}
                </span>
              </div>
            )}
          </div>
          
          {/* Price Display */}
          <div className="bg-[#f7ccc5] rounded-xl p-6 mb-6 max-w-md mx-auto">
            {discountedPrice ? (
              <>
                <div className="text-2xl font-bold text-gray-400 line-through mb-1">
                  {FULL_PRICE.toFixed(2)} SAR
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">
                  {discountedPrice.toFixed(2)} SAR
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-2">
                  Save {(FULL_PRICE - discountedPrice).toFixed(2)} SAR ({codeValidation.percentage}% off)
                </div>
              </>
            ) : (
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {FULL_PRICE.toFixed(2)} SAR
              </div>
            )}
            <div className="text-sm text-gray-600">3 months access • All episodes</div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={processingPayment}
            className="bg-[#e4b8ae] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#d4a89e] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPayment ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              'Subscribe Now'
            )}
          </button>
        </div>

        {/* Course Content Preview */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">What's Included</h3>
          <div className="grid gap-4">
            {episodes.map((episode) => (
              <div
                key={episode.docId}
                className="bg-white rounded-xl shadow-sm p-6 opacity-75"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                      {episode.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{episode.description}</p>
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
                  <div className="flex items-center gap-2 text-[#e4b8ae] font-bold text-sm">
                    <Crown className="w-4 h-4" />
                    <span>PREMIUM</span>
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