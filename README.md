# PlayFlix - Premium Streaming Platform

A modern, cinematic streaming platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎬 **Cinematic Hero Banner**: Full-screen, auto-rotating featured movies with smooth animations
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- 🎨 **Dark Theme**: Elegant dark mode with glassmorphism effects
- 🎞️ **Interactive Movie Cards**: Hover effects and quick actions
- 🎭 **Smooth Animations**: Powered by Framer Motion
- 🔍 **Navigation**: Scroll-aware navbar with smooth transitions

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Getting Started

- Full setup guide: [SETUP.md](./SETUP.md)
- Ubuntu local server instructions: see `Ubuntu Local Server Setup Guide` in [SETUP.md](./SETUP.md)

### Prerequisites

- Node.js (LTS version recommended) - [Download here](https://nodejs.org/)

### Installation

1. **Install Node.js** (if not already installed):
   - Go to https://nodejs.org/
   - Download and install the LTS version
   - Restart your terminal/IDE after installation

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
PlayFlix/
├── app/                     # App Router directory
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── Navbar.tsx          # Navigation bar
│   ├── HeroBanner.tsx      # Hero banner section
│   ├── MovieCard.tsx       # Movie poster card
│   ├── MovieRow.tsx        # Movie carousel row
│   └── Footer.tsx          # Footer component
├── lib/                    # Utility functions and data
│   ├── data.ts             # Sample movie data
│   └── utils.ts            # Utility functions (cn)
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind CSS config
└── next.config.js          # Next.js config
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps to Complete the Platform

1. **Backend API**: Implement NestJS/GraphQL/REST API
2. **Database**: Set up PostgreSQL database
3. **Authentication**: Add user login/signup
4. **Admin Dashboard**: Build content management system
5. **Video Streaming**: Implement video player and streaming infrastructure
6. **Mobile Apps**: Develop Android/iOS apps
7. **Payment System**: Add subscription and payment integration

## License

MIT
