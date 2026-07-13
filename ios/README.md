# PlayFlix iOS Starter

This folder starts the native iOS roadmap with a clean SwiftUI scaffold and Apple-platform starter targets.

## Included Starter Setup

- SwiftUI app source structure
- iOS design-guideline starter dashboard
- AirPlay starter module
- Picture-in-Picture starter module
- Face ID and Touch ID starter module
- WidgetKit target placeholder
- Dynamic Island and Live Activities placeholder target
- XcodeGen project specification for generating the Xcode project

## Folder Structure

```text
ios/
├── project.yml
├── PlayFlix/
│   ├── App/
│   ├── Features/
│   ├── Models/
│   ├── Services/
│   ├── Theme/
│   └── Resources/
├── PlayFlixWidget/
│   ├── PlayFlixWidget.swift
│   └── Info.plist
├── PlayFlixLiveActivity/
│   ├── PlayFlixLiveActivity.swift
│   └── Info.plist
└── Shared/
    └── NowPlayingAttributes.swift
```

## Next Steps

1. Install Xcode 16 or newer.
2. Install [XcodeGen](https://github.com/yonaskolb/XcodeGen).
3. Open a terminal in `ios/`.
4. Run `xcodegen generate`.
5. Open the generated `PlayFlix.xcodeproj`.
6. Set your Apple Team, bundle identifiers, and signing.
7. Expand the starter modules into real playback, biometric, widget, and live activity flows.
