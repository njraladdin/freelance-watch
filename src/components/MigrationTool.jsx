import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { migrateUserData } from '../utils/migrations';

const MigrationTool = () => {
  const [migrating, setMigrating] = useState(false);
  const [results, setResults] = useState([]);

  const runMigration = async () => {
    if (!window.confirm('Are you sure you want to run the migration? This will update the database structure.')) {
      return;
    }

    setMigrating(true);
    setResults([]);

    try {
      // Get all profiles
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const totalProfiles = profilesSnapshot.docs.length;
      
      for (let i = 0; i < profilesSnapshot.docs.length; i++) {
        const profile = profilesSnapshot.docs[i];
        setResults(prev => [...prev, `Migrating ${profile.data().name} (${i + 1}/${totalProfiles})...`]);
        
        try {
          const success = await migrateUserData(profile.id);
          setResults(prev => [...prev, 
            success 
              ? `✅ Successfully migrated ${profile.data().name}`
              : `❌ Failed to migrate ${profile.data().name}`
          ]);
        } catch (error) {
          setResults(prev => [...prev, `❌ Error migrating ${profile.data().name}: ${error.message}`]);
        }
      }

      setResults(prev => [...prev, '✨ Migration completed']);
    } catch (error) {
      setResults(prev => [...prev, `❌ Migration failed: ${error.message}`]);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Database Migration Tool</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            This will migrate the database to the new structure with:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Monthly records grouped by day</li>
            <li>Monthly goals stored separately</li>
            <li>Stats and aggregates reorganized</li>
          </ul>
        </div>

        <button
          onClick={runMigration}
          disabled={migrating}
          className={`w-full py-2 px-4 rounded-lg ${
            migrating 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {migrating ? 'Migrating...' : 'Run Migration'}
        </button>

        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Migration Log:</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationTool; 