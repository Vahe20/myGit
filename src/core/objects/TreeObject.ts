import { IGitObject } from './IGitObject';

export class TreeObject implements IGitObject {
  constructor(private readonly content: Buffer) {}

  public serialize(): Buffer {
    const header = `tree ${this.content.length}\0`;

    return Buffer.concat([Buffer.from(header), this.content]);
  }
}
