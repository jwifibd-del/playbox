import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:playflix_core/playflix_core.dart';

void main() {
  test('Movie model can be created and converted to JSON', () {
    final movie = Movie(
      id: '1',
      title: 'Test Movie',
      overview: 'Test overview',
      posterPath: '/test.jpg',
      backdropPath: '/test-backdrop.jpg',
      rating: 8.5,
      releaseYear: 2024,
      genres: ['Action', 'Adventure'],
      runtime: const Duration(minutes: 120),
    );

    final json = movie.toJson();
    expect(json['id'], '1');
    expect(json['title'], 'Test Movie');
  });

  test('AppTheme.darkTheme exists', () {
    final theme = AppTheme.darkTheme;
    expect(theme.useMaterial3, isTrue);
    expect(
      theme.colorScheme.primary.toARGB32(),
      const Color(0xFFE50914).toARGB32(),
    );
  });
}
