import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:playflix_core/playflix_core.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PlayFlixTVApp());
}

class PlayFlixTVApp extends StatelessWidget {
  const PlayFlixTVApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Shortcuts(
      shortcuts: <LogicalKeyOrKeySequence, Intent>{
        LogicalKeySet(LogicalKeyboardKey.select): const ActivateIntent(),
        LogicalKeySet(LogicalKeyboardKey.enter): const ActivateIntent(),
        LogicalKeySet(LogicalKeyboardKey.space): const ActivateIntent(),
      },
      child: MaterialApp(
        title: 'PlayFlix TV',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme.copyWith(
          scaffoldBackgroundColor: const Color(0xFF090A0F),
        ),
        home: const TVHomeScreen(),
      ),
    );
  }
}

class TVHomeScreen extends StatefulWidget {
  const TVHomeScreen({super.key});

  @override
  State<TVHomeScreen> createState() => _TVHomeScreenState();
}

class _TVHomeScreenState extends State<TVHomeScreen> {
  int _selectedNavIndex = 0;
  late Movie _focusedMovie;

  final List<Movie> _sampleMovies = const [
    Movie(
      id: '1',
      title: 'Interstellar Odyssey',
      overview:
          'A team of explorers travel through a newly discovered wormhole in space to ensure humanity\'s survival across the stars.',
      posterPath: 'https://picsum.photos/seed/interstellar/600/900',
      backdropPath: 'https://picsum.photos/seed/interstellar-wide/1920/1080',
      rating: 8.7,
      releaseYear: 2014,
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      runtime: Duration(hours: 2, minutes: 49),
    ),
    Movie(
      id: '2',
      title: 'Neon Cyberpunk 2099',
      overview:
          'In a dystopian megacity ruled by rogue AI and synthetic syndicates, an augmented detective uncovers an existential conspiracy.',
      posterPath: 'https://picsum.photos/seed/cyberpunk/600/900',
      backdropPath: 'https://picsum.photos/seed/cyberpunk-wide/1920/1080',
      rating: 8.4,
      releaseYear: 2024,
      genres: ['Action', 'Sci-Fi', 'Thriller'],
      runtime: Duration(hours: 2, minutes: 12),
    ),
    Movie(
      id: '3',
      title: 'Echoes of the Deep',
      overview:
          'Deep-sea researchers in the Mariana Trench discover an ancient bioluminescent structure transmitting signals into the void.',
      posterPath: 'https://picsum.photos/seed/deepsea/600/900',
      backdropPath: 'https://picsum.photos/seed/deepsea-wide/1920/1080',
      rating: 8.1,
      releaseYear: 2023,
      genres: ['Mystery', 'Thriller', 'Sci-Fi'],
      runtime: Duration(hours: 1, minutes: 58),
    ),
    Movie(
      id: '4',
      title: 'Chronicles of Valhalla',
      overview:
          'An exiled warrior chieftess rallies rival clans to defend the realm against a mythical frost army.',
      posterPath: 'https://picsum.photos/seed/valhalla/600/900',
      backdropPath: 'https://picsum.photos/seed/valhalla-wide/1920/1080',
      rating: 8.5,
      releaseYear: 2022,
      genres: ['Action', 'Fantasy', 'Adventure'],
      runtime: Duration(hours: 2, minutes: 25),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _focusedMovie = _sampleMovies[0];
  }

  void _onCardFocused(Movie movie) {
    setState(() {
      _focusedMovie = movie;
    });
  }

  void _playMovie(Movie movie) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF181820),
        title: Text(
          'Playing ${movie.title}',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${movie.releaseYear} • ${movie.rating} IMDb • 4K HDR',
              style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 14),
            ),
            const SizedBox(height: 12),
            Text(
              movie.overview ?? '',
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ],
        ),
        actions: [
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.black,
            ),
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.close),
            label: const Text('Back to TV Guide'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Dynamic Living Room Backdrop
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 500),
            child: Container(
              key: ValueKey<String>(_focusedMovie.id),
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage(
                    _focusedMovie.backdropPath ??
                        _focusedMovie.posterPath ??
                        'https://picsum.photos/seed/tvbg/1920/1080',
                  ),
                  fit: BoxFit.cover,
                  colorFilter: ColorFilter.mode(
                    Colors.black.withOpacity(0.65),
                    BlendMode.darken,
                  ),
                ),
              ),
            ),
          ),

          // Vignette Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black45,
                  Color(0xBB090A0F),
                  Color(0xFF090A0F),
                ],
                stops: [0.0, 0.45, 0.9],
              ),
            ),
          ),

          // 10-Foot TV Content Layer
          Row(
            children: [
              // TV Navigation Sidebar
              Container(
                width: 84,
                color: Colors.black54,
                child: Column(
                  children: [
                    const SizedBox(height: 28),
                    // TV Logo Icon
                    Container(
                      height: 44,
                      width: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
                      ),
                      child: const Icon(Icons.tv, color: Color(0xFFF59E0B), size: 26),
                    ),
                    const SizedBox(height: 36),
                    _buildNavButton(0, Icons.home_rounded, 'Home'),
                    _buildNavButton(1, Icons.movie_outlined, 'Movies'),
                    _buildNavButton(2, Icons.tv_rounded, 'Series'),
                    _buildNavButton(3, Icons.live_tv_rounded, 'Live'),
                    _buildNavButton(4, Icons.search_rounded, 'Search'),
                    const Spacer(),
                    _buildNavButton(5, Icons.settings_rounded, 'Settings'),
                    const SizedBox(height: 24),
                  ],
                ),
              ),

              // Main TV Stage
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top TV Bar with Time and Profile
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              RichText(
                                text: const TextSpan(
                                  children: [
                                    TextSpan(
                                      text: 'Play',
                                      style: TextStyle(
                                        color: Color(0xFFF59E0B),
                                        fontSize: 26,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                    TextSpan(
                                      text: 'Flix TV',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 26,
                                        fontWeight: FontWeight.w900,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF59E0B).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(
                                    color: const Color(0xFFF59E0B).withOpacity(0.4),
                                  ),
                                ),
                                child: const Text(
                                  '10-FOOT LIVING ROOM',
                                  style: TextStyle(
                                    color: Color(0xFFF59E0B),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(Icons.wifi, color: Colors.greenAccent, size: 20),
                              const SizedBox(width: 16),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.white10,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: const Text(
                                  '4K HDR • 60 FPS',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),

                      const SizedBox(height: 32),

                      // Featured Movie Spotlight Header
                      SizedBox(
                        height: 180,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF59E0B),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'SPOTLIGHT',
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  '${_focusedMovie.releaseYear} • ${_focusedMovie.rating} IMDb • ${_focusedMovie.genres?.join(', ') ?? 'Cinema'}',
                                  style: TextStyle(
                                    color: Colors.grey[300],
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _focusedMovie.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 36,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Expanded(
                              child: Text(
                                _focusedMovie.overview ?? '',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: Colors.grey[400],
                                  fontSize: 14,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Focusable Rails Section
                      Expanded(
                        child: ListView(
                          children: [
                            _buildTVRail('Spotlight Cinema', _sampleMovies),
                            const SizedBox(height: 24),
                            _buildTVRail('Trending on TV', _sampleMovies.reversed.toList()),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavButton(int index, IconData icon, String tooltip) {
    final isSelected = _selectedNavIndex == index;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Focus(
        onFocusChange: (hasFocus) {
          if (hasFocus) {
            setState(() => _selectedNavIndex = index);
          }
        },
        child: InkWell(
          onTap: () => setState(() => _selectedNavIndex = index),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            height: 48,
            width: 48,
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFFF59E0B) : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              icon,
              color: isSelected ? Colors.black : Colors.grey[400],
              size: 24,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTVRail(String railTitle, List<Movie> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          railTitle,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 170,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            itemBuilder: (context, index) {
              final movie = items[index];
              return TVCardWidget(
                movie: movie,
                onFocus: () => _onCardFocused(movie),
                onSelect: () => _playMovie(movie),
              );
            },
          ),
        ),
      ],
    );
  }
}

class TVCardWidget extends StatefulWidget {
  final Movie movie;
  final VoidCallback onFocus;
  final VoidCallback onSelect;

  const TVCardWidget({
    super.key,
    required this.movie,
    required this.onFocus,
    required this.onSelect,
  });

  @override
  State<TVCardWidget> createState() => _TVCardWidgetState();
}

class _TVCardWidgetState extends State<TVCardWidget> {
  bool _isFocused = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 18),
      child: Focus(
        onFocusChange: (hasFocus) {
          setState(() {
            _isFocused = hasFocus;
          });
          if (hasFocus) {
            widget.onFocus();
          }
        },
        child: InkWell(
          onTap: widget.onSelect,
          borderRadius: BorderRadius.circular(16),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 250,
            transform: _isFocused ? (Matrix4.identity()..scale(1.05)) : Matrix4.identity(),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: _isFocused ? const Color(0xFFF59E0B) : Colors.white12,
                width: _isFocused ? 3 : 1,
              ),
              boxShadow: _isFocused
                  ? [
                      BoxShadow(
                        color: const Color(0xFFF59E0B).withOpacity(0.35),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ]
                  : null,
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    widget.movie.backdropPath ?? widget.movie.posterPath ?? '',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: Colors.grey[900],
                      child: const Center(
                        child: Icon(Icons.movie, color: Colors.white30, size: 40),
                      ),
                    ),
                  ),
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black87],
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    left: 12,
                    right: 12,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.movie.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '${widget.movie.releaseYear ?? 2024} • ★ ${widget.movie.rating ?? 8.0}',
                          style: const TextStyle(
                            color: Color(0xFFF59E0B),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_isFocused)
                    const Positioned(
                      top: 10,
                      right: 10,
                      child: CircleAvatar(
                        radius: 14,
                        backgroundColor: Color(0xFFF59E0B),
                        child: Icon(Icons.play_arrow, color: Colors.black, size: 18),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
