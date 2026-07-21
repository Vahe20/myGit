import path from 'node:path';

export class RepositoryPaths {
  private basePath: string;
  private myGitPath: string;
  private ignorePath: string;
  private objectsPath: string;
  private refsPath: string;
  private headPath: string;
  private indexPath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.ignorePath = path.join(basePath, '.mygitignore');
    this.myGitPath = path.join(basePath, '.mygit');
    this.objectsPath = path.join(this.myGitPath, 'objects');
    this.refsPath = path.join(this.myGitPath, 'refs');
    this.headPath = path.join(this.myGitPath, 'HEAD');
    this.indexPath = path.join(this.myGitPath, 'index');
  }

  base(): string {
    return this.basePath;
  }

  ref(ref: string): string {
    return path.join(this.myGitPath, ref);
  }

  myGit(): string {
    return this.myGitPath;
  }

  ignore(): string {
    return this.ignorePath;
  }
  objects(): string {
    return this.objectsPath;
  }
  refs(): string {
    return this.refsPath;
  }
  head(): string {
    return this.headPath;
  }
  index(): string {
    return this.indexPath;
  }
}
