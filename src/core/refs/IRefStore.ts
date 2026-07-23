export interface IRefStore {
  getHeadRef(): Promise<string>;
  setHeadRef(branch: string): Promise<void>;
  getCurrentCommit(): Promise<string | undefined>;
  getBranchCommit(branch: string): Promise<string | undefined>;
  updateCurrentBranch(hash: string): Promise<void>;
}
