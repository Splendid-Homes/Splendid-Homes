import { ListingsPage } from '@/components/listings/ListingsPage';
import { data } from '@/lib/cms';
import { cmsPageMetadata } from '@/lib/pageSeo';

// Metadata ignores search params: every filtered or sorted URL (/buy?...) canonicalises to /buy.
export async function generateMetadata() {
  const hero = (await data()).heroCommunity(0);
  return cmsPageMetadata('buy', {
    title: 'Properties for Sale in Dubai',
    description: 'Villas, apartments, townhouses and penthouses for sale in Dubai with prices in AED and filters by community, type, beds and budget.',
    path: '/buy',
    image: hero?.img,
  });
}

export default function Page({ searchParams }: PageProps<'/buy'>) {
  return <ListingsPage purpose="buy" searchParams={searchParams} />;
}
