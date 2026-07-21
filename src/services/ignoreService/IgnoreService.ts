import { RepositoryPaths } from '../../configs/RepositoryPaths';
import { IFileSystem } from '../../infrastructure/fileSystem/IFileSystem';
import { PathNormalizer } from '../../utils/normalizer/PathNormalizer';

interface IgnoreRule {
  pattern: string;
  hasSlash: boolean;
  directoryOnly: boolean;
  regex: RegExp;
}

export class IgnoreService {
  private rules?: IgnoreRule[];

  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly repositoryPaths: RepositoryPaths,
  ) {}

  public async loadRules(): Promise<IgnoreRule[]> {
    if (this.rules) {
      return this.rules;
    }

    if (!(await this.fileSystem.exists(this.repositoryPaths.ignore()))) {
      this.rules = [];
      return this.rules;
    }

    const data = (await this.fileSystem.read(this.repositoryPaths.ignore()))
      .toString()
      .split(/\r?\n/);

    this.rules = data
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => this.createRule(line));

    return this.rules;
  }

  public async isIgnored(filePath: string): Promise<boolean> {
    const normalizedPath = PathNormalizer(filePath);

    if (normalizedPath === '.mygit' || normalizedPath.startsWith('.mygit/')) {
      return true;
    }

    const rules = await this.loadRules();

    return rules.some((rule) => this.matchesRule(rule, normalizedPath));
  }

  private createRule(line: string): IgnoreRule {
    const directoryOnly = line.endsWith('/');
    const pattern = PathNormalizer(directoryOnly ? line.slice(0, -1) : line);

    return {
      pattern,
      directoryOnly,
      hasSlash: pattern.includes('/'),
      regex: this.createRegex(pattern),
    };
  }

  private matchesRule(rule: IgnoreRule, filePath: string): boolean {
    if (rule.directoryOnly) {
      return (
        filePath === rule.pattern ||
        filePath.startsWith(`${rule.pattern}/`) ||
        filePath.includes(`/${rule.pattern}/`) ||
        filePath.endsWith(`/${rule.pattern}`)
      );
    }

    if (rule.hasSlash) {
      return rule.regex.test(filePath);
    }

    const parts = filePath.split('/');

    return parts.some((part) => rule.regex.test(part));
  }

  private createRegex(pattern: string): RegExp {
    const source = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');

    return new RegExp(`^${source}$`);
  }
}
