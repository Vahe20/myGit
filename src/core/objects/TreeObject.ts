import { IGitObject } from './IGitObject';

export interface TreeEntry {
  type: 'blob' | 'tree';
  name: string;
  hash: string;
}

export class TreeObject implements IGitObject {
  constructor(private readonly entries: TreeEntry[]) {}

  public serialize(): Buffer {
    const content = Buffer.concat(
      this.entries.map((entry) =>
        Buffer.concat([
          Buffer.from(`${this.getMode(entry.type)} ${entry.name}\0`),
          Buffer.from(entry.hash, 'hex'),
        ]),
      ),
    );

    const header = Buffer.from(`tree ${content.length}\0`);

    return Buffer.concat([header, content]);
  }

  private getMode(type: TreeEntry['type']): string {
    return type === 'tree' ? '040000' : '100644';
  }

  public static parse(data: Buffer): TreeEntry[] {
    const entries: TreeEntry[] = [];

    let offset = data.indexOf(0) + 1;

    while (offset < data.length) {
      const space = data.indexOf(0x20, offset);

      const mode = data.toString('utf8', offset, space);

      const nullByte = data.indexOf(0, space + 1);

      const name = data.toString('utf8', space + 1, nullByte);

      const hash = data.subarray(nullByte + 1, nullByte + 21).toString('hex');

      entries.push({
        type: mode === '040000' ? 'tree' : 'blob',
        name,
        hash,
      });

      offset = nullByte + 21;
    }

    return entries;
  }
}
