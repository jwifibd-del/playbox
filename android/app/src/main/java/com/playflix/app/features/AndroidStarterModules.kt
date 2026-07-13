package com.playflix.app.features

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

data class AndroidStarterModule(
    val title: String,
    val status: String,
    val summary: String,
    val tasks: List<String>
)

data class AndroidStarterModules(
    val foundation: List<AndroidStarterModule>,
    val playback: List<AndroidStarterModule>,
    val deviceSupport: List<AndroidStarterModule>
)

@Composable
fun rememberAndroidStarterModules(): AndroidStarterModules = remember {
    AndroidStarterModules(
        foundation = listOf(
            AndroidStarterModule(
                title = "Kotlin + Jetpack Compose",
                status = "Started",
                summary = "Native Android app scaffold with Compose and Gradle is now in place.",
                tasks = listOf(
                    "Standalone android/ workspace",
                    "Application ID com.playflix.app",
                    "Compose-ready MainActivity entry point"
                )
            ),
            AndroidStarterModule(
                title = "Material Design 3 UI",
                status = "Started",
                summary = "Material 3 theme tokens and starter screen sections are ready for product styling.",
                tasks = listOf(
                    "Custom PlayFlix color system",
                    "Dark-first Material 3 theme",
                    "Starter dashboard built with Compose cards"
                )
            )
        ),
        playback = listOf(
            AndroidStarterModule(
                title = "Offline Downloads",
                status = "Starter module",
                summary = "Media and storage dependencies are added so downloads can move into real queue handling next.",
                tasks = listOf(
                    "Media3 foundation dependency",
                    "Roadmap placeholder for download queue",
                    "Next: WorkManager and persistent media cache"
                )
            ),
            AndroidStarterModule(
                title = "Chromecast",
                status = "Starter module",
                summary = "Cast framework dependency is included to begin sender-side playback setup.",
                tasks = listOf(
                    "Google Cast framework added",
                    "Session integration placeholder",
                    "Next: Cast button and remote playback session"
                )
            ),
            AndroidStarterModule(
                title = "Picture-in-Picture",
                status = "Starter module",
                summary = "Manifest support is enabled so PiP flows can be wired into the player screen.",
                tasks = listOf(
                    "Manifest PiP support enabled",
                    "Activity resize support enabled",
                    "Next: Player screen PiP actions"
                )
            )
        ),
        deviceSupport = listOf(
            AndroidStarterModule(
                title = "Tablet Optimization",
                status = "Started",
                summary = "Compose layout adapts between compact, medium, and expanded widths.",
                tasks = listOf(
                    "Responsive content grid",
                    "Large-screen dashboard layout",
                    "Next: two-pane browsing and detail layouts"
                )
            ),
            AndroidStarterModule(
                title = "Foldable Device Support",
                status = "Started",
                summary = "Jetpack Window Manager is added for posture-aware and spanning-aware enhancements.",
                tasks = listOf(
                    "Window Manager dependency added",
                    "Starter device posture messaging",
                    "Next: hinge-aware layout rules"
                )
            )
        )
    )
}
