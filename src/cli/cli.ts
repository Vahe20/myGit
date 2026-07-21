import { createContainer } from '../container/createContainer';
import { PathNormalizer } from '../utils/normalizer/PathNormalizer';
import { argsParser } from './argsParser';

const main = async () => {
  const cli = argsParser(process.argv.slice(2));

  const { services, commands } = createContainer();

  if (!cli.command) {
    services.logger.error('No command specified');
    return;
  }

  switch (cli.command) {
    case 'init': {
      await commands.init.execute();
      break;
    }

    case 'add': {
      const targetPath = PathNormalizer(cli.args[0]);

      if (!targetPath) {
        throw new Error('File path is required');
      }

      await commands.add.execute(targetPath);

      break;
    }

    case 'status': {
      const { staged, modified, untracked } = await commands.status.execute();

      services.logger.info(
        '\nChanges to be committed:\n' +
          '\t(use \\"git restore --staged <file>...\\" to unstage)',
      );

      staged.forEach((value) => {
        services.logger.success('\t' + value.path);
      });

      services.logger.info(
        '\nChanges not staged for commit:\n' +
          '\t(use \\"git restore --staged <file>...\\" to unstage)',
      );

      modified.forEach((value) => {
        services.logger.warn('\t' + value.path);
      });

      services.logger.info(
        '\nUntracked files:\n' +
          '\t(use \\"git add <file>...\\" to include in what will be committed)',
      );

      untracked.forEach((value) => {
        services.logger.error('\t' + value.path);
      });
      break;
    }

    case 'write-tree': {
      const hash = await commands['write-tree'].execute(services.index);
      services.logger.info('tree hash: ' + hash);
      break;
    }

    case 'commit-tree': {
      const message = cli.options.m;
      const hash = cli.args[0];
      if (typeof message !== 'string') {
        throw new Error('message is require');
      }
      if (!hash) {
        throw new Error('Tree hash is require');
      }
      await commands['commit-tree'].execute(hash, message);
      break;
    }

    case 'commit': {
      const message = cli.options.m;
      if (typeof message !== 'string') {
        throw new Error('message is require');
      }
      await commands.commit.execute(message);
      break;
    }

    case 'log': {
      await commands.log.execute();
      break;
    }

    default: {
      services.logger.error(`Unknown command: ${cli.command}`);
      break;
    }
  }
};

main().catch(console.error);
