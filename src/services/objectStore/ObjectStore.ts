import path from 'node:path';

import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { ICompressionService } from '../../infrastructure/compression/ICompressionService';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IHashService } from '../../infrastructure/hashing/IHashService';
import { IObjectStore } from './IObjectStore';

export class ObjectStore implements IObjectStore {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly hashService: IHashService,
    private readonly compression: ICompressionService,
    private readonly repositoryPaths: RepositoryPaths,
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
    const objectsPath = this.repositoryPaths.objects();
    return path.join(objectsPath, hash.replace(/^(.{2})/, '$1/'));
  }
}
