import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { post } from '../api';

export default function Login({ notice, onLogin, goSignup }) {
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function loginWithCode(e) {
    e.preventDefault();
    setError('');
    try {
      onLogin(await post('/auth/login', { contact, pin }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function loginWithBiometrics() {
    setError('');
    try {
      const options = await post('/biometric/login-options', { contact });
      const answer = await startAuthentication({ optionsJSON: options }); // Face ID / fingerprint popup
      onLogin(await post('/biometric/login', { contact, answer }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={loginWithCode}>
      <h2>Log in</h2>
      {notice && <p className="notice">{notice}</p>}

      <input placeholder="Email or phone" value={contact} onChange={(e) => setContact(e.target.value)} />
      <input type="password" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={pin} onChange={(e) => setPin(e.target.value)} />

      {error && <p className="error">{error}</p>}
      <button>Log in</button>
      <button type="button" className="secondary" onClick={loginWithBiometrics}>
        Use Face ID / fingerprint
      </button>

      <p>
        New here?{' '}
        <button type="button" className="link" onClick={goSignup}>Create an account</button>
      </p>
    </form>
  );
}
