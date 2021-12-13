
import { CancellationToken } from '../base';
import { BaseConstants } from '../base/baseconstants';

import { BackgroundService } from './BackgroundService';

export const serviceNames = BaseConstants.ServiceNames;

export class SimpleTask extends BackgroundService {
  protected override run(token: CancellationToken): Promise<void> {
    token;
    throw new Error('Method not implemented.');
  }
}
