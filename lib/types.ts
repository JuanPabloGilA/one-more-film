// Shapes of the TMDB responses this app reads. Fields are trimmed to what the UI uses.

export type Movie = {
  id: number;
  original_language?: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
};

export type MovieList = {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
  demo: boolean;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};
export type CrewMember = { id: number; name: string; job: string };
export type Video = { key: string; site: string; type: string; official: boolean; name: string };
export type Trailer = Pick<Video, 'key' | 'name'>;

export type MovieDetails = Movie & {
  original_title?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdb_id?: string | null;
  production_companies?: { id: number; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; name: string }[];
  belongs_to_collection?: { id: number; name: string } | null;
  keywords?: { keywords: { id: number; name: string }[] };
  tagline: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  original_language: string;
  credits: { cast: CastMember[]; crew: CrewMember[] };
  videos: { results: Video[] };
  recommendations: { results: Movie[] };
  demo: boolean;
};

export type PersonCredit = Movie & { character?: string; job?: string; adult?: boolean };

export type PersonDetails = {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
  movie_credits: { cast: PersonCredit[]; crew: PersonCredit[] };
};
