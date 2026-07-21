import path from 'node:path';

import { GitPaths } from './GitPaths';

describe('GitPaths', () => {
  it('builds repository paths from the base path', () => {
    const paths = new GitPaths('/repo');

    expect(paths.base()).toBe('/repo');
    expect(paths.ignore()).toBe(path.join('/repo', '.mygitignore'));
    expect(paths.myGit()).toBe(path.join('/repo', '.mygit'));
    expect(paths.objects()).toBe(path.join('/repo', '.mygit', 'objects'));
    expect(paths.refs()).toBe(path.join('/repo', '.mygit', 'refs'));
    expect(paths.head()).toBe(path.join('/repo', '.mygit', 'HEAD'));
    expect(paths.index()).toBe(path.join('/repo', '.mygit', 'index'));
  });
});
