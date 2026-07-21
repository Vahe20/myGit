import { FileSystem } from './utils/fs/FileSystem';
import { GitPaths } from './configs/GitPaths';
import { ObjectStore } from './core/objects/ObjectStore';
import { SHA1HashService } from './core/hashing/SHA1HashService';
import { ZlibCompressionService } from './compression/ZlibCompressionService';
import { Repository } from './core/repository/Repository';
import { GitAdd } from './core/commands/Add';
import { Index } from './core/index/Index';
import { FileScanner } from './utils/scanner/FileScanner';
import { Status } from './core/commands/Status';
import { PathNormalizer } from './utils/normalizer/PathNormalizer';
import { WriteTree } from './core/commands/Write-Tree';
import { CommitTree } from './core/commands/Commit-Tree';
import { Logger } from './utils/logger/Logger';

const main = async () => {
  const args = process.argv.slice(2);

  function getOption(...names: string[]) {
    for (const name of names) {
      const index = args.indexOf(name);
      if (index !== -1 && index + 1 < args.length) {
        return args[index + 1];
      }
    }

    return undefined;
  }

  const command = args[0];
  const message = getOption('-m');

  const logger = new Logger();
  const gitPath = new GitPaths(process.cwd());
  const fileSystem = new FileSystem();
  const scanner = new FileScanner(fileSystem, gitPath);
  const hashService = new SHA1HashService();
  const compressionService = new ZlibCompressionService();
  const index = new Index(fileSystem, gitPath);

  const objectStore = new ObjectStore(
    fileSystem,
    hashService,
    compressionService,
    gitPath,
  );

  switch (command) {
    case 'init': {
      await new Repository(fileSystem, gitPath).init();
      break;
    }

    case 'add': {
      const targetPath = PathNormalizer(args[1]);

      if (!targetPath) {
        throw new Error('File path is required');
      }

      await new GitAdd(fileSystem, objectStore, index).execute(targetPath);

      break;
    }

    case 'status': {
      const { staged, modified, untracked } = await new Status(
        fileSystem,
        scanner,
        index,
        hashService,
      ).execute();

      logger.info(
        '\nChanges to be committed:\n' +
          '\t(use \\"git restore --staged <file>...\\" to unstage)',
      );

      staged.forEach((value) => {
        logger.success('\t' + value.path);
      });

      logger.info(
        '\nChanges not staged for commit:\n' +
          '\t(use \\"git restore --staged <file>...\\" to unstage)',
      );

      modified.forEach((value) => {
        logger.warn('\t' + value.path);
      });

      logger.info(
        '\nUntracked files:\n' +
          '\t(use \\"git add <file>...\\" to include in what will be committed)',
      );

      untracked.forEach((value) => {
        logger.error('\t' + value.path);
      });
      break;
    }

    case 'write-tree': {
      const hash = await new WriteTree(objectStore).execute(index);
      logger.info('tree hash: ' + hash);
      break;
    }

    case 'commit-tree': {
      if (!message) {
        throw new Error('message is not require');
      }
      const hash = args[1];
      await new CommitTree(fileSystem, objectStore, gitPath).execute(
        hash,
        message,
      );
      break;
    }

    case 'commit': {
      if (!message) {
        throw new Error('message is not require');
      }
      const hash = await new WriteTree(objectStore).execute(index);

      await new CommitTree(fileSystem, objectStore, gitPath).execute(
        hash,
        message,
      );
      break;
    }

    case 'log': {
      break;
    }

    default: {
      logger.error(`Unknown command: ${command}`);
      break;
    }
  }
};

main().catch(console.error);
