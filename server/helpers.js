const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./models/User');

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 60;

// emails -> lowercase, phone numbers -> no spaces
const cleanContact = (text) => String(text || '').trim().toLowerCase().replace(/\s/g, '');

const profile = (user) => ({
  contact: user.contact,
  username: user.username,
  hasBiometric: !!user.credential?.id,
});

// Log the user in on this device. The new session id replaces the old one,
// so any other device gets logged out on its next request.
async function startSession(user, res) {
  user.sessionId = crypto.randomUUID();
  user.failedAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  const token = jwt.sign({ id: user.id, sid: user.sessionId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// Middleware: only let people in if their cookie matches the session saved in the database
async function requireLogin(req, res, next) {
  try {
    const { id, sid } = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || user.sessionId !== sid) throw new Error('old session');
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again' });
  }
}

const isLocked = (user) => user.lockUntil && user.lockUntil > new Date();

function lockedReply(res, user) {
  const minutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
  res.status(423).json({ error: `Too many wrong attempts. Try again in ${minutes} minute(s).` });
}

// Call this whenever a code or fingerprint check fails.
// ($inc keeps the count right even if several requests arrive at once)
async function wrongAttempt(res, user) {
  const u = await User.findByIdAndUpdate(user.id, { $inc: { failedAttempts: 1 } }, { new: true });

  if (u.failedAttempts >= MAX_ATTEMPTS) {
    u.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    u.failedAttempts = 0;
    await u.save();
    return lockedReply(res, u);
  }
  res.status(401).json({ error: `Wrong details. ${MAX_ATTEMPTS - u.failedAttempts} attempt(s) left.` });
}

module.exports = { cleanContact, profile, startSession, requireLogin, isLocked, lockedReply, wrongAttempt };