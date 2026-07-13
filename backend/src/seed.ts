import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MoviesService } from './movies/movies.service';
import { Movie } from './movies/movie.entity';

const sampleMovies = [
  {
    title: 'Interstellar Odyssey',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=epic%20sci-fi%20movie%20poster%2C%20interstellar%2C%20cinematic%2C%20space%2C%20black%20hole&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=cinematic%20movie%20backdrop%2C%20epic%20space%20scene%2C%20nebula%2C%20stars%2C%20dramatic%20lighting&image-size=landscape-16-9',
    releaseYear: 2014,
    rating: 8.7,
    runtime: '2h 49m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
  },
  {
    title: 'The Dark Knight',
    tagline: 'Why So Serious?',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=dark%20knight%20movie%20poster%2C%20batman%2C%20joker%2C%20cinematic%2C%20dark%20tones&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=gotham%20city%20night%20skyline%2C%20cinematic%2C%20dramatic%2C%20dark%20blue%20tones&image-size=landscape-16-9',
    releaseYear: 2008,
    rating: 9.0,
    runtime: '2h 32m',
    genres: ['Action', 'Crime', 'Drama'],
  },
  {
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=inception%20movie%20poster%2C%20spinning%20top%2C%20dream%2C%20mind%20bending%2C%20cinematic&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=rotating%20city%20landscape%2C%20dream%20world%2C%20cinematic%2C%20surreal&image-size=landscape-16-9',
    releaseYear: 2010,
    rating: 8.8,
    runtime: '2h 28m',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
  },
  {
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    overview: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=shawshank%20redemption%20movie%20poster%2C%20prison%2C%20hope%2C%20cinematic%2C%20dramatic&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=prison%20yard%20at%20sunset%2C%20cinematic%2C%20warm%20tones%2C%20dramatic&image-size=landscape-16-9',
    releaseYear: 1994,
    rating: 9.3,
    runtime: '2h 22m',
    genres: ['Drama'],
  },
  {
    title: 'Pulp Fiction',
    tagline: 'You won\'t know the facts until you\'ve seen the fiction.',
    overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=pulp%20fiction%20movie%20poster%2C%20retro%20style%2C%20cinematic%2C%20bold%20colors&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=retro%20diner%20scene%2C%20cinematic%2C%20neon%20lights%2C%20night&image-size=landscape-16-9',
    releaseYear: 1994,
    rating: 8.9,
    runtime: '2h 34m',
    genres: ['Crime', 'Drama'],
  },
  {
    title: 'The Matrix',
    tagline: 'Reality is a thing of the past.',
    overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=matrix%20movie%20poster%2C%20neo%2C%20cyberpunk%2C%20green%20tones%2C%20cinematic&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=matrix%20code%20rain%2C%20cyberpunk%20city%2C%20green%20and%20black%2C%20cinematic&image-size=landscape-16-9',
    releaseYear: 1999,
    rating: 8.7,
    runtime: '2h 16m',
    genres: ['Action', 'Sci-Fi'],
  },
  {
    title: 'Forrest Gump',
    tagline: 'Life is like a box of chocolates.',
    overview: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=forrest%20gump%20movie%20poster%2C%20bench%2C%20feather%2C%20warm%20tones%2C%20cinematic&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=bench%20in%20park%20at%20sunset%2C%20warm%20golden%20light%2C%20cinematic&image-size=landscape-16-9',
    releaseYear: 1994,
    rating: 8.8,
    runtime: '2h 22m',
    genres: ['Drama', 'Romance'],
  },
  {
    title: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=fight%20club%20movie%20poster%2C%20dark%2C%20gritty%2C%20soap%2C%20cinematic&image-size=portrait-4-3',
    backdropPath: 'https://coresg-normal.trae.ai/api/ide/v1/text-to-image?prompt=dark%20gritty%20city%20alley%2C%20neon%20lights%2C%20rain%2C%20cinematic&image-size=landscape-16-9',
    releaseYear: 1999,
    rating: 8.8,
    runtime: '2h 19m',
    genres: ['Drama', 'Thriller'],
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const moviesService = app.get(MoviesService);

  console.log('Seeding database...');

  // Check if movies already exist
  const existingMovies = await moviesService.findAll();
  if (existingMovies.length > 0) {
    console.log('Database already has movies. Skipping seed.');
    await app.close();
    return;
  }

  // Create sample movies
  for (const movieData of sampleMovies) {
    await moviesService.create(movieData);
    console.log(`Created movie: ${movieData.title}`);
  }

  console.log('Database seeded successfully!');
  await app.close();
}

bootstrap();
