const router = require('express').Router();
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const User = require('../models/User');
const { cleanContact, profile, startSession, requireLogin, isLocked, lockedReply, wrongAttempt } = require('../helpers');

const origin = process.env.ORIGIN; // e.g. http://localhost:5173
const rpID = new URL(origin).hostname; // e.g. localhost

// ---- turn on biometrics (user must already be logged in) ----

router.post('/register-options', requireLogin, async (req, res) => {
  const user = req.user;
  const options = await generateRegistrationOptions({
    rpName: 'Auth App',
    rpID,
    userName: user.contact,
    userID: new TextEncoder().encode(user.id),
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
  });
  user.challenge = options.challenge;
  await user.save();
  res.json(options);
});

router.post('/register', requireLogin, async (req, res) => {
  const user = req.user;
  try {
    const result = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: user.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
    if (!result.verified) throw new Error('not verified');

    const { credential } = result.registrationInfo;
    user.credential = {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
    };
    user.challenge = undefined;
    await user.save();
    res.json(profile(user));
  } catch {
    res.status(400).json({ error: 'Could not set up biometrics on this device' });
  }
});

// ---- log in with biometrics ----

router.post('/login-options', async (req, res) => {
  const user = await User.findOne({ contact: cleanContact(req.body.contact) });

  if (!user?.credential?.id) {
    return res.status(400).json({ error: 'Biometric login is not set up for this account' });
  }
  if (isLocked(user)) {
    return lockedReply(res, user);
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [{ id: user.credential.id }],
    userVerification: 'required',
  });
  user.challenge = options.challenge;
  await user.save();
  res.json(options);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ contact: cleanContact(req.body.contact) });

  if (!user?.credential?.id || !user.challenge) {
    return res.status(400).json({ error: 'Please start the biometric login again' });
  }
  if (isLocked(user)) {
    return lockedReply(res, user);
  }

  let result;
  try {
    result = await verifyAuthenticationResponse({
      response: req.body.answer,
      expectedChallenge: user.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: user.credential.id,
        publicKey: Buffer.from(user.credential.publicKey, 'base64url'),
        counter: user.credential.counter,
      },
      requireUserVerification: true,
    });
  } catch {
    return wrongAttempt(res, user);
  }
  if (!result.verified) {
    return wrongAttempt(res, user);
  }

  user.credential.counter = result.authenticationInfo.newCounter;
  user.challenge = undefined;
  await startSession(user, res);
  res.json(profile(user));
});

module.exports = router;
