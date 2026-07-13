package com.playflix.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = PlayFlixPrimary,
    onPrimary = PlayFlixBlack,
    primaryContainer = PlayFlixPrimaryContainer,
    secondary = PlayFlixSecondary,
    secondaryContainer = PlayFlixSecondaryContainer,
    tertiary = PlayFlixTertiary,
    background = PlayFlixBlack,
    surface = PlayFlixSurface,
    onSurfaceVariant = PlayFlixTextMuted
)

private val LightColorScheme = lightColorScheme(
    primary = PlayFlixPrimary,
    secondary = PlayFlixSecondary,
    tertiary = PlayFlixTertiary
)

@Composable
fun PlayFlixTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
