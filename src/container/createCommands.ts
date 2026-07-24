import { Add } from '../core/commands/Add';
import { Branch } from '../core/commands/Branch';
import { CatFile } from '../core/commands/CatFile';
import { Checkout } from '../core/commands/Checkout';
import { Commit } from '../core/commands/Commit';
import { CommitTree } from '../core/commands/CommitTree';
import { Init } from '../core/commands/Init';
import { Log } from '../core/commands/Log';
import { Restore } from '../core/commands/Restore';
import { Rm } from '../core/commands/Rm';
import { Status } from '../core/commands/Status';
import { WriteTree } from '../core/commands/WriteTree';
import { Services } from './createServices';

export interface Commands {
  init: Init;
  add: Add;
  status: Status;
  'write-tree': WriteTree;
  'commit-tree': CommitTree;
  commit: Commit;
  log: Log;
  rm: Rm;
  cutFile: CatFile;
  branch: Branch;
  checkout: Checkout;
  restore: Restore;
}

export const createCommands = (services: Services): Commands => {
  const init = new Init(services.repository);
  const add = new Add(
    services.fileSystem,
    services.scanner,
    services.objectStore,
    services.indexService,
  );
  const status = new Status(
    services.fileSystem,
    services.scanner,
    services.indexService,
    services.hashService,
    services.objectStore,
    services.refStore,
  );
  const writeTree = new WriteTree(services.objectStore);
  const commitTree = new CommitTree(services.objectStore, services.refStore);
  const commit = new Commit(writeTree, commitTree, services.indexService);
  const log = new Log(services.objectStore, services.refStore, services.logger);
  const rm = new Rm(services.fileSystem, services.indexService);
  const restore = new Restore(
    services.objectStore,
    services.refStore,
    services.workingTreeRestorer,
    services.treeReader,
  );
  const catFile = new CatFile(services.objectStore, services.logger);
  const branch = new Branch(
    services.fileSystem,
    services.repositoryPaths,
    services.refStore,
  );
  const checkout = new Checkout(
    services.refStore,
    services.objectStore,
    services.workingTreeRestorer,
  );

  return {
    init,
    add,
    status,
    'write-tree': writeTree,
    'commit-tree': commitTree,
    commit,
    log,
    rm,
    cutFile: catFile,
    branch,
    checkout,
    restore,
  };
};
