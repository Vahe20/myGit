import { ILogger } from './ILogger';

export interface StatusResult {
  staged: StatusFile[];
  modified: StatusFile[];
  deleted: StatusFile[];
  untracked: StatusFile[];
}

export interface StatusFile {
  path: string;
  hash?: string;
}

export const statusLog = (logger: ILogger, status: StatusResult) => {
  if (status.staged.length > 0) {
    logger.info(
      '\nChanges to be committed:\n' +
        '\t(use \\"git restore --staged <file>...\\" to unstage)',
    );

    status.staged.forEach((value) => {
      logger.success('\t' + value.path);
    });
  }

  if (status.modified.length > 0 || status.deleted.length > 0) {
    logger.info(
      '\nChanges not staged for commit:\n' +
        '\t(use \\"git restore <file>...\\" to discard changes)',
    );

    status.modified.forEach((value) => {
      logger.warn('\t' + value.path, 'modified');
    });

    status.deleted.forEach((value) => {
      logger.warn('\t' + value.path, 'deleted');
    });
  }

  if (status.untracked.length > 0) {
    logger.info(
      '\nUntracked files:\n' +
        '\t(use \\"git add <file>...\\" to include in what will be committed)',
    );

    status.untracked.forEach((value) => {
      logger.error('\t' + value.path);
    });
  }
};
