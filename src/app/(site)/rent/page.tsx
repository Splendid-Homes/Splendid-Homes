import { ListingsPage } from '@/components/listings/ListingsPage';
import { data } from '@/lib/cms';
import { cmsPageMetadata } from '@/lib/pageSeo';

// Metadata ignores search params: every filtered or sorted URL (/rent?...) canonicalises to /rent.
export async function generateMetadata() {
  const hero = (await data()).heroCommunity(2);
  return cmsPageMetadata('rent', {
    title: 'Properties for Rent in Dubai',
    description: 'Apartments and villas for rent in Dubai with yearly prices in AED, Ejari handled for you, and filters by community, type, beds and budget.',
    path: '/rent',
    image: hero?.img,
  });
}

export default function Page({ searchParams }: PageProps<'/rent'>) {
  return <ListingsPage purpose="rent" searchParams={searchParams} />;
}
