import type { IconName } from '@/components/icons';
import { Price } from '@/components/ui/Price';
import type { Property } from '@/data/types';
import { bedsLabel, num } from './data';
import type { FactKey } from '@/payload/propertyDefaults';

type Fact = { icon: IconName; tile: [string, string] | null; row: [string, React.ReactNode] | null };

/**
 * Every fact a property page can show, as a top tile (value, label) and/or a "Property details"
 * row (label, value). The CMS (Property page) picks which ones show and in what order.
 */
export function propertyFacts(p: Property, developer: string, rentPayment: string): Record<FactKey, Fact> {
  const office = p.type === 'Office', rent = p.purpose === 'rent';
  return {
    type: { icon: 'home', tile: [p.type, 'Property type'], row: ['Property type', p.type] },
    beds: { icon: 'bed', tile: office ? null : [p.beds === 0 ? 'Studio' : String(p.beds), p.beds === 0 ? 'Layout' : 'Bedrooms'], row: ['Bedrooms', office ? 'n/a' : bedsLabel(p.beds)] },
    baths: { icon: 'bath', tile: [String(p.baths), 'Bathrooms'], row: ['Bathrooms', p.baths] },
    size: { icon: 'area', tile: [num(p.size), 'Sq ft built-up'], row: ['Built-up area', `${num(p.size)} sq ft`] },
    psf: { icon: 'wallet', tile: [`AED ${num(Math.round(p.price / p.size))}`, 'Per sq ft'], row: ['Price per sq ft', <Price key="psf" aed={Math.round(p.price / p.size)} />] },
    furnishing: { icon: 'sofa', tile: [p.furnishing, 'Furnishing'], row: ['Furnishing', p.furnishing] },
    status: { icon: 'key', tile: [p.status, 'Status'], row: ['Status', p.status] },
    completion: { icon: 'cal', tile: p.completion ? [p.completion, p.status === 'Off-plan' ? 'Handover' : 'Year built'] : null, row: [p.status === 'Off-plan' ? 'Handover' : 'Year built', p.completion] },
    view: { icon: 'sun', tile: p.view ? [p.view, 'View'] : null, row: ['View', p.view] },
    parking: { icon: 'car', tile: [String(p.parking), p.parking === 1 ? 'Parking space' : 'Parking spaces'], row: ['Parking', `${p.parking} space${p.parking === 1 ? '' : 's'}`] },
    developer: { icon: 'building', tile: developer ? [developer, 'Developer'] : null, row: ['Developer', developer] },
    serviceCharge: { icon: 'doc', tile: rent ? null : [`AED ${p.serviceCharge}`, 'Service charge / sq ft'], row: rent ? null : ['Service charge', `AED ${p.serviceCharge} / sq ft / year`] },
    payment: { icon: 'cal', tile: rent ? [rentPayment, 'Payment'] : null, row: rent ? ['Payment', rentPayment] : null },
  };
}
