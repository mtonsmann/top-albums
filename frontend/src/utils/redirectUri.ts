export const getBaseRedirectUri = (): string => {
  const { origin, pathname } = window.location
  // Ensure trailing slash and preserve repo subpath on GitHub Pages
  const basePath = pathname.endsWith('/') ? pathname : `${pathname}/`
  return `${origin}${basePath}`
}


