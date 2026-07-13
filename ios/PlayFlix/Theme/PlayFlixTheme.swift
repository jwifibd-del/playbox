import SwiftUI

enum PlayFlixTheme {
    static let background = Color(red: 8 / 255, green: 8 / 255, blue: 8 / 255)
    static let cardBackground = Color.white.opacity(0.05)
    static let accent = Color(red: 251 / 255, green: 113 / 255, blue: 133 / 255)
    static let secondary = Color(red: 96 / 255, green: 165 / 255, blue: 250 / 255)
    static let mutedText = Color.white.opacity(0.72)

    static let heroGradient = LinearGradient(
        colors: [
            Color(red: 90 / 255, green: 24 / 255, blue: 55 / 255),
            Color(red: 28 / 255, green: 55 / 255, blue: 122 / 255),
            Color(red: 12 / 255, green: 12 / 255, blue: 18 / 255)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
