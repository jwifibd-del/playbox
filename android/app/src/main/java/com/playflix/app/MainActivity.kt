package com.playflix.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.playflix.app.features.rememberAndroidStarterModules
import com.playflix.app.ui.PlayFlixApp
import com.playflix.app.ui.theme.PlayFlixTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val starterModules = rememberAndroidStarterModules()

            PlayFlixTheme {
                PlayFlixApp(
                    starterModules = starterModules
                )
            }
        }
    }
}
