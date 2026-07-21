import { IIndex } from '../index/IIndex';
import { TreeBuilder } from '../../utils/treeBuilder/treeBuilder';
import { TreeNode } from '../../utils/treeBuilder/TreeNode';
import { IObjectStore } from '../objects/IObjectStore';
import { TreeObject } from '../objects/TreeObject';

export class WriteTree {
  constructor(private readonly objectStore: IObjectStore) {}
  public async execute(index: IIndex) {
    await index.load();
    const tree = await new TreeBuilder().build(index);
    return await this.buildTree(tree);
  }

  private async buildTree(node: TreeNode): Promise<string> {
    const entries = [];

    for (const child of node.children.values()) {
      let hash = child.hash;

      if (child.type === 'tree') {
        hash = await this.buildTree(child);
      }

      entries.push({
        type: child.type,
        name: child.name,
        hash,
      });
    }

    const buffer = Buffer.from(JSON.stringify(entries));

    const treeObject = new TreeObject(buffer).serialize();

    return await this.objectStore.save(treeObject);
  }
}
