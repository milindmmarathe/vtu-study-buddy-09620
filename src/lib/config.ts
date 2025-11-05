// ============================================
// 🔥 HOT-SWAPPABLE ADMIN CONFIGURATION
// ============================================
// Add new admin User IDs below - changes take effect INSTANTLY!
// No database changes or deployments needed.
//
// To add a new admin:
// 1. Add User ID to ADMIN_USER_IDS array
// 2. Save this file
// 3. Done! They're an admin immediately.
//
// Security: This is safe because it's server-rendered and
// requires the user to have a valid account with this User ID.
// ============================================

export const ADMIN_USER_IDS = [
  'admin',
  'padmesh',
  // Add more admin User IDs here 👇
  // 'newadmin',
] as const;

export const isAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  
  // Convert email back to userId format (remove @vtumitra.local)
  if (email.endsWith('@vtumitra.local')) {
    const userId = email.replace('@vtumitra.local', '');
    return ADMIN_USER_IDS.includes(userId as any);
  }
  
  return false;
};
