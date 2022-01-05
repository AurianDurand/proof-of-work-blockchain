const { Block } = require('./block');
const { Transaction } = require('./transaction');

class Blockchain {
  constructor (difficulty = 4) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
    this.pendTransactions = [];
    this.miningReward = 10;
  }

  /**
   * @returns {Block} - the genesis block
   */
  createGenesisBlock () {
    return new Block(Date.parse('2022-01-05'), [], "0");
  }

  /**
   * @returns {Block} - the latest block in the chain
   */
  getLatestBlock () {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address
   * @param {string} miningRewardAddress 
   */
  minePendingTransactions (miningRewardAddress) {
    let block = new Block(Date.now(), this.pendTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
  }

  /**
   * 
   * @param {*} transaction 
   */
  addTransaction (transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }
    if (!transaction.isValid()) {
      throw new Error("Cannot add incalid transaction to chain");
    }
    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }
    // Making sure that the amount sent is not greater than existing balance
    if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
      throw new Error('Not enough balance');
    }
    this.pendTransactions.push(transaction);
  }

  /**
   * @param {string} address 
   * @returns {number} - the balance of the given address
   */
  getBalanceOfAddress (address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        } else if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  /**
   * Returns a list of all transactions that happened
   * to and from the given wallet address.
   * @param  {string} address
   * @return {Transaction[]}
   */
   getAllTransactionsForWallet(address) {
    const transactions = [];
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.fromAddress === address || transaction.toAddress === address) {
          transactions.push(transaction);
        }
      }
    }
    return transactions;
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them
   * @returns {boolean} - true if the chain is valid, false if not
   */
  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());
    if (realGenesis !== JSON.stringify(this.chain[0])) return false;
    // Check the remaining blocks on the chain to see if there hashes and signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      if (!currentBlock.hasValidTransactions()) return false;
      else if (currentBlock.hash !== currentBlock.calculateHash()) return false;
      else if (currentBlock.previousHash !== previousBlock.hash) return false;
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;