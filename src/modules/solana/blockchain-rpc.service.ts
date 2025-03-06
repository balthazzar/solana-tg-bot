import { clusterApiUrl, Connection, FetchFn } from '@solana/web3.js';
import { config } from '#common';

type TProvider = 'rpc' | 'devnet';

const MAX_ATTEMPTS = 5;

const fetchWithBackoff: FetchFn = async (...args): Promise<Response> => {
  let t = 1;

  const backoff = async (): Promise<void> => {
    const ms = t * 100;

    console.debug({}, `Rpc fetch error; Wait for ${ms}ms and try again...`);

    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

    t++;
  };

  do {
    try {
      const response = await fetch(...args);

      const data: any = await response.clone().json();

      if (data.error?.code === 0 && data.error.message === 'we can\'t execute this request') {
        await backoff();
        continue;
      }

      return response;
    } catch (e: unknown) {
      const msg = (e as Error).message;
      if (msg?.startsWith('fetch failed') || msg?.startsWith('Unexpected token \'<\'')) {
        await backoff();
        continue;
      }

      throw e;
    }
    // eslint-disable-next-line no-unmodified-loop-condition
  } while (t <= MAX_ATTEMPTS);
};

export class BlockchainRpcService {
  readonly #connections: { [P in TProvider]?: Connection } = {};

  constructor () {
    try {
      const nodeUrl = config.getOrThrow('SOLANA_RPC_NODE_URL');

      this.#connections['rpc'] = new Connection(nodeUrl, {
        fetch: fetchWithBackoff,
      });
    } catch (error) {
      console.error(error);
    }

    this.#connections['devnet'] = new Connection(clusterApiUrl('devnet'), 'confirmed');
  }

  public getConnection (provider: TProvider = 'devnet'): Connection {
    return this.#connections[provider];
  }
}
