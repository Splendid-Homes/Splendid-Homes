import type { IconName } from '@/components/icons';

/** Icon for an amenity name from the CMS (falls back to a tick). Used on property and project pages. */
export function amenityIcon(a: string): IconName {
  const t = a.toLowerCase();
  const map: [RegExp, IconName][] = [[/pool/, 'pool'], [/beach|marina|water|lake|canal|creek|lagoon|promenade/, 'wave'], [/view|balcony|terrace|garden|deck/, 'sun'],
    [/gym|fitness|sport|yoga|tennis|padel/, 'gym'], [/park|garage/, 'car'], [/security|concierge|guard/, 'shield'], [/maid|storage|study/, 'key'],
    [/smart|tech|automation/, 'star'], [/school|nursery|kids/, 'school'], [/metro|transport/, 'metro'], [/office|meeting|lounge|club/, 'briefcase']];
  return map.find(([re]) => re.test(t))?.[1] ?? 'check';
}
