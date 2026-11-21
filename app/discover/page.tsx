import '@/components/discovery/discovery.css';
import { FilmDiscovery } from '@/components/discovery/film-discovery';
export const metadata = {
  title: 'Find your next film',
  description: 'Choose your preferences and discover films, one at a time.',
};
const DiscoverPage = () => <FilmDiscovery />;
export default DiscoverPage;
