import { Services } from './createServices';
import { Init } from '../core/commands/Init';
import { Add } from '../core/commands/Add';
import { Status } from '../core/commands/Status';
import { WriteTree } from '../core/commands/WriteTree';
import { CommitTree } from '../core/commands/CommitTree';
import { Commit } from '../core/commands/Commit';

export interface Commands {
  init: Init;
  add: Add;
  status: Status;
  'write-tree': WriteTree;
  'commit-tree': CommitTree;
  commit: Commit;
}

export const createCommands = (services: Services): Commands => {
  const init = new Init(services.repository);
  const add = new Add(
    services.fileSystem,
    services.objectStore,
    services.index,
  );
  const status = new Status(
    services.fileSystem,
    services.scanner,
    services.index,
    services.hashService,
  );
  const writeTree = new WriteTree(services.objectStore);
  const commitTree = new CommitTree(
    services.fileSystem,
    services.objectStore,
    services.gitPath,
  );
  const commit = new Commit(writeTree, commitTree, services.index);

  return {
    init,
    add,
    status,
    'write-tree': writeTree,
    'commit-tree': commitTree,
    commit,
  };
};
