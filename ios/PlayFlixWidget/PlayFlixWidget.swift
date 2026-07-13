import SwiftUI
import WidgetKit

@main
struct PlayFlixWidgetBundle: WidgetBundle {
    var body: some Widget {
        PlayFlixWidget()
    }
}

struct PlayFlixWidgetEntry: TimelineEntry {
    let date: Date
    let title: String
    let subtitle: String
}

struct PlayFlixWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> PlayFlixWidgetEntry {
        PlayFlixWidgetEntry(date: .now, title: "Continue Watching", subtitle: "Interstellar Odyssey")
    }

    func getSnapshot(in context: Context, completion: @escaping (PlayFlixWidgetEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PlayFlixWidgetEntry>) -> Void) {
        let entry = PlayFlixWidgetEntry(date: .now, title: "Top Pick", subtitle: "The Dark Knight")
        completion(Timeline(entries: [entry], policy: .after(.now.addingTimeInterval(1800))))
    }
}

struct PlayFlixWidgetEntryView: View {
    let entry: PlayFlixWidgetEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.black, Color(red: 38 / 255, green: 10 / 255, blue: 27 / 255)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 8) {
                Text("PlayFlix")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.pink)
                Text(entry.title)
                    .font(.headline)
                    .foregroundStyle(.white)
                Text(entry.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.72))
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        }
    }
}

struct PlayFlixWidget: Widget {
    let kind: String = "PlayFlixWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlayFlixWidgetProvider()) { entry in
            PlayFlixWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("PlayFlix Picks")
        .description("Shows quick recommendations and continue watching items.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
