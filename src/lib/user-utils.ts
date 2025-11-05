/**
 * Extract User ID from email format
 * Converts "username@vtumitra.local" back to "username"
 */
export const getUserIdFromEmail = (email: string | undefined): string => {
  if (!email) return '';
  
  if (email.endsWith('@vtumitra.local')) {
    return email.replace('@vtumitra.local', '');
  }
  
  return email;
};

/**
 * Get display name for user
 * Prefers user_data.display_name, falls back to userId from email
 */
export const getUserDisplayName = (user: any): string => {
  if (user?.user_metadata?.display_name) {
    return user.user_metadata.display_name;
  }
  
  if (user?.user_metadata?.user_id) {
    return user.user_metadata.user_id;
  }
  
  return getUserIdFromEmail(user?.email);
};
