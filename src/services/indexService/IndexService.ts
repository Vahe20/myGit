import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IIndexService } from './IIndexService';

export class IndexService implements IIndexService {
  private data = new Map<string, string>();

  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly repositoryPaths: RepositoryPaths,
  ) {}

  public add(filePath: string, hash: string): IIndexService {
    this.data.set(filePath, hash);
    return this;
  }

  public get(filePath: string): string | undefined {
    return this.data.get(filePath);
  }

  public has(filepath: string): boolean {
    return this.data.has(filepath);
  }

  public getAll(): Map<string, string> {
    return new Map<string, string>(this.data);
  }

  public clear(): IIndexService {
    this.data = new Map();
    return this;
  }

  public remove(filePath: string): IIndexService {
    this.data.delete(filePath);
    return this;
  }

  public async save(): Promise<IIndexService> {
    const json = JSON.stringify([...this.data.entries()], null, 2);

    await this.fileSystem.write(
      this.repositoryPaths.index(),
      Buffer.from(json),
    );

    return this;
  }

  public async load(): Promise<IIndexService> {
    if (!(await this.fileSystem.exists(this.repositoryPaths.index()))) {
      this.data.clear();
      return this;
    }

    const json = (
      await this.fileSystem.read(this.repositoryPaths.index())
    ).toString();

    try {
      const entries = JSON.parse(json) as [string, string][];
      this.data = new Map(entries);
    } catch {
      this.data.clear();
    }

    return this;
  }
}
