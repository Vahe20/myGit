import { IIndexService } from '../../services/indexService/IIndexService';
import { TreeNode } from './TreeNode';

export class TreeBuilder {
  async build(index: IIndexService): Promise<TreeNode> {
    const data = (await index.load()).getAll();
    const root = new TreeNode('', 'tree');

    for (const [path, hash] of data) {
      const parts = path.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const name = parts[i];
        const isBlob = i === parts.length - 1;

        let child = current.children.get(name);

        if (!child) {
          child = new TreeNode(
            name,
            isBlob ? 'blob' : 'tree',
            isBlob ? hash : undefined,
          );

          current.children.set(name, child);
        } else {
          if (!isBlob && child.type !== 'tree') {
            throw new Error(`"${path}": "${name}" is a blob, expected a tree.`);
          }

          if (isBlob) {
            if (child.type !== 'blob') {
              throw new Error(
                `"${path}": "${name}" is a tree, expected a blob.`,
              );
            }

            if (child.hash !== hash) {
              throw new Error(`"${path}" already exists with another hash.`);
            }
          }
        }

        current = child;
      }
    }

    return root;
  }
}
