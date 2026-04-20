/**
 * Rejects obviously invalid addresses (e.g. user@11.com) while staying
 * permissive for real international domains.
 */
export function isAcceptableRegistrationEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(value)) return false;
  const at = value.lastIndexOf('@');
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!local || !domain || !domain.includes('.')) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) return false;
  const sld = labels[labels.length - 2];
  if (/^\d+$/.test(sld)) return false;
  return true;
}
