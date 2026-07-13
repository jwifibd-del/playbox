import LocalAuthentication

struct BiometricAuthService {
    func starterChecklist() -> [String] {
        [
            "Protect account actions with LAContext evaluation.",
            "Use biometrics for quick profile re-entry and parental controls.",
            "Fallback to device passcode when biometrics are unavailable."
        ]
    }

    func availableBiometricLabel() -> String {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)

        switch context.biometryType {
        case .faceID:
            return "Face ID"
        case .touchID:
            return "Touch ID"
        default:
            return "Biometrics unavailable"
        }
    }
}
