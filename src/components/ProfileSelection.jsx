import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'react-chartjs-2';
import { FiUser, FiCreditCard } from 'react-icons/fi';
import { collection, getDocs, doc, setDoc, addDoc, query, where, getDoc } from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider, getStatsPath, updatePublicUserCount } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Tippy from '@tippyjs/react';

// Helper function
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Reusable components
const MonthlyIncomePill = ({ amount, className = '' }) => (
  <Tippy content={
    <div>
      <p>Average income from past 6 months</p>
      <div className="text-xs mt-1 text-gray-300 flex flex-col items-center">
        <div className="text-center">Total earnings from active months</div>
        <div className="w-48 border-t border-gray-300 my-0.5"></div>
        <div className="text-center">Number of active months</div>
      </div>
    </div>
  }>
    <div className={`flex items-center justify-center bg-blue-50 px-4 py-2 rounded-xl ${className}`}>
      <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
      <span className="text-sm sm:text-base font-medium text-blue-600">
        {formatCurrency(amount)}
      </span>
      <span className="text-xs sm:text-sm text-blue-400 ml-1">/mo</span>
    </div>
  </Tippy>
);

const GoogleLogo = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const DEFAULT_TAGLINE = "Freelance wizard at work 🪄";

const ProfileCard = ({ profile, isOwnProfile }) => {
  const navigate = useNavigate();

  const monthlyData = React.useMemo(() => {
    const recentMonths = profile.recentMonths || {};
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      data.push((recentMonths[monthKey] || 0) / 1000); // Convert to thousands
    }

    return data;
  }, [profile.recentMonths]);

  const monthlyAverage = profile.monthlyAverage || 0;

  const chartData = {
    labels: getLastSevenMonths(),
    datasets: [{
      data: monthlyData,
      borderColor: '#FF9F1C',
      borderWidth: 2,
      backgroundColor: 'rgba(255, 159, 28, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `$${context.raw}k`
        }
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: '#999',
          padding: 8
        }
      },
      y: {
        border: { display: false },
        position: 'left',
        grid: { display: false },
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          color: '#999',
          padding: 8,
          callback: value => `$${value}k`
        }
      }
    }
  };

  return (
    <div
      onClick={() => navigate(`/${encodeURIComponent(profile.name)}`)}
      className="bg-white rounded-3xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-xl">
            <FiUser className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {profile.tagline || DEFAULT_TAGLINE}
            </p>
          </div>
        </div>
        <MonthlyIncomePill amount={monthlyAverage} />
      </div>

      <div className="h-36">
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// Helper function for chart labels
const getLastSevenMonths = () => {
  const months = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(date.toLocaleString('default', { month: 'short' }));
  }
  return months;
};

const ProfileSelection = () => {
  const [profiles, setProfiles] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (isJoining = false) => {
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

        // Create new profile with the new structure
        const newProfileRef = await addDoc(profilesCollection, {
          name: user.displayName,
          userId: user.uid,
          tagline: "Freelance wizard at work 🪄",
          defaultGoal: 10000,
          createdAt: new Date()
        });

        // Initialize stats subcollection
        await setDoc(doc(db, getStatsPath(newProfileRef.id)), {
          monthlyAverages: {},
          lastUpdated: new Date()
        });

        await updatePublicUserCount();

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

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const profilesCollection = collection(db, 'profiles');
        const snapshot = await getDocs(profilesCollection);
        
        const profilesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProfiles(profilesData);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <img
            src="/cat.png"
            alt="Freelance Watch Logo"
            className="w-24 h-24 mx-auto mb-8"
          />
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight mb-6">
            Freelance Watch
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Monitor your freelance income alongside a community of independent professionals.
            Share progress, stay motivated, and grow together.
          </p>

          {!currentUser && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={() => handleAuth(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 
                         bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium
                         rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="bg-white p-1 rounded">
                  <GoogleLogo />
                </div>
                <span>Join the Community</span>
              </button>

              <button
                onClick={() => handleAuth(false)}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4
                         bg-white hover:bg-gray-50 text-gray-600 text-lg
                         rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md 
                         transition-all"
              >
                <GoogleLogo />
                <span>Sign in</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {profiles.length > 0 ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Community</h2>
              <span className="text-sm text-gray-500">
                {profiles.length} {profiles.length === 1 ? 'active member' : 'active members'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profiles
                .sort((a, b) => currentUser && a.userId === currentUser.uid ? -1 : 1)
                .map(profile => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    isOwnProfile={currentUser && profile.userId === currentUser.uid}
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
              <FiUser className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Be the first to join
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Sign in to start tracking your freelance journey
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfileSelection; 