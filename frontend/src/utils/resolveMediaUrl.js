export const resolveMediaUrl = (path, apiOrigin) => {
  if (!path) return path;
  return path.startsWith("http") ? path : `${apiOrigin}${path}`;
};