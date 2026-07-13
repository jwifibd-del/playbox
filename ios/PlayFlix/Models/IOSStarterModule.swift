import SwiftUI

struct IOSStarterSection: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let modules: [IOSStarterModule]
}

struct IOSStarterModule: Identifiable {
    let id = UUID()
    let title: String
    let status: String
    let summary: String
    let iconName: String
    let tint: Color
    let tasks: [String]
}

extension IOSStarterModule {
    static let sampleSections: [IOSStarterSection] = [
        IOSStarterSection(
            title: "Foundation Setup",
            description: "SwiftUI and iOS design patterns now have a real starter structure.",
            modules: [
                IOSStarterModule(
                    title: "Initialize SwiftUI Project",
                    status: "Started",
                    summary: "The native iOS starter now has a SwiftUI app shell, project spec, and resources.",
                    iconName: "iphone.gen3",
                    tint: PlayFlixTheme.accent,
                    tasks: [
                        "Standalone ios/ workspace",
                        "SwiftUI app entry point",
                        "XcodeGen project specification"
                    ]
                ),
                IOSStarterModule(
                    title: "iOS Design Guidelines",
                    status: "Started",
                    summary: "The starter UI follows iOS-friendly spacing, typography, materials, and navigation patterns.",
                    iconName: "paintpalette.fill",
                    tint: PlayFlixTheme.secondary,
                    tasks: [
                        "Rounded SwiftUI cards",
                        "NavigationStack app shell",
                        "Dark cinematic color palette for Apple surfaces"
                    ]
                )
            ]
        ),
        IOSStarterSection(
            title: "Playback Features",
            description: "AirPlay and Picture-in-Picture now have starter service points for full playback integration next.",
            modules: [
                IOSStarterModule(
                    title: "AirPlay Support",
                    status: "Starter module",
                    summary: "A dedicated service stub is ready to expand into route discovery and remote playback handoff.",
                    iconName: "airplayvideo",
                    tint: .blue,
                    tasks: [
                        "AirPlay service placeholder",
                        "AVKit integration target identified",
                        "Next: route picker and playback session wiring"
                    ]
                ),
                IOSStarterModule(
                    title: "Picture-in-Picture",
                    status: "Starter module",
                    summary: "PiP setup is mapped into the iOS services layer so player scenes can adopt it next.",
                    iconName: "pip.enter",
                    tint: .green,
                    tasks: [
                        "PiP capability placeholder",
                        "AVPlayerViewController integration target",
                        "Next: player scene PiP controls"
                    ]
                )
            ]
        ),
        IOSStarterSection(
            title: "Apple Platform Features",
            description: "Biometrics, widgets, Dynamic Island, and Live Activities now have dedicated starter targets or service stubs.",
            modules: [
                IOSStarterModule(
                    title: "Face ID / Touch ID",
                    status: "Starter module",
                    summary: "LocalAuthentication service scaffolding is ready for protected account and parental-control flows.",
                    iconName: "faceid",
                    tint: .mint,
                    tasks: [
                        "Biometric auth service placeholder",
                        "Account unlock flow target",
                        "Next: secure user session prompts"
                    ]
                ),
                IOSStarterModule(
                    title: "Widgets",
                    status: "Started",
                    summary: "A WidgetKit extension placeholder now exists for home screen recommendations and continue watching widgets.",
                    iconName: "square.grid.2x2.fill",
                    tint: .orange,
                    tasks: [
                        "Widget target source added",
                        "Timeline provider starter",
                        "Next: real content snapshots"
                    ]
                ),
                IOSStarterModule(
                    title: "Dynamic Island",
                    status: "Started",
                    summary: "The live activity target is structured so Dynamic Island support can grow from shared now-playing attributes.",
                    iconName: "dynamicisland",
                    tint: .purple,
                    tasks: [
                        "Shared activity attributes model",
                        "Dynamic Island region placeholder",
                        "Next: playback progress and controls"
                    ]
                ),
                IOSStarterModule(
                    title: "Live Activities",
                    status: "Started",
                    summary: "An ActivityKit extension placeholder is ready for lock screen and Dynamic Island playback status.",
                    iconName: "waveform.and.person.filled",
                    tint: .pink,
                    tasks: [
                        "ActivityKit target source added",
                        "Starter activity configuration",
                        "Next: now playing state updates from the app"
                    ]
                )
            ]
        )
    ]
}
