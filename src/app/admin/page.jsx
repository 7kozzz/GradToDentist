'use client';

import React, { useState, useEffect } from 'react';
import { User, DollarSign, Crown, Users, Mail, Calendar, Check, X, TrendingUp, Trash2, Plus, Tag, Percent, LogOut } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [stats, setStats] = useState({ totalSales: 0, premiumUsers: 0, totalUsers: 0, freeUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    percentage: '50',
    isActive: true
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
        //const adminCheck = user.email === 'mahaalsehli@hotmail.com';
        const adminCheck = user.email === 'omarhakeem@bytelyft.io';
        setIsAdmin(adminCheck);
        
        if (adminCheck) {
          if (activeTab === 'users') {
            fetchUsers();
          } else {
            fetchCodes();
          }
        } else {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'Users');
      const snapshot = await getDocs(usersRef);
      
      const usersData = [];
      let totalSalesAmount = 0;
      let premiumCount = 0;

      snapshot.forEach((docSnap) => {
        const userData = { id: docSnap.id, ...docSnap.data() };
        usersData.push(userData);
        
        if (userData.isPremium) {
          premiumCount++;
        }
        
        if (userData.paymentCompleted) {
          totalSalesAmount += 1;
        }
      });

      setUsers(usersData);
      setStats({
        totalSales: totalSalesAmount,
        premiumUsers: premiumCount,
        totalUsers: usersData.length,
        freeUsers: usersData.length - premiumCount
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users: ' + error.message);
      setLoading(false);
    }
  };

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'DiscountCodes'));
      const codesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      codesData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setCodes(codesData);
    } catch (error) {
      console.error('Error fetching codes:', error);
      alert('Error loading discount codes');
    } finally {
      setLoading(false);
    }
  };

  const togglePremium = async (userId, currentStatus) => {
    try {
      setUpdating(userId);
      const userRef = doc(db, 'Users', userId);
      
      if (!currentStatus) {
        const today = new Date();
        const renewDate = new Date(today);
        renewDate.setMonth(renewDate.getMonth() + 3);
        
        await updateDoc(userRef, {
          isPremium: true,
          renewDate: renewDate
        });
      } else {
        await updateDoc(userRef, {
          isPremium: false
        });
      }
      
      await fetchUsers();
      setUpdating(null);
    } catch (error) {
      console.error('Error updating premium status:', error);
      alert('Failed to update premium status: ' + error.message);
      setUpdating(null);
    }
  };

  const handleCreateCode = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a code title');
      return;
    }

    try {
      await addDoc(collection(db, 'DiscountCodes'), {
        title: formData.title.trim(),
        percentage: formData.percentage,
        isActive: formData.isActive,
        createdAt: serverTimestamp()
      });

      setFormData({ title: '', percentage: '50', isActive: true });
      setShowCreateForm(false);
      fetchCodes();
      alert('Discount code created successfully!');
    } catch (error) {
      console.error('Error creating code:', error);
      alert('Error creating discount code');
    }
  };

  const handleDeleteCode = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      await deleteDoc(doc(db, 'DiscountCodes', id));
      setCodes(codes.filter(code => code.id !== id));
      alert('Discount code deleted successfully!');
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('Error deleting discount code');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const PremiumChart = () => {
    const premiumPercentage = stats.totalUsers > 0 ? (stats.premiumUsers / stats.totalUsers) * 100 : 0;
    const freePercentage = 100 - premiumPercentage;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">User Distribution</h3>
        
        <div className="space-y-6 mb-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-[#e4b8ae] mr-2" />
                <span className="text-sm font-medium text-gray-700">Premium Users</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.premiumUsers} ({premiumPercentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div 
                className="bg-[#e4b8ae] h-8 rounded-full transition-all duration-500 flex items-center justify-end px-3"
                style={{ width: `${premiumPercentage}%` }}
              >
                {premiumPercentage > 10 && (
                  <span className="text-white text-xs font-bold">{premiumPercentage.toFixed(0)}%</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Free Users</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{stats.freeUsers} ({freePercentage.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div 
                className="bg-gray-400 h-8 rounded-full transition-all duration-500 flex items-center justify-end px-3"
                style={{ width: `${freePercentage}%` }}
              >
                {freePercentage > 10 && (
                  <span className="text-white text-xs font-bold">{freePercentage.toFixed(0)}%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="40"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#e4b8ae"
              strokeWidth="40"
              strokeDasharray={`${premiumPercentage * 5.03} ${(100 - premiumPercentage) * 5.03}`}
              className="transition-all duration-500"
            />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#e4b8ae] rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Premium</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Free</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e4b8ae] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          <p className="text-sm text-gray-500 mt-2">Current user: {currentUserEmail}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Dr. Maha 👋</p>
        </div>

        <div className="flex gap-3 mb-8 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'users'
                ? 'border-b-4 border-[#e4b8ae] text-[#e4b8ae]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'codes'
                ? 'border-b-4 border-[#e4b8ae] text-[#e4b8ae]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Discount Codes
            </div>
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Total Sales</p>
                    <p className="text-4xl font-bold">{stats.totalSales}</p>
                    <p className="text-green-100 text-xs mt-2">Completed payments</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-full">
                    <DollarSign className="w-10 h-10" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#e4b8ae] to-[#d4a89e] rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-opacity-90 text-sm mb-1">Premium Users</p>
                    <p className="text-4xl font-bold">{stats.premiumUsers}</p>
                    <p className="text-white text-opacity-90 text-xs mt-2">Active subscriptions</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-full">
                    <Crown className="w-10 h-10" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Users</p>
                    <p className="text-4xl font-bold">{stats.totalUsers}</p>
                    <p className="text-blue-100 text-xs mt-2">Registered accounts</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-full">
                    <Users className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <PremiumChart />
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">All Users</h2>
                    <p className="text-white text-opacity-90 text-sm mt-1">Manage premium access for all users</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Premium Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-[#e4b8ae] to-[#f7ccc5] rounded-full flex items-center justify-center shadow-md">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.isPremium ? (
                            <span className="px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5] text-white shadow-md">
                              <Crown className="w-4 h-4 mr-1" />
                              Premium
                            </span>
                          ) : (
                            <span className="px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                              Free User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.paymentCompleted ? (
                            <div className="text-sm">
                              <div className="flex items-center text-green-600 font-semibold">
                                <Check className="w-5 h-5 mr-1" />
                                Paid
                              </div>
                              {user.transactionId && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {user.transactionId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 font-medium">No payment</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {user.joinedAt ? (
                              typeof user.joinedAt === 'string' 
                                ? user.joinedAt 
                                : user.joinedAt.toDate 
                                  ? new Date(user.joinedAt.toDate()).toLocaleDateString() 
                                  : new Date(user.joinedAt).toLocaleDateString()
                            ) : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => togglePremium(user.id, user.isPremium)}
                            disabled={updating === user.id}
                            className={`px-4 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                              user.isPremium
                                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                                : 'bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5] hover:from-[#d4a89e] hover:to-[#e7bcb5] text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                          >
                            {updating === user.id ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                              </span>
                            ) : user.isPremium ? (
                              '❌ Revoke'
                            ) : (
                              '✨ Grant'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Discount Codes</h2>
                <p className="text-gray-600 text-sm mt-1">Manage promotional discount codes</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Create New Code
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white border-2 border-[#e4b8ae] rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Create Discount Code</h3>
                <form onSubmit={handleCreateCode}>
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Code Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., SUMMER50"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e4b8ae]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Discount Percentage
                    </label>
                    <select
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e4b8ae]"
                    >
                      <option value="50">50%</option>
                      <option value="60">60%</option>
                      <option value="70">70%</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-[#e4b8ae] rounded focus:ring-[#e4b8ae]"
                      />
                      <span className="text-sm font-bold text-gray-700">Active</span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#e4b8ae] to-[#f7ccc5] text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      Create Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#e4b8ae] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading codes...</p>
              </div>
            ) : codes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Tag size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No discount codes yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {codes.map((code) => (
                  <div
                    key={code.id}
                    className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center hover:shadow-lg transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{code.title}</h3>
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                          code.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex gap-6 text-gray-600 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{code.percentage}% OFF</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{formatDate(code.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCode(code.id, code.title)}
                      className="bg-red-50 text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}