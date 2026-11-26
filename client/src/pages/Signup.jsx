import { useState } from 'react';
import { post } from '../api';

export default function Signup({ onLogin, goLogin }) {
  const [form, setForm] = useState({ contact: '', username: '', dob: '', pin: '', pin2: '' });
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.pin !== form.pin2) {
      return setError('The two codes do not match');
    }
    try {
      onLogin(await post('/auth/signup', form));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Sign up</h2>

      <input name="contact" placeholder="Email or phone (+91...)" value={form.contact} onChange={change} />
      <input name="username" placeholder="username" value={form.username} onChange={change} />
      <label>
        Date of birth
        <input type="date" name="dob" value={form.dob} onChange={change} />
      </label>
      <input name="pin" type="password" inputMode="numeric" maxLength={6} placeholder="6-digit code" value={form.pin} onChange={change} />
      <input name="pin2" type="password" inputMode="numeric" maxLength={6} placeholder="Confirm code" value={form.pin2} onChange={change} />

      {error && <p className="error">{error}</p>}
      <button>Create account</button>

      <p>
        Already have an account?{' '}
        <button type="button" className="link" onClick={goLogin}>Log in</button>
      </p>
    </form>
  );
}
