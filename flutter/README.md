# PlayFlix Flutter Apps

This directory contains all the Flutter-based applications for PlayFlix.

## Project Structure

```
flutter/
├── packages/
│   └── playflix_core/       # Shared core package (models, API clients, widgets, etc.)
└── apps/
    ├── playflix/            # Main mobile app (Android / iOS / tvOS)
    ├── playflix_tv/         # TV apps (Android TV / Google TV / Fire TV)
    └── playflix_web/        # Web apps (Roku / LG webOS / Samsung Tizen / Titan OS)
```

## Getting Started

1. Install Flutter: https://flutter.dev/docs/get-started/install
2. Install Melos (optional, but recommended for monorepo management):
   ```bash
   dart pub global activate melos
   ```
3. Bootstrap the monorepo:
   ```bash
   cd flutter
   melos bootstrap
   ```

## Available Scripts (via Melos)

- `melos run analyze`: Run `flutter analyze` on all packages
- `melos run format`: Run `dart format` on all packages
- `melos run test`: Run all tests
- `melos run build:all`: Build all release versions
- `melos run clean:deep`: Clean all packages

## Individual Apps

### PlayFlix (Mobile)
- Platforms: Android, iOS, tvOS (Apple TV)
- Features: Material You + Glass UI, offline support, background downloads, etc.

### PlayFlix TV
- Platforms: Android TV, Google TV, Fire TV
- Features: Remote-friendly UI, focus navigation, hero carousel, voice search, etc.

### PlayFlix Web
- Platforms: Web, Roku, LG webOS, Samsung Tizen, Titan OS
- Features: Responsive UI, keyboard navigation, etc.

## Shared Package (playflix_core)
Contains all shared code used by all apps:
- Data models
- API clients
- Custom widgets
- Theme and styling
- Utility functions