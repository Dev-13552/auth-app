const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { cleanContact, profile, startSession, requireLogin, isLocked, lockedReply, wrongAttempt } = require('../helpers');

const isEmail = (text) => /^\S+@\S+\.\S+$/.test(text);
const isPhone = (text) => /^\+?\d{10,15}$/.test(text);
const isSixDigits = (text) => /^\d{6}$/.test(text);

router.post('/signup', async (req, res) => {
  const { username, dob, pin } = req.body;
  const contact = cleanContact(req.body.contact);

  if (!isEmail(contact) && !isPhone(contact)) {
    return res.status(400).json({ error: 'Enter a valid email or phone number' });
  }
  if (!username || !String(username).trim()) {
    return res.status(400).json({ error: 'Enter your username' });
  }
  if (!dob || isNaN(new Date(dob)) || new Date(dob) > new Date()) {
    return res.status(400).json({ error: 'Enter a valid date of birth' });
  }
  if (!isSixDigits(pin)) {
    return res.status(400).json({ error: 'The code must be exactly 6 digits' });
  }
  if (await User.findOne({ contact })) {
    return res.status(409).json({ error: 'An account with this email/phone already exists' });
  }

  const user = await User.create({
    contact,
    username: String(username).trim(),
    dob,
    pin: await bcrypt.hash(pin, 10),
  });

  await startSession(user, res);
  res.json(profile(user));
});

router.post('/login', async (req, res) => {
  const { pin } = req.body;
  const user = await User.findOne({ contact: cleanContact(req.body.contact) });

  if (!user || !isSixDigits(pin)) {
    return res.status(401).json({ error: 'Wrong details' });
  }
  if (isLocked(user)) {
    return lockedReply(res, user);
  }
  if (!(await bcrypt.compare(pin, user.pin))) {
    return wrongAttempt(res, user);
  }

  await startSession(user, res);
  res.json(profile(user));
});

router.get('/me', requireLogin, (req, res) => {
  res.json(profile(req.user));
});

router.post('/logout', requireLogin, async (req, res) => {
  req.user.sessionId = undefined;
  await req.user.save();
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
