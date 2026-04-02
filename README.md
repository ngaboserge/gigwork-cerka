# Cerka Gig Work Platform

> Connecting Rwanda's workforce with flexible employment opportunities

## Overview

Cerka Gig Work is an independent platform focused on temporary staffing and shift-based work in Rwanda. It connects workers with employers for flexible employment opportunities across various industries.

## Features

### For Workers
- **Find Shifts** - Browse and apply for available shifts in your area
- **Time Tracking** - Built-in time tracking with GPS verification
- **Reputation System** - Build your reputation through ratings and completed shifts
- **Instant Payments** - Get paid quickly for completed work
- **Skill Verification** - Verify your skills and certifications

### For Employers
- **Post Shifts** - Create shift postings with detailed requirements
- **Manage Applications** - Review and hire the best candidates
- **Track Performance** - Monitor worker performance and attendance
- **Analytics** - Get insights into your workforce and costs
- **Overbooking Management** - Handle no-shows with backup workers

### Core Capabilities
- Real-time shift matching
- GPS-based check-in/check-out
- Automated payroll processing
- Reliability scoring system
- Multi-language support (English, Kinyarwanda)
- Mobile-first design

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Google Maps API
- **Charts**: Recharts
- **Internationalization**: i18next

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gig-work-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-gig-work-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-gig-work-anon-key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/001_gig_work_schema.sql`
   - Enable Row Level Security (RLS)

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project for gig work platform
   - Note the project URL and anon key

2. **Run Migrations**
   - Copy the SQL from `supabase/migrations/001_gig_work_schema.sql`
   - Run it in the Supabase SQL editor

3. **Configure Authentication**
   - Enable email/password authentication
   - Set up email templates
   - Configure redirect URLs

## Project Structure

```
gig-work-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components
│   │   ├── layout/         # Layout components
│   │   └── jobs/           # Job-specific components
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── employee/       # Worker pages
│   │   ├── employer/       # Employer pages
│   │   └── admin/          # Admin pages
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── lib/                # Utilities and configurations
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── i18n/               # Internationalization
├── public/                 # Static assets
├── supabase/              # Database migrations
└── docs/                  # Documentation
```

## Key Features Implementation

### Shift Management System
- **Overbooking**: Automatically handle no-shows with backup workers
- **Real-time Updates**: Live status updates for shifts and applications
- **Smart Matching**: Match workers to shifts based on skills and location

### Reliability Scoring
- **Dynamic Scoring**: Real-time reliability scores based on performance
- **Event Tracking**: Track completion rates, punctuality, and ratings
- **Tier System**: Standard, Verified, Preferred, and Elite worker tiers

### Time Tracking
- **GPS Verification**: Ensure workers are at the correct location
- **Photo Check-in**: Optional photo verification for check-in
- **Break Management**: Track break times and calculate total hours

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Custom Server**
   - Build the project: `npm run build`
   - Serve the `dist` directory

### Environment Variables for Production
```env
VITE_SUPABASE_URL=https://your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://your-domain.com
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions:
- Email: support@cerka.rw
- Documentation: [docs.cerka.rw](https://docs.cerka.rw)
- Issues: Create an issue in this repository

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with payroll systems
- [ ] Multi-tenant support for agencies
- [ ] AI-powered shift recommendations
- [ ] Blockchain-based reputation system

---

Made with ❤️ in Rwanda 🇷🇼