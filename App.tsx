import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session from Supabase directly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Use display_name from metadata, or fallback to email prefix
        const name = session.user.user_metadata?.display_name || 'User';
        setUser(name);
      }
      setLoading(false);
    });

    // Listen for authentication changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.display_name || 'User';
        setUser(name);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-500">
        <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const handleLogout = async () => {
    // Dashboard component calls logoutUser, which triggers onAuthStateChange, setting user to null
    setUser(null);
  };

  return (
    <>
      {user ? (
        <Dashboard currentUser={user} onLogout={handleLogout} />
      ) : (
        <Auth onLogin={(username) => setUser(username)} />
      )}
    </>
  );
};

export default App;