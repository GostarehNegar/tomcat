
import constants from '../../constants';

import { BackgroundService } from './BackgroundService';
import { CancellationToken } from '../base';

export const serviceNames = constants.ServiceNames;

export class SimpleTask extends BackgroundService {
  protected override run(token: CancellationToken): Promise<void> {
    token;
    throw new Error('Method not implemented.');
  }
}
