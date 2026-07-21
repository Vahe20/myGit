import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { IHashService } from '../../infrastructure/hashing/IHashService';
import { IFileScanner } from '../../services/fileScanner/IFileScanner';
import { IIndexService } from '../index/IIndexService';
import { BlobObject } from '../objects/BlobObject';

export class Status {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly scanner: IFileScanner,
    private readonly index: IIndexService,
    private readonly hashService: IHashService,
  ) {}

  async execute() {
    const indexFiles = (await this.index.load()).getAll();

    const files = await this.scanner.scan();

    const currentFiles = await Promise.all(
      files.map(async (filePath) => {
        const data = await this.fileSystem.read(filePath);

        const blob = new BlobObject(data).serialize();

        const hash = await this.hashService.hash(blob);

        return {
          path: filePath,
          hash,
        };
      }),
    );

    const modified = currentFiles.filter((file) => {
      return (
        indexFiles.has(file.path) && indexFiles.get(file.path) !== file.hash
      );
    });

    const untracked = currentFiles.filter((file) => {
      return !indexFiles.has(file.path);
    });

    const staged = Array.from(indexFiles.entries()).map(([path, hash]) => ({
      path,
      hash,
    }));

    return { modified, untracked, staged };
  }
}
