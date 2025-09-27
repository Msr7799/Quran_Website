// src/utils/encryption.js
// Reimplemented using JWT for unsubscribe tokens.
// Exports: generateUnsubscribeToken(email, hours) and verifyUnsubscribeToken(token)
// Note: install jsonwebtoken in your project: pnpm add jsonwebtoken

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ENCRYPTION_KEY || 'please-change-this-secret-in-prod';

// Generate token valid for `hours` hours (default 24)
export function generateUnsubscribeToken(email, hours = 24) {
  if (!email) throw new Error('email required');
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: `${hours}h` });
}

// Verify token. Returns email string if valid, otherwise returns null and logs error.
export function verifyUnsubscribeToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload && payload.email) return payload.email;
    return null;
  } catch (err) {
    console.error('verifyUnsubscribeToken error:', err.name, err.message);
    return null;
  }
}
