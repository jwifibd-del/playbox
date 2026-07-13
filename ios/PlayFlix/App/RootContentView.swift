import SwiftUI

struct RootContentView: View {
    private let sections = IOSStarterModule.sampleSections

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    HeroHeaderView()

                    ForEach(sections) { section in
                        StarterSectionView(section: section)
                    }
                }
                .padding(20)
            }
            .background(PlayFlixTheme.background.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.hidden, for: .navigationBar)
        }
    }
}

private struct HeroHeaderView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("PlayFlix iOS Starter")
                .font(.caption.weight(.semibold))
                .foregroundStyle(PlayFlixTheme.accent)
                .textCase(.uppercase)

            Text("Start the remaining iOS roadmap with a real SwiftUI foundation.")
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text("This starter sets up Apple-native foundations for SwiftUI, iOS design guidelines, AirPlay, Picture-in-Picture, biometrics, widgets, Dynamic Island, and Live Activities.")
                .font(.body)
                .foregroundStyle(PlayFlixTheme.mutedText)

            HStack(spacing: 10) {
                StarterBadge(label: "SwiftUI")
                StarterBadge(label: "WidgetKit")
                StarterBadge(label: "ActivityKit")
                StarterBadge(label: "LocalAuth")
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(PlayFlixTheme.heroGradient, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .strokeBorder(Color.white.opacity(0.08))
        )
    }
}

private struct StarterSectionView: View {
    let section: IOSStarterSection

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(section.title)
                .font(.title2.weight(.bold))
                .foregroundStyle(.white)

            Text(section.description)
                .font(.subheadline)
                .foregroundStyle(PlayFlixTheme.mutedText)

            LazyVStack(spacing: 14) {
                ForEach(section.modules) { module in
                    NavigationLink {
                        ModuleDetailView(module: module)
                    } label: {
                        ModuleCardView(module: module)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

private struct ModuleCardView: View {
    let module: IOSStarterModule

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: module.iconName)
                .font(.system(size: 22, weight: .semibold))
                .foregroundStyle(module.tint)
                .frame(width: 48, height: 48)
                .background(module.tint.opacity(0.16), in: RoundedRectangle(cornerRadius: 16, style: .continuous))

            VStack(alignment: .leading, spacing: 8) {
                Text(module.status)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(module.tint)

                Text(module.title)
                    .font(.headline)
                    .foregroundStyle(.white)

                Text(module.summary)
                    .font(.subheadline)
                    .foregroundStyle(PlayFlixTheme.mutedText)
                    .multilineTextAlignment(.leading)
            }

            Spacer(minLength: 0)

            Image(systemName: "chevron.right")
                .foregroundStyle(PlayFlixTheme.mutedText)
                .padding(.top, 6)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(PlayFlixTheme.cardBackground, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .strokeBorder(Color.white.opacity(0.06))
        )
    }
}

private struct ModuleDetailView: View {
    let module: IOSStarterModule

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                ModuleCardView(module: module)

                VStack(alignment: .leading, spacing: 12) {
                    Text("Starter Tasks")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.white)

                    ForEach(module.tasks, id: \.self) { task in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(module.tint)
                            Text(task)
                                .foregroundStyle(PlayFlixTheme.mutedText)
                        }
                    }
                }
                .padding(20)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(PlayFlixTheme.cardBackground, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            }
            .padding(20)
        }
        .background(PlayFlixTheme.background.ignoresSafeArea())
        .navigationTitle(module.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct StarterBadge: View {
    let label: String

    var body: some View {
        Text(label)
            .font(.caption.weight(.semibold))
            .foregroundStyle(PlayFlixTheme.accent)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(PlayFlixTheme.accent.opacity(0.14), in: Capsule())
    }
}

#Preview {
    RootContentView()
}
