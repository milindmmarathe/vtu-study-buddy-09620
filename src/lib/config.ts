// Admin configuration - Add new admin emails here (plug & play, no database changes needed)
export const ADMIN_EMAILS = [
  'altmilind@gmail.com',
  'padmeshhu2006@gmail.com'
  // Add new admins here - works instantly!
];

export const isAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
