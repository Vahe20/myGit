import { Repository } from '../repository/Repository';
import { Init } from './Init';

describe('Init', () => {
  it('delegates repository initialization', async () => {
    const repository = {
      init: jest.fn().mockResolvedValue(undefined),
    } as unknown as Repository;

    await new Init(repository).execute();

    expect(repository.init).toHaveBeenCalledTimes(1);
  });
});
