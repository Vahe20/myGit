import { IIndexService } from '../../services/indexService/IIndexService';
import { IObjectStore } from '../../services/objectStore/IObjectStore';
import { TreeBuilder } from '../../utils/treeBuilder/treeBuilder';
import { TreeNode } from '../../utils/treeBuilder/TreeNode';
import { TreeEntry, TreeObject } from '../objects/TreeObject';
import { ICommand } from './ICommand';

export class WriteTree implements ICommand<string, [IIndexService]> {
  constructor(private readonly objectStore: IObjectStore) {}
  public async execute(indexService: IIndexService) {
    await indexService.load();
    const tree = await new TreeBuilder().build(indexService);
    return await this.buildTree(tree);
  }

  private async buildTree(node: TreeNode): Promise<string> {
    const entries: TreeEntry[] = [];

    for (const child of node.children.values()) {
      let hash = child.hash;

      if (child.type === 'tree') {
        hash = await this.buildTree(child);
      }

      if (!hash) {
        continue;
      }

      entries.push({
        type: child.type,
        name: child.name,
        hash,
      });
    }

    const treeObject = new TreeObject(entries).serialize();

    return await this.objectStore.save(treeObject);
  }
}
