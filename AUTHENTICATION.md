# VTU MITRA Authentication System

## User ID + Password Authentication

VTU MITRA uses a simple User ID and password authentication system instead of email-based authentication.

### For Students

#### Creating an Account
1. Go to the **Sign Up** tab on the auth page
2. Choose a **User ID** (username):
   - 3-20 characters long
   - Only letters, numbers, and underscores allowed
   - Examples: `john_doe`, `student123`, `vtu_2024`
3. Create a **Password** (minimum 6 characters)
4. Confirm your password
5. Click **Create Account**

#### Logging In
1. Enter your **User ID** (not email!)
2. Enter your **Password**
3. Click **Sign In**

Your User ID will be displayed in the navbar as `@your_user_id` when logged in.

---

## For Admins

### Hot-Swappable Admin Configuration

Admins are configured in the `src/lib/config.ts` file. **No database changes needed!**

#### Adding a New Admin

1. Open `src/lib/config.ts`
2. Add the User ID to the `ADMIN_USER_IDS` array:

```typescript
export const ADMIN_USER_IDS = [
  'admin',
  'padmesh',
  'your_new_admin_user_id', // Add here
] as const;
```

3. Save the file
4. **Done!** The user is now an admin instantly.

#### Current Admins
- `admin`
- `padmesh`

### Admin Privileges
Admins can:
- Access the `/admin` page
- Approve/reject document uploads
- Manage pending submissions
- View all user uploads

---

## Technical Details

### How It Works
Behind the scenes, User IDs are converted to email format for Supabase Auth:
- User enters: `john_doe`
- System uses: `john_doe@vtumitra.local`

This allows us to use Supabase's robust authentication system while providing a simple username-based experience to users.

### Security Features
- Passwords must be at least 6 characters
- User IDs are validated (alphanumeric + underscore only)
- Admin status is checked both in config file and database
- Sessions auto-refresh every 30 minutes
- Chat history cleared on logout

### Email Confirmation
**For Development/Testing:**
1. Go to Backend (Lovable Cloud dashboard)
2. Navigate to Authentication settings
3. Enable "Auto-confirm email signups"

This skips email confirmation and makes testing faster.

---

## Common Issues

### "Invalid User ID or password"
- Double-check your User ID spelling
- Make sure you're using your User ID, not an email
- Passwords are case-sensitive

### User ID Already Taken
- Choose a different User ID
- User IDs are unique across the platform

### Can't Access Admin Panel
- Check that your User ID is in the `ADMIN_USER_IDS` array in `src/lib/config.ts`
- Log out and log back in after being added as admin

---

## Migration from Email Authentication

If you previously used email authentication:
- Old email-based accounts won't work
- Users need to create new accounts with User IDs
- Admin emails need to be converted to User IDs in config.ts
