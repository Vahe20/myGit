import path from 'node:path';

import { RepositoryPaths } from './RepositoryPaths';

describe('RepositoryPaths', () => {
  it('builds repository paths from the base path', () => {
    const paths = new RepositoryPaths('/repo');

    expect(paths.base()).toBe('/repo');
    expect(paths.ignore()).toBe(path.join('/repo', '.mygitignore'));
    expect(paths.myGit()).toBe(path.join('/repo', '.mygit'));
    expect(paths.objects()).toBe(path.join('/repo', '.mygit', 'objects'));
    expect(paths.refs()).toBe(path.join('/repo', '.mygit', 'refs'));
    expect(paths.branch('main')).toBe(
      path.join('/repo', '.mygit', 'refs', 'heads', 'main'),
    );
    expect(paths.head()).toBe(path.join('/repo', '.mygit', 'HEAD'));
    expect(paths.index()).toBe(path.join('/repo', '.mygit', 'index'));
  });
});
