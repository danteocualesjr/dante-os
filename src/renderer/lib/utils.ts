export function dirname(path: string): string {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// Parses an ISO date or date-only string as a LOCAL date, avoiding UTC
// drift that causes "YYYY-MM-DD" values to land on the previous day in
// negative-UTC timezones (a common off-by-one calendar bug).
export function parseLocalDate(value: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch
    return new Date(Number(y), Number(m) - 1, Number(d))
  }
  return new Date(value)
}
