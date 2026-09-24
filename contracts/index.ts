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

// Build the base contract using the single make().pipe() chain while .pipe() still exists.
// After each SDK combinator (withWitnesses, withCompiledFileAssets), the returned object is
// a plain spread — so .pipe() is no longer available. We therefore build everything in one
// unbroken .pipe() call starting from make().
const _base = CompiledContract.make('NoxBallot', Contract);

/** Base compiled contract (no witnesses) — for per-call witness injection in tests. */
export const BaseCompiledNoxBallot = (CompiledContract.withCompiledFileAssets as any)(_base, zkConfigPath);

/** Fully compiled contract with stub witnesses for deployment. */
export const CompiledNoxBallot = (CompiledContract.withWitnesses as any)(BaseCompiledNoxBallot, {
  voter_credential: (ctx: any) => [ctx.privateState, {
    voter_id: new Uint8Array(32),
    eligibility_key: new Uint8Array(32),
  }],
  admin_secret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
  vote_choice: (ctx: any) => [ctx.privateState, 0n],
});
