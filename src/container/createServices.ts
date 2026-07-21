import { RepositoryPaths } from '../configs/RepositoryPaths';
import { IndexService } from '../core/index/IndexService';
import { RefStore } from '../core/refs/RefStore';
import { Repository } from '../core/repository/Repository';
import { ZlibCompressionService } from '../infrastructure/compression/ZlibCompressionService';
import { FileSystem } from '../infrastructure/fileSystem/FileSystem';
import { SHA1HashService } from '../infrastructure/hashing/SHA1HashService';
import { FileScanner } from '../services/fileScanner/FileScanner';
import { ObjectStore } from '../services/objectStore/ObjectStore';
import { Logger } from '../utils/logger/Logger';

export interface Services {
  logger: Logger;
  gitPath: RepositoryPaths;
  fileSystem: FileSystem;
  scanner: FileScanner;
  hashService: SHA1HashService;
  compressionService: ZlibCompressionService;
  index: IndexService;
  objectStore: ObjectStore;
  repository: Repository;
  refStore: RefStore;
}

export const createServices = (): Services => {
  const logger = new Logger();
  const gitPath = new RepositoryPaths(process.cwd());
  const fileSystem = new FileSystem();
  const scanner = new FileScanner(fileSystem, gitPath);
  const hashService = new SHA1HashService();
  const compressionService = new ZlibCompressionService();
  const index = new IndexService(fileSystem, gitPath);
  const repository = new Repository(fileSystem, gitPath);
  const refStore = new RefStore(fileSystem, gitPath);

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
    refStore,
  };
};
