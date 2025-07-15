# Yello Bar Admin Dashboard

A modern admin dashboard for managing Yello Bar users, announcements, and analytics. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔒 **Secure Authentication** - Role-based access with Supabase Auth
- 👥 **User Management** - View and manage user roles (free, unlimited, admin)
- 📢 **Announcement Management** - Manage bars/banners with status and visibility controls
- 📊 **Dashboard Analytics** - Real-time stats and metrics
- 🎨 **Modern UI** - Clean, responsive design with shadcn/ui components
- 🚀 **Vercel Deployment** - Ready for production deployment

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project with the following setup:
  - `profiles` table with `id`, `email`, `role`, `created_at`, `updated_at`
  - `announcements` table with `id`, `title`, `content`, `status`, `visibility`, `user_id`, `scheduled_at`, `created_at`, `updated_at`
  - Row Level Security (RLS) policies configured

## Database Schema

This admin dashboard works with your existing yello.bar database schema:

### Profiles Table
The existing `profiles` table with an added `admin` boolean column:
```sql
-- Add admin column to existing profiles table
ALTER TABLE profiles ADD COLUMN admin boolean DEFAULT false;
```

### Announcements Table  
Uses your existing `announcements` table with all the styling and configuration fields:
- `visibility` (boolean) - determines if banner is shown
- `scheduled_start`/`scheduled_end` - for scheduling banners
- `title`, `message` - content fields
- All styling fields like `background`, `text_color`, `font_family`, etc.

### Required Database Changes
You only need to add the admin column to your existing profiles table:
```sql
ALTER TABLE profiles ADD COLUMN admin boolean DEFAULT false;

-- Grant admin privileges to your user
UPDATE profiles SET admin = true WHERE id = 'your-user-id';
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yello.bar.admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Deployment on Vercel

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Configure the project settings

2. **Set environment variables in Vercel**
   - Go to your project settings
   - Add the same environment variables from `.env.local`

3. **Deploy**
   - Vercel will automatically build and deploy your application
   - Configure your custom domain (admin.yello.bar)

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── page.tsx            # Dashboard with stats
│   │   ├── users/
│   │   │   └── page.tsx        # User management
│   │   └── bars/
│   │       └── page.tsx        # Announcement management
│   ├── login/
│   │   └── page.tsx            # Admin login page
│   ├── unauthorized/
│   │   └── page.tsx            # Access denied page
│   └── globals.css             # Global styles
├── components/
│   ├── admin/
│   │   ├── header.tsx          # Admin header component
│   │   └── sidebar.tsx         # Admin sidebar navigation
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   ├── utils.ts                # Utility functions
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── types.ts            # Database types
└── middleware.ts               # Route protection middleware
```

## Authentication Flow

1. **Login**: Users sign in with email/password
2. **Role Check**: System verifies user has 'admin' role
3. **Route Protection**: Middleware protects all `/admin/*` routes
4. **Session Management**: Automatic session refresh and logout

## Available Pages

- **Dashboard** (`/admin`) - Overview stats and metrics
- **Users** (`/admin/users`) - User management with role editing
- **Bars** (`/admin/bars`) - Announcement management with filtering
- **Login** (`/login`) - Admin authentication
- **Unauthorized** (`/unauthorized`) - Access denied page

## Features in Detail

### User Management
- View all registered users with email addresses
- Filter by plan (free, unlimited) and admin status
- Search by email or user ID
- Change user plans between free and unlimited
- Grant/revoke admin privileges
- View user creation dates

### Announcement Management
- View all announcements/bars with full styling details
- Smart status detection (active, scheduled, inactive) based on visibility and scheduling
- Filter by computed status and visibility (visible/hidden)
- Search by title or user
- Toggle banner visibility (show/hide)
- View scheduled start times and user information
- See all styling properties (colors, fonts, alignment, etc.)

### Dashboard Analytics
- Total users count
- Free vs Unlimited plan breakdown
- Visible banner count (currently active)
- Scheduled banners for next 24 hours

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- All admin routes are protected by middleware
- Role-based access control enforced at database level
- Service role key used only on server side
- Environment variables properly configured

## Support

For questions or issues, please contact the development team or create an issue in the repository.

## License

This project is private and proprietary to Yello Bar.
