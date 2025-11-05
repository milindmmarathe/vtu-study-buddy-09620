# 🎓 VTU MITRA - Your AI Study Companion

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-powered-green?logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-orange?logo=google)](https://deepmind.google/technologies/gemini/)

> **AI-powered study assistant for VTU students. Find notes, PYQs, and lab programs instantly.**


---

## 🌟 Features

### For Students
- 🤖 **AI Chat Assistant** - Natural language search for study materials
- 📚 **Smart Search** - Find notes, PYQs, and lab programs by subject, semester, branch
- ⬆️ **Upload Materials** - Share your notes to help fellow students
- 📧 **Email Documents** - Send materials directly to your inbox
- ⭐ **Ratings & Reviews** - See what other students think
- 🔖 **Bookmarks** - Save frequently needed documents

### For Admins
- ✅ **Document Moderation** - Review and approve/reject uploads
- 📥 **Download for Inspection** - Check files before approval
- 📊 **Dashboard** - Manage all pending documents in one place
- 👥 **User Management** - Monitor platform activity

---

## 🎯 Problem & Solution

**Problem:** VTU students waste hours searching for study materials across WhatsApp groups, Google Drive, and random websites.

**Solution:** VTU MITRA centralizes all materials with AI-powered search. Just ask in plain English: *"Data Structures notes for 3rd sem CSE"*

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| **AI** | Google Gemini 2.5 Flash via Lovable AI Gateway |
| **Email** | Resend API |
| **State** | TanStack Query, React Context |

---

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/milindmmarathe/vtu-mitra.git
cd vtu-mitra
npm install
npm run dev
```

### Environment Variables

Already configured with Lovable Cloud. For manual deployment:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
VITE_SUPABASE_PROJECT_ID=your_id
```

### Adding Admins (Plug & Play)

Edit `src/lib/config.ts`:

```typescript
export const ADMIN_EMAILS = [
  'altmilind@gmail.com',
  'padmeshhu2006@gmail.com',
  'your_email@example.com'  // Add here - works instantly!
];
```

---

## 📖 How It Works

**Student Flow:**
1. Ask question in chat → AI analyzes → Searches documents → Returns matches → Download/Email

**Admin Flow:**
1. Student uploads → Stored in pending → Admin reviews → Approve/Reject → Available in search

---

## 🏗️ Architecture

### Database Tables
- `profiles` - User information
- `user_roles` - Admin/user roles
- `documents` - Document metadata with ratings
- `chat_messages` - Persistent chat history
- `document_ratings` - User reviews
- `user_bookmarks` - Saved documents
- `download_history` - Track usage

### Storage Buckets
- `documents/pending/` - Awaiting approval
- `documents/approved/` - Available to all

### Edge Functions
- `chat` - AI-powered document search
- `send-email` - Document delivery

---

## 🔐 Security Features

✅ Row Level Security (RLS) on all tables  
✅ JWT authentication with auto-refresh  
✅ Admin verification for uploads  
✅ Input validation and sanitization  
✅ Secure file storage with proper policies  
✅ Rate limiting on edge functions  

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/name`
5. Open Pull Request

---

## 🐛 Troubleshooting

**File downloads not working?**
- Ensure you're logged in
- Refresh the page
- Clear browser cache

**Can't log in?**
- Sessions auto-refresh every 30 minutes
- Clear cookies and try again

**Uploads not appearing?**
- Files need admin approval (24-48 hours)
- Contact: altmilind@gmail.com

---

## 📊 Project Status

✅ Core features complete  
✅ AI integration working  
✅ Admin dashboard functional  
✅ File downloads robust  
✅ Chat persistence enabled  
🚧 Landing page (coming soon)  
🚧 Mobile app (planned)  

---

## 📞 Contact

- **Email**: altmilind@gmail.com, padmeshhu2006@gmail.com
- **Issues**: [GitHub Issues](https://github.com/milindmmarathe/vtu-mitra/issues)

---

## 🏆 Hacknova 2025

Built to solve real problems for 50,000+ VTU students.

**What makes it special:**
- Real-world impact
- Production-ready
- Beautiful UI/UX
- AI-powered
- Open source
- Comprehensive documentation

---

## 📄 License

MIT License - use freely for any purpose.

---

