import { IGitObject } from './IGitObject';

export interface CommitData {
  tree: string;
  parent?: string;
  author: string;
  message: string;
}

export class CommitObject implements IGitObject {
  constructor(private readonly data: CommitData) {}

  public serialize(): Buffer {
    const content = [
      `tree ${this.data.tree}`,
      this.data.parent ? `parent ${this.data.parent}` : undefined,
      `author ${this.data.author}`,
      '',
      this.data.message,
    ]
      .filter((line) => line !== undefined)
      .join('\n');

    const body = Buffer.from(content);

    const header = Buffer.from(`commit ${body.length}\0`);

    return Buffer.concat([header, body]);
  }

  public static parse(data: Buffer): CommitData {
    const separator = data.indexOf(0);

    if (separator === -1) {
      throw new Error('Invalid commit object');
    }

    const body = data.subarray(separator + 1).toString();

    const lines = body.split('\n');

    const result: Partial<CommitData> = {};

    let messageStart = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line === '') {
        messageStart = i + 1;
        break;
      }

      const [key, ...rest] = line.split(' ');
      const value = rest.join(' ');

      switch (key) {
        case 'tree':
          result.tree = value;
          break;

        case 'parent':
          result.parent = value;
          break;

        case 'author':
          result.author = value;
          break;
      }
    }

    if (!result.tree) {
      throw new Error('Commit object has no tree');
    }

    if (!result.author) {
      throw new Error('Commit object has no author');
    }

    return {
      tree: result.tree,
      parent: result.parent,
      author: result.author,
      message: messageStart === -1 ? '' : lines.slice(messageStart).join('\n'),
    };
  }
}
