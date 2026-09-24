import { WebSocket } from 'ws';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { MidnightWalletProvider, syncWallet } from '@midnight-ntwrk/testkit-js';
import pino from 'pino';

// @ts-expect-error
globalThis.WebSocket = WebSocket;

const config = {
  walletNetworkId: 'undeployed' as any,
  networkId: 'undeployed' as any,
  indexer: 'http://127.0.0.1:8088/api/v4/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v4/graphql/ws',
  node: 'http://127.0.0.1:9944',
  nodeWS: 'ws://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  faucet: '',
};

setNetworkId(config.networkId as any);

const logger = pino({ level: 'silent' });
const walletWrapper = await MidnightWalletProvider.build(logger, config, '0000000000000000000000000000000000000000000000000000000000000001');
await walletWrapper.start();
const wallet = walletWrapper.wallet;

console.log('Waiting for DUST...');
let attempts = 0;
while (attempts < 120) {
  try {
    const syncedState = await syncWallet(wallet);
    const dustBalance = syncedState.dust.balance(new Date());
    if (dustBalance > 0n) {
      console.log(`DUST ready: ${dustBalance}`);
      await wallet.stop();
      process.exit(0);
    }
  } catch {
    // ignore
  }
  await new Promise((r) => setTimeout(r, 5000));
  attempts++;
  console.log(`Waiting... attempt ${attempts}`);
}
console.error('DUST never arrived. Is Docker running?');
await wallet.stop();
process.exit(1);
