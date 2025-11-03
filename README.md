# VTU MITRA 📚

**AI-Powered Study Assistant for VTU Students**

VTU MITRA is an intelligent study material management system designed specifically for Visvesvaraya Technological University (VTU) students. It combines AI-powered chat assistance with a comprehensive document management system to help students easily find and access study materials.

## 🌟 Features

### For Students
- **AI Chat Assistant**: Ask questions and get relevant study materials instantly through natural language conversations
- **Smart Document Search**: AI automatically matches your queries with approved study materials from the database
- **Document Upload**: Upload and share study materials (PDFs, DOCs, PPTs) with fellow students
- **Email Documents**: Send study materials directly to your email with one click
- **Organized by Metadata**: Documents categorized by Subject, Semester, Branch, and Type (Notes, Question Papers, Lab Manuals, etc.)
- **Secure Authentication**: Email-based authentication system with profile management

### For Administrators
- **Admin Dashboard**: Review and approve/reject uploaded documents
- **Document Moderation**: Ensure quality control by approving only relevant study materials
- **User Role Management**: Automatic admin assignment for designated email addresses
- **Storage Management**: Approved documents moved to permanent storage, rejected ones removed

## 🔧 How It Works

### Architecture Overview

```
┌─────────────┐
│   Student   │
└──────┬──────┘
       │
       │ 1. Asks question
       ▼
┌─────────────────┐
│  Chat Interface │
└──────┬──────────┘
       │
       │ 2. Sends to AI
       ▼
┌──────────────────┐      ┌──────────────┐
│  Edge Function   │─────▶│  Gemini AI   │
│   (chat)         │◀─────│              │
└──────┬───────────┘      └──────────────┘
       │
       │ 3. Fetches relevant docs
       ▼
┌──────────────────┐
│   Database       │
│  (Approved Docs) │
└──────────────────┘
```

### Workflow

1. **Student Registration**
   - Students sign up with email and password
   - Profile created automatically with 'user' role
   - Specific emails (`altmilind@gmail.com`, `padmeshhu2006@gmail.com`) assigned 'admin' role

2. **Document Upload Process**
   - Students upload study materials via the Upload page
   - Documents stored in `pending/` folder with status `pending`
   - Metadata includes: Subject, Semester, Branch, Document Type
   - File validation: Max 20MB, supports PDF, DOC, DOCX, PPT, PPTX

3. **Admin Approval Workflow**
   - Admins view pending uploads in the Admin Dashboard
   - Review document details and metadata
   - **Approve**: Document moved to `approved/` folder, status set to `approved`
   - **Reject**: Document deleted from storage and database

4. **AI-Powered Chat**
   - Student asks: "I need data structures notes for 3rd sem CSE"
   - Chat edge function fetches all approved documents
   - Gemini AI (google/gemini-2.5-flash) analyzes query against document database
   - AI returns relevant document IDs in format `[DOCUMENTS: id1, id2]`
   - Frontend displays matching documents with download/email options

5. **Document Access**
   - **Download**: Direct download from Supabase Storage
   - **Email**: Edge function sends document as email attachment via Resend API

## 🛡️ Security Features

- **Row-Level Security (RLS)**: All database tables protected with RLS policies
- **Role-Based Access Control**: Separate user and admin permissions
- **JWT Authentication**: Edge functions verify JWT tokens
- **Storage Policies**: Files accessible only based on user permissions
- **Input Validation**: Client-side validation using Zod schemas
- **Secure File Handling**: Approved documents isolated from pending uploads

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom design system
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **TanStack Query** - Data fetching and caching
- **Zod** - Schema validation

### Backend (Lovable Cloud)
- **Supabase Database** - PostgreSQL with RLS
- **Supabase Auth** - User authentication
- **Supabase Storage** - File storage with buckets
- **Edge Functions** - Serverless Deno functions
- **Lovable AI Gateway** - AI model integration (Gemini)
- **Resend API** - Email delivery service

### AI Integration
- **Model**: Google Gemini 2.5 Flash
- **Purpose**: Natural language query processing and document matching
- **Context**: System prompt includes all approved documents for accurate matching

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx           # Navigation bar with auth
│   ├── ProtectedRoute.tsx   # Route authentication guard
│   └── ui/                  # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx      # Authentication state management
├── pages/
│   ├── Auth.tsx             # Login/Signup page
│   ├── Chat.tsx             # Main chat interface
│   ├── Upload.tsx           # Document upload form
│   └── Admin.tsx            # Admin dashboard
├── integrations/
│   └── supabase/            # Auto-generated Supabase client
└── App.tsx                  # Root component with routing

supabase/
├── functions/
│   ├── chat/               # AI chat edge function
│   └── send-email/         # Email sending edge function
└── migrations/             # Database schema migrations
```

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd vtu-mitra

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
The following environment variables are auto-configured by Lovable Cloud:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID

### Required Secrets (Edge Functions)
- `RESEND_API_KEY` - For email functionality
- Additional secrets configured via Lovable Cloud

## 📊 Database Schema

### Tables
- **profiles**: User information (email, full_name, timestamps)
- **user_roles**: Role assignments (admin/user)
- **documents**: Study material metadata and status

### Storage Buckets
- **documents**: 
  - `pending/` - Uploaded documents awaiting approval
  - `approved/` - Approved documents accessible to all students

## 🔐 Admin Access

Default admin emails:
- altmilind@gmail.com
- padmeshhu2006@gmail.com

New admins can be added by modifying the `handle_new_user()` trigger function in the database.

## 📝 Development

### Editing Code
- **Lovable IDE**: Visit [Lovable Project](https://lovable.dev/projects/21353cef-f9e6-48a0-84d1-e3bf986e65c9)
- **Local IDE**: Clone repo and edit locally, push changes to sync
- **GitHub**: Edit files directly in GitHub interface
- **Codespaces**: Use GitHub Codespaces for cloud-based development

### Deployment
Click the **Publish** button in Lovable (top right on desktop, bottom right on mobile)

### Custom Domain
Navigate to Project > Settings > Domains in Lovable (requires paid plan)

## 🤝 Contributing

This is a student project for VTU. Contributions welcome!

## 📄 License

Built with [Lovable](https://lovable.dev) - The AI Full-Stack Engineer

## 🔗 Project Links

- **Lovable Project**: https://lovable.dev/projects/21353cef-f9e6-48a0-84d1-e3bf986e65c9
- **Documentation**: https://docs.lovable.dev
