import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';

export const migrateUserData = async (profileId) => {
  try {
    // Get existing profile data
    const profileDoc = await getDoc(doc(db, 'profiles', profileId));
    const userDoc = await getDoc(doc(db, 'users', profileId));
    
    if (!profileDoc.exists()) return;
    
    const profileData = profileDoc.data();
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    // Group records by month
    const recordsByMonth = {};
    Object.entries(userData)
      .filter(([key]) => key.startsWith('records.'))
      .forEach(([key, value]) => {
        const date = new Date(key.replace('records.', ''));
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const dayOfMonth = date.getDate();
        
        if (!recordsByMonth[monthKey]) {
          recordsByMonth[monthKey] = {
            days: {},
            totalEarnings: 0,
            projectsCompleted: 0
          };
        }
        
        recordsByMonth[monthKey].days[dayOfMonth] = {
          earnings: value.earnings || 0,
          projectsCount: value.projectsCount || 0
        };
        
        recordsByMonth[monthKey].totalEarnings += value.earnings || 0;
        recordsByMonth[monthKey].projectsCompleted += value.projectsCount || 0;
      });

    // Create monthly goals
    const monthlyGoals = {};
    if (profileData.monthlyGoals) {
      Object.entries(profileData.monthlyGoals).forEach(([key, value]) => {
        monthlyGoals[key] = {
          amount: value,
          updatedAt: new Date()
        };
      });
    }

    // Batch write new structure
    const batch = writeBatch(db);

    // Update profile
    batch.set(doc(db, 'profiles', profileId), {
      name: profileData.name,
      userId: profileData.userId,
      tagline: profileData.tagline || '',
      defaultGoal: profileData.monthlyGoal || 10000,
      createdAt: new Date()
    });

    // Write monthly records
    Object.entries(recordsByMonth).forEach(([monthKey, monthData]) => {
      batch.set(
        doc(db, 'profiles', profileId, 'records', monthKey),
        {
          ...monthData,
          averageDailyEarnings: monthData.totalEarnings / Object.keys(monthData.days).length
        }
      );
    });

    // Write goals
    Object.entries(monthlyGoals).forEach(([monthKey, goalData]) => {
      batch.set(
        doc(db, 'profiles', profileId, 'goals', monthKey),
        goalData
      );
    });

    // Write stats
    if (profileData.aggregates) {
      Object.entries(profileData.aggregates.monthly).forEach(([month, earnings]) => {
        const yearMonth = `${new Date().getFullYear()}-${String(Number(month) + 1).padStart(2, '0')}`;
        batch.set(
          doc(db, 'profiles', profileId, 'stats', yearMonth),
          {
            monthlyEarnings: earnings,
            monthlyAverage: profileData.monthlyAverage || 0,
            weeklyBreakdown: profileData.aggregates.weekly || {}
          }
        );
      });
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}; 