import { RepositoryPaths } from '../configs/RepositoryPaths';
import { IndexService } from '../core/indexService/IndexService';
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
  repositoryPaths: RepositoryPaths;
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
  const repositoryPaths = new RepositoryPaths(process.cwd());
  const fileSystem = new FileSystem();
  const scanner = new FileScanner(fileSystem, repositoryPaths);
  const hashService = new SHA1HashService();
  const compressionService = new ZlibCompressionService();
  const index = new IndexService(fileSystem, repositoryPaths);
  const repository = new Repository(fileSystem, repositoryPaths);
  const refStore = new RefStore(fileSystem, repositoryPaths);

  const objectStore = new ObjectStore(
    fileSystem,
    hashService,
    compressionService,
    repositoryPaths,
  );

  return {
    logger,
    repositoryPaths,
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
