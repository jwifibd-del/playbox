import ActivityKit
import SwiftUI
import WidgetKit

@main
struct PlayFlixLiveActivityBundle: WidgetBundle {
    var body: some Widget {
        PlayFlixLiveActivity()
    }
}

struct PlayFlixLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NowPlayingAttributes.self) { context in
            ZStack {
                LinearGradient(
                    colors: [Color.black, Color(red: 56 / 255, green: 12 / 255, blue: 34 / 255)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                VStack(alignment: .leading, spacing: 12) {
                    Text(context.attributes.channelName)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.pink)

                    Text(context.state.title)
                        .font(.headline)
                        .foregroundStyle(.white)
                        .lineLimit(1)

                    Text(context.state.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.72))
                        .lineLimit(1)

                    ProgressView(value: clampedProgress(context.state.progress))
                        .tint(.pink)
                }
                .padding(18)
            }
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "play.rectangle.fill")
                        .foregroundStyle(.pink)
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(context.state.title)
                            .font(.headline)
                            .lineLimit(1)
                        Text(context.state.subtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(progressText(context.state.progress))
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.pink)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: clampedProgress(context.state.progress))
                        .tint(.pink)
                }
            } compactLeading: {
                Image(systemName: "play.fill")
                    .foregroundStyle(.pink)
            } compactTrailing: {
                Text(progressText(context.state.progress))
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(.white)
            } minimal: {
                Image(systemName: "play.rectangle")
                    .foregroundStyle(.pink)
            }
        }
    }
}

private func clampedProgress(_ progress: Double) -> Double {
    min(max(progress, 0), 1)
}

private func progressText(_ progress: Double) -> String {
    "\(Int(clampedProgress(progress) * 100))%"
}
