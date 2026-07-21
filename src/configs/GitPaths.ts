import path from 'node:path';

export class GitPaths {
  private basePath: string;
  private myGitPaht: string;
  private ignorePath: string;
  private objectsPath: string;
  private refsPath: string;
  private headPath: string;
  private indexPath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
    this.ignorePath = path.join(basePath, '.mygitignore');
    this.myGitPaht = path.join(basePath, '.mygit');
    this.objectsPath = path.join(this.myGitPaht, 'objects');
    this.refsPath = path.join(this.myGitPaht, 'refs');
    this.headPath = path.join(this.myGitPaht, 'HEAD');
    this.indexPath = path.join(this.myGitPaht, 'index');
  }

  base(): string {
    return this.basePath;
  }

  myGit(): string {
    return this.myGitPaht;
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
