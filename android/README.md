# PlayFlix Android Starter

This folder starts the native Android app roadmap with a clean Kotlin + Jetpack Compose scaffold.

## Included Starter Setup

- Kotlin Android application module
- Jetpack Compose foundation
- Material Design 3 theme
- Responsive layout groundwork for phone, tablet, and foldable widths
- Starter modules for:
  - offline downloads
  - Chromecast
  - picture-in-picture
  - tablet optimization
  - foldable device support

## Folder Structure

```text
android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/playflix/app/
│       │   ├── MainActivity.kt
│       │   ├── features/AndroidStarterModules.kt
│       │   └── ui/
│       │       ├── PlayFlixApp.kt
│       │       └── theme/
│       └── res/
└── settings.gradle.kts
```

## Next Steps

1. Install Android Studio with Android SDK 35.
2. Open the `android/` folder as a standalone Android project.
3. Sync Gradle and run the `app` module.
4. Replace placeholder backend URL values with your real API endpoints.
5. Expand the starter feature modules into real implementations.
