import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IIndexService } from './IIndexService';

export class IndexService implements IIndexService {
  private data = new Map<string, string>();

  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly gitPaths: RepositoryPaths,
  ) {}

  public add(filePath: string, hash: string): IIndexService {
    this.data.set(filePath, hash);
    return this;
  }

  public get(filePath: string): string | undefined {
    return this.data.get(filePath);
  }

  public getAll(): Map<string, string> {
    return new Map<string, string>(this.data);
  }

  public remove(filePath: string): IIndexService {
    this.data.delete(filePath);
    return this;
  }

  public async save(): Promise<IIndexService> {
    const json = JSON.stringify([...this.data.entries()], null, 2);

    await this.fileSystem.write(this.gitPaths.index(), Buffer.from(json));

    return this;
  }

  public async load(): Promise<IIndexService> {
    if (!(await this.fileSystem.exists(this.gitPaths.index()))) {
      this.data.clear();
      return this;
    }

    const json = (await this.fileSystem.read(this.gitPaths.index())).toString();

    try {
      const entries = JSON.parse(json) as [string, string][];
      this.data = new Map(entries);
    } catch {
      this.data.clear();
    }

    return this;
  }
}
