/**
 * Strict client-side validators aligned with backend expectations.
 */

/** First / last name: only letters, spaces, hyphens, apostrophes. Min 2 chars. */
export function validateName(value: string): string | null {
  const v = value.trim();
  if (!v) return 'This field is required.';
  if (v.length < 2) return 'Must be at least 2 characters.';
  if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]+$/.test(v))
    return 'Only letters, spaces, hyphens and apostrophes are allowed.';
  return null;
}

/** Username: 3-30 chars, letters/numbers/underscores/hyphens, no spaces. */
export function validateUsername(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Username is required.';
  if (v.length < 3) return 'Username must be at least 3 characters.';
  if (v.length > 30) return 'Username must be 30 characters or fewer.';
  if (!/^[a-zA-Z0-9_\-]+$/.test(v))
    return 'Only letters, numbers, underscores and hyphens are allowed.';
  return null;
}

/**
 * Ethiopian phone number validation.
 * Accepted formats: +2519XXXXXXXX or +2517XXXXXXXX (13 chars total).
 * Examples: +251912345678, +251712345678
 */
export function validatePhone(value: string): string | null {
  const v = value.trim();
  if (!v) return null; // phone is optional on registration
  if (!/^\+251[79]\d{8}$/.test(v))
    return 'Phone must be in +251 format (e.g. +251912345678).';
  return null;
}

/** Strict email: must have local, @, domain with valid TLD (non-numeric SLD). */
export function validateEmail(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (!v) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(v)) return 'Enter a valid email address.';

  const parts = v.split('@');
  if (parts.length !== 2) return 'Enter a valid email address.';
  const domain = parts[1];
  const labels = domain.split('.');
  if (labels.length < 2) return 'Enter a valid email address.';
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld))
    return 'Enter a valid email address.';
  const sld = labels[labels.length - 2];
  if (/^\d+$/.test(sld))
    return 'That email domain looks invalid. Use a real provider.';
  return null;
}

/** Password: min 8 chars, at least 1 letter and 1 digit. */
export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter.';
  if (!/\d/.test(value)) return 'Password must contain at least one number.';
  return null;
}
