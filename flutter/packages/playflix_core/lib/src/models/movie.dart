/// Movie model
class Movie {
  final String id;
  final String title;
  final String? overview;
  final String? posterPath;
  final String? backdropPath;
  final double? rating;
  final int? releaseYear;
  final List<String>? genres;
  final Duration? runtime;

  const Movie({
    required this.id,
    required this.title,
    this.overview,
    this.posterPath,
    this.backdropPath,
    this.rating,
    this.releaseYear,
    this.genres,
    this.runtime,
  });

  /// Create a Movie from JSON
  factory Movie.fromJson(Map<String, dynamic> json) {
    return Movie(
      id: json['id'].toString(),
      title: json['title'] ?? json['name'] ?? '',
      overview: json['overview'],
      posterPath: json['poster_path'],
      backdropPath: json['backdrop_path'],
      rating: (json['vote_average'] as num?)?.toDouble(),
      releaseYear: json['release_date'] != null
          ? DateTime.tryParse(json['release_date'])?.year
          : null,
      genres: (json['genres'] as List<dynamic>?)
          ?.map((e) => e['name'] as String)
          .toList(),
      runtime: json['runtime'] != null
          ? Duration(minutes: json['runtime'] as int)
          : null,
    );
  }

  /// Convert a Movie to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'overview': overview,
      'poster_path': posterPath,
      'backdrop_path': backdropPath,
      'vote_average': rating,
      'release_date': releaseYear?.toString(),
      'genres': genres?.map((g) => {'name': g}).toList(),
      'runtime': runtime?.inMinutes,
    };
  }
}