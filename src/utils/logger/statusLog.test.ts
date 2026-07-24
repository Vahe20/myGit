import { ILogger } from './ILogger';
import { statusLog, StatusResult } from './statusLog';

const createLogger = (): ILogger => ({
  info: jest.fn(),
  success: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

const emptyStatus: StatusResult = {
  staged: [],
  modified: [],
  deleted: [],
  untracked: [],
};

describe('statusLog', () => {
  it('logs nothing when there are no changes', () => {
    const logger = createLogger();

    statusLog(logger, emptyStatus);

    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.success).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('logs staged files as success entries', () => {
    const logger = createLogger();

    statusLog(logger, {
      ...emptyStatus,
      staged: [{ path: 'a.txt', hash: 'hash-a' }],
    });

    expect(logger.success).toHaveBeenCalledWith('\ta.txt');
  });

  it('logs modified and deleted files as warnings', () => {
    const logger = createLogger();

    statusLog(logger, {
      ...emptyStatus,
      modified: [{ path: 'modified.txt', hash: 'hash-m' }],
      deleted: [{ path: 'deleted.txt' }],
    });

    expect(logger.warn).toHaveBeenCalledWith('\tmodified.txt', 'modified');
    expect(logger.warn).toHaveBeenCalledWith('\tdeleted.txt', 'deleted');
  });

  it('logs untracked files as errors', () => {
    const logger = createLogger();

    statusLog(logger, {
      ...emptyStatus,
      untracked: [{ path: 'new.txt', hash: 'hash-n' }],
    });

    expect(logger.error).toHaveBeenCalledWith('\tnew.txt');
  });
});
