const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  contact: { type: String, required: true, unique: true }, // email or phone
  username: { type: String, required: true },
  dob: { type: Date, required: true },
  pin: { type: String, required: true }, // 6-digit code, stored hashed

  // lockout
  failedAttempts: { type: Number, default: 0 },
  lockUntil: Date,

  // only the session id saved here is allowed in, so only one device at a time
  sessionId: String,

  // fingerprint / Face ID (WebAuthn)
  credential: { id: String, publicKey: String, counter: Number },
  challenge: String,
});

module.exports = mongoose.model('User', userSchema);
