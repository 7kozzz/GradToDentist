'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link href="/login">
          <div className="w-16 h-16 bg-[#f7ccc5] rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#e4b8ae] transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 py-12">
        {/* Logo */}
        <div className="mb-16">
          <Image src="/logo.png" alt="DrMaha Logo" width={160} height={160} />
        </div>

        {/* Form */}
        <form className="w-full max-w-md space-y-6" onSubmit={handleResetPassword}>
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
            Reset Your Password
          </h2>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
              {message}
              <p className="mt-2 text-xs">
                Please check your spam or junk folder if you don't see the email.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#e4b8ae] focus:ring-1 focus:ring-[#e4b8ae] transition-colors"
              required
            />
          </div>

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e4b8ae] text-white font-medium py-4 px-6 rounded-xl text-base hover:bg-[#d4a89e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link href="/login" className="text-[#e4b8ae] text-sm hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}