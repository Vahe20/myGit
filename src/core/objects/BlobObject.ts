import { IGitObject } from './IGitObject';

export class BlobObject implements IGitObject {
  constructor(private readonly content: Buffer) {}

  public serialize(): Buffer {
    const header = `blob ${this.content.length}\0`;

    return Buffer.concat([Buffer.from(header), this.content]);
  }

  public static parse(data: Buffer): string {
    const offset = data.indexOf(0);

    return data.subarray(offset + 1).toString();
  }
}
