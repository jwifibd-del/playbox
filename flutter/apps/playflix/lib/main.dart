import 'package:flutter/material.dart';
import 'package:playflix_core/playflix_core.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const PlayFlixMobileApp());
}

class PlayFlixMobileApp extends StatelessWidget {
  const PlayFlixMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PlayFlix Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme.copyWith(
        scaffoldBackgroundColor: const Color(0xFF090A0F),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFF59E0B),
          secondary: Color(0xFFE50914),
          surface: Color(0xFF14151D),
        ),
      ),
      home: const MobileMainScreen(),
    );
  }
}

class MobileMainScreen extends StatefulWidget {
  const MobileMainScreen({super.key});

  @override
  State<MobileMainScreen> createState() => _MobileMainScreenState();
}

class _MobileMainScreenState extends State<MobileMainScreen> {
  int _currentIndex = 0;

  final List<Movie> _movies = const [
    Movie(
      id: '1',
      title: 'Interstellar Odyssey',
      overview: 'Explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      posterPath: 'https://picsum.photos/seed/interstellar/600/900',
      backdropPath: 'https://picsum.photos/seed/interstellar-wide/1920/1080',
      rating: 8.7,
      releaseYear: 2014,
      genres: ['Sci-Fi', 'Adventure'],
      runtime: Duration(hours: 2, minutes: 49),
    ),
    Movie(
      id: '2',
      title: 'Neon Cyberpunk 2099',
      overview: 'In a dystopian megacity, a detective investigates a synth syndicate conspiracy.',
      posterPath: 'https://picsum.photos/seed/cyberpunk/600/900',
      backdropPath: 'https://picsum.photos/seed/cyberpunk-wide/1920/1080',
      rating: 8.4,
      releaseYear: 2024,
      genres: ['Action', 'Sci-Fi'],
      runtime: Duration(hours: 2, minutes: 12),
    ),
    Movie(
      id: '3',
      title: 'Echoes of the Deep',
      overview: 'Mariana trench researchers detect signals from an unknown abyssal civilization.',
      posterPath: 'https://picsum.photos/seed/deepsea/600/900',
      backdropPath: 'https://picsum.photos/seed/deepsea-wide/1920/1080',
      rating: 8.1,
      releaseYear: 2023,
      genres: ['Mystery', 'Thriller'],
      runtime: Duration(hours: 1, minutes: 58),
    ),
    Movie(
      id: '4',
      title: 'Chronicles of Valhalla',
      overview: 'Warrior clans unite to protect the northern realm from mythical adversaries.',
      posterPath: 'https://picsum.photos/seed/valhalla/600/900',
      backdropPath: 'https://picsum.photos/seed/valhalla-wide/1920/1080',
      rating: 8.5,
      releaseYear: 2022,
      genres: ['Action', 'Fantasy'],
      runtime: Duration(hours: 2, minutes: 25),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeFeed(),
          _buildSearchFeed(),
          _buildDownloadsFeed(),
          _buildProfileFeed(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        backgroundColor: const Color(0xFF0D0E15),
        indicatorColor: const Color(0xFFF59E0B).withOpacity(0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: Color(0xFFF59E0B)),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search, color: Color(0xFFF59E0B)),
            label: 'Search',
          ),
          NavigationDestination(
            icon: Icon(Icons.download_outlined),
            selectedIcon: Icon(Icons.download, color: Color(0xFFF59E0B)),
            label: 'Downloads',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: Color(0xFFF59E0B)),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildHomeFeed() {
    final heroMovie = _movies.first;
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          floating: true,
          backgroundColor: const Color(0xFF090A0F),
          title: Row(
            children: [
              RichText(
                text: const TextSpan(
                  children: [
                    TextSpan(
                      text: 'Play',
                      style: TextStyle(
                        color: Color(0xFFF59E0B),
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    TextSpan(
                      text: 'Flix',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text(
                  'MOBILE',
                  style: TextStyle(
                    color: Color(0xFFF59E0B),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.cast, color: Colors.white70),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.notifications_none, color: Colors.white70),
              onPressed: () {},
            ),
          ],
        ),

        // Hero Banner
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Image.network(
                    heroMovie.backdropPath ?? heroMovie.posterPath ?? '',
                    height: 380,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      gradient: const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Color(0xCC090A0F), Color(0xFF090A0F)],
                        stops: [0.3, 0.75, 1.0],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  left: 20,
                  right: 20,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF59E0B),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'FEATURED',
                          style: TextStyle(
                            color: Colors.black,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        heroMovie.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${heroMovie.releaseYear} • ★ ${heroMovie.rating} • ${heroMovie.genres?.join(', ')}',
                        style: const TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFF59E0B),
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              onPressed: () => _openMovieDetails(heroMovie),
                              icon: const Icon(Icons.play_arrow),
                              label: const Text(
                                'Watch Now',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          IconButton.filledTonal(
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.white12,
                              padding: const EdgeInsets.all(12),
                            ),
                            icon: const Icon(Icons.add, color: Colors.white),
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Section: Trending Movies
        SliverToBoxAdapter(
          child: _buildSection('Trending on Mobile', _movies),
        ),

        // Section: Continue Watching
        SliverToBoxAdapter(
          child: _buildSection('Continue Watching', _movies.reversed.toList()),
        ),

        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ],
    );
  }

  Widget _buildSection(String title, List<Movie> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Text(
                'See all',
                style: TextStyle(color: Color(0xFFF59E0B), fontSize: 13),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final movie = items[index];
              return GestureDetector(
                onTap: () => _openMovieDetails(movie),
                child: Container(
                  width: 130,
                  margin: const EdgeInsets.only(right: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(14),
                        child: Image.network(
                          movie.posterPath ?? '',
                          height: 160,
                          width: 130,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 160,
                            color: Colors.grey[900],
                            child: const Center(
                              child: Icon(Icons.movie, color: Colors.white30),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        movie.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSearchFeed() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              decoration: InputDecoration(
                hintText: 'Search movies, series, directors...',
                hintStyle: const TextStyle(color: Colors.grey),
                prefixIcon: const Icon(Icons.search, color: Color(0xFFF59E0B)),
                filled: true,
                fillColor: const Color(0xFF14151D),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.7,
                ),
                itemCount: _movies.length,
                itemBuilder: (context, index) {
                  final movie = _movies[index];
                  return GestureDetector(
                    onTap: () => _openMovieDetails(movie),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(
                            movie.posterPath ?? '',
                            fit: BoxFit.cover,
                          ),
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              color: Colors.black87,
                              child: Text(
                                movie.title,
                                maxLines: 1,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDownloadsFeed() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Downloads & Offline',
              style: TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF14151D),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Device Storage', style: TextStyle(color: Colors.white70)),
                      Text('2.8 GB / 128 GB', style: TextStyle(color: Color(0xFFF59E0B))),
                    ],
                  ),
                  const SizedBox(height: 10),
                  LinearProgressIndicator(
                    value: 0.12,
                    backgroundColor: Colors.white12,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFF59E0B)),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: _movies.length,
                itemBuilder: (context, index) {
                  final m = _movies[index];
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(vertical: 4),
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        m.posterPath ?? '',
                        width: 50,
                        height: 75,
                        fit: BoxFit.cover,
                      ),
                    ),
                    title: Text(
                      m.title,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${m.releaseYear} • 1.4 GB • 1080p',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    trailing: const Icon(Icons.check_circle, color: Color(0xFF10B981)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileFeed() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const CircleAvatar(
              radius: 40,
              backgroundColor: Color(0xFFF59E0B),
              child: Icon(Icons.person, size: 48, color: Colors.black),
            ),
            const SizedBox(height: 16),
            const Text(
              'PlayFlix Member',
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Premium 4K HDR Plan',
              style: TextStyle(color: Color(0xFFF59E0B), fontSize: 13),
            ),
            const SizedBox(height: 24),
            _buildProfileTile(Icons.offline_pin, 'Smart Downloads', 'Download next episode automatically'),
            _buildProfileTile(Icons.high_quality, 'Stream Quality', 'Auto (Up to 4K HDR)'),
            _buildProfileTile(Icons.lock, 'Parental Controls', 'PIN Protection Active'),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFFF59E0B)),
      title: Text(title, style: const TextStyle(color: Colors.white)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey),
    );
  }

  void _openMovieDetails(Movie movie) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF14151D),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              movie.title,
              style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              '${movie.releaseYear} • ★ ${movie.rating} IMDb',
              style: const TextStyle(color: Color(0xFFF59E0B)),
            ),
            const SizedBox(height: 12),
            Text(
              movie.overview ?? '',
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.play_arrow),
              label: const Text('Play Now', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
