import type { Community, Site } from '@/data/types';

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

/**
 * Market pulse figures (homepage hero and Insights): averages across the communities in the CMS,
 * plus the optional quarter-on-quarter changes from Site settings > Market data.
 */
export function marketPulse(communities: Community[], market: Site['market']) {
  return {
    pricePerSqft: `AED ${Math.round(avg(communities.map(c => c.avgSale))).toLocaleString('en-US')}`,
    yield: `${avg(communities.map(c => c.roi)).toFixed(1)}%`,
    tracked: communities.length,
    priceChange: market.priceChange,
    yieldChange: market.yieldChange,
  };
}
