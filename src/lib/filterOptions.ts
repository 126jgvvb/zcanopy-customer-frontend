/**
 * Helpers for the property filter dropdowns (location, property type and
 * broker type).
 *
 * The same value can reach the options list more than once when it only
 * differs by case or surrounding whitespace — "kito" and "Kito" both exist in
 * the listings. The backend filters these fields case-insensitively, so the
 * options are collapsed to a single entry to avoid showing "kito" twice.
 */

/** Normalises a filter option so equivalent values compare equal. */
export function normalizeOptionKey(value: string): string {
  return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Removes duplicate filter option values, keeping the first spelling seen.
 */
export function dedupeOptionValues(values: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value) continue;
    const key = normalizeOptionKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result.sort((a, b) => a.localeCompare(b));
}

/**
 * Maps a selected filter value onto the matching option, so a value that only
 * differs in case from the listed one still shows as selected in the dropdown.
 */
export function resolveOptionValue(selected: string, options: string[]): string {
  if (!selected) return "";
  if (options.includes(selected)) return selected;
  const key = normalizeOptionKey(selected);
  return options.find((option) => normalizeOptionKey(option) === key) ?? selected;
}
