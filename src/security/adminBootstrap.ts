/**
 * Bootstrap Admin Validation
 * Authorizes pre-designated administrative accounts for bootstrap access.
 */

export const BOOTSTRAP_ADMIN_EMAILS = [
  'eesaalqadri25@gmail.com',
  'khlanysy6@gmail.com',
  'admin@ebb.gov.ye',
  'm.almadani@ebb.gov.ye',
  'sh.alshami@ebb.gov.ye'
];

export function isBootstrapAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return BOOTSTRAP_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === clean);
}
