import { useEffect, useState } from 'react';
import { get } from './api';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [notice, setNotice] = useState('');

  // are we already logged in? (the cookie decides)
  useEffect(() => {
    get('/auth/me')
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // If the account was opened on another device, this device finds out when you come back to the tab.
  useEffect(() => {
    if (!user) return;
    const check = () =>
      get('/auth/me').catch(() => {
        setUser(null);
        setNotice('You were logged out. Your account may have been opened on another device.');
      });
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, [user]);

  function handleLogin(loggedInUser) {
    setNotice('');
    setUser(loggedInUser);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="box">
      {user ? (
        <Home user={user} setUser={setUser} />
      ) : showSignup ? (
        <Signup onLogin={handleLogin} goLogin={() => setShowSignup(false)} />
      ) : (
        <Login notice={notice} onLogin={handleLogin} goSignup={() => setShowSignup(true)} />
      )}
    </div>
  );
}
