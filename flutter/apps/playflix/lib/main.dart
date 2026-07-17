import 'package:flutter/material.dart';
import 'package:playflix_core/playflix_core.dart';

void main() {
  runApp(const PlayFlixApp());
}

class PlayFlixApp extends StatelessWidget {
  const PlayFlixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PlayFlix',
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('PlayFlix'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        children: [
          // Hero Banner Placeholder
          Container(
            height: 400,
            decoration: BoxDecoration(
              color: Colors.grey[900],
            ),
            child: const Center(
              child: Text(
                'Featured Content',
                style: TextStyle(fontSize: 24, color: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Trending Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'Trending Now',
              style: Theme.of(context).textTheme.displayMedium,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, index) => Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Container(
                  width: 120,
                  decoration: BoxDecoration(
                    color: Colors.grey[800],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      'Movie $index',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}