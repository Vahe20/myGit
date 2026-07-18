import * as zlib from 'node:zlib';
import { promisify } from 'util';
import { ICompressionService } from './ICompressionService';

export class ZlibCompressionService implements ICompressionService {
  private readonly deflate = promisify(zlib.deflate);
  private readonly inflate = promisify(zlib.inflate);

  public async compress(data: Buffer): Promise<Buffer> {
    return this.deflate(data);
  }

  public async decompress(data: Buffer): Promise<Buffer> {
    return this.inflate(data);
  }
}
