import { PathNormalizer } from './PathNormalizer';

describe('PathNormalizer', () => {
  it('converts backslashes to forward slashes', () => {
    expect(PathNormalizer('src\\core\\indexService.ts')).toBe(
      'src/core/indexService.ts',
    );
  });

  it('removes a leading current-directory segment', () => {
    expect(PathNormalizer('./src/indexService.ts')).toBe('src/indexService.ts');
    expect(PathNormalizer('/src/indexService.ts')).toBe('src/indexService.ts');
  });

  it('collapses duplicate slashes and removes trailing slash', () => {
    expect(PathNormalizer('src//core///objects/')).toBe('src/core/objects');
  });
});
