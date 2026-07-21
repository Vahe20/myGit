import { ZlibCompressionService } from '../compression/ZlibCompressionService';
import { GitPaths } from '../configs/GitPaths';
import { SHA1HashService } from '../core/hashing/SHA1HashService';
import { IndexService } from '../core/index/IndexService';
import { ObjectStore } from '../core/objects/ObjectStore';
import { Repository } from '../core/repository/Repository';
import { FileSystem } from '../utils/fs/FileSystem';
import { Logger } from '../utils/logger/Logger';
import { FileScanner } from '../utils/scanner/FileScanner';

export interface Services {
  logger: Logger;
  gitPath: GitPaths;
  fileSystem: FileSystem;
  scanner: FileScanner;
  hashService: SHA1HashService;
  compressionService: ZlibCompressionService;
  index: IndexService;
  objectStore: ObjectStore;
  repository: Repository;
}

export const createServices = (): Services => {
  const logger = new Logger();
  const gitPath = new GitPaths(process.cwd());
  const fileSystem = new FileSystem();
  const scanner = new FileScanner(fileSystem, gitPath);
  const hashService = new SHA1HashService();
  const compressionService = new ZlibCompressionService();
  const index = new IndexService(fileSystem, gitPath);
  const repository = new Repository(fileSystem, gitPath);

  const objectStore = new ObjectStore(
    fileSystem,
    hashService,
    compressionService,
    gitPath,
  );

  return {
    logger,
    gitPath,
    fileSystem,
    scanner,
    hashService,
    compressionService,
    index,
    objectStore,
    repository,
  };
};
