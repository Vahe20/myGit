export type ObjectType = 'blob' | 'tree';

export class TreeNode {
  constructor(
    public name: string,
    public type: ObjectType,
    public hash?: string,
    public children: Map<string, TreeNode> = new Map(),
  ) {}
}
