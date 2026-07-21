export const PathNormalizer = (filePath: string): string => {
  return filePath
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
};
