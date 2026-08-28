import { TransactionBuilder, Server, Networks, Asset, Operation, Keypair, Transaction, FeeBumpTransaction } from 'stellar-sdk';
import { session } from '../crypto/session';

export class StellarTransactionService {
  private server: Server;
  private networkPassphrase: string;

  constructor(network: 'testnet' | 'mainnet') {
    if (network === 'mainnet') {
      this.server = new Server('https://horizon.stellar.org');
      this.networkPassphrase = Networks.PUBLIC;
    } else {
      this.server = new Server('https://horizon-testnet.stellar.org');
      this.networkPassphrase = Networks.TESTNET;
    }
  }

  async buildPaymentTx(params: {
    sourcePublicKey: string;
    destinationPublicKey: string;
    amount: string;
    assetCode?: string;
    assetIssuer?: string;
    memo?: string;
  }): Promise<Transaction> {
    const sourceAccount = await this.server.loadAccount(params.sourcePublicKey);
    
    let asset = Asset.native();
    if (params.assetCode && params.assetIssuer) {
      asset = new Asset(params.assetCode, params.assetIssuer);
    }

    const builder = new TransactionBuilder(sourceAccount, {
      fee: '100', // Default base fee (100 stroops)
      networkPassphrase: this.networkPassphrase,
    });

    builder.addOperation(
      Operation.payment({
        destination: params.destinationPublicKey,
        asset: asset,
        amount: params.amount,
      })
    );

    builder.setTimeout(300); // 5 minutes timeout
    return builder.build();
  }

  signTransaction(transaction: Transaction | FeeBumpTransaction) {
    const secretKey = session.getSecretKey();
    if (!secretKey) {
      throw new Error('Wallet is locked. Session key not available for signing.');
    }
    
    const keypair = Keypair.fromSecret(secretKey);
    transaction.sign(keypair);
    
    return transaction;
  }

  async submitTransaction(transaction: Transaction | FeeBumpTransaction) {
    return await this.server.submitTransaction(transaction);
  }
}
