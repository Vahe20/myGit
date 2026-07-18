import path from 'node:path';
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
import { PathNormalizer } from './utils/PathNormalizer';

const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  const gitPath = new GitPaths(process.cwd());

  const fileSystem = new FileSystem();
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
      const fileSystem = new FileSystem();

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
      const scanner = new FileScanner(fileSystem, gitPath);
      const hashService = new SHA1HashService();

      const { staged, modified, untracked } = await new Status(
        fileSystem,
        scanner,
        index,
        hashService,
      ).execute();

      console.log(
        '\nChanges to be committed:\n' +
          '  (use "git restore --staged <file>..." to unstage)',
      );

      staged.forEach((value) => {
        console.log(`\x1b[32m\t ${value.path}\x1b[0m`);
      });

      console.log(
        '\nChanges not staged for commit:\n' +
          '  (use "git restore --staged <file>..." to unstage)',
      );

      modified.forEach((value) => {
        console.log(`\x1b[32m\t ${value.path}\x1b[0m`);
      });

      console.log(
        '\nUntracked files:\n' +
          '  (use "git add <file>..." to include in what will be committed)',
      );

      untracked.forEach((value) => {
        console.log(`\x1b[31m\t ${value.path}\x1b[0m`);
      });
      break;
    }

    default: {
      console.log(`Unknown command: ${command}`);
      break;
    }
  }
};

main().catch(console.error);
