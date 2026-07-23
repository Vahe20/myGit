import { PathNormalizer } from './PathNormalizer';

describe('PathNormalizer', () => {
  it('converts backslashes to forward slashes', () => {
    expect(PathNormalizer('src\\core\\index.ts')).toBe('src/core/index.ts');
  });

  it('removes a leading current-directory segment', () => {
    expect(PathNormalizer('./src/index.ts')).toBe('src/index.ts');
    expect(PathNormalizer('/src/index.ts')).toBe('src/index.ts');
  });

  it('collapses duplicate slashes and removes trailing slash', () => {
    expect(PathNormalizer('src//core///objects/')).toBe('src/core/objects');
  });
});
