import { createHash } from 'node:crypto';

import { IHashService } from './IHashService';
export class SHA1HashService implements IHashService {
  async hash(data: Buffer): Promise<string> {
    return createHash('sha1').update(data).digest('hex');
  }
}
