'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    graduationYear: '',
    birthday: null
  });
  
  // Date picker state
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(1991);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup } = useAuth();
  const router = useRouter();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const years = Array.from({ length: 80 }, (_, i) => 2024 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Create birthday date object
      const birthday = new Date(selectedYear, months.indexOf(selectedMonth), selectedDay);
      
      await signup(formData.email, formData.password, fullName);
      setSuccess('Account created successfully! Please check your email to verify your account.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setError('Failed to create account. ' + error.message);
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Created Successfully!</h2>
          <p className="text-gray-600 mb-6">{success}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center mb-6 max-w-md w-full">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="w-full max-w-2xl space-y-6" onSubmit={handleSubmit}>
          {/* First Name and Last Name */}
          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="flex-1 px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#e4b8ae] focus:ring-1 focus:ring-[#e4b8ae] transition-colors"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="flex-1 px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#e4b8ae] focus:ring-1 focus:ring-[#e4b8ae] transition-colors"
            />
          </div>

          {/* Date of Birth - Cupertino Style */}
          <div className="space-y-3">
            <div className="bg-white border border-gray-300 rounded-xl p-4">
              <div className="text-gray-500 text-base mb-3">Date Of Birth</div>
              <div className="flex justify-center items-center gap-2">
                {/* Month Picker */}
                <div className="flex-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-transparent text-center text-gray-700 focus:outline-none appearance-none cursor-pointer py-2"
                    style={{ WebkitAppearance: 'none' }}
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Picker */}
                <div className="flex-1">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                    className="w-full bg-transparent text-center text-gray-700 focus:outline-none appearance-none cursor-pointer py-2"
                    style={{ WebkitAppearance: 'none' }}
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Picker */}
                <div className="flex-1">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full bg-transparent text-center text-gray-700 focus:outline-none appearance-none cursor-pointer py-2"
                    style={{ WebkitAppearance: 'none' }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#e4b8ae] focus:ring-1 focus:ring-[#e4b8ae] transition-colors"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
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

          {/* Graduation Year */}
          <input
            type="text"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            placeholder="Date Of Graduation"
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#e4b8ae] focus:ring-1 focus:ring-[#e4b8ae] transition-colors"
          />

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e4b8ae] text-white font-medium py-4 px-6 rounded-xl text-base hover:bg-[#d4a89e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Login Button */}
          <Link href="/login">
            <button
              type="button"
              className="w-full bg-[#e4b8ae] text-white font-medium py-4 px-6 rounded-xl text-base hover:bg-[#d4a89e] transition-colors"
            >
              Login
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}