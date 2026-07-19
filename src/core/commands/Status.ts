import { IIndex } from '../index/IIndex';
import { FileScanner } from '../../utils/scanner/FileScanner';
import { IFileSystem } from '../../utils/fs/IFileSystem';
import { BlobObject } from '../objects/BlobObject';
import { IHashService } from '../hashing/IHashService';

export class Status {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly scanner: FileScanner,
    private readonly index: IIndex,
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
