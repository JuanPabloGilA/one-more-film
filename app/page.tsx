import { Notice } from '@/components/notice';
import { Explorer, type Period } from '@/components/explorer';
import { FeaturedFilm } from '@/components/movies/featured-film';
import { normalizePage, normalizeQuery, singleParam } from '@/lib/params';
import { getMovies } from '@/lib/tmdb';

type SearchParams = Record<string, string | string[] | undefined>;

const featureEyebrow = (demo: boolean, period: Period) => {
  if (demo) return 'From the collection';
  return period === 'week' ? 'This week’s feature' : 'Today’s feature';
};

const Home = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const params = await searchParams;
  const query = normalizeQuery(singleParam(params.q));
  const period: Period = params.window === 'week' ? 'week' : 'day';
  const page = normalizePage(singleParam(params.page));
  const data = await getMovies({ query, period, page });
  const [featured, ...rest] = data.results;
  const showFeature = !query && page === 1 && featured;
  return (
    <main id="main-content">
      {data.demo && <Notice>Preview collection · Sample films, not live trends</Notice>}
      {showFeature && (
        <FeaturedFilm
          movie={featured}
          upNext={rest.slice(0, 2)}
          eyebrow={featureEyebrow(data.demo, period)}
        />
      )}
      <Explorer key={`${query}-${period}-${page}`} data={data} query={query} period={period} />
    </main>
  );
};
export default Home;
