'use client';

import { SelectInput, useField } from '@payloadcms/ui';
import type { TextFieldClientComponent } from 'payload';
import { useEffect, useState } from 'react';
import { INSIGHT_CATEGORIES } from '../insightsDefaults';

/** Article category: a dropdown of the categories set in Admin > Insights pages (falls back to the standard six). */
export const CategoryField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError } = useField<string>({ path: path ?? field.name });
  const [names, setNames] = useState(INSIGHT_CATEGORIES);
  useEffect(() => {
    fetch('/api/globals/insightsPages?depth=0', { credentials: 'include' }).then(r => r.json() as Promise<{ categories?: { name?: string }[] }>)
      .then(g => {
        const n = (g.categories ?? []).map(c => c.name).filter((x): x is string => !!x);
        if (n.length) setNames(n);
      })
      .catch(() => {});
  }, []);
  const options = [...new Set([...names, ...(value ? [value] : [])])].map(o => ({ label: o, value: o }));
  return (
    <SelectInput path={path ?? field.name} name={field.name} label={field.label} required={field.required} options={options} value={value ?? ''}
      showError={showError} isClearable={false}
      onChange={o => setValue(o && !Array.isArray(o) ? (o as { value: string }).value : null)} />
  );
};
