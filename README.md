# PlayFlix - Premium Streaming Platform

A modern, cinematic streaming platform built with Next.js, TypeScript, and Tailwind CSS.

## Deliverables

- 🌐 **Responsive Next.js Website**: Web streaming experience for desktop, tablet, and mobile
- 🤖 **Flutter Android App**: Mobile Android application
- 🍎 **Flutter iOS App**: Mobile iPhone application
- 📺 **Flutter Android TV App**: 10-foot TV experience for Android TV devices
- 📺 **Flutter Google TV App**: Google TV optimized experience
- 🔥 **Flutter Fire TV App**: Amazon Fire TV optimized experience
- 🍎 **Flutter Apple TV (tvOS) App**: Apple TV living-room experience
- 📡 **Flutter Roku-Compatible Interface**: Roku-targeted TV interface layer
- 📺 **Flutter LG webOS Interface**: LG smart TV interface target
- 📺 **Flutter Samsung Tizen Interface**: Samsung smart TV interface target
- 📺 **Flutter Titan OS Interface**: Titan OS smart TV interface target

## Features

- 🎬 **Cinematic Hero Banner**: Full-screen, auto-rotating featured movies with smooth animations
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- 🎨 **Dark Theme**: Elegant dark mode with glassmorphism effects
- 🎞️ **Interactive Movie Cards**: Hover effects and quick actions
- 🎭 **Smooth Animations**: Powered by Framer Motion
- 🔍 **Navigation**: Scroll-aware navbar with smooth transitions

### AI Features
- 📊 **Trending Prediction**: Predict upcoming trending content
- 📂 **Auto Categorization/Smart Categorization**: Auto-categorize movies/shows
- 📝 **AI Subtitle & AI Subtitle Translation**: Auto-generate and translate subtitles
- 🌍 **AI Translation**: Translate content across multiple languages
- 🎙️ **AI Voiceover & AI Voice Search**: Voice-powered navigation and voiceovers
- 🖼️ **AI Poster Enhancement & AI Posters**: Generate and enhance movie posters
- 🔍 **Smart Search & AI Search**: AI-powered search and discovery
- 🤖 **AI Chat Assistant**: Chat with AI for recommendations and help
- 📈 **Churn Prediction**: Predict user churn
- 📋 **AI Recommendations**: 
  - Trending
  - Recently Watched
  - Because You Watched
  - Popular Near You
  - New Releases
  - Top Rated
- 🧹 **AI Metadata Cleanup**: Clean and standardize content metadata

### Download Features
- 📥 **Offline Download**: Download content for offline viewing
- 🔒 **Encrypted Downloads**: Secure encrypted downloads
- 🤖 **Smart Downloads**: Auto-download next episodes
- 📂 **Download Manager**: Manage all downloads in one place
- 💾 **Storage Manager**: Manage device storage usage

### Android App
- 🎨 **Material You + Glass UI**: Modern material design with glass morphing
- 🚀 **Jetpack Compose**: Built with latest Jetpack Compose
- 📶 **Offline Support**: Full offline functionality
- ⏸️ **Background Downloads**: Download content in background
- 📱 **Android 10+**: Supports Android 10 and newer
- 🚀 **Android 16 Ready**: Ready for upcoming Android 16
- 📐 **Tablet Support**: Optimized for tablets
- 📱 **Foldable Support**: Supports foldable devices
- 📺 **Chromecast**: Cast content to Chromecast devices
- 📺 **Picture in Picture**: Floating video player

### iOS App
- 🎨 **SwiftUI**: Built with SwiftUI for native performance
- 🪟 **Glass Design**: Beautiful glass interface
- 📺 **Apple TV Style**: Apple TV inspired UI
- 📺 **AirPlay**: AirPlay support
- 🔐 **Face ID**: Face ID authentication
- 🔐 **Touch ID**: Touch ID authentication
- 📱 **Dynamic Island**: Dynamic Island support
- 📱 **Widgets**: Home screen widgets
- 🔔 **Live Activities**: Live Activities support
- 📺 **Picture in Picture**: Floating video player

### Android TV App
- 📺 **Remote Friendly**: Optimized for remote control navigation
- 🎯 **Focus Navigation**: Focus-based UI for TV
- 🖼️ **Large Cards**: TV-sized large cards
- 🎠 **Hero Carousel**: Hero banner carousel
- 🎤 **Voice Search**: Voice search for TV
- ⏯️ **Continue Watching**: Continue watching from last position

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge
- **Cross-Platform Apps**: Flutter workspace in `flutter/`

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
├── flutter/                 # Flutter workspace for mobile/TV deliverables
│   ├── apps/               # App targets
│   └── packages/           # Shared Flutter packages
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
