import { GENRES } from './genres';
import type { Movie, MovieDetails, MovieList } from './types';

// A deliberately fixed sample catalogue, used only when TMDB_DEMO_MODE opts in.
// Never presented as live trending data.
export const demoMovies: Movie[] = [
  {
    id: 693134,
    original_language: 'en',
    title: 'Dune: Part Two',
    overview:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Faced with a choice between love and the fate of the universe, he must prevent a terrible future only he can foresee.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/eZ239CUp1d6OryZEBPnO2n87gMG.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5000,
    genre_ids: [878, 12],
  },
  {
    id: 872585,
    original_language: 'en',
    title: 'Oppenheimer',
    overview:
      'The story of American physicist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    poster_path: '/ptpr0kGAckfQkJeJIt8st5dglvd.jpg',
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    release_date: '2023-07-19',
    vote_average: 8.1,
    vote_count: 6000,
    genre_ids: [18, 36],
  },
  {
    id: 569094,
    original_language: 'en',
    title: 'Spider-Man: Across the Spider-Verse',
    overview:
      'Miles Morales travels across the multiverse and encounters a team of Spider-People charged with protecting its existence.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    release_date: '2023-05-31',
    vote_average: 8.4,
    vote_count: 4500,
    genre_ids: [16, 28, 12],
  },
  {
    id: 346698,
    original_language: 'en',
    title: 'Barbie',
    overview:
      'Barbie and Ken are having the time of their lives in the colorful world of Barbie Land. When they get a chance to go to the real world, they discover the joys and perils of living among humans.',
    poster_path: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
    backdrop_path: '/nHf61UzkfFno5X1ofIhugCPus2R.jpg',
    release_date: '2023-07-19',
    vote_average: 7.0,
    vote_count: 4200,
    genre_ids: [35, 12, 14],
  },
  {
    id: 157336,
    original_language: 'en',
    title: 'Interstellar',
    overview:
      'A team of explorers travels beyond this galaxy to discover whether mankind has a future among the stars.',
    poster_path: '/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    backdrop_path: '/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 20000,
    genre_ids: [878, 18, 12],
  },
  {
    id: 545611,
    original_language: 'en',
    title: 'Everything Everywhere All at Once',
    overview:
      'An exhausted Chinese American woman finds herself swept up in an adventure in which she alone can save existence by exploring other universes.',
    poster_path: '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    backdrop_path: '/ss0Os3uWJfQAENILHZUdX8Tt1OC.jpg',
    release_date: '2022-03-24',
    vote_average: 7.8,
    vote_count: 4500,
    genre_ids: [28, 12, 878],
  },
  {
    id: 496243,
    original_language: 'ko',
    title: 'Parasite',
    overview:
      'The struggling Kim family sees an opportunity when their son begins working for the wealthy Park family. Soon, the two households become entangled in unexpected ways.',
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: '/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 14000,
    genre_ids: [35, 53, 18],
  },
  {
    id: 129,
    original_language: 'ja',
    title: 'Spirited Away',
    overview:
      'A young girl enters a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdrop_path: '/6vDtY1V1rmqVYAgB75igcrY86E7.jpg',
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 15000,
    genre_ids: [16, 10751, 14],
  },
];
const DUNE_PART_TWO = 693134;
// Only one sample film carries full details, enough to demo the detail page and trailer.
const demoExtras: Partial<Record<number, Pick<MovieDetails, 'tagline' | 'runtime' | 'videos'>>> = {
  [DUNE_PART_TWO]: {
    tagline: 'Long live the fighters.',
    runtime: 167,
    videos: {
      results: [
        {
          key: 'Way9Dexny3w',
          site: 'YouTube',
          type: 'Trailer',
          official: true,
          name: 'Official trailer',
        },
      ],
    },
  },
};

export const demoDetail = (id: number): MovieDetails | null => {
  const movie = demoMovies.find((item) => item.id === id);
  if (!movie) return null;
  return {
    ...movie,
    tagline: '',
    runtime: null,
    videos: { results: [] },
    ...demoExtras[id],
    genres: movie.genre_ids.map((genreId) => ({ id: genreId, name: GENRES[genreId] })),
    original_language: movie.original_language ?? 'en',
    credits: { cast: [], crew: [] },
    recommendations: { results: demoMovies.filter((item) => item.id !== id).slice(0, 6) },
    demo: true,
  };
};

/** The demo catalogue fits on one page; later pages are empty. */
export const demoPage = (results: Movie[], page: number): MovieList => ({
  results: page === 1 ? results : [],
  page,
  total_pages: 1,
  total_results: results.length,
  demo: true,
});
