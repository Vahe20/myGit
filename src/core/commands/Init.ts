import { Repository } from '../repository/Repository';
import { ICommand } from './ICommand';

export class Init implements ICommand {
  constructor(private readonly repository: Repository) {}

  public async execute(): Promise<void> {
    await this.repository.init();
  }
}
