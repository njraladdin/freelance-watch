import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, setDoc, doc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { SecondaryButton } from './Buttons';
import { FiLogOut } from 'react-icons/fi';

const GoogleLogo = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MobileMenu = ({ isOpen, onClose, currentUser, onAuth, onLogout }) => {
  return (
    <div 
      className={`fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-50 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`fixed inset-y-0 right-0 w-[280px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 float-right"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {currentUser ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="font-medium text-gray-900">{currentUser.displayName}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2
                           bg-white border border-gray-200 text-gray-600
                           rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => onAuth(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3
                           bg-blue-600 hover:bg-blue-700 text-white font-medium
                           rounded-xl shadow-sm transition-colors"
                >
                  <div className="bg-white p-0.5 rounded">
                    <GoogleLogo />
                  </div>
                  <span>Join with Google</span>
                </button>
                
                <button
                  onClick={() => onAuth(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3
                           bg-white hover:bg-gray-50 text-gray-600
                           rounded-xl border border-gray-200 shadow-sm transition-colors"
                >
                  <GoogleLogo />
                  <span>Sign in</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuth = async (isJoining = false) => {
    setIsMobileMenuOpen(false);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const profilesCollection = collection(db, 'profiles');
      const q = query(profilesCollection, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        if (!isJoining) {
          await signOut(auth);
          alert('No account found. Please join first.');
          return;
        }

        const newProfileRef = await addDoc(profilesCollection, {
          name: user.displayName,
          createdAt: new Date().toISOString(),
          userId: user.uid,
          aggregates: { weekly: {}, monthly: {} },
          monthlyAverage: 0
        });

        await setDoc(doc(db, 'users', newProfileRef.id), {
          monthlyGoal: 10000,
          records: {},
          createdAt: new Date().toISOString(),
          userId: user.uid
        });

        navigate(`/${encodeURIComponent(user.displayName)}`);
      } else {
        if (isJoining) {
          alert('Account already exists. Please sign in instead.');
        }
        const profileData = snapshot.docs[0].data();
        navigate(`/${encodeURIComponent(profileData.name)}`);
      }
    } catch (error) {
      console.error('Auth Error:', error);
    }
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <img 
                src="/cat.png" 
                alt="Freelance Watch Logo" 
                className="w-8 h-8 sm:w-9 sm:h-9 cursor-pointer"
                onClick={() => navigate('/')}
              />
              <h1 
                onClick={() => navigate('/')} 
                className="text-xl sm:text-2xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              >
                Freelance Watch
              </h1>
            </div>

            <div className="hidden sm:flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Signed in as</span>{' '}
                    <span className="font-medium text-gray-900">{currentUser.displayName}</span>
                  </div>
                  <SecondaryButton
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </SecondaryButton>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuth(true)}
                    className="flex items-center space-x-2 px-4 py-2 
                             bg-blue-600 hover:bg-blue-700 text-white font-medium 
                             rounded-xl shadow-sm transition-colors"
                  >
                    <div className="bg-white p-0.5 rounded">
                      <GoogleLogo />
                    </div>
                    <span>Join with Google</span>
                  </button>
                  
                  <button
                    onClick={() => handleAuth(false)}
                    className="flex items-center space-x-2 px-4 py-2 
                             bg-white hover:bg-gray-50 text-gray-600
                             rounded-xl border border-gray-200 shadow-sm transition-colors"
                  >
                    <GoogleLogo />
                    <span>Sign in</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentUser={currentUser}
        onAuth={handleAuth}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header; 