// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initial load
    const checkAuth = () => {
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('userToken');
      const userPhone = localStorage.getItem('userPhone');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (token && userPhone && isAuthenticated) {
        const userData = localStorage.getItem('userData');
        setUser({
          phone: userPhone,
          token: token,
          data: userData ? JSON.parse(userData) : null
        });
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData, phone, token) => {
    setUser({
      phone: phone,
      token: token,
      data: userData
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};