import { initRepository } from './repository/init';

const command = process.argv[2];

switch (command) {
  case 'init':
    initRepository();
    break;

  default:
    console.log('unknown command');
}