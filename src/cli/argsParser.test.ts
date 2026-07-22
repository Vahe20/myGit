import { argsParser } from './argsParser';

describe('argsParser', () => {
  it('parses a command with positional arguments', () => {
    expect(argsParser(['commit', 'file.txt', 'src/indexService.ts'])).toEqual({
      command: 'commit',
      args: ['file.txt', 'src/indexService.ts'],
      options: {},
    });
  });

  it('parses options with values and boolean flags', () => {
    expect(argsParser(['commit', '-m', 'init commit', '--all'])).toEqual({
      command: 'commit',
      args: [],
      options: {
        m: 'init commit',
        all: true,
      },
    });
  });

  it('keeps positional arguments that appear before options', () => {
    expect(argsParser(['add', 'src/app.ts', '--verbose'])).toEqual({
      command: 'add',
      args: ['src/app.ts'],
      options: {
        verbose: true,
      },
    });
  });
});
