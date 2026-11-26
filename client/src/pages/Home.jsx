import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { post } from '../api';

export default function Home({ user, setUser }) {
  const [message, setMessage] = useState('');

  async function enableBiometrics() {
    try {
      const options = await post('/biometric/register-options');
      const answer = await startRegistration({ optionsJSON: options });
      setUser(await post('/biometric/register', answer));
      setMessage('Biometric login is now on');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function logout() {
    await post('/auth/logout');
    setUser(null);
  }

  return (
    <div>
      <h2>Welcome, {user.surname}</h2>
      <p>You are logged in as {user.contact}</p>

      {user.hasBiometric ? (
        <p>Biometric login is on</p>
      ) : (
        <button className="secondary" onClick={enableBiometrics}>Turn on Face ID / fingerprint</button>
      )}
      {message && <p>{message}</p>}

      <button onClick={logout}>Log out</button>
    </div>
  );
}
