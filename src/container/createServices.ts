import { RepositoryPaths } from '../configs/RepositoryPaths';
import { RefStore } from '../core/refs/RefStore';
import { Repository } from '../core/repository/Repository';
import { ZlibCompressionService } from '../infrastructure/compression/ZlibCompressionService';
import { FileSystem } from '../infrastructure/fileSystem/FileSystem';
import { SHA1HashService } from '../infrastructure/hashing/SHA1HashService';
import { FileScanner } from '../services/fileScanner/FileScanner';
import { IndexService } from '../services/indexService/IndexService';
import { ObjectStore } from '../services/objectStore/ObjectStore';
import { TreeRestorer } from '../services/treeRestorer/TreeRestorer';
import { ILogger } from '../utils/logger/ILogger';
import { Logger } from '../utils/logger/Logger';

export interface Services {
  logger: ILogger;
  repositoryPaths: RepositoryPaths;
  fileSystem: FileSystem;
  scanner: FileScanner;
  hashService: SHA1HashService;
  compressionService: ZlibCompressionService;
  index: IndexService;
  objectStore: ObjectStore;
  repository: Repository;
  refStore: RefStore;
  treeRestorer: TreeRestorer;
}

export const createServices = (): Services => {
  const logger = new Logger();
  const repositoryPaths = new RepositoryPaths(process.cwd());
  const fileSystem = new FileSystem();
  const scanner = new FileScanner(fileSystem, repositoryPaths);
  const hashService = new SHA1HashService();
  const compressionService = new ZlibCompressionService();
  const indexService = new IndexService(fileSystem, repositoryPaths);
  const repository = new Repository(fileSystem, repositoryPaths);
  const refStore = new RefStore(fileSystem, repositoryPaths);

  const objectStore = new ObjectStore(
    fileSystem,
    hashService,
    compressionService,
    repositoryPaths,
  );

  const treeRestorer = new TreeRestorer(fileSystem, objectStore, indexService);

  return {
    logger,
    repositoryPaths,
    fileSystem,
    scanner,
    hashService,
    compressionService,
    index: indexService,
    objectStore,
    repository,
    refStore,
    treeRestorer,
  };
};
