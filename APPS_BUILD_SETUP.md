# PlayFlix - Apps Build Setup Guide

A single reference for **every deliverable in the PlayFlix repo**:

- 🌐 Web (Next.js PWA)
- 🔌 Backend API (NestJS)
- 🤖 Native Android (Kotlin + Jetpack Compose)
- 🍎 Native iOS / tvOS (SwiftUI + XcodeGen)
- 🐦 Flutter Mobile app (`flutter/apps/playflix`)
- 📺 Flutter TV app (`flutter/apps/playflix_tv`)
- 🔥 Flutter Web/TV-templates app (`flutter/apps/playflix_web`)

---

## 0. Repository layout (where each build lives)

```
playbox/
├── app/                      Next.js Web frontend (source)
├── backend/                  NestJS API backend
├── android/                  Native Android starter (Kotlin / Jetpack Compose)
├── ios/                      Native iOS starter (SwiftUI + XcodeGen project.yml)
└── flutter/
    ├── apps/
    │   ├── playflix/         Flutter mobile (Android + iOS + tvOS)
    │   ├── playflix_tv/      Flutter TV (Android TV / Google TV / Fire TV)
    │   └── playflix_web/     Flutter web (Roku / webOS / Tizen / Titan wrappers)
    ├── packages/
    │   └── playflix_core/    Shared Dart package used by all 3 Flutter apps
    └── melos.yaml            Melos workspace (scripts + builds)
```

---

## 1. Global prerequisites (all builds)

Install these **once** on your development machine.

| Purpose | Package | Min version | Install |
|---|---|---|---|
| JavaScript runtime | Node.js | 18.x (LTS) | https://nodejs.org |
| Node package manager | npm | 10.x (ships with Node) | `npm install -g npm@latest` |
| (Recommended) Better npm alternative | pnpm | 9+ | `npm install -g pnpm` |
| Video transcoding (backend) | FFmpeg | 4.4+ | macOS: `brew install ffmpeg`<br>Ubuntu: `sudo apt install -y ffmpeg`<br>Windows: https://www.gyan.dev/ffmpeg/builds/ |
| Default DB (backend) | SQLite 3 | 3.35+ | macOS/Linux usually ships it; Windows: https://www.sqlite.org/download.html |
| (Optional, only if you use caching) | Redis | 7+ | macOS: `brew install redis`<br>Ubuntu: `sudo apt install -y redis-server` |
| Dart / mobile SDK | Flutter | 3.22+ (the apps pin `sdk: ^3.12.2` so a **3.12.x / 3.24.x** SDK is recommended) | https://docs.flutter.dev/get-started/install |
| Dart monorepo tool | Melos | 6.x | `dart pub global activate melos` (only for Flutter builds) |
| Native Android builds | Android Studio (with SDK 35) / JDK 17 | Chipmunk+ | https://developer.android.com/studio |
| Native iOS / Flutter iOS builds | Xcode | 16+ | App Store / https://developer.apple.com/xcode |
| (Native iOS only) Project generator | XcodeGen | 2.40+ | `brew install xcodegen` (macOS only) |

---

## 2. Environment variables (frontend + backend)

### 2.1 Frontend (Next.js) — `.env.local` in repo root

Create `playbox/.env.local` (copy example below — **do NOT commit this file**):

```env
# ── NextAuth (MANDATORY or you get CLIENT_FETCH_ERROR) ──────────
# v4 uses NEXTAUTH_SECRET by default. Set BOTH for forward-compat:
NEXTAUTH_SECRET="paste-a-64-byte-random-secret-here"
AUTH_SECRET="paste-the-same-64-byte-random-secret-here"

# NextAuth origin. MUST match the port you actually launch the FE on:
#   port 3000 -> http://localhost:3000
#   port 3001 -> http://localhost:3001
NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_URL_INTERNAL="http://localhost:3000"   # optional for container envs

# Google OAuth (required by the existing NextAuth Google provider)
GOOGLE_CLIENT_ID=replace-me.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=replace-me

# App base used for <head> metadata / canonical URLs / manifest.webmanifest
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backend API URL consumed by lib/api.ts (frontend -> backend calls)
NEXT_PUBLIC_API_BASE="http://localhost:3002"

# (optional) enable PWA Service Worker on localhost for testing
# NEXT_PUBLIC_ENABLE_PWA_ON_LOCALHOST=true
```

Quick secret generator (terminal):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 2.2 Backend (NestJS) — `backend/.env`

Copy `backend/.env.example` → `backend/.env`:
```bash
cd backend
cp .env.example .env
```

Minimum `.env` you must customise:
```env
NODE_ENV=development
PORT=3002

# Secret used for JWT auth tokens (make this DIFFERENT from NEXTAUTH_SECRET!)
JWT_SECRET=different-long-random-jwt-secret

# Default admin login for /admin panel (change these in production)
ADMIN_PANEL_USER=admin
ADMIN_PANEL_PASSWORD=admin
ADMIN_PANEL_EMAIL=admin@playflix.local

# (Optional but recommended) metadata enrichment
TMDB_API_KEY=your-tmdb-v3-api-key
FANART_API_KEY=your-fanart-tv-api-key

# (Optional) If you actually run Redis
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

---

## 3. Install project dependencies

Run from the repo root (`playbox/`):

```bash
# Frontend + Backend node_modules (from root package.json "install:all")
npm install
npm run install:all
```

Then, for the Flutter **monorepo** (separate from the node build):
```bash
cd flutter
dart pub global activate melos     # one-time install
melos bootstrap                    # installs + links playflix_core into all 3 apps
```

(Equivalent without Melos, if you want to do it manually: `cd flutter/packages/playflix_core && flutter pub get`, then repeat `flutter pub get` in each app under `flutter/apps/*`.)

---

## 4. Dev runs (before you build)

Before shipping a release build, confirm your environment is correct with the dev runs below.

### 4.1 Run Frontend dev server
```bash
# from repo root, default port 3000
npm run dev
# → http://localhost:3000

# alternative port (don't forget to edit NEXTAUTH_URL + NEXT_PUBLIC_APP_URL)
npx next dev -p 3001
```

### 4.2 Run Backend dev server
```bash
# from repo root
npm run dev:backend
# → http://localhost:3002/api  (health: /api/server-health)
```

### 4.3 Run both together (via concurrently)
```bash
# from repo root — runs FE (3000) + BE (3002) in one terminal
npm run dev:all
```

### 4.4 Sanity-check URLs
| URL | What it proves |
|---|---|
| `http://localhost:3000` | FE renders home page (HeroBanner + rows) |
| `http://localhost:3000/kids` | FE switches to Kids-mode view correctly |
| `http://localhost:3000/anime` | FE switches to Anime-mode view correctly |
| `http://localhost:3000/admin` | Admin panel loads (login via `backend/.env` creds) |
| `http://localhost:3002/api/server-health` | JSON `{status:"ok"}` = backend is alive |
| `http://localhost:3000/api/auth/session` | Returns `200` + `{}` (unauthed) = NextAuth wired |
| `http://localhost:3000/api/auth/csrf` | Returns `200` + `{csrfToken:...}` = sessions OK |

---

## 5. Production builds — Web/API

All output directories listed below are what you upload/deploy.

---

### 5.1 Backend (NestJS) — production build

```bash
cd backend
npm run build                # compiles src/ -> dist/ (TypeScript -> JS)
# then, to run the compiled bundle:
npm run start:prod           # runs node dist/main on PORT from .env (default 3002)
```

**Deliverable artifacts:**
- `backend/dist/` — copy the whole folder to the server
- `backend/node_modules/` — you need this on the server too (or `npm ci --omit=dev` there)
- `backend/.env` — production values (keep out of source control)
- `backend/playflix.db` — the SQLite DB (auto-created on first start) OR swap to Postgres via `.env`
- (Optional) `backend/uploads/` — poster/profile uploads made from the admin panel

**Seed starter data (optional):**
```bash
cd backend
npm run seed                 # runs src/seed.ts once
```

---

### 5.2 Frontend (Next.js) — production build

From the repo root:
```bash
# 1. Build (reads .env.local at BUILD-time for NEXT_PUBLIC_* variables)
npm run build                # Next.js compiles -> .next/ standalone build output

# 2. Run the built app (port 3000 per package.json "start" script)
npm run start
# → http://localhost:3000
```

**Deliverable artifacts:**
- `.next/` — Next.js build cache + compiled pages (required)
- `public/` — static assets, `manifest.webmanifest`, `sw.js`, images (required)
- `node_modules/` — runtime dependencies on server
- `.env.local` — production env (read at runtime by `next start` for NEXTAUTH secrets)
- `next.config.js` + `package.json` — required for `npm run start` to know how to launch it

**Alternative: Standalone output (smaller Docker images)**
`next.config.js` currently does not opt in, but if you add:
```js
module.exports = { output: 'standalone', /* ...rest */ }
```
then after `npm run build` you get a minimal runnable bundle:
```
.next/standalone/   +   public/   +   .next/static/
```
which is what most Vercel-style deployers prefer.

**Build variants you may want:**
```bash
# Build & serve non-default port (example: 3001 for pre-prod)
NEXT_PUBLIC_APP_URL=http://localhost:3001 NEXTAUTH_URL=http://localhost:3001 \
  npm run build
NEXT_PUBLIC_APP_URL=http://localhost:3001 NEXTAUTH_URL=http://localhost:3001 \
  npx next start -p 3001
```

**Lint + type-check pass (recommended CI step):**
```bash
npm run lint
npx tsc --noEmit
```

---

## 6. Native Android build (`android/` folder, Kotlin starter)

This is the **native Kotlin + Jetpack Compose** starter in `android/`. It is independent from the Flutter build (which also has its own Android target).

### Prerequisites
- Android Studio Hedgehog+ with **Android SDK Platform 35** installed
- JDK 17 (bundled inside Android Studio — point `JAVA_HOME` at it, OR use Android Studio's built-in Gradle JDK)
- `$ANDROID_HOME` set to your Android SDK folder (typically `~/Android/Sdk`)

### 6.1 Debug APK (local test installs)

**Windows (Powershell/cmd):**
```powershell
cd playbox\android
.\gradlew.bat assembleDebug
# → android\app\build\outputs\apk\debug\app-debug.apk
```

**macOS / Linux:**
```bash
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Install directly to a connected device / emulator:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### 6.2 Release AAB (Google Play store) + signed APK

1. **Create a signing keystore** (once per app lifetime):
   ```bash
   keytool -genkey -v -keystore playflix-android.jks \
     -keyalg RSA -keysize 2048 -validity 10000 -alias playflix
   ```
2. **Create `android/keystore.properties`** (NOT in git):
   ```properties
   storeFile=../playflix-android.jks
   storePassword=your-store-pass
   keyAlias=playflix
   keyPassword=your-key-pass
   ```
3. **Wire signingConfigs into `android/app/build.gradle.kts`** (the existing scaffold doesn't yet — add a `signingConfigs.release { ... }` block and hook it to `buildTypes.release.signingConfig = signingConfigs.release`).
4. **Run builds:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease   # APK for sideload / direct distribution
   ./gradlew bundleRelease     # .aab for Google Play Console upload
   ```
   Outputs:
   - `android/app/build/outputs/apk/release/app-release.apk`
   - `android/app/build/outputs/bundle/release/app-release.aab`  ⬅ upload to Google Play

---

## 7. Native iOS build (`ios/` folder, SwiftUI starter)

⚠ macOS **only** — Xcode only runs on Apple Silicon / Intel Macs.

### 7.1 One-time setup
```bash
# Install XcodeGen via homebrew (https://github.com/yonaskolb/XcodeGen)
brew install xcodegen

# From repo root:
cd ios
xcodegen generate            # generates PlayFlix.xcodeproj from project.yml
open PlayFlix.xcodeproj      # opens Xcode
```

### 7.2 In Xcode
1. Select the **Runner** project → `Signing & Capabilities`.
2. Pick your **Apple Developer Team**.
3. Change bundle IDs to something unique (e.g. `com.yourcompany.playflix`, `com.yourcompany.playflix.widget`, `com.yourcompany.playflix.liveactivity`).
4. Sign **every target** (App + Widget + Live Activity).
5. If you want a **tvOS build**, add a tvOS target in `project.yml` and re-run `xcodegen generate`.

### 7.3 Builds
- **Development on Simulator:** press **Run** in Xcode (target: iPhone 16 Simulator).
- **Device run:** connect your iPhone, select it as the run destination, press Run.
- **Archive for App Store / TestFlight:** in Xcode menu → `Product > Archive` → the Organizer opens → **Distribute App**.

Artifacts (from Archive organizer):
- `*.ipa` – upload to TestFlight / App Store Connect.

---

## 8. Flutter builds (the `flutter/` monorepo workspace)

Three apps, all sharing `flutter/packages/playflix_core`:

| App | Directory | Primary target platforms |
|---|---|---|
| **playflix** | `flutter/apps/playflix` | Android APK / AAB, iOS IPA, **tvOS** (Apple TV) |
| **playflix_tv** | `flutter/apps/playflix_tv` | Android TV / Google TV / Fire TV (APK) |
| **playflix_web** | `flutter/apps/playflix_web` | Static web build (then wrap for Roku / webOS / Tizen / Titan) |

### 8.0 One-time Melos commands (recommended before any Flutter build)
```bash
cd flutter
melos bootstrap              # resolves deps + wires local playflix_core
melos run analyze            # dart analyzer pass on every package
melos run test               # runs all widget/unit tests
# (optional) deep-clean if something caches badly:
melos run clean:deep
```

### 8.1 Build **all three Flutter apps at once**

Via Melos (from `flutter/`):
```bash
melos run build:all
# equivalent to:
#   melos run build:playflix  (apk)
#   melos run build:playflix_tv  (apk)
#   melos run build:playflix_web  (web)
```

### 8.2 Flutter Mobile — Android
```bash
cd flutter/apps/playflix

# Debug APK (fast, install locally):
flutter build apk --debug
# output: flutter/apps/playflix/build/app/outputs/flutter-apk/app-debug.apk

# Release APK (sideload to single device):
flutter build apk --release --split-per-abi
# outputs:
#   build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk
#   build/app/outputs/flutter-apk/app-arm64-v8a-release.apk   ⬅ most modern phones
#   build/app/outputs/flutter-apk/app-x86_64-release.apk

# App Bundle for Google Play Store (RECOMMENDED for publishing):
flutter build appbundle --release
# output: build/app/outputs/bundle/release/app-release.aab
```

Signing these APKs/AABs uses the same workflow as **Section 6** (`keystore.properties` + `android/app/build.gradle.kts`). The Flutter wrapper auto-uses that signing config once you add it — it runs Gradle under the hood.

### 8.3 Flutter Mobile — iOS / IPA
```bash
cd flutter/apps/playflix

# 1. one-time native setup (re-run after any pubspec.yaml plugin change)
flutter create --platforms=ios .   # only needed if Podfile is missing; usually already present
cd ios && pod install && cd ..     # resolve CocoaPods dependencies

# 2. simulator build (for quick tests on Mac):
flutter build ios --simulator

# 3. device / App Store build (creates .xcarchive for Xcode Organizer):
flutter build ipa --release
# → outputs build/ios/ipa/playflix.ipa
```
Alternative: `open ios/Runner.xcworkspace` → `Product > Archive` (same as native workflow).

### 8.4 Flutter Mobile — tvOS (Apple TV)
Flutter does not ship a first-class `flutter build tvos` command in stable; the normal approach is to add a tvOS target to `ios/Runner.xcodeproj` that points at the same Flutter engine and Dart code, then Archive through Xcode exactly like iOS. Run `open flutter/apps/playflix/ios/Runner.xcworkspace` → add tvOS target → build/archive there.

### 8.5 Flutter TV (Android TV / Google TV / Fire TV)
```bash
cd flutter/apps/playflix_tv

# Debug install to your TV box (must be ADB-enabled, same network as your laptop):
flutter devices                        # confirm the TV shows (e.g. "Google TV Chromecast")
flutter run -d <TV-DEVICE-ID>

# Release APK (sideload to TV boxes / submit to Play Store TV tab):
flutter build apk --release --split-per-abi
# output: flutter/apps/playflix_tv/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
```
Google Play Console lets you upload the same `.aab` you get from `flutter build appbundle --release` and just mark the release track as "Android TV / Google TV" via the Release → Device catalog page.

For **Amazon Fire TV**: build the arm64-v8a release APK, then upload to the Amazon Appstore developer portal (Fire OS 7+ runs standard Android APKs natively; no recompile needed).

### 8.6 Flutter Web (for Roku / webOS / Tizen / Titan wrapping)
```bash
cd flutter/apps/playflix_web
flutter build web --release --pwa-strategy=none
# output directory: flutter/apps/playflix_web/build/web/
# this folder is a fully-static web SPA (index.html + main.dart.js + assets/)
```

This `build/web/` is then fed into each TV platform's wrapper toolchain:
- **Roku**: use `brighterscript` + a SceneGraph `Channel` template that opens this URL in a `Poster`/`roWebAssistan` (or embed as `pkg:/components/...`) using BrightSign's HTMLView if available.
- **LG webOS**: import the folder contents into the webOS Studio CLI template, zip it and call it `*.ipk`.
- **Samsung Tizen**: wrap with Tizen Studio .NET + web widget project to produce a `.wgt`.
- **Titan OS**: same static web bundle served via Titan's browser shell (check Titan vendor docs for expected manifest).

To test the web build locally without wrapping:
```bash
flutter run -d chrome --release
# or, after build:
python3 -m http.server 8080 --directory build/web
# open http://localhost:8080
```

---

## 9. Convenience scripts (references)

All the short-cuts defined in the **root `package.json`** so you don't have to remember paths:

| Root script | What it does |
|---|---|
| `npm install` | Installs only frontend deps |
| `npm run install:all` | Installs frontend + `backend/` deps (recommended) |
| `npm run dev` | Starts Next.js FE on **3000** |
| `npm run dev:backend` | Starts NestJS BE watch mode on **3002** |
| `npm run dev:all` | FE + BE together via concurrently |
| `npm run seed` | Runs `backend/src/seed.ts` once |
| `npm run build` | Next.js FE production build (`app/`) |
| `npm run build:android` | Runs `cd android && gradlew.bat assembleRelease` (native Android, Windows only) |
| `npm run dev:android` | Native Android debug build (Windows only) |
| `npm run dev:ios` | Runs `xcodegen generate` + opens iOS Xcode project (macOS only) |

All the Flutter equivalents live inside `flutter/melos.yaml` (run from `flutter/` folder, `melos run <name>`):

| Melos script | What it does |
|---|---|
| `melos run analyze` | `flutter analyze` all packages |
| `melos run format` | `dart format .` all packages |
| `melos run test` | runs all tests in all packages |
| `melos run clean:deep` | `melos clean + flutter clean` everywhere |
| `melos run build:playflix` | `flutter build apk --release` for mobile app |
| `melos run build:playflix_tv` | `flutter build apk --release` for TV app |
| `melos run build:playflix_web` | `flutter build web --release` for web template |
| `melos run build:all` | builds all three (mobile apk + TV apk + web) |

---

## 10. Build verification checklist

Before you ship **any** build, verify:

- [ ] `node -v` ≥ 18, `npm -v` ≥ 10
- [ ] `.env.local` has **both** `NEXTAUTH_SECRET` + `AUTH_SECRET` and **both point to the same string**
- [ ] `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` match the exact `host:port` the app is served from (no mismatches or you get the NextAuth `CLIENT_FETCH_ERROR`)
- [ ] `npm run build` passes (Next.js FE)
- [ ] `cd backend && npm run build && npm run start:prod` starts on PORT 3002 and returns healthy JSON from `/api/server-health`
- [ ] For a mobile APK: install via `adb install -r *.apk` and confirm cold-launch to Home screen works
- [ ] For Flutter apps: `melos run analyze` shows **0 errors**, `melos run test` passes
- [ ] For Native iOS: Archive build succeeds and Signing report shows all 3 targets (App / Widget / Live Activity) are correctly signed
- [ ] For Android TV release: install on a TV box and focus-navigation (D-pad) works top→bottom through hero → rows → detail

---

## 11. Troubleshooting

### FE / BE
- **`[next-auth][error][CLIENT_FETCH_ERROR]`**: 95% of the time this is **NEXTAUTH_URL port mismatch** or a missing `NEXTAUTH_SECRET`. See **Section 2.1** — restart the dev server after editing `.env.local` so it picks up new env vars.
- **Port 3000/3002 busy**: `npx kill-port 3000` (Linux/macOS: `lsof -ti:3000 | xargs kill -9`).
- **Backend won't connect to SQLite**: ensure folder `backend/` is writable and `sqlite3` is installed (`sqlite3 --version`).
- **npm weirdness**: try `rm -rf node_modules package-lock.json backend/node_modules backend/package-lock.json` then `npm run install:all` again (Windows: use File Explorer to delete the folders).

### Flutter
- **Could not find a file named "pubspec.yaml" in `packages/playflix_core`**: you forgot `cd flutter && melos bootstrap`.
- **"Android sdkmanager not found"**: open Android Studio → Settings → Languages & Frameworks → Android SDK → SDK Tools → check **Android SDK Command-line Tools (latest)**. Also accept the licenses once: `flutter doctor --android-licenses`.
- **iOS pod install fails**: `sudo gem install cocoapods` (or `brew install cocoapods`).
- **"Flutter version 3.x.x does not match SDK constraint ^3.12.2"**: install the matching Flutter SDK via `fvm install 3.24.0` then `fvm use 3.24.0` (https://fvm.app).

### Native Android
- **Gradle sync fails**: in Android Studio, set Gradle JDK to **Embedded JDK (JDK 17)** and confirm `local.properties` has `sdk.dir=/Users/you/Library/Android/sdk` (macOS) or the Windows equivalent.

### Native iOS
- **`xcodegen: command not found`**: `brew install xcodegen` or `brew upgrade xcodegen` (macOS only).
- **Signing errors in Xcode**: ensure the **bundle IDs are globally unique** (Apple won't allow 2 teams to reuse the same id) and all targets (App / Widget / Live Activity) share the same Team in Signing & Capabilities.

---

That's it — with this guide you can build **every** artifact the repo is designed to produce. Happy shipping!
