import { Add } from '../core/commands/Add';
import { Branch } from '../core/commands/Branch';
import { CatFile } from '../core/commands/CatFile';
import { Checkout } from '../core/commands/Checkout';
import { Commit } from '../core/commands/Commit';
import { CommitTree } from '../core/commands/CommitTree';
import { Init } from '../core/commands/Init';
import { Log } from '../core/commands/Log';
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
}

export const createCommands = (services: Services): Commands => {
  const init = new Init(services.repository);
  const add = new Add(
    services.fileSystem,
    services.scanner,
    services.objectStore,
    services.index,
  );
  const status = new Status(
    services.fileSystem,
    services.scanner,
    services.index,
    services.hashService,
    services.objectStore,
    services.refStore,
  );
  const writeTree = new WriteTree(services.objectStore);
  const commitTree = new CommitTree(services.objectStore, services.refStore);
  const commit = new Commit(writeTree, commitTree, services.index);
  const log = new Log(services.objectStore, services.refStore, services.logger);
  const rm = new Rm(services.fileSystem, services.index);
  const cutFile = new CatFile(services.objectStore, services.logger);
  const branch = new Branch(
    services.fileSystem,
    services.repositoryPaths,
    services.refStore,
  );
  const checkout = new Checkout(
    services.refStore,
    services.objectStore,
    services.treeRestorer,
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
    cutFile,
    branch,
    checkout,
  };
};
