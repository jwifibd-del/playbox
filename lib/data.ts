export interface CastMember {
  id: string | number;
  name: string;
  role: string; // e.g., "Actor", "Actress"
  character: string;
  profilePath?: string;
}

export interface CrewMember {
  id: string | number;
  name: string;
  job: string; // e.g., "Director", "Producer", "Writer"
  profilePath?: string;
}

export interface MediaSubtitleTrack {
  label: string;
  src: string;
  lang: string;
}

export interface MediaAudioTrack {
  id: string;
  label: string;
  lang: string;
  hlsIndex?: number;
  isDefault?: boolean;
}

export interface MovieSource {
  id: number | string;
  title: string;
  quality: string;
  size: string;
  type: 'MP4' | 'WebM' | 'MKV' | 'HLS' | 'RTMP' | 'M3U8' | 'TS' | 'Embed URL' | 'YouTube URL' | 'Local Storage';
  isLocal: boolean;
  url: string;
  audioTracks?: MediaAudioTrack[];
  subtitles?: MediaSubtitleTrack[];
}

export type MediaSourceType = MovieSource['type'];

export interface Movie {
  id: number | string;
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  rating: number;
  runtime: string;
  genres: string[];
  country: string;
  language: string;
  quality: string;
  studio: string;
  director: string;
  tags?: string[];
  trailerUrl?: string;
  sources?: MovieSource[];
  cast?: CastMember[];
  crew?: CrewMember[];
  imdbId?: string;
  isKids?: boolean;
  isAnime?: boolean;
  logoPath?: string;
  hdLogoPath?: string;
  clearArtPath?: string;
  hdClearArtPath?: string;
  bannerPath?: string;
  thumbPath?: string;
  discArtPath?: string;
}

export const sampleMovies: Movie[] = [
  {
    id: 1,
    title: "Interstellar Odyssey",
    tagline: "Mankind was born on Earth. It was never meant to die here.",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20movie%20poster%2C%20interstellar%2C%20cinematic%2C%20space%2C%20black%20hole&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20movie%20backdrop%2C%20epic%20space%20scene%2C%20nebula%2C%20stars%2C%20dramatic%20lighting&image_size=landscape_16_9",
    releaseYear: 2014,
    rating: 8.7,
    runtime: "2h 49m",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    country: "United States",
    language: "English",
    quality: "4K HDR",
    studio: "Paramount Pictures",
    director: "Christopher Nolan",
    tags: ["Space", "Time Travel", "Wormhole"],
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    sources: [
      { id: 1, title: "Main Source", quality: "4K", size: "12.5 GB", type: "MP4", isLocal: false, url: "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4" },
      {
        id: 2,
        title: "HLS Stream",
        quality: "1080p",
        size: "4.2 GB",
        type: "HLS",
        isLocal: false,
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        audioTracks: [
          { id: "audio-en", label: "English 5.1", lang: "en", isDefault: true },
          { id: "audio-es", label: "Spanish Dub", lang: "es" },
          { id: "audio-fr", label: "French", lang: "fr" }
        ],
        subtitles: [
          { label: "English CC", lang: "en", src: "/subtitles/interstellar-en.vtt" },
          { label: "Spanish", lang: "es", src: "/subtitles/interstellar-es.vtt" }
        ]
      },
    ],
    cast: [
      { id: 1, name: "Matthew McConaughey", role: "Actor", character: "Cooper", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/3/8927.jpg" },
      { id: 2, name: "Anne Hathaway", role: "Actress", character: "Brand", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/254/635982.jpg" },
      { id: 3, name: "Jessica Chastain", role: "Actress", character: "Murph", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/51/128106.jpg" },
      { id: 4, name: "Michael Caine", role: "Actor", character: "Professor Brand", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/45/114043.jpg" }
    ],
    imdbId: "tt0816692"
  },
  {
    id: 2,
    title: "The Dark Knight",
    tagline: "Why So Serious?",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20knight%20movie%20poster%2C%20batman%2C%20joker%2C%20cinematic%2C%20dark%20tones&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gotham%20city%20night%20skyline%2C%20cinematic%2C%20dramatic%2C%20dark%20blue%20tones&image_size=landscape_16_9",
    releaseYear: 2008,
    rating: 9.0,
    runtime: "2h 32m",
    genres: ["Action", "Crime", "Drama"],
    country: "United States",
    language: "English",
    quality: "1080p",
    studio: "Warner Bros. Pictures",
    director: "Christopher Nolan",
    tags: ["Superhero", "Gotham", "Joker"],
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    sources: [
      {
        id: 1,
        title: "Full Movie",
        quality: "1080p",
        size: "3.8 GB",
        type: "MP4",
        isLocal: false,
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        audioTracks: [
          { id: "audio-en-stereo", label: "English Stereo", lang: "en", isDefault: true },
          { id: "audio-hi", label: "Hindi Dub", lang: "hi" }
        ],
        subtitles: [
          { label: "English", lang: "en", src: "/subtitles/dark-knight-en.vtt" }
        ]
      }
    ],
    cast: [
      { id: 1, name: "Christian Bale", role: "Actor", character: "Bruce Wayne / Batman", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/70/176856.jpg" },
      { id: 2, name: "Heath Ledger", role: "Actor", character: "The Joker", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/44/112055.jpg" },
      { id: 3, name: "Aaron Eckhart", role: "Actor", character: "Harvey Dent", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/33/82837.jpg" },
      { id: 4, name: "Maggie Gyllenhaal", role: "Actress", character: "Rachel Dawes", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/29/74019.jpg" },
      { id: 5, name: "Michael Caine", role: "Actor", character: "Alfred Pennyworth", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/45/114043.jpg" },
      { id: 6, name: "Gary Oldman", role: "Actor", character: "Commissioner Gordon", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/45/114347.jpg" }
    ],
    imdbId: "tt0468569"
  },
  {
    id: 3,
    title: "Inception",
    tagline: "Your mind is the scene of the crime.",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=inception%20movie%20poster%2C%20spinning%20top%2C%20dream%2C%20mind%20bending%2C%20cinematic&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rotating%20city%20landscape%2C%20dream%20world%2C%20cinematic%2C%20surreal&image_size=landscape_16_9",
    releaseYear: 2010,
    rating: 8.8,
    runtime: "2h 28m",
    genres: ["Action", "Sci-Fi", "Thriller"],
    country: "United States",
    language: "English",
    quality: "4K",
    studio: "Warner Bros. Pictures",
    director: "Christopher Nolan",
    tags: ["Dreams", "Mind", "Heist"],
    trailerUrl: "https://www.youtube.com/watch?v=8hP9D6kZseM",
    sources: [],
    cast: [
      { id: 1, name: "Leonardo DiCaprio", role: "Actor", character: "Dom Cobb", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/269/672763.jpg" },
      { id: 2, name: "Joseph Gordon-Levitt", role: "Actor", character: "Arthur", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/85/214698.jpg" },
      { id: 3, name: "Ellen Page", role: "Actress", character: "Ariadne", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/413/1034108.jpg" },
      { id: 4, name: "Tom Hardy", role: "Actor", character: "Eames", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/92/231677.jpg" },
      { id: 5, name: "Marion Cotillard", role: "Actress", character: "Mal", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/91/229385.jpg" }
    ],
    imdbId: "tt1375666"
  },
  {
    id: 4,
    title: "The Shawshank Redemption",
    tagline: "Fear can hold you prisoner. Hope can set you free.",
    overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=shawshank%20redemption%20movie%20poster%2C%20prison%2C%20hope%2C%20cinematic%2C%20dramatic&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=prison%20yard%20at%20sunset%2C%20cinematic%2C%20warm%20tones%2C%20dramatic&image_size=landscape_16_9",
    releaseYear: 1994,
    rating: 9.3,
    runtime: "2h 22m",
    genres: ["Drama"],
    country: "United States",
    language: "English",
    quality: "1080p",
    studio: "Columbia Pictures",
    director: "Frank Darabont",
    tags: ["Prison", "Hope", "Friendship"],
    trailerUrl: "https://www.youtube.com/watch?v=NmzuHjWmXOc",
    sources: [],
    cast: [
      { id: 1, name: "Tim Robbins", role: "Actor", character: "Andy Dufresne", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/9/24280.jpg" },
      { id: 2, name: "Morgan Freeman", role: "Actor", character: "Ellis Redding", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/47/119670.jpg" },
      { id: 3, name: "Bob Gunton", role: "Actor", character: "Warden Norton", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/183/457608.jpg" }
    ],
    imdbId: "tt0111161"
  },
  {
    id: 5,
    title: "Pulp Fiction",
    tagline: "You won't know the facts until you've seen the fiction.",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=pulp%20fiction%20movie%20poster%2C%20retro%20style%2C%20cinematic%2C%20bold%20colors&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=retro%20diner%20scene%2C%20cinematic%2C%20neon%20lights%2C%20night&image_size=landscape_16_9",
    releaseYear: 1994,
    rating: 8.9,
    runtime: "2h 34m",
    genres: ["Crime", "Drama"],
    country: "United States",
    language: "English",
    quality: "720p",
    studio: "Miramax Films",
    director: "Quentin Tarantino",
    tags: ["Crime", "Tarantino", "Non-Linear"],
    trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    sources: [],
    cast: [
      { id: 1, name: "John Travolta", role: "Actor", character: "Vincent Vega", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/74/186963.jpg" },
      { id: 2, name: "Samuel L. Jackson", role: "Actor", character: "Jules Winnfield", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/624/1562412.jpg" },
      { id: 3, name: "Uma Thurman", role: "Actress", character: "Mia Wallace", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/9/23853.jpg" },
      { id: 4, name: "Bruce Willis", role: "Actor", character: "Butch Coolidge", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/9/23686.jpg" }
    ],
    imdbId: "tt0110912"
  },
  {
    id: 6,
    title: "The Matrix",
    tagline: "Reality is a thing of the past.",
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=matrix%20movie%20poster%2C%20neo%2C%20cyberpunk%2C%20green%20tones%2C%20cinematic&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=matrix%20code%20rain%2C%20cyberpunk%20city%2C%20green%20and%20black%2C%20cinematic&image_size=landscape_16_9",
    releaseYear: 1999,
    rating: 8.7,
    runtime: "2h 16m",
    genres: ["Action", "Sci-Fi"],
    country: "United States",
    language: "English",
    quality: "4K",
    studio: "Warner Bros. Pictures",
    director: "The Wachowskis",
    tags: ["Cyberpunk", "Reality", "Matrix"],
    trailerUrl: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    sources: [],
    cast: [
      { id: 1, name: "Keanu Reeves", role: "Actor", character: "Neo", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/45/113789.jpg" },
      { id: 2, name: "Laurence Fishburne", role: "Actor", character: "Morpheus", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/636/1590529.jpg" },
      { id: 3, name: "Carrie-Anne Moss", role: "Actress", character: "Trinity", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/120/301939.jpg" },
      { id: 4, name: "Hugo Weaving", role: "Actor", character: "Agent Smith", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/53/133124.jpg" }
    ]
  },
  {
    id: 7,
    title: "Forrest Gump",
    tagline: "Life is like a box of chocolates.",
    overview: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=forrest%20gump%20movie%20poster%2C%20bench%2C%20feather%2C%20warm%20tones%2C%20cinematic&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bench%20in%20park%20at%20sunset%2C%20warm%20golden%20light%2C%20cinematic&image_size=landscape_16_9",
    releaseYear: 1994,
    rating: 8.8,
    runtime: "2h 22m",
    genres: ["Drama", "Romance"],
    country: "United States",
    language: "English",
    quality: "1080p",
    studio: "Paramount Pictures",
    director: "Robert Zemeckis",
    tags: ["Life", "Love", "History"],
    trailerUrl: "https://www.youtube.com/watch?v=bLvqoHBptjg",
    sources: [],
    cast: [
      { id: 1, name: "Tom Hanks", role: "Actor", character: "Forrest Gump", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/28/72307.jpg" },
      { id: 2, name: "Robin Wright", role: "Actress", character: "Jenny Curran", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/3/8644.jpg" },
      { id: 3, name: "Gary Sinise", role: "Actor", character: "Lt. Dan Taylor", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/8/20153.jpg" }
    ]
  },
  {
    id: 8,
    title: "Fight Club",
    tagline: "Mischief. Mayhem. Soap.",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fight%20club%20movie%20poster%2C%20dark%2C%20gritty%2C%20soap%2C%20cinematic&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20gritty%20city%20alley%2C%20neon%20lights%2C%20rain%2C%20cinematic&image_size=landscape_16_9",
    releaseYear: 1999,
    rating: 8.8,
    runtime: "2h 19m",
    genres: ["Drama", "Thriller"],
    country: "United States",
    language: "English",
    quality: "720p",
    studio: "20th Century Fox",
    director: "David Fincher",
    tags: ["Fight", "Identity", "Consumerism"],
    trailerUrl: "https://www.youtube.com/watch?v=SUXWAEX2jlg",
    sources: [],
    cast: [
      { id: 1, name: "Brad Pitt", role: "Actor", character: "Tyler Durden", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/11/29350.jpg" },
      { id: 2, name: "Edward Norton", role: "Actor", character: "The Narrator", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/525/1313957.jpg" },
      { id: 3, name: "Helena Bonham Carter", role: "Actress", character: "Marla Singer", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/530/1325009.jpg" }
    ]
  },
  {
    id: 9,
    title: "Spirited Away",
    tagline: "The tunnel led to a strange and wonderful world.",
    overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods and witches, where humans are changed into beasts.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=spirited%20away%20anime%20movie%20poster%2C%20studio%20ghibli%20style%2C%20cinematic%2C%20colorful&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=spirited%20away%20anime%20bathhouse%20scene%2C%20cinematic%2C%20magical%2C%20neon%20lights&image_size=landscape_16_9",
    releaseYear: 2001,
    rating: 9.3,
    runtime: "2h 5m",
    genres: ["Animation", "Fantasy", "Adventure"],
    country: "Japan",
    language: "Japanese",
    quality: "4K HDR",
    studio: "Studio Ghibli",
    director: "Hayao Miyazaki",
    tags: ["Anime", "Fantasy", "Studio Ghibli"],
    trailerUrl: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
    sources: [],
    cast: [
      { id: 1, name: "Rumi Hiiragi", role: "Voice Actress", character: "Chihiro", profilePath: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" },
      { id: 2, name: "Miyu Irino", role: "Voice Actor", character: "Haku", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/70/176906.jpg" }
    ],
    isAnime: true
  },
  {
    id: 10,
    title: "Your Name",
    tagline: "Two strangers find themselves connected in a way they never imagined.",
    overview: "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=your%20name%20anime%20movie%20poster%2C%20makoto%20shinkai%20style%2C%20cinematic%2C%20stars%2C%20night%20sky&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=your%20name%20anime%20meteor%20scene%2C%20cinematic%2C%20night%20sky%2C%20city%20lights&image_size=landscape_16_9",
    releaseYear: 2016,
    rating: 9.0,
    runtime: "1h 46m",
    genres: ["Animation", "Romance", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "4K HDR",
    studio: "CoMix Wave Films",
    director: "Makoto Shinkai",
    tags: ["Anime", "Romance", "Fantasy"],
    trailerUrl: "https://www.youtube.com/watch?v=o4-URMnBOPU",
    sources: [],
    cast: [
      { id: 1, name: "Ryunosuke Kamiki", role: "Voice Actor", character: "Taki Tachibana", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/65/163658.jpg" },
      { id: 2, name: "Mone Kamishiraishi", role: "Voice Actress", character: "Mitsuha Miyamizu", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/95/237669.jpg" }
    ],
    isAnime: true
  },
  {
    id: 11,
    title: "Akira",
    tagline: "Neo-Tokyo is about to explode.",
    overview: "A secret military project endangers Neo-Tokyo when it turns a biker gang member into a rampaging psychic psychopath.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=akira%20anime%20movie%20poster%2C%20cyberpunk%2C%20neo-tokyo%2C%20cinematic%2C%20neon%20pink%20and%20blue&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=akira%20anime%20neo-tokyo%20scene%2C%20cyberpunk%2C%20cinematic%2C%20neon%20lights&image_size=landscape_16_9",
    releaseYear: 1988,
    rating: 8.8,
    runtime: "2h 4m",
    genres: ["Animation", "Sci-Fi", "Action"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Toho",
    director: "Katsuhiro Otomo",
    tags: ["Anime", "Cyberpunk", "Sci-Fi"],
    trailerUrl: "https://www.youtube.com/watch?v=GAM2g3yS5V8",
    sources: [],
    cast: [
      { id: 1, name: "Mitsuo Iwata", role: "Voice Actor", character: "Kaneda", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/25/64614.jpg" },
      { id: 2, name: "Nozomu Sasaki", role: "Voice Actor", character: "Tetsuo", profilePath: "https://static.tvmaze.com/uploads/images/medium_portrait/73/184364.jpg" }
    ],
    isAnime: true
  }
];

export const sampleTVShows: TVShow[] = [
  {
    id: 1,
    title: "Cosmic Frontiers",
    tagline: "Beyond the known universe.",
    overview: "A space exploration series following the crew of the Odyssey as they discover new worlds and encounter alien civilizations.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20tv%20show%20poster%2C%20spaceship%2C%20stars%2C%20cinematic%2C%20dramatic%20lighting&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20space%20scene%2C%20nebula%2C%20spacecraft%2C%20dramatic%2C%20cinematic&image_size=landscape_16_9",
    startYear: 2020,
    endYear: 2025,
    rating: 8.9,
    numberOfSeasons: 5,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    country: "United States",
    language: "English",
    quality: "4K HDR",
    studio: "Playflix Studios",
    seasons: [
      {
        id: "s1",
        seasonNumber: 1,
        title: "Season 1",
        overview: "The crew embarks on their first mission.",
        posterPath: "",
        episodes: [
          {
            id: "s1e1",
            title: "The Launch",
            overview: "The crew prepares for their first mission.",
            episodeNumber: 1,
            runtime: "45m",
            rating: 8.5,
            airDate: "2020-09-15",
            thumbnailPath: "",
            sources: [],
          },
          {
            id: "s1e2",
            title: "First Contact",
            overview: "The crew makes first contact with an alien species.",
            episodeNumber: 2,
            runtime: "48m",
            rating: 9.0,
            airDate: "2020-09-22",
            thumbnailPath: "",
            sources: [],
          }
        ]
      }
    ],
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "Shadow Protocol",
    tagline: "Trust no one.",
    overview: "A spy thriller series about a secret agent uncovering a global conspiracy.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=spy%20thriller%20tv%20show%20poster%2C%20dark%2C%20gritty%2C%20cinematic%2C%20neon%20lights&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=night%20city%2C%20gritty%2C%20neon%2C%20cinematic%2C%20spy%20thriller&image_size=landscape_16_9",
    startYear: 2019,
    endYear: 2024,
    rating: 8.7,
    numberOfSeasons: 6,
    genres: ["Thriller", "Drama", "Action"],
    country: "United States",
    language: "English",
    quality: "1080p",
    studio: "Playflix Studios",
    seasons: [],
  },
  {
    id: 3,
    title: "Attack on Titan",
    tagline: "Humanity's fight for survival against the Titans.",
    overview: "Many years ago, humanity was driven to the brink of extinction by giant man-eating humanoids called Titans.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=attack%20on%20titan%20anime%20tv%20show%20poster%2C%20cinematic%2C%20dark%20fantasy%2C%20titan%2C%20eren%2C%20mikasa&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=attack%20on%20titan%20anime%20wall%20scene%2C%20cinematic%2C%20titan%20attack%2C%20epic&image_size=landscape_16_9",
    startYear: 2013,
    endYear: 2023,
    rating: 9.2,
    numberOfSeasons: 4,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "4K HDR",
    studio: "Wit Studio, MAPPA",
    seasons: [
      {
        id: "aot-s1",
        seasonNumber: 1,
        title: "The Fall of Wall Maria",
        overview: "The fall of Wall Maria and humanity's first encounter with the Colossal and Armored Titans.",
        posterPath: "",
        episodes: [
          {
            id: "aot-s1e1",
            title: "To You, 2000 Years From Now",
            overview: "The Colossal Titan breaches Wall Maria, and Eren's world is turned upside down.",
            episodeNumber: 1,
            runtime: "24m",
            rating: 9.4,
            airDate: "2013-04-07",
            thumbnailPath: "",
            sources: [],
          }
        ]
      },
      {
        id: "aot-s2",
        seasonNumber: 2,
        title: "The Battle of Trost",
        overview: "Humanity fights back to reclaim Trost District from the Titans.",
        posterPath: "",
        episodes: []
      },
      {
        id: "aot-s3",
        seasonNumber: 3,
        title: "The Truth Revealed",
        overview: "Secrets about the Titans and the walls are uncovered.",
        posterPath: "",
        episodes: []
      },
      {
        id: "aot-s4",
        seasonNumber: 4,
        title: "The Final Season",
        overview: "The epic conclusion to humanity's war against the Titans.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Dark Fantasy", "Marathon", "Serialized"],
    trailerUrl: "https://www.youtube.com/watch?v=I_G6cG5oWpI",
    isAnime: true
  },
  {
    id: 4,
    title: "Demon Slayer",
    tagline: "Slay the demons, save your sister.",
    overview: "A boy becomes a demon slayer to save his sister and avenge his family.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=demon%20slayer%20anime%20tv%20show%20poster%2C%20tanjiro%2C%20nezuko%2C%20cinematic%2C%20colorful&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=demon%20slayer%20anime%20cinematic%20scene%2C%20breathing%2C%20styles%2C%20demon&image_size=landscape_16_9",
    startYear: 2019,
    endYear: undefined,
    rating: 9.1,
    numberOfSeasons: 4,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "4K HDR",
    studio: "Ufotable",
    seasons: [
      {
        id: "ds-s1",
        seasonNumber: 1,
        title: "Tanjiro's Journey Begins",
        overview: "Tanjiro becomes a Demon Slayer to save his sister.",
        posterPath: "",
        episodes: []
      },
      {
        id: "ds-s2",
        seasonNumber: 2,
        title: "Entertainment District Arc",
        overview: "Tanjiro and the Hashira face off against Daki and Gyutaro.",
        posterPath: "",
        episodes: []
      },
      {
        id: "ds-s3",
        seasonNumber: 3,
        title: "Swordsmith Village Arc",
        overview: "New allies and powerful demons emerge in the village.",
        posterPath: "",
        episodes: []
      },
      {
        id: "ds-s4",
        seasonNumber: 4,
        title: "Hashira Training Arc",
        overview: "The Hashira prepare for the final battle.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Fantasy", "Power Arcs", "Serialized"],
    trailerUrl: "https://www.youtube.com/watch?v=VQGCKyvzIM4",
    isAnime: true
  },
  {
    id: 5,
    title: "One Piece",
    tagline: "The greatest adventure to find the One Piece.",
    overview: "Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=one%20piece%20anime%20tv%20show%20poster%2C%20luffy%2C%20cinematic%2C%20pirates%2C%20straw%20hat%2C%20grand%20line&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=one%20piece%20anime%20grand%20line%20scene%2C%20cinematic%2C%20ocean%2C%20adventure&image_size=landscape_16_9",
    startYear: 1999,
    endYear: undefined,
    rating: 9.0,
    numberOfSeasons: 20,
    genres: ["Animation", "Action", "Adventure"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Toei Animation",
    seasons: [
      {
        id: "op-s1",
        seasonNumber: 1,
        title: "East Blue Saga",
        overview: "Luffy forms his crew and begins his journey.",
        posterPath: "",
        episodes: []
      },
      {
        id: "op-s2",
        seasonNumber: 2,
        title: "Alabasta Saga",
        overview: "The Straw Hats help Vivi save her kingdom.",
        posterPath: "",
        episodes: []
      },
      {
        id: "op-s3",
        seasonNumber: 3,
        title: "Skypeia Saga",
        overview: "An adventure in the sky islands.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Adventure", "Pirates", "Long-Running", "Marathon"],
    trailerUrl: "https://www.youtube.com/watch?v=S8_YezW8V-4",
    isAnime: true
  },
  {
    id: 6,
    title: "Naruto Shippuden",
    tagline: "A ninja's journey to save his friend.",
    overview: "Naruto Uzumaki returns after training to save his friend Sasuke and protect the village.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=naruto%20shippuden%20anime%20poster%2C%20cinematic%2C%20ninja%2C%20orange%20and%20blue&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=naruto%20shippuden%20konoha%20village%2C%20cinematic%2C%20sunset%2C%20ninjas&image_size=landscape_16_9",
    startYear: 2007,
    endYear: 2017,
    rating: 8.9,
    numberOfSeasons: 21,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Studio Pierrot",
    seasons: [
      {
        id: "ns-s1",
        seasonNumber: 1,
        title: "Kazekage Rescue Arc",
        overview: "Naruto and his friends rescue Gaara from the Akatsuki.",
        posterPath: "",
        episodes: []
      },
      {
        id: "ns-s2",
        seasonNumber: 2,
        title: "Tenchi Bridge Reconnaissance Arc",
        overview: "A mission to find Sasuke.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Fantasy", "Long-Running", "Marathon"],
    trailerUrl: "https://www.youtube.com/watch?v=QczgoPbAVDY",
    isAnime: true
  },
  {
    id: 7,
    title: "Hunter x Hunter",
    tagline: "The ultimate treasure hunt.",
    overview: "Gon Freecss becomes a Hunter to find his missing father.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=hunter%20x%20hunter%20anime%20poster%2C%20gon%20killua%2C%20cinematic%2C%20colorful%20fantasy&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=hunter%20x%20hunter%20greed%20island%2C%20cinematic%2C%20fantasy%20world&image_size=landscape_16_9",
    startYear: 2011,
    endYear: 2014,
    rating: 9.3,
    numberOfSeasons: 6,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Madhouse",
    seasons: [
      {
        id: "hxh-s1",
        seasonNumber: 1,
        title: "Hunter Exam Arc",
        overview: "Gon takes the Hunter Exam to become a Hunter.",
        posterPath: "",
        episodes: []
      },
      {
        id: "hxh-s2",
        seasonNumber: 2,
        title: "Heavens Arena Arc",
        overview: "Gon and Killua train at Heavens Arena.",
        posterPath: "",
        episodes: []
      },
      {
        id: "hxh-s3",
        seasonNumber: 3,
        title: "Yorknew City Arc",
        overview: "The gang reunites in Yorknew City.",
        posterPath: "",
        episodes: []
      },
      {
        id: "hxh-s4",
        seasonNumber: 4,
        title: "Greed Island Arc",
        overview: "Gon enters the Greed Island game.",
        posterPath: "",
        episodes: []
      },
      {
        id: "hxh-s5",
        seasonNumber: 5,
        title: "Chimera Ant Arc",
        overview: "A terrifying new threat emerges.",
        posterPath: "",
        episodes: []
      },
      {
        id: "hxh-s6",
        seasonNumber: 6,
        title: "Chairman Election Arc",
        overview: "The final arc of the series.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Fantasy", "Serialized", "Marathon"],
    trailerUrl: "https://www.youtube.com/watch?v=d6kBeJjTGnY",
    isAnime: true
  },
  {
    id: 8,
    title: "My Hero Academia",
    tagline: "Plus Ultra!",
    overview: "A boy born without superpowers dreams of becoming a hero in a world of quirks.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=my%20hero%20academia%20anime%20poster%2C%20deku%2C%20all%20might%2C%20cinematic%2C%20superheroes&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=my%20hero%20academia%20u%20a%20high%2C%20cinematic%2C%20heroes%20training&image_size=landscape_16_9",
    startYear: 2016,
    endYear: undefined,
    rating: 8.8,
    numberOfSeasons: 7,
    genres: ["Animation", "Action", "Superhero"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Bones",
    seasons: [
      {
        id: "mha-s1",
        seasonNumber: 1,
        title: "UA Beginnings",
        overview: "Deku joins UA High School.",
        posterPath: "",
        episodes: []
      },
      {
        id: "mha-s2",
        seasonNumber: 2,
        title: "Sports Festival Arc",
        overview: "The students compete in the Sports Festival.",
        posterPath: "",
        episodes: []
      },
      {
        id: "mha-s3",
        seasonNumber: 3,
        title: "Internship Arc",
        overview: "Students get real-world hero experience.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Superhero", "Power Arcs"],
    trailerUrl: "https://www.youtube.com/watch?v=o9nsq27x9Vg",
    isAnime: true
  },
  {
    id: 9,
    title: "Bleach",
    tagline: "The battle between Soul Reapers and Hollows.",
    overview: "Ichigo Kurosaki becomes a Soul Reaper and battles evil spirits to protect the living and the dead.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bleach%20anime%20tv%20show%20poster%2C%20ichigo%2C%20cinematic%2C%20soul%20reaper%2C%20black%20and%20orange&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=bleach%20anime%20soul%20society%20scene%2C%20cinematic%2C%20battle%2C%20epic&image_size=landscape_16_9",
    startYear: 2004,
    endYear: 2012,
    rating: 8.6,
    numberOfSeasons: 16,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Studio Pierrot",
    seasons: [
      {
        id: "bl-s1",
        seasonNumber: 1,
        title: "Agent of the Shinigami Arc",
        overview: "Ichigo gains Soul Reaper powers and battles Hollows in Karakura Town.",
        posterPath: "",
        episodes: []
      },
      {
        id: "bl-s2",
        seasonNumber: 2,
        title: "Soul Society: The Rescue Arc",
        overview: "Ichigo and friends invade Soul Society to rescue Rukia.",
        posterPath: "",
        episodes: []
      },
      {
        id: "bl-s3",
        seasonNumber: 3,
        title: "Arrancar Arc",
        overview: "The battle against Aizen and his Arrancar army.",
        posterPath: "",
        episodes: []
      },
      {
        id: "bl-s4",
        seasonNumber: 4,
        title: "Thousand-Year Blood War",
        overview: "The final war against the Wandenreich.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Fantasy", "Sagas", "Marathon"],
    trailerUrl: "https://www.youtube.com/watch?v=oZ6y7l05wO4",
    isAnime: true
  },
  {
    id: 10,
    title: "Fullmetal Alchemist: Brotherhood",
    tagline: "Two brothers search for the Philosopher's Stone.",
    overview: "Edward and Alphonse Elric commit the ultimate taboo and pay a terrible price, setting them on a quest for redemption.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fullmetal%20alchemist%20brotherhood%20anime%20poster%2C%20edward%2C%20alphonse%2C%20cinematic%2C%20steampunk%2C%20red%20and%20black&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=fullmetal%20alchemist%20brotherhood%20amestris%20scene%2C%20cinematic%2C%20epic%2C%20fantasy&image_size=landscape_16_9",
    startYear: 2009,
    endYear: 2010,
    rating: 9.1,
    numberOfSeasons: 6,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Bones",
    seasons: [
      {
        id: "fma-s1",
        seasonNumber: 1,
        title: "The Quest Begins",
        overview: "The Elric brothers begin their search for the Philosopher's Stone.",
        posterPath: "",
        episodes: []
      },
      {
        id: "fma-s2",
        seasonNumber: 2,
        title: "The Truth Unfolds",
        overview: "Secrets about the Stone and Amestris are revealed.",
        posterPath: "",
        episodes: []
      },
      {
        id: "fma-s3",
        seasonNumber: 3,
        title: "Promised Day",
        overview: "The final battle against Father and the Homunculi.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Fantasy", "Serialized", "Sagas"],
    trailerUrl: "https://www.youtube.com/watch?v=kVLwCw_8zr0",
    isAnime: true
  },
  {
    id: 11,
    title: "One Punch Man",
    tagline: "The strongest hero who can defeat anyone in one punch.",
    overview: "Saitama is a hero who can defeat any enemy with a single punch, leading to a boring existence.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=one%20punch%20man%20anime%20poster%2C%20saitama%2C%20genos%2C%20cinematic%2C%20yellow%20and%20red&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=one%20punch%20man%20city%20battle%20scene%2C%20cinematic%2C%20epic%2C%20action&image_size=landscape_16_9",
    startYear: 2015,
    endYear: undefined,
    rating: 8.8,
    numberOfSeasons: 3,
    genres: ["Animation", "Action", "Comedy"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "Madhouse, J.C.Staff",
    seasons: [
      {
        id: "opm-s1",
        seasonNumber: 1,
        title: "One Punch Man Season 1",
        overview: "Saitama meets Genos and joins the Hero Association.",
        posterPath: "",
        episodes: []
      },
      {
        id: "opm-s2",
        seasonNumber: 2,
        title: "One Punch Man Season 2",
        overview: "Garou the Hero Hunter emerges.",
        posterPath: "",
        episodes: []
      },
      {
        id: "opm-s3",
        seasonNumber: 3,
        title: "One Punch Man Season 3",
        overview: "The Monster Association arc continues.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Comedy", "Episodic", "High-Intensity"],
    trailerUrl: "https://www.youtube.com/watch?v=atxYJeU4jCg",
    isAnime: true
  },
  {
    id: 12,
    title: "Jujutsu Kaisen",
    tagline: "Sorcerers battle cursed spirits.",
    overview: "Yuuji Itadori becomes the host of a powerful curse and joins a school for sorcerers.",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=jujutsu%20kaisen%20anime%20poster%2C%20itadori%2C%20gojo%2C%20cinematic%2C%20purple%20and%20pink&image_size=portrait_4_3",
    backdropPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=jujutsu%20kaisen%20shibuya%20incident%20scene%2C%20cinematic%2C%20epic%2C%20battle&image_size=landscape_16_9",
    startYear: 2020,
    endYear: undefined,
    rating: 9.0,
    numberOfSeasons: 3,
    genres: ["Animation", "Action", "Fantasy"],
    country: "Japan",
    language: "Japanese",
    quality: "1080p",
    studio: "MAPPA",
    seasons: [
      {
        id: "jk-s1",
        seasonNumber: 1,
        title: "Cursed Womb",
        overview: "Itadori joins Jujutsu High and faces Sukuna.",
        posterPath: "",
        episodes: []
      },
      {
        id: "jk-s2",
        seasonNumber: 2,
        title: "Shibuya Incident",
        overview: "The Shibuya Incident changes everything.",
        posterPath: "",
        episodes: []
      },
      {
        id: "jk-s3",
        seasonNumber: 3,
        title: "Culling Game",
        overview: "The Culling Game arc begins.",
        posterPath: "",
        episodes: []
      }
    ],
    tags: ["Anime", "Action", "Fantasy", "Sagas", "High-Intensity"],
    trailerUrl: "https://www.youtube.com/watch?v=zJ973n5s4O4",
    isAnime: true
  }
];

export interface ContinueWatchingItem extends Partial<Movie> {
  id: string;
  title: string;
  backdropPath: string;
  posterPath?: string;
  progress: number;        // 0-100
  currentTime: string;     // Human-readable
  duration: string;        // Human-readable
  progressSeconds: number; // Exact seek point
  totalSeconds: number;    // Exact total
  kind: 'movie' | 'episode';
  isMovie?: boolean;
  watchedAt?: string;
  movieId?: string;        // Direct link if kind=movie
  tvShowId?: string;       // Direct link if kind=episode
  episodeId?: string;      // Direct link if kind=episode
  seasonNumber?: number;
  episodeNumber?: number;
  showName?: string;
}

const STATIC_CONTINUE_WATCHING: ContinueWatchingItem[] = [
  {
    ...sampleMovies[0],
    id: String(sampleMovies[0].id),
    progress: 65,
    currentTime: "1h 47m",
    duration: "2h 49m",
    progressSeconds: 107 * 60,
    totalSeconds: 169 * 60,
    kind: 'movie',
    movieId: String(sampleMovies[0].id),
  },
  {
    ...sampleMovies[1],
    id: String(sampleMovies[1].id),
    progress: 30,
    currentTime: "45m",
    duration: "2h 32m",
    progressSeconds: 45 * 60,
    totalSeconds: 152 * 60,
    kind: 'movie',
    movieId: String(sampleMovies[1].id),
  },
  {
    ...sampleMovies[2],
    id: String(sampleMovies[2].id),
    progress: 80,
    currentTime: "2h 02m",
    duration: "2h 28m",
    progressSeconds: 122 * 60,
    totalSeconds: 148 * 60,
    kind: 'movie',
    movieId: String(sampleMovies[2].id),
  },
  {
    ...sampleMovies[3],
    id: String(sampleMovies[3].id),
    progress: 45,
    currentTime: "1h 10m",
    duration: "2h 22m",
    progressSeconds: 70 * 60,
    totalSeconds: 142 * 60,
    kind: 'movie',
    movieId: String(sampleMovies[3].id),
  },
];

export const continueWatching = STATIC_CONTINUE_WATCHING;

function getAuthHeadersForUser(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('playflix_token');
    const token = adminToken || userToken;
    if (token && token.trim()) headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

export function formatSeconds(totalSeconds: number): string {
  if (!totalSeconds || Number.isNaN(totalSeconds) || totalSeconds < 0) return '0m';
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (m > 0) {
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  }
  return `${sec}s`;
}

export function getWatchHistory(): ContinueWatchingItem[] {
  if (typeof window === 'undefined') return STATIC_CONTINUE_WATCHING;
  const saved = localStorage.getItem('playflix_watch_history');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  return STATIC_CONTINUE_WATCHING;
}

export function saveWatchHistory(items: ContinueWatchingItem[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_watch_history', JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('playflix-watch-history-updated'));
  }
}

export function removeWatchHistoryItem(id: string | number): void {
  const current = getWatchHistory();
  const filtered = current.filter(i => String(i.id) !== String(id));
  saveWatchHistory(filtered);
}

export function clearWatchHistory(): void {
  saveWatchHistory([]);
}

export type WatchHistoryItem = ContinueWatchingItem;

export function addWatchHistoryItem(item: {
  id: string | number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  progress?: number;
  isMovie?: boolean;
}): void {
  const current = getWatchHistory();
  const existingIndex = current.findIndex(i => 
    String(i.id) === String(item.id) || 
    (item.isMovie && String(i.movieId) === String(item.id)) || 
    (!item.isMovie && String(i.tvShowId) === String(item.id))
  );
  const totalSec = item.isMovie ? 7200 : 2700;
  const progPct = item.progress || 10;
  const progSec = Math.round((progPct / 100) * totalSec);
  const historyItem: ContinueWatchingItem = {
    id: String(item.id),
    kind: item.isMovie ? 'movie' : 'episode',
    title: item.title,
    posterPath: item.posterPath,
    backdropPath: item.backdropPath || item.posterPath,
    progress: progPct,
    currentTime: formatSeconds(progSec),
    duration: formatSeconds(totalSec),
    progressSeconds: progSec,
    totalSeconds: totalSec,
    movieId: item.isMovie ? String(item.id) : undefined,
    tvShowId: !item.isMovie ? String(item.id) : undefined,
  };
  let updated: ContinueWatchingItem[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = { ...updated[existingIndex], ...historyItem };
    const [moved] = updated.splice(existingIndex, 1);
    updated.unshift(moved);
  } else {
    updated = [historyItem, ...current];
  }
  saveWatchHistory(updated);
}

export async function fetchWatchHistory(take = 24, includeCompleted = false): Promise<ContinueWatchingItem[]> {
  // If local history exists, provide it immediately
  if (typeof window !== 'undefined') {
    const local = getWatchHistory();
    if (local && local.length > 0) {
      return local.slice(0, take);
    }
  }

  try {
    const res = await fetch(`${BACKEND_API_BASE}/watch-history?take=${take}&includeCompleted=${includeCompleted ? 'true' : 'false'}`, {
      headers: getAuthHeadersForUser(),
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 401) return [];
      return getWatchHistory();
    }
    const rows = await res.json() as any[];
    if (!Array.isArray(rows)) return getWatchHistory();
    const items: ContinueWatchingItem[] = rows
      .map(row => {
        const kind: 'movie' | 'episode' = row.kind || (row.episodeId || row.tvShowId ? 'episode' : 'movie');
        const total = Math.max(0, Number(row.duration) || 0);
        const prog = Math.min(total, Math.max(0, Number(row.progress) || 0));
        const percent = total > 0 ? Math.round((prog / total) * 100) : 0;
        let backdrop = row.backdropPath;
        if (!backdrop && row.posterPath) backdrop = row.posterPath;
        return {
          id: row.id,
          kind,
          title: (kind === 'episode' && row.showName && row.episodeNumber !== undefined
            ? `${row.showName} — S${row.seasonNumber ?? 0}E${row.episodeNumber}`
            : (row.title || 'Watched item')) as string,
          backdropPath: backdrop || '',
          posterPath: row.posterPath,
          progress: percent,
          currentTime: formatSeconds(prog),
          duration: formatSeconds(total),
          progressSeconds: prog,
          totalSeconds: total,
          movieId: row.movieId,
          tvShowId: row.tvShowId,
          episodeId: row.episodeId,
          seasonNumber: row.seasonNumber,
          episodeNumber: row.episodeNumber,
          showName: row.showName,
          releaseDate: row.releaseDate,
          firstAirDate: row.firstAirDate,
        } as ContinueWatchingItem;
      })
      .filter(it => it.backdropPath || it.posterPath)
      .slice(0, take);
    return items.length > 0 ? items : getWatchHistory();
  } catch (e) {
    return getWatchHistory();
  }
}

export async function upsertWatchHistory(input: {
  movieId?: string;
  tvShowId?: string;
  episodeId?: string;
  progress: number;
  duration: number;
  completed?: boolean;
}): Promise<boolean> {
  // Always update local storage first so watch progress is immediately saved and responsive
  if (typeof window !== 'undefined') {
    try {
      const current = getWatchHistory();
      const allMovies = getMovies();
      const allShows = getTVShows();

      let title = 'Watched item';
      let posterPath = '';
      let backdropPath = '';
      const total = Math.max(0, Number(input.duration) || 0);
      const prog = Math.min(total, Math.max(0, Number(input.progress) || 0));
      const percent = total > 0 ? Math.round((prog / total) * 100) : 0;

      if (input.movieId) {
        const movie = allMovies.find(m => String(m.id) === String(input.movieId)) || sampleMovies.find(m => String(m.id) === String(input.movieId));
        if (movie) {
          title = movie.title;
          posterPath = movie.posterPath;
          backdropPath = movie.backdropPath || movie.posterPath;
        }
      } else if (input.tvShowId) {
        const show = allShows.find(s => String(s.id) === String(input.tvShowId)) || sampleTVShows.find(s => String(s.id) === String(input.tvShowId));
        if (show) {
          title = show.title;
          posterPath = show.posterPath;
          backdropPath = show.backdropPath || show.posterPath;
        }
      }

      const id = input.episodeId ? `ep-${input.episodeId}` : (input.movieId ? `movie-${input.movieId}` : `tv-${input.tvShowId || Date.now()}`);

      const historyItem: ContinueWatchingItem = {
        id,
        kind: input.episodeId || input.tvShowId ? 'episode' : 'movie',
        title,
        backdropPath: backdropPath || posterPath,
        posterPath,
        progress: percent,
        currentTime: formatSeconds(prog),
        duration: formatSeconds(total),
        progressSeconds: prog,
        totalSeconds: total,
        movieId: input.movieId,
        tvShowId: input.tvShowId,
        episodeId: input.episodeId,
      };

      const existingIndex = current.findIndex(it =>
        (input.movieId && String(it.movieId) === String(input.movieId)) ||
        (input.episodeId && String(it.episodeId) === String(input.episodeId)) ||
        String(it.id) === String(id)
      );

      let updated: ContinueWatchingItem[];
      if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex] = { ...updated[existingIndex], ...historyItem };
        const [moved] = updated.splice(existingIndex, 1);
        updated.unshift(moved);
      } else {
        updated = [historyItem, ...current];
      }

      saveWatchHistory(updated);
    } catch (e) {
      console.warn('Failed to update local watch history:', e);
    }
  }

  try {
    const res = await fetch(`${BACKEND_API_BASE}/watch-history`, {
      method: 'POST',
      headers: getAuthHeadersForUser(),
      body: JSON.stringify(input),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function getWatchProgress(key: { movieId?: string; tvShowId?: string; episodeId?: string }): Promise<{ progress: number; duration: number; completed: boolean } | null> {
  try {
    const params = new URLSearchParams();
    if (key.movieId) params.set('movieId', key.movieId);
    if (key.tvShowId) params.set('tvShowId', key.tvShowId);
    if (key.episodeId) params.set('episodeId', key.episodeId);
    if ([...params.values()].length === 0) return null;
    const res = await fetch(`${BACKEND_API_BASE}/watch-history/progress?${params.toString()}`, {
      headers: getAuthHeadersForUser(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json() as any;
  } catch (e) {
    return null;
  }
}

export function buildResumeUrl(item: ContinueWatchingItem): string {
  if (item.kind === 'episode' && item.episodeId && item.tvShowId) {
    const seek = item.progressSeconds ? `?t=${Math.max(0, Math.round(item.progressSeconds - 3))}` : '';
    return `/tv/${item.tvShowId}/episode/${item.episodeId}${seek}`;
  }
  if (item.kind === 'movie' && item.movieId) {
    const seek = item.progressSeconds ? `?t=${Math.max(0, Math.round(item.progressSeconds - 3))}` : '';
    return `/movie/${item.movieId}${seek}`;
  }
  if (item.tvShowId) {
    return `/tv/${item.tvShowId}`;
  }
  return '#';
}

// News Section Data
export interface NewsItem {
  id: number | string;
  title: string;
  category: string;
  image: string;
  time: string;
}

export const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "New blockbuster movie announced for 2025",
    category: "Movies",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=movie%20news%20banner%2C%20cinematic%2C%20red%20carpet%2C%20premiere&image_size=landscape_16_9",
    time: "2 hours ago"
  },
  {
    id: 2,
    title: "Exclusive: First look at upcoming TV series",
    category: "TV Shows",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=tv%20series%20news%2C%20behind%20the%20scenes%2C%20production&image_size=landscape_16_9",
    time: "5 hours ago"
  },
  {
    id: 3,
    title: "Award season predictions: Who will win?",
    category: "Awards",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=awards%20ceremony%2C%20golden%20trophy%2C%20celebration&image_size=landscape_16_9",
    time: "1 day ago"
  },
  {
    id: 4,
    title: "New additions to streaming library",
    category: "Updates",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=streaming%20library%20update%2C%20movie%20collection%2C%20digital&image_size=landscape_16_9",
    time: "2 days ago"
  }
];

// Kids Section Data
export interface KidsContent {
  id: number | string;
  title: string;
  posterPath: string;
  rating: string;
  genre: string;
}

export const kidsContent: KidsContent[] = [
  {
    id: 1,
    title: "Space Adventure",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=kids%20cartoon%20space%20adventure%2C%20colorful%2C%20animated%2C%20bright%20colors&image_size=portrait_4_3",
    rating: "All Ages",
    genre: "Animation"
  },
  {
    id: 2,
    title: "Fairy Tale Kingdom",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=kids%20fairy%20tale%20cartoon%2C%20princess%2C%20castle%2C%20magical&image_size=portrait_4_3",
    rating: "All Ages",
    genre: "Fantasy"
  },
  {
    id: 3,
    title: "Animal Friends",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cute%20animal%20cartoon%20for%20kids%2C%20colorful%20and%20fun&image_size=portrait_4_3",
    rating: "All Ages",
    genre: "Comedy"
  },
  {
    id: 4,
    title: "Science Explorers",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=educational%20kids%20science%20cartoon%2C%20colorful%2C%20fun&image_size=portrait_4_3",
    rating: "All Ages",
    genre: "Educational"
  },
  {
    id: 5,
    title: "Super Hero Team",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=kids%20superhero%20cartoon%2C%20colorful%20and%20exciting&image_size=portrait_4_3",
    rating: "All Ages",
    genre: "Action"
  },
  {
    id: 6,
    title: "Music Party",
    posterPath: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=kids%20music%20cartoon%2C%20colorful%20musical%20instruments&image_size=portrait_4_3",
    rating: "All Ages",
    genre: "Musical"
  }
];

// Trending & Recent Searches
export const trendingSearches = ["Inception", "The Matrix", "Interstellar", "The Dark Knight", "Pulp Fiction"];
export const recentSearches = ["The Shawshank Redemption", "Forrest Gump"];

export const heroMovies = sampleMovies.slice(0, 3);
export const trendingMovies = sampleMovies.slice(0, 6);
export const popularMovies = sampleMovies;
export const topRatedMovies = [...sampleMovies].sort((a, b) => b.rating - a.rating);

// AI-Based Recommendations
export function getAIRecommendations(): Movie[] {
  // Get user preferences based on continue watching
  const watchedGenres: string[] = [];
  const watchedDirectors: string[] = [];
  
  continueWatching.forEach(item => {
    if (Array.isArray(item.genres)) watchedGenres.push(...item.genres);
    if (item.director) {
      watchedDirectors.push(item.director);
    }
  });

  // Calculate score for each movie
  const scoredMovies = sampleMovies.map(movie => {
    let score = 0;
    
    // Genre match score
    const genreMatches = movie.genres.filter(g => watchedGenres.includes(g)).length;
    score += genreMatches * 2;
    
    // Director match score
    if (watchedDirectors.includes(movie.director)) {
      score += 5;
    }
    
    // Rating bonus
    score += movie.rating / 2;
    
    // Variety bonus
    score += Math.random();
    
    return { movie, score };
  });

  // Sort by score descending
  scoredMovies.sort((a, b) => b.score - a.score);
  
  // Exclude already watched (continue watching) and return top recommendations
  const watchedIds = new Set<string | number>(continueWatching.map(i => i.id));
  return scoredMovies
    .filter(({ movie }) => !watchedIds.has(movie.id))
    .map(({ movie }) => movie)
    .slice(0, 6);
}

export const aiRecommendations = getAIRecommendations();

// "Because You Watched" - Recommendations based on last watched item
export function getBecauseYouWatched(): Movie[] {
  if (continueWatching.length === 0) {
    return sampleMovies.slice(0, 5);
  }
  const lastWatched = continueWatching[0];
  const scoredMovies = sampleMovies.map(movie => {
    let score = 0;
    if (movie.id === lastWatched.id) return null;
    const lastGenres: string[] = Array.isArray(lastWatched.genres) ? lastWatched.genres : [];
    const genreMatches = movie.genres.filter(g => lastGenres.includes(g)).length;
    score += genreMatches * 3;
    if (movie.director === lastWatched.director) score += 5;
    if (movie.country === lastWatched.country) score += 2;
    if (movie.language === lastWatched.language) score += 2;
    score += Math.random();
    return { movie, score };
  }).filter(Boolean) as { movie: Movie, score: number }[];
  scoredMovies.sort((a, b) => b.score - a.score);
  return scoredMovies.map(s => s.movie).slice(0, 6);
}
export const becauseYouWatched = getBecauseYouWatched();

// "Popular Near You" - Simulated local popularity
export function getPopularNearYou(): Movie[] {
  return [...sampleMovies].sort((a, b) => b.rating - a.rating).slice(0, 6);
}
export const popularNearYou = getPopularNearYou();

// "New Releases" - Simulate latest movies
export function getNewReleases(): Movie[] {
  return [...sampleMovies].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 6);
}
export const newReleases = getNewReleases();

// App Download Links
export interface AppLink {
  platform: string;
  name: string;
  url: string;
  icon: string;
}

const defaultAppLinks: AppLink[] = [
  {
    platform: "android",
    name: "Google Play",
    url: "https://play.google.com/store/apps/details?id=com.playflix.app",
    icon: "phone"
  },
  {
    platform: "ios",
    name: "App Store",
    url: "https://apps.apple.com/app/playflix/id1234567890",
    icon: "apple"
  },
  {
    platform: "androidtv",
    name: "Android TV",
    url: "https://play.google.com/store/apps/details?id=com.playflix.tv",
    icon: "tv"
  },
  {
    platform: "appletv",
    name: "Apple TV",
    url: "https://tv.apple.com/",
    icon: "tv"
  }
];

export function getAppLinks(): AppLink[] {
  if (typeof window === 'undefined') {
    return defaultAppLinks;
  }
  const saved = localStorage.getItem('playflix_app_links');
  if (saved) {
    try {
      const parsedLinks = JSON.parse(saved);
      if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
        return defaultAppLinks.map((defaultLink) => {
          const savedLink = parsedLinks.find((link) => link.platform === defaultLink.platform);
          return savedLink ? { ...defaultLink, ...savedLink } : defaultLink;
        });
      }
      return defaultAppLinks;
    } catch {
      return defaultAppLinks;
    }
  }
  return defaultAppLinks;
}

export function saveAppLinks(links: AppLink[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_app_links', JSON.stringify(links));
    window.dispatchEvent(new CustomEvent('playflix-app-links-updated'));
  }
}

export let appLinks: AppLink[] = getAppLinks();

// General Settings
export interface GeneralSettings {
  appName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  defaultLanguage: string;
  defaultBrowseTab: 'home' | 'movies' | 'tv' | 'livetv';
  maintenanceMode: boolean;
  downloadsEnabled: boolean;
  registrationEnabled: boolean;
  pushNotificationsEnabled: boolean;
  navbarName: string;
  navbarFontSize: string;
  navbarColor: string;
  navbarAnimationType: 'fade' | 'slide' | 'scale' | 'bounce' | 'none';
  navbarLogo?: string;
}

export const defaultGeneralSettings: GeneralSettings = {
  appName: 'PlayFlix',
  tagline: 'Premium Streaming Platform',
  supportEmail: 'support@playflix.app',
  supportPhone: '+1 (800) 555-0199',
  defaultLanguage: 'English',
  defaultBrowseTab: 'home',
  maintenanceMode: false,
  downloadsEnabled: true,
  registrationEnabled: true,
  pushNotificationsEnabled: true,
  navbarName: 'PlayFlix',
  navbarFontSize: '18px',
  navbarColor: '#ef4444',
  navbarAnimationType: 'fade',
  navbarLogo: ''
};

export function getGeneralSettings(): GeneralSettings {
  if (typeof window === 'undefined') {
    return defaultGeneralSettings;
  }
  const saved = localStorage.getItem('playflix_general_settings');
  if (saved) {
    try {
      return { ...defaultGeneralSettings, ...JSON.parse(saved) };
    } catch {
      return defaultGeneralSettings;
    }
  }
  return defaultGeneralSettings;
}

export function saveGeneralSettings(settings: GeneralSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_general_settings', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('playflix-general-settings-updated'));
  }
}

// Admin Authentication
export interface AdminCredentials {
  username: string;
  password: string;
}

export const defaultAdminCredentials: AdminCredentials = {
  username: 'admin',
  password: 'admin'
};

export function getAdminCredentials(): AdminCredentials {
  if (typeof window === 'undefined') {
    return defaultAdminCredentials;
  }
  const saved = localStorage.getItem('playflix_admin_credentials');
  if (saved) {
    try {
      return { ...defaultAdminCredentials, ...JSON.parse(saved) };
    } catch {
      return defaultAdminCredentials;
    }
  }
  return defaultAdminCredentials;
}

export function saveAdminCredentials(credentials: AdminCredentials): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_admin_credentials', JSON.stringify(credentials));
  }
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  return credentials.username === username && credentials.password === password;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem('playflix_admin_authenticated') === 'true';
}

export function setAdminAuthenticated(isAuthenticated: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_admin_authenticated', isAuthenticated ? 'true' : 'false');
  }
}

export function logoutAdmin(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('playflix_admin_authenticated');
  }
}

// Profile Interface
export interface Profile {
  id: number | string;
  name: string;
  avatar: string;
  isKids: boolean;
  pin: string;
  preferences: {
    language: string;
    subtitlesEnabled: boolean;
    defaultQuality: string;
  };
}

// Subscription Interface
export interface Subscription {
  plan: 'Free' | 'Premium' | 'VIP' | 'Family';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

// User Profile
export interface UserProfile {
  id: number | string;
  fullName: string;
  email: string;
  gender: 'male' | 'female' | 'other' | 'prefer not to say';
  joinDate: string;
  lastLogin: string;
  avatar: string;
  subscription: Subscription;
  profiles: Profile[];
  activeProfileId: number | string;
}

export interface AppUser extends UserProfile {
  password: string;
}

// Default Profiles
const defaultProfiles: Profile[] = [
  {
    id: 'profile-1',
    name: 'John',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square',
    isKids: false,
    pin: '',
    preferences: {
      language: 'English',
      subtitlesEnabled: false,
      defaultQuality: 'Auto'
    }
  },
  {
    id: 'profile-2',
    name: 'Kids',
    avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cute%20cartoon%20profile%20avatar%2C%20kids%2C%20colorful&image_size=square',
    isKids: true,
    pin: '1234',
    preferences: {
      language: 'English',
      subtitlesEnabled: true,
      defaultQuality: '720p'
    }
  }
];

export const currentUserProfile: UserProfile = {
  id: 1,
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  gender: 'male',
  joinDate: 'January 15, 2024',
  lastLogin: 'Today, 2:30 PM',
  avatar: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=friendly%20user%20avatar%20portrait%2C%20simple%2C%20clean%20design&image_size=square',
  subscription: {
    plan: 'Premium',
    startDate: 'January 15, 2024',
    endDate: 'January 15, 2025',
    autoRenew: true
  },
  profiles: defaultProfiles,
  activeProfileId: 'profile-1'
};

const defaultUsers: AppUser[] = [
  {
    ...currentUserProfile,
    password: 'user'
  }
];

const USER_LIST_STORAGE_KEY = 'playflix_users';
const USER_AUTH_STORAGE_KEY = 'playflix_user_authenticated';
const USER_SESSION_STORAGE_KEY = 'playflix_current_user_id';
const LEGACY_USER_PROFILE_STORAGE_KEY = 'playflix_user_profile';
const LEGACY_USER_CREDENTIALS_STORAGE_KEY = 'playflix_user_auth_credentials';

export interface UserAuthCredentials {
  email: string;
  password: string;
}

export const defaultUserAuthCredentials: UserAuthCredentials = {
  email: currentUserProfile.email,
  password: 'user'
};

function getDefaultUser(): AppUser {
  return defaultUsers[0];
}

function normalizeUserGender(gender?: string): UserProfile['gender'] {
  if (!gender) {
    return getDefaultUser().gender;
  }

  const normalizedGender = gender.trim().toLowerCase();

  if (normalizedGender === 'male') return 'male';
  if (normalizedGender === 'female') return 'female';
  if (normalizedGender === 'other') return 'other';
  if (
    normalizedGender === 'prefer not to say' ||
    normalizedGender === 'prefer-not-to-say' ||
    normalizedGender === 'prefer_not_to_say'
  ) {
    return 'prefer not to say';
  }

  return getDefaultUser().gender;
}

function formatReadableDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatReadableDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function buildAvatarPrompt(fullName: string): string {
  return `friendly profile avatar portrait of ${fullName}, cinematic streaming app, clean dark background, premium lighting`;
}

function createAvatarUrl(fullName: string): string {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(buildAvatarPrompt(fullName))}&image_size=square`;
}

function toUserProfile(user: AppUser): UserProfile {
  const { password, ...profile } = user;
  return profile;
}

function persistUsers(users: AppUser[]): void {
  localStorage.setItem(USER_LIST_STORAGE_KEY, JSON.stringify(users));
  window.dispatchEvent(new CustomEvent('playflix-users-updated'));
}

function normalizeUserRecord(user: Partial<AppUser>, index: number): AppUser {
  const defaultUser = getDefaultUser();
  const fallbackName = user.fullName || defaultUser.fullName;
  const keepAvatar: string | undefined = (() => {
    if (typeof user.avatar === 'string') {
      const a = user.avatar.trim();
      if (a.length > 0) return a;
    }
    return undefined;
  })();
  
  return {
    ...defaultUser,
    ...user,
    id: user.id ?? `${Date.now()}-${index}`,
    fullName: fallbackName,
    email: user.email || `${Date.now()}@playflix.app`,
    gender: normalizeUserGender(user.gender),
    joinDate: user.joinDate || formatReadableDate(new Date()),
    lastLogin: user.lastLogin || 'Never',
    avatar: keepAvatar ?? createAvatarUrl(fallbackName),
    subscription: user.subscription || defaultUser.subscription,
    profiles: user.profiles || defaultUser.profiles,
    activeProfileId: user.activeProfileId || defaultUser.activeProfileId,
    password: user.password || defaultUserAuthCredentials.password
  };
}

// OTP Functions
const OTP_STORAGE_KEY = 'playflix_otp';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface OTPEntry {
  email: string;
  otp: string;
  expiresAt: number;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sendOTP(email: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'OTP is only available in browser.' };
  }
  
  const otp = generateOTP();
  const otpEntry: OTPEntry = {
    email,
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS
  };
  
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpEntry));
  console.log(`OTP for ${email}: ${otp}`);
  return { success: true, message: 'OTP sent successfully!' };
}

export function verifyOTP(email: string, otp: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'OTP verification is only available in browser.' };
  }
  
  const trimmedOTP = otp.trim();
  const otpEntryRaw = localStorage.getItem(OTP_STORAGE_KEY);
  if (!otpEntryRaw) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }
  
  try {
    const otpEntry: OTPEntry = JSON.parse(otpEntryRaw);
    
    if (Date.now() > otpEntry.expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }
    
    if (otpEntry.email.toLowerCase() !== email.toLowerCase()) {
      return { success: false, message: 'OTP is for a different email address.' };
    }
    
    if (otpEntry.otp !== trimmedOTP) {
      return { success: false, message: 'Invalid OTP.' };
    }
    
    localStorage.removeItem(OTP_STORAGE_KEY);
    return { success: true, message: 'OTP verified successfully!' };
  } catch {
    return { success: false, message: 'Invalid OTP data.' };
  }
}

// Profile Management Functions
export function getActiveProfile(): Profile | null {
  const user = getCurrentUserRecord();
  return user.profiles.find(p => String(p.id) === String(user.activeProfileId)) || user.profiles[0] || null;
}

export function switchProfile(profileId: string | number): void {
  if (typeof window === 'undefined') return;
  
  const currentUser = getCurrentUserRecord();
  const profileExists = currentUser.profiles.some(p => String(p.id) === String(profileId));
  
  if (!profileExists) return;
  
  const updatedUsers = getUsers().map(user => {
    if (String(user.id) === String(currentUser.id)) {
      return { ...user, activeProfileId: profileId };
    }
    return user;
  });
  
  persistUsers(updatedUsers);
}

export function addProfile(profile: Omit<Profile, 'id'>): Profile {
  const newProfile: Profile = {
    ...profile,
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  };
  
  const currentUser = getCurrentUserRecord();
  const updatedUsers = getUsers().map(user => {
    if (String(user.id) === String(currentUser.id)) {
      return { ...user, profiles: [...user.profiles, newProfile] };
    }
    return user;
  });
  
  persistUsers(updatedUsers);
  return newProfile;
}

export function updateProfile(profileId: string | number, updatedProfile: Partial<Profile>): void {
  const currentUser = getCurrentUserRecord();
  const updatedUsers = getUsers().map(user => {
    if (String(user.id) === String(currentUser.id)) {
      const updatedProfiles = user.profiles.map(p => 
        String(p.id) === String(profileId) ? { ...p, ...updatedProfile } : p
      );
      return { ...user, profiles: updatedProfiles };
    }
    return user;
  });
  
  persistUsers(updatedUsers);
}

export function deleteProfile(profileId: string | number): boolean {
  if (typeof window === 'undefined') return false;
  const currentUser = getCurrentUserRecord();
  if (currentUser.profiles.length <= 1) {
    return false; // Cannot delete the only profile
  }
  const updatedProfiles = currentUser.profiles.filter(p => String(p.id) !== String(profileId));
  if (updatedProfiles.length === currentUser.profiles.length) {
    return false;
  }
  const newActiveId = String(currentUser.activeProfileId) === String(profileId) 
    ? updatedProfiles[0].id 
    : currentUser.activeProfileId;
  const updatedUsers = getUsers().map(user => {
    if (String(user.id) === String(currentUser.id)) {
      return { ...user, profiles: updatedProfiles, activeProfileId: newActiveId };
    }
    return user;
  });
  persistUsers(updatedUsers);
  return true;
}

function migrateLegacyUsers(): AppUser[] {
  const legacyProfileRaw = localStorage.getItem(LEGACY_USER_PROFILE_STORAGE_KEY);
  const legacyCredentialsRaw = localStorage.getItem(LEGACY_USER_CREDENTIALS_STORAGE_KEY);

  let legacyProfile: Partial<UserProfile> = {};
  let legacyCredentials: Partial<UserAuthCredentials> = {};

  if (legacyProfileRaw) {
    try {
      legacyProfile = JSON.parse(legacyProfileRaw);
    } catch {
      legacyProfile = {};
    }
  }

  if (legacyCredentialsRaw) {
    try {
      legacyCredentials = JSON.parse(legacyCredentialsRaw);
    } catch {
      legacyCredentials = {};
    }
  }

  const migratedUser = normalizeUserRecord({
    ...getDefaultUser(),
    ...legacyProfile,
    email: legacyCredentials.email || legacyProfile.email || getDefaultUser().email,
    password: legacyCredentials.password || defaultUserAuthCredentials.password
  }, 0);

  const users = [migratedUser];
  persistUsers(users);
  localStorage.setItem(USER_SESSION_STORAGE_KEY, String(migratedUser.id));

  return users;
}

export function getUsers(): AppUser[] {
  if (typeof window === 'undefined') {
    return defaultUsers;
  }

  const saved = localStorage.getItem(USER_LIST_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((user, index) => normalizeUserRecord(user, index));
      }
    } catch {
      return defaultUsers;
    }
  }

  return migrateLegacyUsers();
}

export function saveUsers(users: AppUser[]): void {
  if (typeof window !== 'undefined') {
    persistUsers(users);
  }
}

export function deleteUser(userId: string | number): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentUserId = getCurrentUserId();
  const updatedUsers = getUsers().filter((user) => String(user.id) !== String(userId));

  saveUsers(updatedUsers);

  if (currentUserId && String(currentUserId) === String(userId)) {
    localStorage.removeItem(USER_AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    localStorage.removeItem('playflix_token');
    localStorage.removeItem('playflix_user');
  }
}

function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') {
    return String(getDefaultUser().id);
  }
  return localStorage.getItem(USER_SESSION_STORAGE_KEY);
}

function setCurrentUserId(userId: string | number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_SESSION_STORAGE_KEY, String(userId));
  }
}

function getCurrentUserRecord(): AppUser {
  // Fall back to original method to fetch the user list first, so we can merge overrides
  const users = getUsers();
  const currentUserId = getCurrentUserId();

  // First check for playflix_user from backend auth, but merge any newer fields
  // (avatar, etc.) from the matching entry in the persisted USER_LIST so
  // avatar/profile edits are visible even with a backend-signed-in session.
  if (typeof window !== 'undefined') {
    const storedUserRaw = localStorage.getItem('playflix_user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        const storedEmail = String(storedUser?.email || '').trim().toLowerCase();
        let merged: any = { ...(storedUser || {}) };
        if (storedEmail) {
          const listMatch = users.find((u) => String(u.email || '').trim().toLowerCase() === storedEmail);
          if (listMatch) {
            // Prefer user-list values for avatar / fullName / profiles / activeProfileId
            // because those are what saveUserProfile mutates.
            merged = {
              ...merged,
              ...listMatch,
              id: merged.id || listMatch.id,
              email: merged.email || listMatch.email,
            };
          }
        }
        // Convert stored user to AppUser format
        return normalizeUserRecord(merged, 0);
      } catch {
        // ignore invalid JSON
      }
    }
  }

  if (currentUserId) {
    const matchedUser = users.find((user) => String(user.id) === currentUserId);
    if (matchedUser) {
      return matchedUser;
    }
  }

  const fallbackUser = users[0] || getDefaultUser();
  if (typeof window !== 'undefined') {
    setCurrentUserId(fallbackUser.id);
  }
  return fallbackUser;
}

export function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
  gender?: UserProfile['gender'];
}): { success: boolean; message?: string; user?: UserProfile } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Registration is only available in the browser.' };
  }

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!fullName || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }

  const users = getUsers();
  const existingUser = users.find((user) => user.email.toLowerCase() === email);
  if (existingUser) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const newUser: AppUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fullName,
    email,
    password,
    gender: input.gender || 'prefer not to say',
    joinDate: formatReadableDate(now),
    lastLogin: formatReadableDateTime(now),
    avatar: createAvatarUrl(fullName),
    subscription: {
      plan: 'Free',
      startDate: formatReadableDate(now),
      endDate: formatReadableDate(endDate),
      autoRenew: true
    },
    profiles: defaultProfiles,
    activeProfileId: defaultProfiles[0].id
  };

  const nextUsers = [newUser, ...users];
  persistUsers(nextUsers);
  setCurrentUserId(newUser.id);

  return { success: true, user: toUserProfile(newUser) };
}

export function getUserAuthCredentials(): UserAuthCredentials {
  const currentUser = getCurrentUserRecord();
  return {
    email: currentUser.email,
    password: currentUser.password
  };
}

export function saveUserAuthCredentials(credentials: UserAuthCredentials): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentUser = getCurrentUserRecord();
  const updatedUsers = getUsers().map((user) =>
    String(user.id) === String(currentUser.id)
      ? {
          ...user,
          email: credentials.email,
          password: credentials.password
        }
      : user
  );

  persistUsers(updatedUsers);
}

export function verifyUserCredentials(email: string, password: string): boolean {
  const users = getUsers();
  return users.some(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
  );
}

export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(USER_AUTH_STORAGE_KEY) === 'true';
}

export function setUserAuthenticated(isAuthenticated: boolean, email?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(USER_AUTH_STORAGE_KEY, isAuthenticated ? 'true' : 'false');

  if (isAuthenticated) {
    const users = getUsers();
    const matchedUser = email
      ? users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase())
      : users[0];

    if (matchedUser) {
      const updatedUsers = users.map((user) =>
        String(user.id) === String(matchedUser.id)
          ? { ...user, lastLogin: formatReadableDateTime(new Date()) }
          : user
      );
      persistUsers(updatedUsers);
      setCurrentUserId(matchedUser.id);
    }
  } else {
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
  }
}

export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_SESSION_STORAGE_KEY);
    localStorage.removeItem('playflix_token');
    localStorage.removeItem('playflix_user');
  }
}

export function getUserProfile(): UserProfile {
  return toUserProfile(getCurrentUserRecord());
}

export function saveUserProfile(profile: Partial<UserProfile>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentUser = getCurrentUserRecord();
  const normalizedGender = profile.gender ? normalizeUserGender(profile.gender) : undefined;
  const updatedUsers = getUsers().map((user) =>
    String(user.id) === String(currentUser.id)
      ? {
          ...user,
          ...profile,
          gender: normalizedGender || user.gender,
          email: profile.email || user.email
        }
      : user
  );

  persistUsers(updatedUsers);

  // Also sync updates into the separate backend-auth session key so
  // avatar/profile edits show up immediately for backend-signed-in users.
  try {
    const storedUserRaw = localStorage.getItem('playflix_user');
    if (storedUserRaw) {
      const stored = JSON.parse(storedUserRaw);
      const storedEmail = String(stored?.email || '').trim().toLowerCase();
      const curEmail = String(currentUser.email || '').trim().toLowerCase();
      if (stored && (storedEmail === curEmail || !storedEmail || !curEmail)) {
        const merged: any = {
          ...(stored || {}),
          ...profile,
          email: profile.email || stored.email || currentUser.email,
          gender: normalizedGender || stored.gender || currentUser.gender,
        };
        // Sync user-list fields (avatar/profiles/fullName/...) that are part of AppUser/UserProfile
        const listMatch = updatedUsers.find((u) => String(u.id) === String(currentUser.id));
        if (listMatch) {
          merged.avatar = listMatch.avatar || merged.avatar;
          merged.fullName = listMatch.fullName || merged.fullName;
          merged.profiles = listMatch.profiles || merged.profiles;
          merged.activeProfileId = listMatch.activeProfileId || merged.activeProfileId;
          merged.subscription = listMatch.subscription || merged.subscription;
        }
        localStorage.setItem('playflix_user', JSON.stringify(merged));
      }
    }
  } catch {
    // ignore JSON errors on best-effort sync
  }
}

export function resetUserPasswordByEmail(input: {
  email: string;
  newPassword: string;
}): { success: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Password reset is only available in the browser.' };
  }

  const email = input.email.trim().toLowerCase();
  const newPassword = input.newPassword;

  if (!email) {
    return { success: false, message: 'Please enter your email.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters.' };
  }

  const users = getUsers();
  const matchedUser = users.find((user) => user.email.toLowerCase() === email);

  if (!matchedUser) {
    return { success: false, message: 'No account was found for this email.' };
  }

  const updatedUsers = users.map((user) =>
    user.email.toLowerCase() === email
      ? {
          ...user,
          password: newPassword
        }
      : user
  );

  persistUsers(updatedUsers);

  return { success: true, message: 'Password updated successfully. You can sign in now.' };
}

export type MovieRequestStatus = 'Pending' | 'Approved' | 'Fulfilled' | 'Declined';

export interface MovieRequest {
  id: string;
  title: string;
  type: 'Movie' | 'TV Show';
  notes: string;
  status: MovieRequestStatus;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  adminNotes?: string;
}

export function getMovieRequests(): MovieRequest[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const saved = localStorage.getItem('playflix_movie_requests');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  return [];
}

export function saveMovieRequests(requests: MovieRequest[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_movie_requests', JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('playflix-movie-requests-updated'));
  }
}

export function submitMovieRequest(input: {
  title: string;
  type: MovieRequest['type'];
  notes?: string;
}): { success: boolean; message?: string; request?: MovieRequest } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Movie requests are only available in the browser.' };
  }

  const title = input.title.trim();
  if (!title) {
    return { success: false, message: 'Please enter a title.' };
  }

  const currentUser = getCurrentUserRecord();
  const requests = getMovieRequests();
  const duplicateRequest = requests.find(
    (request) =>
      request.requesterId === String(currentUser.id) &&
      request.title.trim().toLowerCase() === title.toLowerCase() &&
      request.type === input.type
  );

  if (duplicateRequest) {
    return { success: false, message: 'You already requested this title.' };
  }

  const now = formatReadableDateTime(new Date());
  const newRequest: MovieRequest = {
    id: `request-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    type: input.type,
    notes: input.notes?.trim() || '',
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
    requesterId: String(currentUser.id),
    requesterName: currentUser.fullName,
    requesterEmail: currentUser.email,
  };

  saveMovieRequests([newRequest, ...requests]);
  return { success: true, request: newRequest };
}

export function deleteMovieRequest(requestId: string): boolean {
  if (typeof window === 'undefined') return false;
  const requests = getMovieRequests();
  const filtered = requests.filter(r => r.id !== requestId);
  if (filtered.length === requests.length) return false;
  saveMovieRequests(filtered);
  return true;
}

// Downloads Management
export type DownloadStatus = 'pending' | 'downloading' | 'paused' | 'completed' | 'failed';

export interface Download {
  id: string;
  title: string;
  posterPath: string;
  url: string;
  status: DownloadStatus;
  progress: number;
  size: string;
  downloadedSize: string;
  quality: string;
  addedAt: string;
  completedAt?: string;
  isEncrypted: boolean;
}

const defaultDownloads: Download[] = [
  {
    id: '1',
    title: 'Interstellar Odyssey',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20movie%20poster%2C%20interstellar%2C%20cinematic%2C%20space%2C%20black%20hole&image_size=portrait_4_3',
    url: 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4',
    status: 'completed',
    progress: 100,
    size: '12.5 GB',
    downloadedSize: '12.5 GB',
    quality: '4K',
    addedAt: '2025-07-10T14:30:00',
    isEncrypted: true,
  },
  {
    id: '2',
    title: 'The Dark Knight',
    posterPath: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20knight%20movie%20poster%2C%20batman%2C%20joker%2C%20cinematic%2C%20dark%20tones&image_size=portrait_4_3',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'downloading',
    progress: 65,
    size: '3.8 GB',
    downloadedSize: '2.5 GB',
    quality: '1080p',
    addedAt: '2025-07-15T10:00:00',
    isEncrypted: false,
  }
];

export function getDownloads(): Download[] {
  if (typeof window === 'undefined') return defaultDownloads;
  const saved = localStorage.getItem('playflix_downloads');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultDownloads;
    }
  }
  return defaultDownloads;
}

export function saveDownloads(downloads: Download[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_downloads', JSON.stringify(downloads));
    window.dispatchEvent(new CustomEvent('playflix-downloads-updated'));
  }
}

export function removeDownload(id: string): void {
  const current = getDownloads();
  const filtered = current.filter(d => d.id !== id);
  saveDownloads(filtered);
}

export function clearDownloads(): void {
  saveDownloads([]);
}

export function toggleDownloadPause(id: string): void {
  const current = getDownloads();
  const updated = current.map(d => {
    if (d.id === id) {
      const nextStatus = d.status === 'downloading' ? 'paused' : 'downloading';
      return { ...d, status: nextStatus as DownloadStatus };
    }
    return d;
  });
  saveDownloads(updated);
}

export function addDownload(item: { title: string; posterPath: string; url?: string; quality?: string; size?: string }): Download {
  const current = getDownloads();
  const existing = current.find(d => d.title.toLowerCase() === item.title.toLowerCase());
  if (existing) return existing;
  const newDownload: Download = {
    id: `dl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: item.title,
    posterPath: item.posterPath,
    url: item.url || 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'downloading',
    progress: 15,
    size: item.size || '2.4 GB',
    downloadedSize: '360 MB',
    quality: item.quality || '1080p',
    addedAt: new Date().toISOString(),
    isEncrypted: false,
  };
  saveDownloads([newDownload, ...current]);
  return newDownload;
}

// Favorites Management
export function getFavorites(): (Movie | TVShow)[] {
  if (typeof window === 'undefined') return sampleMovies.slice(0, 4);
  const saved = localStorage.getItem('playflix_favorites');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return sampleMovies.slice(0, 3);
}

export function saveFavorites(favorites: (Movie | TVShow)[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_favorites', JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent('playflix-favorites-updated'));
  }
}

export function isFavorite(id: string | number): boolean {
  const current = getFavorites();
  return current.some(item => String(item.id) === String(id));
}

export function toggleFavorite(item: Movie | TVShow): boolean {
  const current = getFavorites();
  const exists = current.some(m => String(m.id) === String(item.id));
  let updated: (Movie | TVShow)[];
  let isNowFav: boolean;
  if (exists) {
    updated = current.filter(m => String(m.id) !== String(item.id));
    isNowFav = false;
  } else {
    updated = [item, ...current];
    isNowFav = true;
  }
  saveFavorites(updated);
  return isNowFav;
}

export function removeFavorite(id: string | number): void {
  const current = getFavorites();
  saveFavorites(current.filter(m => String(m.id) !== String(id)));
}

export function clearFavorites(): void {
  saveFavorites([]);
}

// User Notifications
export interface UserNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
  type?: 'system' | 'release' | 'account' | 'request';
  link?: string;
}

const defaultUserNotifications: UserNotification[] = [
  {
    id: 'notif-1',
    title: 'New Release: Interstellar Odyssey 4K HDR',
    message: 'Interstellar Odyssey is now streaming with Dolby Atmos audio and HDR 10+ visual enhancement.',
    date: '2 hours ago',
    unread: true,
    type: 'release',
    link: '/movie/1'
  },
  {
    id: 'notif-2',
    title: 'Subscription Active & Verified',
    message: 'Your Premium membership is active. Enjoy ad-free streaming on all your linked devices.',
    date: '1 day ago',
    unread: true,
    type: 'account',
  },
  {
    id: 'notif-3',
    title: 'New TV Shows Added to Catalog',
    message: 'Explore the newly added seasonal series and anime in the PlayFlix library.',
    date: '3 days ago',
    unread: false,
    type: 'release',
    link: '/tv'
  },
  {
    id: 'notif-4',
    title: 'Profile Settings Synchronized',
    message: 'Your playback and audio preferences have been synchronized across all active devices.',
    date: '1 week ago',
    unread: false,
    type: 'system',
  }
];

export function getUserNotifications(): UserNotification[] {
  if (typeof window === 'undefined') return defaultUserNotifications;
  const saved = localStorage.getItem('playflix_user_notifications');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return defaultUserNotifications;
}

export function saveUserNotifications(notifications: UserNotification[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_user_notifications', JSON.stringify(notifications));
    window.dispatchEvent(new CustomEvent('playflix-notifications-updated'));
  }
}

export function markAllNotificationsAsRead(): void {
  const current = getUserNotifications();
  const updated = current.map(n => ({ ...n, unread: false }));
  saveUserNotifications(updated);
}

export function toggleNotificationRead(id: string): void {
  const current = getUserNotifications();
  const updated = current.map(n => n.id === id ? { ...n, unread: !n.unread } : n);
  saveUserNotifications(updated);
}

export function deleteUserNotification(id: string): void {
  const current = getUserNotifications();
  const updated = current.filter(n => n.id !== id);
  saveUserNotifications(updated);
}

export function clearAllUserNotifications(): void {
  saveUserNotifications([]);
}

export function addUserNotification(notification: Omit<UserNotification, 'id' | 'date'> & { date?: string }): UserNotification {
  const current = getUserNotifications();
  const newNotif: UserNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: notification.date || 'Just now',
  };
  saveUserNotifications([newNotif, ...current]);
  return newNotif;
}

// Storage Manager
export interface StorageStats {
  totalAvailable: string;
  used: string;
  downloadsUsed: string;
  free: string;
}

export function getStorageStats(): StorageStats {
  // Simulate storage info
  return {
    totalAvailable: '512 GB',
    used: '256 GB',
    downloadsUsed: '16.3 GB',
    free: '256 GB',
  };
}

// Parental Control & Kids Mode
export interface ParentalControlSettings {
  pinEnabled: boolean;
  pin: string;
  maxAllowedRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  kidsModeEnabled: boolean;
  animeModeEnabled: boolean;
}

export const defaultParentalControlSettings: ParentalControlSettings = {
  pinEnabled: false,
  pin: '',
  maxAllowedRating: 'PG-13',
  kidsModeEnabled: false,
  animeModeEnabled: false,
};

export function getParentalControlSettings(): ParentalControlSettings {
  if (typeof window === 'undefined') {
    return defaultParentalControlSettings;
  }
  const saved = localStorage.getItem('playflix_parental_controls');
  if (saved) {
    try {
      return { ...defaultParentalControlSettings, ...JSON.parse(saved) };
    } catch {
      return defaultParentalControlSettings;
    }
  }
  return defaultParentalControlSettings;
}

export function saveParentalControlSettings(settings: ParentalControlSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_parental_controls', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('playflix-parental-controls-updated'));
  }
}

export function verifyParentalPin(pin: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const settings = getParentalControlSettings();
  if (!settings.pinEnabled || !settings.pin) {
    return false;
  }

  return settings.pin === pin.trim();
}

export function getFilteredKidsContent(): KidsContent[] {
  return kidsContent;
}

export function isKidsModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  const settings = getParentalControlSettings();
  return settings.kidsModeEnabled;
}

export function isAnimeModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  const settings = getParentalControlSettings();
  return settings.animeModeEnabled;
}

function buildAnimeSearchText(parts: Array<string | string[] | undefined>): string {
  return parts
    .flatMap((part) => Array.isArray(part) ? part : [part])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function hasAnimeAffinity(content: {
  title: string;
  overview?: string;
  genres?: string[];
  tags?: string[];
  language?: string;
  country?: string;
}): boolean {
  const searchableText = buildAnimeSearchText([
    content.title,
    content.overview,
    content.genres,
    content.tags,
    content.language,
    content.country,
  ]);

  return [
    'anime',
    'animation',
    'animated',
    'manga',
    'otaku',
    'shonen',
    'shojo',
    'isekai',
    'mecha',
    'studio ghibli',
    'japan',
    'japanese',
  ].some((keyword) => searchableText.includes(keyword));
}

export function getFilteredAnimeMovies(): Movie[] {
  const movies = getMovies();
  const filteredMovies = movies.filter((movie) => hasAnimeAffinity(movie));

  if (filteredMovies.length > 0) {
    return filteredMovies;
  }

  return movies.slice(0, Math.min(movies.length, 8));
}

export function getFilteredAnimeTVShows(): TVShow[] {
  const shows = getTVShows();
  const filteredShows = shows.filter((show) => show.isAnime || hasAnimeAffinity(show));

  if (filteredShows.length > 0) {
    return filteredShows;
  }

  return shows.slice(0, Math.min(shows.length, 8));
}

export function getFilteredKidsTVShows(): TVShow[] {
  const shows = getTVShows();
  return shows.filter((show) => show.isKids);
}

export interface MiniPlayerState {
  isVisible: boolean;
  isMinimized: boolean;
  src: string;
  sourceType?: MediaSourceType;
  poster?: string;
  title?: string;
  videoId: string;
  audioTracks?: MediaAudioTrack[];
  subtitles?: MediaSubtitleTrack[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

const MINI_PLAYER_STORAGE_KEY = 'playflix_mini_player';
const MINI_PLAYER_EVENT = 'playflix-mini-player-updated';

export function getMiniPlayerState(): MiniPlayerState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const saved = localStorage.getItem(MINI_PLAYER_STORAGE_KEY);
  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as MiniPlayerState;
  } catch {
    return null;
  }
}

export function saveMiniPlayerState(state: MiniPlayerState): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(MINI_PLAYER_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(MINI_PLAYER_EVENT, { detail: state }));
}

export function updateMiniPlayerState(updates: Partial<MiniPlayerState>): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentState = getMiniPlayerState();
  if (!currentState) {
    return;
  }

  saveMiniPlayerState({ ...currentState, ...updates });
}

export function clearMiniPlayerState(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(MINI_PLAYER_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(MINI_PLAYER_EVENT, { detail: null }));
}

export function getMiniPlayerEventName(): string {
  return MINI_PLAYER_EVENT;
}

export function normalizeRating(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return fallback;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export type CuratedContentType = 'movie' | 'tv';

// Hero Banner
export interface HeroBanner {
  id: string;
  title: string;
  description: string;
  backdropUrl: string;
  posterUrl: string;
  contentType?: CuratedContentType;
  contentId?: string | number;
  movieId?: string | number;
  tvShowId?: string | number;
  isActive: boolean;
  order: number;
  autoScrollInterval: number;
}

function normalizeHeroBanner(banner: Partial<HeroBanner> & Pick<HeroBanner, 'id' | 'title' | 'description' | 'backdropUrl' | 'posterUrl' | 'isActive' | 'order'>): HeroBanner {
  return {
    ...banner,
    autoScrollInterval: Math.max(1000, Number(banner.autoScrollInterval ?? 10000) || 10000),
    // Default any optional missing fields if needed
    contentType: banner.contentType,
    contentId: banner.contentId,
    movieId: banner.movieId,
    tvShowId: banner.tvShowId,
  };
}

const defaultHeroBanners: HeroBanner[] = [
  {
    id: '1',
    title: 'Interstellar Odyssey',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    backdropUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20movie%20backdrop%2C%20epic%20space%20scene%2C%20nebula%2C%20stars%2C%20dramatic%20lighting&image_size=landscape_16_9',
    posterUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=epic%20sci-fi%20movie%20poster%2C%20interstellar%2C%20cinematic%2C%20space%2C%20black%20hole&image_size=portrait_4_3',
    isActive: true,
    order: 1,
    autoScrollInterval: 10000,
  },
  {
    id: '2',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    backdropUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=gotham%20city%20night%20skyline%2C%20cinematic%2C%20dramatic%2C%20dark%20blue%20tones&image_size=landscape_16_9',
    posterUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dark%20knight%20movie%20poster%2C%20batman%2C%20joker%2C%20cinematic%2C%20dark%20tones&image_size=portrait_4_3',
    isActive: true,
    order: 2,
    autoScrollInterval: 10000,
  },
  {
    id: '3',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    backdropUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=rotating%20city%20landscape%2C%20dream%20world%2C%20cinematic%2C%20surreal&image_size=landscape_16_9',
    posterUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=inception%20movie%20poster%2C%20spinning%20top%2C%20dream%2C%20mind%20bending%2C%20cinematic&image_size=portrait_4_3',
    isActive: true,
    order: 3,
    autoScrollInterval: 10000,
  }
];

export function getHeroBanners(): HeroBanner[] {
  if (typeof window === 'undefined') return defaultHeroBanners;
  const saved = localStorage.getItem('playflix_hero_banners');
  if (saved) {
    try {
      return JSON.parse(saved).map(normalizeHeroBanner);
    } catch {
      return defaultHeroBanners;
    }
  }
  return defaultHeroBanners;
}

export function saveHeroBanners(banners: HeroBanner[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_hero_banners', JSON.stringify(banners.map(normalizeHeroBanner)));
  }
}

const defaultKidsHeroBanners: HeroBanner[] = kidsContent.slice(0, 3).map((item, index) => ({
  id: `kids-banner-${item.id}`,
  title: item.title,
  description: `${item.title} is a playful ${item.genre.toLowerCase()} adventure made for young viewers.`,
  backdropUrl: item.posterPath,
  posterUrl: item.posterPath,
  contentType: 'movie',
  contentId: item.id,
  movieId: item.id,
  isActive: true,
  order: index + 1,
  autoScrollInterval: 10000,
}));

export function getKidsHeroBanners(): HeroBanner[] {
  if (typeof window === 'undefined') return defaultKidsHeroBanners;
  const saved = localStorage.getItem('playflix_kids_hero_banners');
  if (saved) {
    try {
      return JSON.parse(saved).map(normalizeHeroBanner);
    } catch {
      return defaultKidsHeroBanners;
    }
  }
  return defaultKidsHeroBanners;
}

export function saveKidsHeroBanners(banners: HeroBanner[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_kids_hero_banners', JSON.stringify(banners.map(normalizeHeroBanner)));
  }
}

const defaultAnimeHeroBanners: HeroBanner[] = getFilteredAnimeMovies().slice(0, 3).map((movie, index) => ({
  id: `anime-banner-${movie.id}`,
  title: movie.title,
  description: movie.overview,
  backdropUrl: movie.backdropPath,
  posterUrl: movie.posterPath,
  contentType: 'movie',
  contentId: movie.id,
  movieId: movie.id,
  isActive: true,
  order: index + 1,
  autoScrollInterval: 10000,
}));

export function getAnimeHeroBanners(): HeroBanner[] {
  if (typeof window === 'undefined') return defaultAnimeHeroBanners;
  const saved = localStorage.getItem('playflix_anime_hero_banners');
  if (saved) {
    try {
      return JSON.parse(saved).map(normalizeHeroBanner);
    } catch {
      return defaultAnimeHeroBanners;
    }
  }
  return defaultAnimeHeroBanners;
}

export function saveAnimeHeroBanners(banners: HeroBanner[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_anime_hero_banners', JSON.stringify(banners.map(normalizeHeroBanner)));
  }
}

export function getHeroBannerContentId(banner: HeroBanner): string | number | undefined {
  return banner.contentId ?? banner.movieId ?? banner.tvShowId;
}

// Genres
export interface Genre {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

const defaultGenres: Genre[] = [
  { id: '1', name: 'Action', slug: 'action', isActive: true },
  { id: '2', name: 'Adventure', slug: 'adventure', isActive: true },
  { id: '3', name: 'Drama', slug: 'drama', isActive: true },
  { id: '4', name: 'Sci-Fi', slug: 'sci-fi', isActive: true },
  { id: '5', name: 'Thriller', slug: 'thriller', isActive: true },
];

export function getGenres(): Genre[] {
  if (typeof window === 'undefined') return defaultGenres;
  const saved = localStorage.getItem('playflix_genres');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultGenres;
    }
  }
  return defaultGenres;
}

export function saveGenres(genres: Genre[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_genres', JSON.stringify(genres));
  }
}

// Countries
export interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

const defaultCountries: Country[] = [
  { id: '1', name: 'United States', code: 'US', isActive: true },
  { id: '2', name: 'United Kingdom', code: 'GB', isActive: true },
  { id: '3', name: 'India', code: 'IN', isActive: true },
];

export function getCountries(): Country[] {
  if (typeof window === 'undefined') return defaultCountries;
  const saved = localStorage.getItem('playflix_countries');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultCountries;
    }
  }
  return defaultCountries;
}

export function saveCountries(countries: Country[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_countries', JSON.stringify(countries));
  }
}

// Languages
export interface Language {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

const defaultLanguages: Language[] = [
  { id: '1', name: 'English', code: 'en', isActive: true },
  { id: '2', name: 'Spanish', code: 'es', isActive: true },
  { id: '3', name: 'French', code: 'fr', isActive: true },
  { id: '4', name: 'Hindi', code: 'hi', isActive: true },
];

export function getLanguages(): Language[] {
  if (typeof window === 'undefined') return defaultLanguages;
  const saved = localStorage.getItem('playflix_languages');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultLanguages;
    }
  }
  return defaultLanguages;
}

export function saveLanguages(languages: Language[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_languages', JSON.stringify(languages));
  }
}

// Push Notifications
export interface PushNotification {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  sentAt: string;
  status: 'draft' | 'sent';
}

const defaultPushNotifications: PushNotification[] = [];

export function getPushNotifications(): PushNotification[] {
  if (typeof window === 'undefined') return defaultPushNotifications;
  const saved = localStorage.getItem('playflix_push_notifications');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultPushNotifications;
    }
  }
  return defaultPushNotifications;
}

export function savePushNotifications(notifications: PushNotification[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_push_notifications', JSON.stringify(notifications));
  }
}

// API Keys
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  isActive: boolean;
}

const defaultApiKeys: ApiKey[] = [];

export function getApiKeys(): ApiKey[] {
  if (typeof window === 'undefined') return defaultApiKeys;
  const saved = localStorage.getItem('playflix_api_keys');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultApiKeys;
    }
  }
  return defaultApiKeys;
}

export function saveApiKeys(keys: ApiKey[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_api_keys', JSON.stringify(keys));
  }
}

// External service API Keys
export interface ExternalApiKeys {
  tmdb: string;
  imdb: string;
  firebaseLegacyServerKey: string;
  fanartTv: string;
}

const defaultExternalApiKeys: ExternalApiKeys = {
  tmdb: '',
  imdb: '',
  firebaseLegacyServerKey: '',
  fanartTv: '',
};

export function getExternalApiKeys(): ExternalApiKeys {
  if (typeof window === 'undefined') return defaultExternalApiKeys;
  const saved = localStorage.getItem('playflix_external_api_keys');
  if (saved) {
    try {
      return { ...defaultExternalApiKeys, ...JSON.parse(saved) };
    } catch {
      return defaultExternalApiKeys;
    }
  }
  return defaultExternalApiKeys;
}

export function saveExternalApiKeys(keys: ExternalApiKeys): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_external_api_keys', JSON.stringify(keys));
  }
}

// Horizontal Slider Sections
export type SliderSectionType = 'custom' | 'genre';

export interface SliderSection {
  id: string;
  type: SliderSectionType;
  title: string;
  description?: string;
  contentType?: CuratedContentType;
  contentIds?: (string | number)[];
  movieIds: (string | number)[];
  genreId?: string;
  isActive: boolean;
  order: number;
  animationDuration: number;
}

const defaultSliderSections: SliderSection[] = [
  {
    id: '1',
    type: 'custom',
    title: 'Infinite Scroll Slider',
    description: 'Scrolling movie recommendations',
    contentType: 'movie',
    contentIds: [1, 2, 3, 4, 5, 6, 7, 8],
    movieIds: [1, 2, 3, 4, 5, 6, 7, 8],
    isActive: true,
    order: 1,
    animationDuration: 15,
  },
];

export function getSliderSections(): SliderSection[] {
  if (typeof window === 'undefined') return defaultSliderSections;
  const saved = localStorage.getItem('playflix_slider_sections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultSliderSections;
    }
  }
  return defaultSliderSections;
}

export function saveSliderSections(sections: SliderSection[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_slider_sections', JSON.stringify(sections));
  }
}

const defaultKidsSliderSections: SliderSection[] = [
  {
    id: 'kids-slider-1',
    type: 'custom',
    title: 'Kids Favorites',
    description: 'Fun and safe picks for young viewers',
    contentType: 'movie',
    contentIds: kidsContent.map((item) => item.id),
    movieIds: kidsContent.map((item) => item.id),
    isActive: true,
    order: 1,
    animationDuration: 15,
  },
];

export function getKidsSliderSections(): SliderSection[] {
  if (typeof window === 'undefined') return defaultKidsSliderSections;
  const saved = localStorage.getItem('playflix_kids_slider_sections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultKidsSliderSections;
    }
  }
  return defaultKidsSliderSections;
}

export function saveKidsSliderSections(sections: SliderSection[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_kids_slider_sections', JSON.stringify(sections));
  }
}

const defaultAnimeSliderSections: SliderSection[] = [
  {
    id: 'anime-slider-0',
    type: 'custom',
    title: 'Movie Worlds with Anime Energy',
    description: 'Explore anime-inspired adventures, dreamlike visuals, and bold storytelling',
    contentType: 'movie',
    contentIds: getFilteredAnimeMovies().map((movie) => movie.id),
    movieIds: getFilteredAnimeMovies().map((movie) => movie.id),
    isActive: true,
    order: 1,
    animationDuration: 20,
  },
  {
    id: 'anime-slider-1',
    type: 'custom',
    title: 'Marathon Ready: Long-Running Series',
    description: 'Dive into epic stories with hundreds of episodes to enjoy',
    contentType: 'tv',
    contentIds: [3, 5, 6, 7, 9],
    movieIds: [],
    isActive: true,
    order: 2,
    animationDuration: 20,
  },
  {
    id: 'anime-slider-2',
    type: 'custom',
    title: 'Stylized Sagas & Epic Arcs',
    description: 'Rich, carefully crafted sagas with incredible world-building',
    contentType: 'tv',
    contentIds: [5, 9, 10, 12],
    movieIds: [],
    isActive: true,
    order: 3,
    animationDuration: 18,
  },
  {
    id: 'anime-slider-3',
    type: 'custom',
    title: 'High-Intensity Episodic Adventures',
    description: 'Non-stop action and thrills in every episode',
    contentType: 'tv',
    contentIds: [4, 11, 12, 3],
    movieIds: [],
    isActive: true,
    order: 4,
    animationDuration: 16,
  },
  {
    id: 'anime-slider-4',
    type: 'custom',
    title: 'Fantasy Worlds & Magical Realms',
    description: 'Explore magical kingdoms, alternate dimensions, and fantastical worlds',
    contentType: 'tv',
    contentIds: [3, 4, 7, 10],
    movieIds: [],
    isActive: true,
    order: 5,
    animationDuration: 14,
  },
  {
    id: 'anime-slider-5',
    type: 'custom',
    title: 'Studio Ghibli Classics',
    description: 'Timeless masterpieces from the legendary animation studio',
    contentType: 'movie',
    contentIds: getFilteredAnimeMovies().slice(0, 6).map((movie) => movie.id),
    movieIds: getFilteredAnimeMovies().slice(0, 6).map((movie) => movie.id),
    isActive: true,
    order: 6,
    animationDuration: 15,
  },
];

export function getAnimeSliderSections(): SliderSection[] {
  if (typeof window === 'undefined') return defaultAnimeSliderSections;
  const saved = localStorage.getItem('playflix_anime_slider_sections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultAnimeSliderSections;
    }
  }
  return defaultAnimeSliderSections;
}

export function saveAnimeSliderSections(sections: SliderSection[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_anime_slider_sections', JSON.stringify(sections));
  }
}

export function getSliderSectionContentIds(section: SliderSection): (string | number)[] {
  return section.contentIds ?? section.movieIds ?? [];
}

// Homepage Sections
export type HomepageSectionType = 
  | 'continue-watching' 
  | 'recommended' 
  | 'trending' 
  | 'news' 
  | 'popular' 
  | 'kids' 
  | 'anime'
  | 'top-rated' 
  | 'latest-movies'
  | 'tv-shows'
  | 'live-tv'
  | 'new-releases'
  | 'regional'
  | 'hollywood'
  | 'bollywood'
  | 'bangla'
  | 'korean'
  | 'japanese'
  | 'chinese'
  | 'turkish'
  | 'custom'
  | 'movie-genre'
  | 'tv-genre'
  | 'movie-studio'
  | 'tv-studio';

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  isActive: boolean;
  order: number;
  animationDuration?: number; // in seconds, default 15
  customData?: any;
  movieIds?: (string | number)[];
  genre?: string;
  contentType?: 'movie' | 'tv';
  description?: string;
  studio?: string;
}

const defaultHomepageSections: HomepageSection[] = [
  { id: '1', type: 'continue-watching', title: 'Continue Watching', isActive: true, order: 1, animationDuration: 15 },
  { id: '2', type: 'recommended', title: 'Recommended for You', isActive: true, order: 2, animationDuration: 15 },
  { id: '3', type: 'trending', title: 'Trending Now', isActive: true, order: 3, animationDuration: 15 },
  { id: '4', type: 'news', title: 'Latest News', isActive: true, order: 4, animationDuration: 15 },
  { id: '5', type: 'popular', title: 'Popular Movies', isActive: true, order: 5, animationDuration: 15 },
  { id: '6', type: 'kids', title: 'Just For Kids', isActive: true, order: 6, animationDuration: 15 },
  { id: '7', type: 'top-rated', title: 'Top Rated', isActive: true, order: 7, animationDuration: 15 },
];

export function getHomepageSections(): HomepageSection[] {
  if (typeof window === 'undefined') return defaultHomepageSections;
  const saved = localStorage.getItem('playflix_homepage_sections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultHomepageSections;
    }
  }
  return defaultHomepageSections;
}

export function saveHomepageSections(sections: HomepageSection[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_homepage_sections', JSON.stringify(sections));
  }
}

// Kids Homepage Sections
const defaultKidsHomepageSections: HomepageSection[] = [
  { id: '1', type: 'continue-watching', title: 'Continue Watching', isActive: true, order: 1, animationDuration: 15 },
  { id: '2', type: 'kids', title: 'Just For Kids', isActive: true, order: 2, animationDuration: 15 },
  { id: '3', type: 'popular', title: 'Popular Kids Movies', isActive: true, order: 3, animationDuration: 15 },
  { id: '4', type: 'top-rated', title: 'Top Rated Kids', isActive: true, order: 4, animationDuration: 15 },
];

export function getKidsHomepageSections(): HomepageSection[] {
  if (typeof window === 'undefined') return defaultKidsHomepageSections;
  const saved = localStorage.getItem('playflix_kids_homepage_sections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultKidsHomepageSections;
    }
  }
  return defaultKidsHomepageSections;
}

export function saveKidsHomepageSections(sections: HomepageSection[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_kids_homepage_sections', JSON.stringify(sections));
  }
}

// Anime Homepage Sections
const defaultAnimeHomepageSections: HomepageSection[] = [
  { id: '1', type: 'continue-watching', title: 'Continue Watching', isActive: true, order: 1, animationDuration: 15 },
  { id: '2', type: 'anime', title: 'Featured Anime', isActive: true, order: 2, animationDuration: 15 },
  { id: '3', type: 'popular', title: 'Popular Anime', isActive: true, order: 3, animationDuration: 15 },
  { id: '4', type: 'top-rated', title: 'Top Rated Anime', isActive: true, order: 4, animationDuration: 15 },
];

export function getAnimeHomepageSections(): HomepageSection[] {
  if (typeof window === 'undefined') return defaultAnimeHomepageSections;
  const saved = localStorage.getItem('playflix_anime_homepage_sections');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultAnimeHomepageSections;
    }
  }
  return defaultAnimeHomepageSections;
}

export function saveAnimeHomepageSections(sections: HomepageSection[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_anime_homepage_sections', JSON.stringify(sections));
  }
}

// TMDB API Functions
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function searchTMDB(query: string, type: 'movie' | 'tv'): Promise<any[]> {
  const keys = getExternalApiKeys();
  if (!keys.tmdb) {
    throw new Error('TMDB API key not set');
  }

  // Check if query is an IMDb ID (starts with tt followed by numbers)
  if (query.trim().toLowerCase().startsWith('tt')) {
    const response = await fetch(
      `${TMDB_BASE_URL}/find/${encodeURIComponent(query.trim())}?api_key=${keys.tmdb}&language=en-US&external_source=imdb_id`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search TMDB by IMDb ID');
    }
    
    const data = await response.json();
    // Return appropriate results based on type
    if (type === 'movie') {
      return data.movie_results || [];
    } else {
      return data.tv_results || [];
    }
  }

  // Otherwise, do normal search
  const endpoint = type === 'movie' ? '/search/movie' : '/search/tv';
  const response = await fetch(
    `${TMDB_BASE_URL}${endpoint}?api_key=${keys.tmdb}&query=${encodeURIComponent(query)}&language=en-US&page=1`
  );
  
  if (!response.ok) {
    throw new Error('Failed to search TMDB');
  }
  
  const data = await response.json();
  return data.results;
}

export async function getTMDBDetails(id: number, type: 'movie' | 'tv'): Promise<any> {
  const keys = getExternalApiKeys();
  if (!keys.tmdb) {
    throw new Error('TMDB API key not set');
  }

  const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
  const response = await fetch(
    `${TMDB_BASE_URL}${endpoint}?api_key=${keys.tmdb}&language=en-US&append_to_response=credits,videos,external_ids`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get TMDB details');
  }
  
  return await response.json();
}

export async function getTMDBSeasonDetails(tvId: number, seasonNumber: number): Promise<any> {
  const keys = getExternalApiKeys();
  if (!keys.tmdb) {
    throw new Error('TMDB API key not set');
  }
  
  const endpoint = `/tv/${tvId}/season/${seasonNumber}`;
  const response = await fetch(
    `${TMDB_BASE_URL}${endpoint}?api_key=${keys.tmdb}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error('Failed to get TMDB season details');
  }
  
  return await response.json();
}

// ============== Fanart.tv ==============
const FANART_BASE_URL = 'https://webservice.fanart.tv/v3';

export interface FanartMovieArt {
  name: string;
  tmdb_id?: string;
  imdb_id?: string;
  tvdb_id?: string;
  moviethumb?: { url: string; lang: string; likes: string; id: string }[];
  moviebackground?: { url: string; lang: string; likes: string; id: string }[];
  movieposter?: { url: string; lang: string; likes: string; id: string }[];
  movielogo?: { url: string; lang: string; likes: string; id: string }[];
  moviebanner?: { url: string; lang: string; likes: string; id: string }[];
  hdmovielogo?: { url: string; lang: string; likes: string; id: string }[];
  hdmovieclearart?: { url: string; lang: string; likes: string; id: string }[];
  moviedisc?: { url: string; lang: string; likes: string; id: string; disc: string }[];
  movieart?: { url: string; lang: string; likes: string; id: string }[];
}

export interface FanartTvArt {
  name: string;
  thetvdb_id: string;
  tmdb_id?: string;
  imdb_id?: string;
  clearlogo?: { url: string; lang: string; likes: string; id: string }[];
  hdtvlogo?: { url: string; lang: string; likes: string; id: string }[];
  clearart?: { url: string; lang: string; likes: string; id: string }[];
  showbackground?: { url: string; lang: string; likes: string; id: string }[];
  tvthumb?: { url: string; lang: string; likes: string; id: string }[];
  seasonposter?: { url: string; lang: string; likes: string; id: string; season: string }[];
  seasonthumb?: { url: string; lang: string; likes: string; id: string; season: string }[];
  hdclearart?: { url: string; lang: string; likes: string; id: string }[];
  tvbanner?: { url: string; lang: string; likes: string; id: string }[];
  characterart?: { url: string; lang: string; likes: string; id: string }[];
  tvposter?: { url: string; lang: string; likes: string; id: string }[];
  seasonbanner?: { url: string; lang: string; likes: string; id: string; season: string }[];
}

export async function getFanartMovieArt(tmdbOrImdbId: string): Promise<FanartMovieArt | null> {
  const keys = getExternalApiKeys();
  if (!keys.fanartTv) return null;
  const id = String(tmdbOrImdbId).trim();
  if (!id) return null;
  try {
    const res = await fetch(`${FANART_BASE_URL}/movies/${encodeURIComponent(id)}?api_key=${keys.fanartTv}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getFanartTvArt(tvdbId: string): Promise<FanartTvArt | null> {
  const keys = getExternalApiKeys();
  if (!keys.fanartTv) return null;
  const id = String(tvdbId).trim();
  if (!id) return null;
  try {
    const res = await fetch(`${FANART_BASE_URL}/tv/${encodeURIComponent(id)}?api_key=${keys.fanartTv}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export function pickBestFanartImage(
  list: { url: string; lang?: string; likes?: string }[] | undefined,
  preferLang = 'en',
): string | null {
  if (!list || list.length === 0) return null;
  const withScore = list.map(img => {
    const score =
      (img.lang === preferLang ? 10000 : 0) +
      Number((img as any).likes || 0);
    return { ...img, score };
  });
  withScore.sort((a, b) => b.score - a.score);
  return withScore[0].url || null;
}

function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface PickedFanartMovieResult {
  logo?: string;
  hdlogo?: string;
  clearart?: string;
  hdclearart?: string;
  poster?: string;
  background?: string;
  banner?: string;
  thumb?: string;
  disc?: string;
  basic?: { name: string; tmdb_id?: string; imdb_id?: string; tvdb_id?: string };
}

export interface PickedFanartTVResult {
  logo?: string;
  hdlogo?: string;
  clearart?: string;
  hdclearart?: string;
  poster?: string;
  background?: string;
  banner?: string;
  thumb?: string;
  basic?: { name: string; thetvdb_id: string; tmdb_id?: string; imdb_id?: string };
  seasonPosters?: Record<string, string>;
  seasonThumbs?: Record<string, string>;
}

const BACKEND_API_BASE =
  (typeof window !== 'undefined' && (window as any).__PLAYFLIX_API_BASE__) ||
  process.env.NEXT_PUBLIC_API_BASE ||
  (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:3000');

export async function getFanartMovieByTMDBBackend(tmdbId: number): Promise<PickedFanartMovieResult | null> {
  try {
    const userKeys = getExternalApiKeys();
    const params = new URLSearchParams({ pick: 'best' });
    if (userKeys.fanartTv && userKeys.fanartTv.trim()) {
      params.append('fanartKey', userKeys.fanartTv.trim());
    }
    const res = await fetch(`${BACKEND_API_BASE}/fanart/tmdb/movies/${tmdbId}?${params.toString()}`, {
      headers: getAdminAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getFanartTVByTMDBBackend(tmdbId: number): Promise<PickedFanartTVResult | null> {
  try {
    const userKeys = getExternalApiKeys();
    const params = new URLSearchParams({ pick: 'best' });
    if (userKeys.fanartTv && userKeys.fanartTv.trim()) {
      params.append('fanartKey', userKeys.fanartTv.trim());
    }
    const res = await fetch(`${BACKEND_API_BASE}/fanart/tmdb/tv/${tmdbId}?${params.toString()}`, {
      headers: getAdminAuthHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function enrichMovieWithFanart(movie: Movie, tmdbId?: number): Promise<Movie> {
  const fanartId = (tmdbId != null)
    ? tmdbId
    : (typeof (movie as any).tmdbId === 'number' ? (movie as any).tmdbId : undefined);
  let fanart: PickedFanartMovieResult | null = null;
  if (fanartId != null) {
    fanart = await getFanartMovieByTMDBBackend(fanartId);
  }
  if (!fanart) {
    const directId = (movie.imdbId && movie.imdbId.trim()) || String(fanartId || '');
    if (directId) {
      const raw = await getFanartMovieArt(directId);
      if (raw) {
        fanart = {
          logo: pickBestFanartImage(raw.movielogo) || undefined,
          hdlogo: pickBestFanartImage(raw.hdmovielogo) || undefined,
          clearart: pickBestFanartImage(raw.hdmovieclearart) || pickBestFanartImage(raw.movieart) || undefined,
          poster: pickBestFanartImage(raw.movieposter) || undefined,
          background: pickBestFanartImage(raw.moviebackground) || undefined,
          banner: pickBestFanartImage(raw.moviebanner) || undefined,
          thumb: pickBestFanartImage(raw.moviethumb) || undefined,
          disc: pickBestFanartImage(raw.moviedisc) || undefined,
        };
      }
    }
  }
  const result: Movie = { ...movie };
  if (fanart) {
    if (fanart.logo) result.logoPath = fanart.logo;
    if (fanart.hdlogo) result.hdLogoPath = fanart.hdlogo;
    if (fanart.clearart) result.clearArtPath = fanart.clearart;
    if (fanart.hdclearart) result.hdClearArtPath = fanart.hdclearart;
    if (fanart.banner) result.bannerPath = fanart.banner;
    if (fanart.thumb) result.thumbPath = fanart.thumb;
    if (fanart.disc) result.discArtPath = fanart.disc;
    if (fanart.poster && !result.posterPath) result.posterPath = fanart.poster;
    if (fanart.background && !result.backdropPath) result.backdropPath = fanart.background;
    if (fanart.basic?.tvdb_id && !(result as any).tvdbId) {
      (result as any).tvdbId = fanart.basic.tvdb_id;
    }
  }
  return result;
}

export async function enrichTVShowWithFanart(show: TVShow, tmdbId?: number): Promise<TVShow> {
  const fanartTmdbId = (tmdbId != null)
    ? tmdbId
    : (show.tmdbId && typeof show.tmdbId === 'number' ? show.tmdbId : undefined);
  let fanart: PickedFanartTVResult | null = null;
  if (fanartTmdbId != null) {
    fanart = await getFanartTVByTMDBBackend(fanartTmdbId);
  }
  if (!fanart) {
    const tvdbId = (show as any).tvdbId ? String((show as any).tvdbId) : '';
    if (tvdbId) {
      const raw = await getFanartTvArt(tvdbId);
      if (raw) {
        const seasonPosters: Record<string, string> = {};
        for (const s of raw.seasonposter || []) {
          if (!s.season) continue;
          if (!seasonPosters[s.season]) {
            const url = pickBestFanartImage(raw.seasonposter!.filter(x => x.season === s.season));
            if (url) seasonPosters[s.season] = url;
          }
        }
        const seasonThumbs: Record<string, string> = {};
        for (const s of raw.seasonthumb || []) {
          if (!s.season) continue;
          if (!seasonThumbs[s.season]) {
            const url = pickBestFanartImage(raw.seasonthumb!.filter(x => x.season === s.season));
            if (url) seasonThumbs[s.season] = url;
          }
        }
        fanart = {
          logo: pickBestFanartImage(raw.clearlogo) || undefined,
          hdlogo: pickBestFanartImage(raw.hdtvlogo) || undefined,
          clearart: pickBestFanartImage(raw.clearart) || undefined,
          hdclearart: pickBestFanartImage(raw.hdclearart) || undefined,
          poster: pickBestFanartImage(raw.tvposter) || undefined,
          background: pickBestFanartImage(raw.showbackground) || undefined,
          banner: pickBestFanartImage(raw.tvbanner) || undefined,
          thumb: pickBestFanartImage(raw.tvthumb) || undefined,
          seasonPosters,
          seasonThumbs,
          basic: {
            name: raw.name,
            thetvdb_id: raw.thetvdb_id,
            tmdb_id: raw.tmdb_id,
            imdb_id: raw.imdb_id,
          },
        };
      }
    }
  }
  const result: TVShow = { ...show };
  if (fanart) {
    if (fanart.logo) result.logoPath = fanart.logo;
    if (fanart.hdlogo) result.hdLogoPath = fanart.hdlogo;
    if (fanart.clearart) result.clearArtPath = fanart.clearart;
    if (fanart.hdclearart) result.hdClearArtPath = fanart.hdclearart;
    if (fanart.banner) result.bannerPath = fanart.banner;
    if (fanart.thumb) result.thumbPath = fanart.thumb;
    if (fanart.poster && !result.posterPath) result.posterPath = fanart.poster;
    if (fanart.background && !result.backdropPath) result.backdropPath = fanart.background;
    if (fanart.basic?.thetvdb_id && !result.tvdbId) {
      result.tvdbId = fanart.basic.thetvdb_id;
    }
    const hasSeasonData = !!(fanart.seasonPosters || fanart.seasonThumbs);
    if (hasSeasonData && result.seasons && result.seasons.length > 0) {
      result.seasons = result.seasons.map(season => {
        const seasonKey = String(season.seasonNumber);
        const updated: Season = { ...season };
        if (fanart?.seasonPosters?.[seasonKey] && !updated.posterPath) {
          updated.posterPath = fanart.seasonPosters[seasonKey];
        }
        if (fanart?.seasonThumbs?.[seasonKey]) {
          updated.fanartThumb = fanart.seasonThumbs[seasonKey];
        }
        return updated;
      });
    }
  }
  return result;
}

export async function convertTMDBToMovieWithFanart(tmdbMovie: any): Promise<Movie> {
  const base = convertTMDBToMovie(tmdbMovie);
  const tmdbId = tmdbMovie?.id ? Number(tmdbMovie.id) : undefined;
  return enrichMovieWithFanart(base, tmdbId);
}

export async function convertTMDBToTVShowWithFanart(tmdbShow: any): Promise<TVShow> {
  const base = convertTMDBToTVShow(tmdbShow);
  const tmdbId = tmdbShow?.id ? Number(tmdbShow.id) : undefined;
  return enrichTVShowWithFanart(base, tmdbId);
}

export async function convertTMDBToTVShowWithEpisodesAndFanart(tmdbShow: any): Promise<TVShow> {
  const base = await convertTMDBToTVShowWithEpisodes(tmdbShow);
  const tmdbId = tmdbShow?.id ? Number(tmdbShow.id) : undefined;
  return enrichTVShowWithFanart(base, tmdbId);
}

export function convertTMDBToMovie(tmdbMovie: any): Movie {
  const cast: CastMember[] = (tmdbMovie.credits?.cast || []).map((actor: any) => ({
    id: actor.id,
    name: actor.name,
    role: actor.known_for_department || "Actor",
    character: actor.character || "",
    profilePath: actor.profile_path 
      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
      : ""
  }));

  const crew: CrewMember[] = (tmdbMovie.credits?.crew || []).map((member: any) => ({
    id: member.id,
    name: member.name,
    job: member.job || "Crew",
    profilePath: member.profile_path 
      ? `https://image.tmdb.org/t/p/w185${member.profile_path}` 
      : ""
  }));

  return {
    id: Date.now(),
    title: tmdbMovie.title,
    tagline: tmdbMovie.tagline || '',
    overview: tmdbMovie.overview || '',
    posterPath: tmdbMovie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` 
      : '',
    backdropPath: tmdbMovie.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${tmdbMovie.backdrop_path}` 
      : '',
    releaseYear: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : new Date().getFullYear(),
    rating: tmdbMovie.vote_average || 8.0,
    runtime: tmdbMovie.runtime ? `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}m` : '2h 0m',
    genres: tmdbMovie.genres ? tmdbMovie.genres.map((g: any) => g.name) : ['Drama'],
    country: tmdbMovie.production_countries && tmdbMovie.production_countries.length > 0 
      ? tmdbMovie.production_countries[0].name 
      : 'United States',
    language: tmdbMovie.original_language || 'English',
    quality: '1080p',
    studio: tmdbMovie.production_companies && tmdbMovie.production_companies.length > 0 
      ? tmdbMovie.production_companies[0].name 
      : 'Independent',
    director: tmdbMovie.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown Director',
    trailerUrl: tmdbMovie.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') 
      ? `https://www.youtube.com/watch?v=${tmdbMovie.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube').key}`
      : '',
    tags: [],
    sources: [
      {
        id: Date.now(),
        title: "HD Stream",
        quality: "1080p",
        size: "2.5 GB",
        type: "HLS",
        isLocal: false,
        url: ""
      },
      {
        id: Date.now() + 1,
        title: "4K Stream",
        quality: "4K",
        size: "8.5 GB",
        type: "M3U8",
        isLocal: false,
        url: ""
      }
    ],
    cast,
    crew,
    imdbId: tmdbMovie.imdb_id || '',
    isKids: false,
    isAnime: false
  };
}

export function convertTMDBToTVShow(tmdbShow: any): TVShow {
  const seasons: Season[] = (tmdbShow.seasons || []).map((season: any) => ({
    id: season.id || Date.now() + Math.random(),
    tmdbId: season.id,
    seasonNumber: season.season_number || 1,
    title: season.name || `Season ${season.season_number || 1}`,
    overview: season.overview || '',
    posterPath: season.poster_path 
      ? `https://image.tmdb.org/t/p/w500${season.poster_path}` 
      : '',
    episodes: []
  }));

  const cast: CastMember[] = (tmdbShow.credits?.cast || []).map((actor: any) => ({
    id: actor.id,
    name: actor.name,
    role: actor.known_for_department || "Actor",
    character: actor.character || "",
    profilePath: actor.profile_path 
      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
      : ""
  }));

  const crew: CrewMember[] = (tmdbShow.credits?.crew || []).map((member: any) => ({
    id: member.id,
    name: member.name,
    job: member.job || "Crew",
    profilePath: member.profile_path 
      ? `https://image.tmdb.org/t/p/w185${member.profile_path}` 
      : ""
  }));

  return {
    id: Date.now(),
    tmdbId: tmdbShow.id,
    title: tmdbShow.name,
    tagline: tmdbShow.tagline || '',
    overview: tmdbShow.overview || '',
    posterPath: tmdbShow.poster_path 
      ? `https://image.tmdb.org/t/p/w500${tmdbShow.poster_path}` 
      : '',
    backdropPath: tmdbShow.backdrop_path 
      ? `https://image.tmdb.org/t/p/w1280${tmdbShow.backdrop_path}` 
      : '',
    startYear: tmdbShow.first_air_date ? parseInt(tmdbShow.first_air_date.split('-')[0]) : new Date().getFullYear(),
    endYear: tmdbShow.last_air_date ? parseInt(tmdbShow.last_air_date.split('-')[0]) : undefined,
    rating: tmdbShow.vote_average || 8.0,
    numberOfSeasons: tmdbShow.number_of_seasons || 1,
    genres: tmdbShow.genres ? tmdbShow.genres.map((g: any) => g.name) : ['Drama'],
    country: tmdbShow.production_countries && tmdbShow.production_countries.length > 0 
      ? tmdbShow.production_countries[0].name 
      : 'United States',
    language: tmdbShow.original_language || 'English',
    quality: '1080p',
    studio: tmdbShow.production_companies && tmdbShow.production_companies.length > 0 
      ? tmdbShow.production_companies[0].name 
      : 'Independent',
    tags: [],
    trailerUrl: tmdbShow.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') 
      ? `https://www.youtube.com/watch?v=${tmdbShow.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube').key}`
      : '',
    seasons,
    cast,
    crew,
    imdbId: tmdbShow.external_ids?.imdb_id || tmdbShow.imdb_id || '',
    isKids: false,
    isAnime: false
  };
}

export async function convertTMDBToTVShowWithEpisodes(tmdbShow: any): Promise<TVShow> {
  const baseShow = convertTMDBToTVShow(tmdbShow);
  
  const seasonsWithEpisodes: Season[] = await Promise.all(
    (tmdbShow.seasons || []).map(async (season: any) => {
      if (season.season_number === 0) { // Skip specials
        return {
          id: season.id || Date.now() + Math.random(),
          seasonNumber: season.season_number || 1,
          title: season.name || `Season ${season.season_number || 1}`,
          overview: season.overview || '',
          posterPath: season.poster_path 
            ? `https://image.tmdb.org/t/p/w500${season.poster_path}` 
            : '',
          episodes: []
        };
      }
      
      try {
        const seasonDetails = await getTMDBSeasonDetails(tmdbShow.id, season.season_number);
        const episodes: Episode[] = (seasonDetails.episodes || []).map((ep: any) => ({
          id: ep.id || Date.now() + Math.random(),
          tmdbId: ep.id,
          title: ep.name || `Episode ${ep.episode_number}`,
          overview: ep.overview || '',
          episodeNumber: ep.episode_number,
          runtime: ep.runtime ? `${Math.floor(ep.runtime / 60)}h ${ep.runtime % 60}m` : '45m',
          rating: ep.vote_average || 8.0,
          airDate: ep.air_date || '',
          thumbnailPath: ep.still_path 
            ? `https://image.tmdb.org/t/p/w500${ep.still_path}` 
            : '',
          sources: [
            {
              id: Date.now() + Math.random(),
              title: "HD Stream",
              quality: "1080p",
              size: "500 MB",
              type: "HLS" as any,
              isLocal: false,
              url: ""
            },
            {
              id: Date.now() + Math.random() + 1,
              title: "4K Stream",
              quality: "4K",
              size: "1.5 GB",
              type: "M3U8" as any,
              isLocal: false,
              url: ""
            }
          ]
        }));
        
        return {
          id: season.id || Date.now() + Math.random(),
          seasonNumber: season.season_number || 1,
          title: season.name || `Season ${season.season_number || 1}`,
          overview: season.overview || '',
          posterPath: season.poster_path 
            ? `https://image.tmdb.org/t/p/w500${season.poster_path}` 
            : '',
          episodes
        };
      } catch (error) {
        console.error('Error fetching season details:', error);
        return {
          id: season.id || Date.now() + Math.random(),
          seasonNumber: season.season_number || 1,
          title: season.name || `Season ${season.season_number || 1}`,
          overview: season.overview || '',
          posterPath: season.poster_path 
            ? `https://image.tmdb.org/t/p/w500${season.poster_path}` 
            : '',
          episodes: []
        };
      }
    })
  );
  
  return {
    ...baseShow,
    seasons: seasonsWithEpisodes
  };
}

// Movies and TV Shows persistence
export interface Episode {
  id: string | number;
  tmdbId?: number;
  title: string;
  overview: string;
  seasonNumber?: number;
  episodeNumber: number;
  runtime: string | number;
  rating: number;
  airDate: string;
  thumbnailPath: string;
  sources: MovieSource[];
}

export interface Season {
  id: string | number;
  tmdbId?: number;
  seasonNumber: number;
  title: string;
  overview: string;
  posterPath: string;
  episodes: Episode[];
  fanartThumb?: string;
}

export interface TVShow {
  id: string | number;
  tmdbId?: number;
  title: string;
  tagline?: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  startYear: number;
  endYear?: number;
  rating: number;
  numberOfSeasons: number;
  genres: string[];
  country: string;
  language: string;
  quality: string;
  studio: string;
  tags?: string[];
  trailerUrl?: string;
  seasons: Season[];
  sources?: MovieSource[];
  cast?: CastMember[];
  crew?: CrewMember[];
  imdbId?: string;
  isAnime?: boolean;
  isKids?: boolean;
  logoPath?: string;
  hdLogoPath?: string;
  clearArtPath?: string;
  hdClearArtPath?: string;
  bannerPath?: string;
  thumbPath?: string;
  tvdbId?: string;
}

export function getMovies(): Movie[] {
  if (typeof window === 'undefined') return sampleMovies;
  const saved = localStorage.getItem('playflix_movies');
  if (saved) {
    try {
      const raw = JSON.parse(saved);
      if (Array.isArray(raw)) {
        return raw.map((m: any) => m ? { ...m, rating: normalizeRating((m as any).rating, 8.0) } : m);
      }
    } catch {
      return sampleMovies;
    }
  }
  return sampleMovies;
}

export function saveMovies(movies: Movie[]): void {
  if (typeof window !== 'undefined') {
    const normalized = Array.isArray(movies)
      ? movies.map((m: any) => (m ? { ...m, rating: normalizeRating(m?.rating, 8.0) } : m))
      : movies;
    localStorage.setItem('playflix_movies', JSON.stringify(normalized));
    (async () => {
      try {
        const { syncMovieToBackend, deleteMovieFromBackend } = await import('./api');
        const local = new Set(normalized.map(m => String(m.id)));
        const prevRaw = localStorage.getItem('playflix_movies_prev_ids');
        const prevIds: string[] = prevRaw ? JSON.parse(prevRaw) : [];
        for (const pid of prevIds) {
          if (!local.has(pid)) {
            await deleteMovieFromBackend(pid);
          }
        }
        const results = await Promise.allSettled(normalized.map(m => syncMovieToBackend(m)));
        const backendIds = new Set<string>();
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value?.id !== undefined) {
            const bid = String(r.value.id);
            backendIds.add(bid);
            if (String(normalized[i].id) !== bid) {
              normalized[i] = { ...normalized[i], id: r.value.id };
            }
          }
        });
        localStorage.setItem('playflix_movies', JSON.stringify(normalized));
        localStorage.setItem('playflix_movies_prev_ids', JSON.stringify(normalized.map(m => String(m.id))));
      } catch (e) {
        console.warn('saveMovies backend sync failed:', e);
      }
    })();
  }
}

export function getTVShows(): TVShow[] {
  if (typeof window === 'undefined') return sampleTVShows;
  const saved = localStorage.getItem('playflix_tv_shows');
  if (saved) {
    try {
      const raw = JSON.parse(saved);
      if (Array.isArray(raw)) {
        return raw.map((s: any) => s ? { ...s, rating: normalizeRating((s as any).rating, 8.0) } : s);
      }
    } catch {
      return sampleTVShows;
    }
  }
  return sampleTVShows;
}

export function saveTVShows(shows: TVShow[]): void {
  if (typeof window !== 'undefined') {
    const normalized = Array.isArray(shows)
      ? shows.map((s: any) => (s ? { ...s, rating: normalizeRating(s?.rating, 8.0) } : s))
      : shows;
    localStorage.setItem('playflix_tv_shows', JSON.stringify(normalized));
    (async () => {
      try {
        const { syncTVShowToBackend, deleteTVShowFromBackend } = await import('./api');
        const local = new Set(normalized.map(s => String(s.id)));
        const prevRaw = localStorage.getItem('playflix_tv_shows_prev_ids');
        const prevIds: string[] = prevRaw ? JSON.parse(prevRaw) : [];
        for (const pid of prevIds) {
          if (!local.has(pid)) {
            await deleteTVShowFromBackend(pid);
          }
        }
        const results = await Promise.allSettled(normalized.map(s => syncTVShowToBackend(s)));
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value?.id !== undefined) {
            const bid = String(r.value.id);
            if (String(normalized[i].id) !== bid) {
              normalized[i] = { ...normalized[i], id: r.value.id };
            }
          }
        });
        localStorage.setItem('playflix_tv_shows', JSON.stringify(normalized));
        localStorage.setItem('playflix_tv_shows_prev_ids', JSON.stringify(normalized.map(s => String(s.id))))
      } catch (e) {
        console.warn('saveTVShows backend sync failed:', e);
      }
    })();
  }
}

// Automated Metadata Scraping
export interface ScraperSource {
  id: string;
  name: string;
  type: 'tmdb' | 'imdb' | 'local' | 'tvmaze';
  isEnabled: boolean;
  apiKey?: string;
  config: any;
}

export interface ScrapingJob {
  id: string;
  type: 'movie' | 'tv' | 'all' | 'local';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  itemsProcessed: number;
  itemsAdded: number;
  itemsUpdated: number;
  errors: string[];
}

export interface ScrapingConfig {
  autoScrapeEnabled: boolean;
  scrapeInterval: number; // in hours
  autoImportEnabled: boolean;
  defaultQuality: string;
  scrapeSources: ScraperSource[];
  scrapingJobs: ScrapingJob[];
  localScanPaths: string[];
  supportedExtensions: string[];
  lastScrapeTime?: string;
}

const defaultScrapingSources: ScraperSource[] = [
  {
    id: 'tmdb',
    name: 'The Movie Database (TMDB)',
    type: 'tmdb',
    isEnabled: true,
    config: {
      language: 'en-US',
      includeAdult: false,
      includeVideos: true,
      includeCredits: true
    }
  },
  {
    id: 'tvmaze',
    name: 'TVMaze & Open Media (Free, No Key Required)',
    type: 'tvmaze',
    isEnabled: true,
    config: {}
  },
  {
    id: 'local',
    name: 'Local File System',
    type: 'local',
    isEnabled: true,
    config: {
      scanPaths: [],
      supportedExtensions: ['.mp4', '.mkv', '.avi', '.webm', '.mov', '.flv', '.wmv']
    }
  }
];

const defaultScrapingConfig: ScrapingConfig = {
  autoScrapeEnabled: false,
  scrapeInterval: 24,
  autoImportEnabled: true,
  defaultQuality: '1080p',
  scrapeSources: defaultScrapingSources,
  scrapingJobs: [],
  localScanPaths: [],
  supportedExtensions: ['.mp4', '.mkv', '.avi', '.webm', '.mov', '.flv', '.wmv']
};

export function getScrapingConfig(): ScrapingConfig {
  if (typeof window === 'undefined') return defaultScrapingConfig;
  const saved = localStorage.getItem('playflix_scraping_config');
  if (saved) {
    try {
      return { ...defaultScrapingConfig, ...JSON.parse(saved) };
    } catch {
      return defaultScrapingConfig;
    }
  }
  return defaultScrapingConfig;
}

export function saveScrapingConfig(config: Partial<ScrapingConfig>): void {
  if (typeof window !== 'undefined') {
    const existing = getScrapingConfig();
    localStorage.setItem('playflix_scraping_config', JSON.stringify({ ...existing, ...config }));
  }
}

export function addScrapingJob(job: Omit<ScrapingJob, 'id' | 'startTime' | 'status' | 'itemsProcessed' | 'itemsAdded' | 'itemsUpdated' | 'errors'>): ScrapingJob {
  const config = getScrapingConfig();
  const newJob: ScrapingJob = {
    ...job,
    id: Date.now().toString(),
    status: 'pending',
    startTime: new Date().toISOString(),
    itemsProcessed: 0,
    itemsAdded: 0,
    itemsUpdated: 0,
    errors: []
  };
  saveScrapingConfig({
    scrapingJobs: [newJob, ...config.scrapingJobs].slice(0, 50)
  });
  return newJob;
}

export function updateScrapingJob(jobId: string, updates: Partial<ScrapingJob>): void {
  const config = getScrapingConfig();
  const updatedJobs = config.scrapingJobs.map(job => 
    job.id === jobId ? { ...job, ...updates } : job
  );
  saveScrapingConfig({ scrapingJobs: updatedJobs });
}

// Helper to parse movie/TV show info from filename
export function parseFilename(filename: string): { title?: string; year?: number; season?: number; episode?: number; type: 'movie' | 'tv' } {
  let cleanName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  
  // Try to extract year for movies (e.g., "Movie Name (2023)")
  const yearMatch = cleanName.match(/\((\d{4})\)|(\d{4})/);
  let year = yearMatch ? parseInt(yearMatch[1] || yearMatch[2]) : undefined;
  
  // Try to extract season/episode for TV (e.g., "S01E05" or "Season 01 Episode 05")
  const tvMatch = cleanName.match(/[Ss](\d+)[Ee](\d+)|Season\s*(\d+)\s*Episode\s*(\d+)/i);
  if (tvMatch) {
    const season = parseInt(tvMatch[1] || tvMatch[3]);
    const episode = parseInt(tvMatch[2] || tvMatch[4]);
    
    // Remove season/episode from title
    cleanName = cleanName.replace(/[Ss]\d+[Ee]\d+|Season\s*\d+\s*Episode\s*\d+/i, '').trim();
    
    return { title: cleanName.replace(/\./g, ' ').replace(/_/g, ' ').trim(), season, episode, type: 'tv' };
  }
  
  // Clean up movie title
  const title = cleanName.replace(/\./g, ' ').replace(/_/g, ' ').replace(/\(\d{4}\)|\d{4}/g, '').trim();
  
  return { title, year, type: 'movie' };
}

// Xtream API Config
export interface XtreamConfig {
  id: string;
  name: string;
  serverUrl: string;
  username: string;
  password: string;
  isActive: boolean;
  authData?: any;
  createdAt: string;
  updatedAt: string;
}

const defaultXtreamConfigs: XtreamConfig[] = [];

export function getXtreamConfigs(): XtreamConfig[] {
  if (typeof window === 'undefined') return defaultXtreamConfigs;
  const saved = localStorage.getItem('playflix_xtream_configs');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultXtreamConfigs;
    }
  }
  return defaultXtreamConfigs;
}

export function saveXtreamConfigs(configs: XtreamConfig[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('playflix_xtream_configs', JSON.stringify(configs));
  }
}

export interface TvChannel {
  id: string | number;
  name: string;
  description?: string;
  logoPath?: string;
  logoThumbPath?: string;
  streamUrl: string;
  category?: string;
  language?: string;
  country?: string;
  isHD: boolean;
  is4K: boolean;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  epgId?: string;
  nowPlaying?: string;
  nextProgram?: string;
  viewerCount: number;
  rating: number;
  timezone?: string;
  isPaid: boolean;
  packageName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const sampleTvChannels: TvChannel[] = [
  {
    id: 'cnn-us',
    name: 'CNN',
    description: 'Cable News Network - 24/7 News Coverage',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/240px-CNN.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'News',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 1,
    isActive: true,
    isFeatured: true,
    nowPlaying: 'Breaking News Live',
    nextProgram: 'The Situation Room with Wolf Blitzer',
    viewerCount: 245000,
    rating: 8.2,
    isPaid: false,
  },
  {
    id: 'bbc-world',
    name: 'BBC World News',
    description: 'BBC Global News and Analysis',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/BBC_News_logo_2022.svg/240px-BBC_News_logo_2022.svg.png',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'News',
    language: 'English',
    country: 'United Kingdom',
    isHD: true,
    is4K: false,
    order: 2,
    isActive: true,
    isFeatured: true,
    nowPlaying: 'BBC News at Ten',
    nextProgram: 'HARDtalk',
    viewerCount: 189000,
    rating: 8.7,
    isPaid: false,
  },
  {
    id: 'espn',
    name: 'ESPN',
    description: 'Entertainment and Sports Programming Network',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/240px-ESPN_wordmark.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Sports',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 3,
    isActive: true,
    isFeatured: true,
    nowPlaying: 'Monday Night Football',
    nextProgram: 'SportsCenter',
    viewerCount: 512000,
    rating: 9.1,
    isPaid: true,
    packageName: 'Sports Package',
  },
  {
    id: 'hbo',
    name: 'HBO',
    description: 'Home Box Office - Premium Movies and Series',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/240px-HBO_logo.svg.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'Entertainment',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: true,
    order: 4,
    isActive: true,
    isFeatured: true,
    nowPlaying: 'Game of Thrones - The Iron Throne',
    nextProgram: 'Westworld',
    viewerCount: 398000,
    rating: 9.4,
    isPaid: true,
    packageName: 'Premium Package',
  },
  {
    id: 'national-geographic',
    name: 'National Geographic',
    description: 'Science, Nature, and Adventure Documentaries',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/National-Geographic-Logo.svg/240px-National-Geographic-Logo.svg.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'Documentary',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 5,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'Planet Earth III',
    nextProgram: 'Cosmos: Possible Worlds',
    viewerCount: 156000,
    rating: 9.0,
    isPaid: false,
  },
  {
    id: 'discovery',
    name: 'Discovery Channel',
    description: 'The World is Just Awesome',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Discovery_Channel_logo_2019.svg/240px-Discovery_Channel_logo_2019.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Documentary',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 6,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'MythBusters',
    nextProgram: 'Gold Rush',
    viewerCount: 112000,
    rating: 8.5,
    isPaid: false,
  },
  {
    id: 'cartoon-network',
    name: 'Cartoon Network',
    description: "The Best Place for Cartoons and Kids' Entertainment",
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Cartoon_Network_logo_2010.svg/240px-Cartoon_Network_logo_2010.svg.png',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'Kids',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 7,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'Adventure Time',
    nextProgram: 'The Amazing World of Gumball',
    viewerCount: 89000,
    rating: 8.8,
    isPaid: false,
  },
  {
    id: 'mtv',
    name: 'MTV',
    description: 'Music Television - Music, Pop Culture, and Reality',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MTV_logo_2021.svg/240px-MTV_logo_2021.svg.png',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    category: 'Music',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 8,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'Top 40 Music Videos',
    nextProgram: 'Ridiculousness',
    viewerCount: 67000,
    rating: 7.9,
    isPaid: false,
  },
  {
    id: 'food-network',
    name: 'Food Network',
    description: 'Cooking Shows, Recipes and Food Competitions',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Food_Network_logo_2013.svg/240px-Food_Network_logo_2013.svg.png',
    streamUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    category: 'Lifestyle',
    language: 'English',
    country: 'United States',
    isHD: true,
    is4K: false,
    order: 9,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'Iron Chef America',
    nextProgram: 'Diners, Drive-Ins and Dives',
    viewerCount: 78000,
    rating: 8.3,
    isPaid: false,
  },
  {
    id: 'sky-sports',
    name: 'Sky Sports',
    description: "Europe's Leading Sports Broadcaster",
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Sky_Sports_logo_2020.svg/240px-Sky_Sports_logo_2020.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'Sports',
    language: 'English',
    country: 'United Kingdom',
    isHD: true,
    is4K: true,
    order: 10,
    isActive: true,
    isFeatured: true,
    nowPlaying: 'Premier League Live',
    nextProgram: 'Super Sunday',
    viewerCount: 445000,
    rating: 9.0,
    isPaid: true,
    packageName: 'Sports Package',
  },
  {
    id: 'arte',
    name: 'ARTE',
    description: 'Franco-German Cultural Channel',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Arte_logo_2017.svg/240px-Arte_logo_2017.svg.png',
    streamUrl: 'http://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    category: 'Culture',
    language: 'French',
    country: 'France',
    isHD: true,
    is4K: false,
    order: 11,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'Cultural Documentary',
    nextProgram: 'European Cinema Night',
    viewerCount: 34000,
    rating: 8.6,
    isPaid: false,
  },
  {
    id: 'al-jazeera',
    name: 'Al Jazeera English',
    description: 'Global News from the Middle East',
    logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Aljazeera_english.svg/240px-Aljazeera_english.svg.png',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    category: 'News',
    language: 'English',
    country: 'Qatar',
    isHD: true,
    is4K: false,
    order: 12,
    isActive: true,
    isFeatured: false,
    nowPlaying: 'The Newsmakers',
    nextProgram: 'UpFront',
    viewerCount: 123000,
    rating: 8.1,
    isPaid: false,
  },
];

export function getTvChannels(): TvChannel[] {
  if (typeof window === 'undefined') return sampleTvChannels;
  const saved = localStorage.getItem('playflix_tv_channels');
  if (saved) {
    try {
      const raw = JSON.parse(saved);
      if (Array.isArray(raw)) {
        return raw.map((c: any) => {
          if (!c) return c;
          let streamUrl = c.streamUrl;
          // Auto-upgrade dead legacy sample streams
          if (
            !streamUrl ||
            streamUrl.includes('example.com') ||
            streamUrl.includes('cph-p2p-msl.akamaized.net') ||
            streamUrl.includes('moctobpltc-i.akamaihd.net')
          ) {
            const fallback = sampleTvChannels.find((s) => s.id === c.id);
            streamUrl = fallback ? fallback.streamUrl : 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
          }
          return {
            ...c,
            streamUrl,
            rating: normalizeRating((c as any).rating, 8.0),
          };
        });
      }
    } catch {
      return sampleTvChannels;
    }
  }
  return sampleTvChannels;
}

export function saveTvChannels(channels: TvChannel[]): void {
  if (typeof window !== 'undefined') {
    const normalized = Array.isArray(channels)
      ? channels.map((c: any) => (c ? { ...c, rating: normalizeRating(c?.rating, 8.0) } : c))
      : channels;
    localStorage.setItem('playflix_tv_channels', JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('playflix_tv_channels_updated', { detail: normalized }));
    (async () => {
      try {
        const { syncTvChannelToBackend, deleteTvChannelFromBackend } = await import('./api');
        const local = new Set(normalized.map(c => String(c.id)));
        const prevRaw = localStorage.getItem('playflix_tv_channels_prev_ids');
        const prevIds: string[] = prevRaw ? JSON.parse(prevRaw) : [];
        for (const pid of prevIds) {
          if (!local.has(pid)) {
            await deleteTvChannelFromBackend(pid);
          }
        }
        const results = await Promise.allSettled(normalized.map(c => syncTvChannelToBackend(c)));
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value?.id !== undefined) {
            const bid = String(r.value.id);
            if (String(normalized[i].id) !== bid) {
              normalized[i] = { ...normalized[i], id: r.value.id };
            }
          }
        });
        localStorage.setItem('playflix_tv_channels', JSON.stringify(normalized));
        localStorage.setItem('playflix_tv_channels_prev_ids', JSON.stringify(normalized.map(c => String(c.id))));
      } catch (e) {
        console.warn('saveTvChannels backend sync failed:', e);
      }
    })();
  }
}

export const getTvChannelCategories = (): string[] => {
  const all = getTvChannels();
  const cats = new Set<string>();
  for (const c of all) {
    if (c.category) cats.add(c.category);
  }
  return Array.from(cats).sort();
}

export function getActiveXtreamConfig(): XtreamConfig | undefined {
  const configs = getXtreamConfigs();
  return configs.find(c => c.isActive);
}

export function setActiveXtreamConfig(configId: string): void {
  const configs = getXtreamConfigs();
  const updated = configs.map(c => ({
    ...c,
    isActive: c.id === configId
  }));
  saveXtreamConfigs(updated);
}

// --- Media Sync / Upload Folder Types ---

export type SyncTargetType =
  | 'local-folder'
  | 'external-drive'
  | 'network-share'
  | 's3'
  | 'r2'
  | 'android'
  | 'android-tv'
  | 'google-tv'
  | 'ios'
  | 'tvos'
  | 'tizen'
  | 'webos'
  | 'roku'
  | 'fire-tv'
  | 'titan-os'
  | 'tablet';

export type SyncMode = 'copy' | 'mirror' | 'move';
export type SyncDirection = 'backup' | 'archive' | 'restore' | 'two-way';

export interface MediaSyncTarget {
  id: string;
  name: string;
  userId?: string;
  deviceId?: string;
  type: SyncTargetType;
  defaultMode: SyncMode;
  defaultDirection: SyncDirection;
  path?: string;
  label?: string;
  mountPoint?: string;
  bucketName?: string;
  endpoint?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKeyEncrypted?: string;
  includeQualities: boolean;
  qualities: string[];
  includeSubtitles: boolean;
  includeThumbnails: boolean;
  includeOriginal: boolean;
  includeMetadata: boolean;
  compress: boolean;
  splitIntoParts: boolean;
  partSizeGB: number;
  maxBandwidthMbps: number;
  autoDetectOnConnect: boolean;
  isConnected: boolean;
  enabled: boolean;
  freeBytes: number;
  totalBytes: number;
  usedBytes: number;
  filesystem?: string;
  autoSyncNewContent: boolean;
  autoSyncMediaTypes: string[];
  lastSeenAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type SyncJobStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'verifying' | 'paused';
export type SyncJobMediaType = 'video' | 'movie' | 'tv' | 'episode';

export interface MediaSyncJob {
  id: string;
  status: SyncJobStatus;
  direction: 'backup' | 'archive' | 'restore' | 'two-way';
  mode: 'copy' | 'mirror' | 'move';
  target?: MediaSyncTarget;
  targetId?: string;
  deviceId?: string;
  platform?: string;
  videoIds: string[];
  movieIds: string[];
  tvShowIds: string[];
  episodeIds: string[];
  qualities: string[];
  includeSubtitles: boolean;
  includeThumbnails: boolean;
  includeOriginal: boolean;
  includeMetadata: boolean;
  verifyAfterCopy: boolean;
  deleteSourceAfter: boolean;
  itemsTotal: number;
  itemsProcessed: number;
  itemsFailed: number;
  itemsSkipped: number;
  bytesTotal: number;
  bytesTransferred: number;
  errors: string[];
  warnings: string[];
  speedMbps?: number;
  etaSeconds?: number;
  retryCount: number;
  startedAt?: Date | string;
  pausedAt?: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- Device / Multi-Platform Registration Types ---

export type DevicePlatform =
  | 'android'
  | 'android-tv'
  | 'google-tv'
  | 'ios'
  | 'tvos'
  | 'tizen'
  | 'webos'
  | 'roku'
  | 'fire-tv'
  | 'titan-os'
  | 'tablet'
  | 'web-pwa';

export type DeviceFormFactor = 'phone' | 'tablet' | 'tv' | 'desktop' | 'stick' | 'unknown';
export type DeviceConnectionState = 'online' | 'offline' | 'idle' | 'syncing' | 'error';

export interface Device {
  id: string;
  deviceKey: string;
  name: string;
  platform: DevicePlatform;
  formFactor: DeviceFormFactor;
  userId?: string;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  appVersion?: string;
  appBuild?: string;
  locale?: string;
  languageCode?: string;
  countryCode?: string;
  timezone?: string;
  totalBytes: number;
  freeBytes: number;
  usedBytes: number;
  storagePath?: string;
  ipAddress?: string;
  macAddress?: string;
  pushToken?: string;
  connectionState: DeviceConnectionState;
  enabled: boolean;
  offlineEnabled: boolean;
  autoSyncNewContent: boolean;
  autoSyncMediaTypes: string[];
  preferredQualities: string[];
  autoSyncOnWifiOnly: boolean;
  includeSubtitles: boolean;
  includeAudioTracks: boolean;
  maxOfflineGB: number;
  batteryLevel?: number;
  lastSeenAt?: Date | string;
  lastSyncAt?: Date | string;
  capabilities: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// --- DLNA / Easy DLNA Device Discovery and Control Types ---

export type DlnaDeviceClass =
  | 'MediaRenderer'
  | 'MediaServer'
  | 'MediaPlayer'
  | 'MediaRenderer:1'
  | 'MediaServer:1'
  | 'MediaServer:2'
  | 'MediaRenderer:2'
  | 'unknown';

export type DlnaDeviceStatus = 'online' | 'offline' | 'discovering' | 'error';

export type DlnaTransportState =
  | 'STOPPED'
  | 'PLAYING'
  | 'TRANSITIONING'
  | 'PAUSED_PLAYBACK'
  | 'PAUSED_RECORDING'
  | 'RECORDING'
  | 'NO_MEDIA_PRESENT'
  | 'CUSTOM';

export interface DlnaDevice {
  id: string;
  udn: string;
  friendlyName: string;
  deviceClass: DlnaDeviceClass;
  manufacturer?: string;
  manufacturerUrl?: string;
  modelName?: string;
  modelDescription?: string;
  modelNumber?: string;
  modelUrl?: string;
  serialNumber?: string;
  locationUrl: string;
  baseUrl?: string;
  status: DlnaDeviceStatus;
  ipAddress?: string;
  port: number;
  isMediaRenderer: boolean;
  isMediaServer: boolean;
  isRemoteControllable: boolean;
  supportsPlay: boolean;
  supportsPause: boolean;
  supportsStop: boolean;
  supportsSeek: boolean;
  supportsSetVolume: boolean;
  supportsSetMute: boolean;
  avTransportControlUrl?: string;
  renderingControlUrl?: string;
  connectionManagerUrl?: string;
  contentDirectoryUrl?: string;
  supportedProtocols: string[];
  services: string[];
  cacheControlMaxAge: number;
  pinned: boolean;
  autoReconnect: boolean;
  discoverCount: number;
  failedAttempts: number;
  lastKnownVolume?: number;
  lastKnownMute: boolean;
  lastPlayingTitle?: string;
  lastPlayingUrl?: string;
  lastSeenAt?: Date | string;
  lastConnectedAt?: Date | string;
  rawDeviceDescription: Record<string, any>;
  capabilities: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DlnaCastRequest {
  deviceId: string;
  mediaUrl: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  posterUrl?: string;
  contentType?: string;
  startPositionSeconds?: number;
  initialVolume?: number;
  autoPlay?: boolean;
}

export interface DlnaPlaybackControlRequest {
  volume?: number;
  mute?: boolean;
  seekSeconds?: number;
  seekRelative?: string;
}

export interface DlnaPlaybackState {
  currentTransportState: DlnaTransportState;
  currentSpeed: string;
  currentStatus: string;
  trackDuration?: string;
  relTime?: string;
  absTime?: string;
  currentTrack?: number;
  currentTrackDuration?: string;
  currentTrackMetaData?: any;
  volume?: number;
  mute?: boolean;
}

export interface DlnaBrowseRequest {
  objectId?: string;
  browseFlag?: 'BrowseMetadata' | 'BrowseDirectChildren';
  filter?: string;
  startingIndex?: number;
  requestedCount?: number;
  sortCriteria?: string;
}

export interface DlnaBrowseResponse {
  numberReturned: number;
  totalMatches: number;
  items: any[];
}
