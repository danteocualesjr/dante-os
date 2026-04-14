export function dirname(path: string): string {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/') || '/'
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
