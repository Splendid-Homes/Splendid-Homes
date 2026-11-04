'use client';

import { useRowLabel } from '@payloadcms/ui';

/**
 * Names an array row after one of its select fields (e.g. "Featured properties" instead of
 * "Section 03"). Configured per array with clientProps { field, options, fallback }.
 */
export function OptionRowLabel({ field, options, fallback = 'Row', textField }: {
  field: string; options: { value: string; label: string }[]; fallback?: string; textField?: string;
}) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  const v = data?.[field];
  const named = options.find(o => o.value === v)?.label ?? (textField && typeof data?.[textField] === 'string' ? (data[textField] as string) : '');
  return <span>{named || `${fallback} ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</span>;
}
