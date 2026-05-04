// Auth helpers — JWT signing/verification, password hashing
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.warn('⚠ WARNING: JWT_SECRET is missing or too short. Generate one: openssl rand -base64 32');
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
