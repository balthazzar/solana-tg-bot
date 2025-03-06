import { Connection, PublicKey } from '@solana/web3.js';
import { BlockchainRpcService } from './blockchain-rpc.service';

export class SplTokenService {
  readonly #connection: Connection;

  constructor (
    rpcClient: BlockchainRpcService,
  ) {
    this.#connection = rpcClient.getConnection();
  }

  public async getBalance (token: PublicKey) {
    const balance = await this.#connection.getBalance(token, {
      commitment: 'finalized',
    });

    return balance;
  }
}
