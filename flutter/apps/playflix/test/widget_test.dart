// This is a basic Flutter widget test for PlayFlix.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:playflix/main.dart';

void main() {
  testWidgets('PlayFlix app starts successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const PlayFlixApp());

    // Verify that the app bar title is present.
    expect(find.text('PlayFlix'), findsOneWidget);

    // Verify that the "Trending Now" text is present.
    expect(find.text('Trending Now'), findsOneWidget);
  });
}
