import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { NetworkConfig } from './config.js';

export type NoxBallotProviders = {
  privateStateProvider: any;
  publicDataProvider: any;
  zkConfigProvider: any;
  proofProvider: any;
  walletProvider: any;
  midnightProvider: any;
};

export function buildProviders(
  wallet: any,
  zkConfigPath: string,
  config: NetworkConfig,
  accountId = 'noxballot-default-account',
): NoxBallotProviders {
  // walletProvider and midnightProvider live directly on MidnightWalletProvider,
  // but FluentWalletBuilder.build() returns a WalletFacade which IS both providers.
  // Support both shapes:
  const walletProvider = wallet.walletProvider ?? wallet;
  const midnightProvider = wallet.midnightProvider ?? wallet;

  return {
    privateStateProvider: levelPrivateStateProvider({
      midnightDbName: 'noxballot-level-db',
      privateStoragePasswordProvider: () => 'NoxBallot!Super#Secret$Key99',
      accountId,
    }),
    publicDataProvider: indexerPublicDataProvider(config.indexer, config.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider,
    midnightProvider,
  };
}
