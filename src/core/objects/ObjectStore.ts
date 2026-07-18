import { IFileSystem } from '../../utils/fs/IFileSystem';
import { IHashService } from '../hashing/IHashService';
import { ICompressionService } from '../../compression/ICompressionService';
import path from 'node:path';
import { GitPaths } from '../../configs/GitPaths';
import { IObjectStore } from './IObjectStore';

export class ObjectStore implements IObjectStore {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly hashService: IHashService,
    private readonly compression: ICompressionService,
    private readonly gitPaths: GitPaths,
  ) {}

  public async save(data: Buffer): Promise<string> {
    const hash = await this.hashService.hash(data);
    const filePath = this.buildPath(hash);
    if (await this.fileSystem.exists(filePath)) {
      return hash;
    }
    const compressedData = await this.compression.compress(data);

    await this.fileSystem.write(filePath, compressedData);

    return hash;
  }

  public async read(hash: string): Promise<Buffer> {
    const filePath = this.buildPath(hash);
    const fileData = await this.fileSystem.read(filePath);
    return await this.compression.decompress(fileData);
  }

  public buildPath(hash: string): string {
    const objectsPath = this.gitPaths.objects();
    return path.join(objectsPath, hash.replace(/^(.{2})/, '$1/'));
  }
}
