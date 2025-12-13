/**
 * Security Configuration
 * Centralized security settings for authentication and cryptography
 */

// Bcrypt cost factor (salt rounds)
// OWASP recommends 12+ for 2024/2025
// Higher values = more secure but slower hashing
export const BCRYPT_ROUNDS = 12;
