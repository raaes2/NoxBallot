import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/noxballot/contract/index.js';
import { Contract } from './managed/noxballot/contract/index.js';

const currentDir = path.resolve(fileURLToPath(import.meta.url), '..');
export const zkConfigPath = path.resolve(currentDir, 'managed', 'noxballot');

/** Base compiled contract with no witnesses yet — use CompiledContract.withWitnesses() at each call site. */
export const BaseCompiledNoxBallot = CompiledContract.make('NoxBallot', Contract).pipe(
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

/** Fully compiled contract with stub witnesses for deployment (witnesses are not called during deploy). */
export const CompiledNoxBallot = BaseCompiledNoxBallot.pipe(
  CompiledContract.withWitnesses({
    voter_credential: () => ({
      voter_id: new Uint8Array(32),
      eligibility_key: new Uint8Array(32),
    }),
    admin_secret: () => new Uint8Array(32),
    vote_choice: () => 0n,
  }),
);
