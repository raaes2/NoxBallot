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

console.log('Waiting for DUST...');
let attempts = 0;
while (attempts < 120) {
  let walletWrapper: any;
  try {
    const logger = pino({ level: 'silent' });
    walletWrapper = await MidnightWalletProvider.build(logger, config, '0000000000000000000000000000000000000000000000000000000000000001');
    await walletWrapper.start();
    
    const syncedState = await Promise.race([
      syncWallet(walletWrapper.wallet),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    
    const dustBalance = syncedState.dust.balance(new Date());
    if (dustBalance > 0n) {
      console.log(`DUST ready: ${dustBalance}`);
      await walletWrapper.stop();
      process.exit(0);
    }
  } catch {
    // ignore
  } finally {
    if (walletWrapper) {
      try { await walletWrapper.stop(); } catch {}
    }
  }
  await new Promise((r) => setTimeout(r, 5000));
  attempts++;
  console.log(`Waiting... attempt ${attempts}`);
}
console.error('DUST never arrived. Is Docker running?');
process.exit(1);
