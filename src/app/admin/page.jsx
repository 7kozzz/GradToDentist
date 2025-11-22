import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Plus, Tag, Calendar, Percent, Users, UserCheck, UserX, Crown } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    percentage: '50',
    isActive: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      usersData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users');
    } finally {
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

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchCodes();
    }
  }, [activeTab]);

  const togglePremiumStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, 'users', userId), {
        isPremium: newStatus
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isPremium: newStatus } : user
      ));
      alert(`Premium status ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating premium status:', error);
      alert('Error updating premium status');
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

  const formatExpiryDate = (timestamp) => {
    if (!timestamp?.seconds) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const isExpired = date < now;
    return {
      text: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      isExpired
    };
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: '#1a1a1a',
          marginBottom: '30px'
        }}>
          Admin Panel
        </h1>

        <div style={{ 
          display: 'flex',
          gap: '12px',
          marginBottom: '30px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid #e4b8ae' : '3px solid transparent',
              color: activeTab === 'users' ? '#e4b8ae' : '#666',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={20} />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'codes' ? '3px solid #e4b8ae' : '3px solid transparent',
              color: activeTab === 'codes' ? '#e4b8ae' : '#666',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Tag size={20} />
            Discount Codes
          </button>
        </div>

        {activeTab === 'users' ? (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e4b8ae', marginBottom: '8px' }}>
                    {users.length}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Total Users</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
                    {users.filter(u => u.isPremium).length}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Premium Users</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
                    {users.filter(u => !u.isPremium).length}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>Free Users</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Users size={48} style={{ color: '#ccc', margin: '0 auto 16px' }} />
                <p style={{ color: '#666', fontSize: '16px' }}>No users yet</p>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Name</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Phone</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Status</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Expiry Date</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => {
                      const expiry = formatExpiryDate(user.premiumExpiryDate);
                      return (
                        <tr key={user.id} style={{ 
                          borderBottom: index < users.length - 1 ? '1px solid #e0e0e0' : 'none'
                        }}>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontWeight: '500', color: '#1a1a1a' }}>
                              {user.name || 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: '16px', color: '#666' }}>{user.email || 'N/A'}</td>
                          <td style={{ padding: '16px', color: '#666' }}>{user.phoneNumber || 'N/A'}</td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{
                              backgroundColor: user.isPremium ? '#e4f7e4' : '#fff3e0',
                              color: user.isPremium ? '#2d7a2d' : '#e65100',
                              padding: '6px 16px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              {user.isPremium ? (
                                <>
                                  <Crown size={14} />
                                  Premium
                                </>
                              ) : (
                                'Free'
                              )}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {user.isPremium ? (
                              <span style={{
                                color: expiry.isExpired ? '#dc3545' : '#666',
                                fontWeight: expiry.isExpired ? '600' : '400'
                              }}>
                                {expiry.text}
                                {expiry.isExpired && ' (Expired)'}
                              </span>
                            ) : (
                              <span style={{ color: '#999' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <button
                              onClick={() => togglePremiumStatus(user.id, user.isPremium)}
                              style={{
                                backgroundColor: user.isPremium ? '#fee' : '#e4f7e4',
                                color: user.isPremium ? '#dc3545' : '#2d7a2d',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {user.isPremium ? (
                                <>
                                  <UserX size={14} />
                                  Revoke
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} />
                                  Grant
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginBottom: '4px'
                }}>
                  Discount Codes
                </h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Manage promotional discount codes
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                style={{
                  backgroundColor: '#e4b8ae',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                <Plus size={20} />
                Create New Code
              </button>
            </div>

            {showCreateForm && (
              <div style={{
                backgroundColor: 'white',
                border: '2px solid #e4b8ae',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '30px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  marginBottom: '20px',
                  color: '#1a1a1a'
                }}>
                  Create Discount Code
                </h3>
                <form onSubmit={handleCreateCode}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Code Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., SUMMER50"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Discount Percentage
                    </label>
                    <select
                      value={formData.percentage}
                      onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="50">50%</option>
                      <option value="60">60%</option>
                      <option value="70">70%</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: '500', color: '#333' }}>Active</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#e4b8ae',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      Create Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                Loading codes...
              </div>
            ) : codes.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Tag size={48} style={{ color: '#ccc', margin: '0 auto 16px' }} />
                <p style={{ color: '#666', fontSize: '16px' }}>No discount codes yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {codes.map((code) => (
                  <div
                    key={code.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold',
                          color: '#1a1a1a'
                        }}>
                          {code.title}
                        </h3>
                        <span style={{
                          backgroundColor: code.isActive ? '#e4f7e4' : '#f5f5f5',
                          color: code.isActive ? '#2d7a2d' : '#666',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '24px', color: '#666', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Percent size={16} />
                          <span>{code.percentage}% OFF</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={16} />
                          <span>{formatDate(code.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCode(code.id, code.title)}
                      style={{
                        backgroundColor: '#fee',
                        color: '#dc3545',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
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
};

export default AdminPanel;