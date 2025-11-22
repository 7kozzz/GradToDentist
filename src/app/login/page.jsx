'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signin } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signin(email, password);
      
      // Check if admin and redirect accordingly
      if (email === 'omarhakeem@bytelyft.io') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
      console.error('Sign in error:', error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="absolute top-8 left-8">
        <Link href="/">
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
        <form className="w-full max-w-md space-y-6" onSubmit={handleSubmit}>
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
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#e4b8ae] focus:ring-1 focus:ring-[#e4b8ae] transition-colors pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-[#e4b8ae]" />
              ) : (
                <Eye className="w-5 h-5 text-[#e4b8ae]" />
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-[#e4b8ae] text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e4b8ae] text-white font-medium py-4 px-6 rounded-xl text-base hover:bg-[#d4a89e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Sign Up Button */}
          <Link href="/signup">
            <button
              type="button"
              className="w-full bg-[#e4b8ae] text-white font-medium py-4 px-6 rounded-xl text-base hover:bg-[#d4a89e] transition-colors"
            >
              Sign Up
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}