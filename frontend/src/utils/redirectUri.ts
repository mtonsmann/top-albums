export const getBaseRedirectUri = (): string => {
  const { origin, hostname, pathname } = window.location
  // In dev, always use the plain origin root
  if (import.meta.env.DEV) {
    return `${origin}/`
  }
  // On GitHub Pages, include the repository subpath (first path segment)
  const segments = pathname.split('/').filter(Boolean)
  if (hostname.endsWith('github.io') && segments.length > 0) {
    return `${origin}/${segments[0]}/`
  }
  // Fallback to origin root
  return `${origin}/`
}


