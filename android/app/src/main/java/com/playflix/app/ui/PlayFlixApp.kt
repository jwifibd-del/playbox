package com.playflix.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CastConnected
import androidx.compose.material.icons.outlined.CloudDownload
import androidx.compose.material.icons.outlined.DevicesFold
import androidx.compose.material.icons.outlined.Pip
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material.icons.outlined.TabletMac
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.playflix.app.features.AndroidStarterModule
import com.playflix.app.features.AndroidStarterModules

@Composable
fun PlayFlixApp(starterModules: AndroidStarterModules) {
    Scaffold { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF120A24),
                            Color(0xFF080808),
                            Color(0xFF050505)
                        )
                    )
                )
                .padding(innerPadding)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                HeroSection()

                ResponsiveModuleSection(
                    title = "Foundation Setup",
                    description = "The Android app now starts with a clean native workspace, Compose entry point, and Material 3 system.",
                    modules = starterModules.foundation
                )

                ResponsiveModuleSection(
                    title = "Playback Features",
                    description = "Offline downloads, Chromecast, and Picture-in-Picture now have starter dependencies and implementation targets.",
                    modules = starterModules.playback
                )

                DeviceSupportSection(modules = starterModules.deviceSupport)
            }
        }
    }
}

@Composable
private fun HeroSection() {
    Surface(
        shape = RoundedCornerShape(32.dp),
        color = Color.White.copy(alpha = 0.05f),
        tonalElevation = 0.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            Color(0x33F43F5E),
                            Color(0x331D4ED8),
                            Color(0x22171717)
                        )
                    )
                )
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "PlayFlix Android Starter",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Start the remaining Android roadmap with a real native foundation.",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "This starter app covers Kotlin + Jetpack Compose, Material 3, offline download groundwork, Chromecast dependencies, Picture-in-Picture support, and responsive layouts for tablets and foldables.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StarterPill(label = "Compose")
                StarterPill(label = "Material 3")
                StarterPill(label = "Media3")
                StarterPill(label = "Cast")
            }
        }
    }
}

@Composable
private fun StarterPill(label: String) {
    Surface(
        shape = RoundedCornerShape(999.dp),
        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.14f)
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
private fun ResponsiveModuleSection(
    title: String,
    description: String,
    modules: List<AndroidStarterModule>
) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text(text = title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        BoxWithConstraints {
            val columns = when {
                maxWidth >= 1100.dp -> 3
                maxWidth >= 720.dp -> 2
                else -> 1
            }

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                modules.chunked(columns).forEach { rowModules ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        rowModules.forEach { module ->
                            Box(modifier = Modifier.weight(1f)) {
                                ModuleCard(module = module, iconTint = moduleAccent(module.title))
                            }
                        }
                        repeat(columns - rowModules.size) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DeviceSupportSection(modules: List<AndroidStarterModule>) {
    BoxWithConstraints {
        val deviceLabel = when {
            maxWidth >= 1100.dp -> "Expanded layout detected"
            maxWidth >= 720.dp -> "Tablet-ready width detected"
            else -> "Compact phone width detected"
        }

        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(text = "Large Screen Support", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(
                text = "The starter screen already adapts its layout by width so phone, tablet, and foldable improvements can grow from one Compose foundation.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Surface(
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.35f)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (maxWidth >= 720.dp) Icons.Outlined.TabletMac else Icons.Outlined.PhoneAndroid,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary
                    )
                    Column {
                        Text(text = deviceLabel, fontWeight = FontWeight.Bold)
                        Text(
                            text = "Jetpack Window Manager is included for hinge-aware foldable work next.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            ResponsiveModuleSection(
                title = "Tablet And Foldable Modules",
                description = "Responsive layout and posture-aware planning are now part of the Android starter workspace.",
                modules = modules
            )
        }
    }
}

@Composable
private fun ModuleCard(module: AndroidStarterModule, iconTint: Color) {
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.05f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = iconTint.copy(alpha = 0.16f)
                ) {
                    Icon(
                        imageVector = moduleIcon(module.title),
                        contentDescription = null,
                        modifier = Modifier.padding(12.dp),
                        tint = iconTint
                    )
                }

                Column {
                    Text(text = module.status, style = MaterialTheme.typography.labelMedium, color = iconTint)
                    Text(text = module.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                }
            }

            Text(
                text = module.summary,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                module.tasks.forEach { task ->
                    Text(
                        text = "• $task",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}

private fun moduleAccent(title: String): Color = when {
    "Compose" in title || "Material" in title -> Color(0xFFFB7185)
    "Offline" in title -> Color(0xFF60A5FA)
    "Chromecast" in title -> Color(0xFFFBBF24)
    "Picture" in title -> Color(0xFF34D399)
    "Tablet" in title -> Color(0xFFA78BFA)
    "Foldable" in title -> Color(0xFF22D3EE)
    else -> Color(0xFFE5E7EB)
}

private fun moduleIcon(title: String): ImageVector = when {
    "Offline" in title -> Icons.Outlined.CloudDownload
    "Chromecast" in title -> Icons.Outlined.CastConnected
    "Picture" in title -> Icons.Outlined.Pip
    "Tablet" in title -> Icons.Outlined.TabletMac
    "Foldable" in title -> Icons.Outlined.DevicesFold
    else -> Icons.Outlined.PhoneAndroid
}
