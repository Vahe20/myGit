import { Commands, createCommands } from './createCommands';
import { createServices, Services } from './createServices';

export interface Container {
  services: Services;
  commands: Commands;
}

export const createContainer = (): Container => {
  const services = createServices();
  const commands = createCommands(services);

  return {
    services,
    commands,
  };
};
