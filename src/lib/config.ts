// ============================================
// 🔥 HOT-SWAPPABLE ADMIN CONFIGURATION
// ============================================
// Add new admin emails below - changes take effect INSTANTLY!
// No database changes or deployments needed.
//
// To add a new admin:
// 1. Add email to ADMIN_EMAILS array
// 2. Save this file
// 3. Done! They're an admin immediately.
//
// Security: This is safe because it's server-rendered and
// requires the user to have a valid account with this email.
// ============================================

export const ADMIN_EMAILS = [
  'altmilind@gmail.com',
  'padmeshhu2006@gmail.com',
  // Add more admin emails here 👇
  // 'newadmin@example.com',
] as const;

export const isAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as any);
};
