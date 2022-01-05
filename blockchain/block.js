const SHA256 = require("crypto-js/sha256");

class Block {
  constructor (timestamp, transactions, previousHash = "") {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0; // number only used once
    this.hash = this.calculateHash();
  }

  /**
   * Returns the SHA256 of this block (by processing all the data stored inside this block)
   * @returns {string} - the SHA256 of this block
   */
  calculateHash () {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   * @param {number} difficulty 
   */
  mineBlock (difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce ++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  } 

  /**
   * Validates all the transactions inside this block (signature + hash) and
   * returns true if everything checks out. False if the block is invalid
   * @returns {boolean} - true if the block is valid, false if not
   */
  hasValidTransactions() {
    this.transactions.forEach(transaction => {
      if (!transaction.isValid()) {
        return false;
      }
    });
    return true;
  }
}

module.exports.Block = Block;