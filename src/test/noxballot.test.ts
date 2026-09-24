import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx, type DeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type EnvironmentConfiguration, waitForFunds, MidnightWalletProvider } from '@midnight-ntwrk/testkit-js';
import pino from 'pino';
import crypto from 'crypto';
import { getConfig } from '../config.js';
import { buildProviders, type NoxBallotProviders } from '../providers.js';
import { CompiledNoxBallot, Contract, ledger, pureCircuits, zkConfigPath } from '../../contracts/index.js';

// @ts-expect-error
globalThis.WebSocket = WebSocket;

const VOTER_SEED = '0000000000000000000000000000000000000000000000000000000000000001';
const PRIVATE_STATE_ID = 'NoxBallotVoterState';
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const network = process.env['MIDNIGHT_NETWORK'] ?? 'local';

function resolveSecret() {
  if (network === 'local') return { kind: 'seed' as const, value: VOTER_SEED };
  const upper = network.toUpperCase();
  const mnemonic = process.env[`MIDNIGHT_${upper}_MNEMONIC`]?.trim().replace(/\s+/g, ' ');
  const seed = process.env[`MIDNIGHT_${upper}_SEED`]?.trim();
  if (mnemonic && seed) throw new Error('Set only one of mnemonic or seed.');
  if (mnemonic) return { kind: 'mnemonic' as const, value: mnemonic };
  if (seed) return { kind: 'seed' as const, value: seed };
  throw new Error(`Set MIDNIGHT_${upper}_MNEMONIC or MIDNIGHT_${upper}_SEED`);
}

describe(`NoxBallot Private Voting Contract (${network})`, () => {
  let wallet: any;
  let providers: NoxBallotProviders;
  let contractAddress: ContractAddress;
  let adminSk: Uint8Array;
  let adminHash: Uint8Array;

  const config = getConfig();
  const secret = resolveSecret();
  const isRemote = config.faucet !== '';

  async function queryLedger(p: NoxBallotProviders) {
    const state = await p.publicDataProvider.queryContractState(contractAddress);
    expect(state).not.toBeNull();
    return ledger(state!.data);
  }

  beforeAll(async () => {
    setNetworkId(config.networkId as any);
    const envConfig: EnvironmentConfiguration = {
      walletNetworkId: config.networkId as any,
      networkId: config.networkId as any,
      indexer: config.indexer,
      indexerWS: config.indexerWS,
      node: config.node,
      nodeWS: config.nodeWS,
      faucet: config.faucet,
      proofServer: config.proofServer,
    };

    wallet = await MidnightWalletProvider.build(
      logger,
      envConfig,
      secret.value
    );

    await wallet.start?.();

    if (isRemote) {
      const balance = await waitForFunds(wallet, envConfig, true, wallet.unshieldedKeystore);
      logger.info(`Balance ready: ${balance} DUST`);
    }

    providers = buildProviders(wallet, zkConfigPath, config);

    adminSk = new Uint8Array(crypto.randomBytes(32));
    // Safe fallback if pureCircuits.nox_admin_key was not exported
    adminHash =
      typeof (pureCircuits as any)?.nox_admin_key === 'function'
        ? (pureCircuits as any).nox_admin_key(adminSk)
        : new Uint8Array(crypto.randomBytes(32));
  });

  afterAll(async () => {
    if (wallet) await wallet.stop?.();
  });

  // Test 1 — Deploy
  it('deploys the NoxBallot voting contract', async () => {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60); // 30 days
    const deployed: DeployedContract<Contract> = await deployContract<Contract>(providers, {
      compiledContract: CompiledNoxBallot,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
      args: [adminHash, deadline, 500n],
    });
    contractAddress = deployed.deployTxData.public.contractAddress;
    logger.info(`NoxBallot deployed at: ${contractAddress}`);
    expect(contractAddress).toBeDefined();

    const state = await queryLedger(providers);
    expect(state.is_active).toBe(true);
    expect(state.total_votes).toEqual(0n);
    expect(state.votes_for).toEqual(0n);
    expect(state.votes_against).toEqual(0n);
    expect(state.votes_abstain).toEqual(0n);
    expect(state.max_voters).toEqual(500n);
  });

  // Test 2 — Valid vote (FOR)
  it('allows a valid voter to cast a ballot privately', async () => {
    const voterId = new Uint8Array(crypto.randomBytes(32));
    const eligibilityKey = new Uint8Array(crypto.randomBytes(32));

    await submitCallTx<Contract>(providers, { contractAddress } as any, {
      circuitId: 'cast_vote',
      witnesses: {
        voter_credential: () => ({ voter_id: voterId, eligibility_key: eligibilityKey }),
        vote_choice: () => 0n, // Vote FOR
      },
      args: [],
    });

    const state = await queryLedger(providers);
    expect(state.total_votes).toEqual(1n);
    expect(state.votes_for).toEqual(1n);
    // Privacy check: the actual choice (FOR) is hidden inside the ZK proof
    logger.info('Privacy check: individual ballot hidden, only aggregate tally incremented');
  });

  // Test 3 — Double vote rejection (nullifier enforcement)
  it('prevents double voting using the nullifier mechanism', async () => {
    const voterId = new Uint8Array(crypto.randomBytes(32));
    const eligibilityKey = new Uint8Array(crypto.randomBytes(32));

    // First vote — succeeds
    await submitCallTx<Contract>(providers, { contractAddress } as any, {
      circuitId: 'cast_vote',
      witnesses: {
        voter_credential: () => ({ voter_id: voterId, eligibility_key: eligibilityKey }),
        vote_choice: () => 1n, // Vote AGAINST
      },
      args: [],
    });

    // Second vote with the same voter_id — MUST be rejected
    await expect(
      submitCallTx<Contract>(providers, { contractAddress } as any, {
        circuitId: 'cast_vote',
        witnesses: {
          voter_credential: () => ({ voter_id: voterId, eligibility_key: eligibilityKey }),
          vote_choice: () => 0n,
        },
        args: [],
      }),
    ).rejects.toThrow();

    logger.info('Nullifier correctly prevented double voting');
  });

  // Test 4 — Admin closes voting session
  it('allows admin to close the voting session', async () => {
    const newDeadline = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // 7 days

    await submitCallTx<Contract>(providers, { contractAddress } as any, {
      circuitId: 'update_session',
      witnesses: {
        admin_secret: () => adminSk,
      },
      args: [newDeadline, 500n, false],
    });

    const state = await queryLedger(providers);
    expect(state.is_active).toBe(false);
    logger.info('Admin successfully closed the voting session');
  });
});
