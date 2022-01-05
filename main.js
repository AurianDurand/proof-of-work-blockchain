const { Blockchain } = require('./blockchain/blockchain');
const { Transaction } = require('./blockchain/transaction');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function getShortSring(string) {
  return string.substring(0, 10) + '...' + string.substring(string.length - 10, string.length);
}

/**
 * Account 1
 * Private key:  4abbc482240ccf4fe5f92b4464240a2706e7d80aa9dc68776d3808302d815ccc
 * Public key:  04ef8adbb8489e5d9f7122c09be1d1666f1928abdee5ffd7b3871a734847ed28150c07395b0ec80f9eb91d3dd4207a6d0ea2755123724ac1a40b5adec27a39fb20
 */

// Create a new key pair from the elliptic curve library (secp256k1) and the wallet address
const myAccount1Key = ec.keyFromPrivate("4abbc482240ccf4fe5f92b4464240a2706e7d80aa9dc68776d3808302d815ccc");
const myWallet1Address = myAccount1Key.getPublic("hex");
console.log("\nWallet 1 address: ", getShortSring(myWallet1Address));

/**
 * Account 2
 * Private key:  d3d4093cc99464e9f47963291ba35187d5ead7580d858dcdf3001697d7e01a4d
 * Public key:  040853075bdd9574c9d715bce5d4f86e85425377ff26437b0b1a338331ed8fc84a2cdb6a45cec2ab951ad7a1c8169a7583190784673f04fc81917900fb1d64e37c
 */

// Create a new key pair from the elliptic curve library (secp256k1) and the wallet address
const myAccount2Key = ec.keyFromPrivate("d3d4093cc99464e9f47963291ba35187d5ead7580d858dcdf3001697d7e01a4d");
const myWallet2Address = myAccount2Key.getPublic("hex");
console.log("Wallet 2 address: ", getShortSring(myWallet2Address));

// Create the blockchain
let blockchain = new Blockchain();
console.log("\nBlockchain difficulty: ", blockchain.difficulty);

// Mine the first block
console.log("\nWallet 1 mining...");
blockchain.minePendingTransactions(myWallet1Address);

// Mine one block
console.log("\nWallet 1 mining...");
blockchain.minePendingTransactions(myWallet1Address);

// Create a first transaction & sign it 
const transaction1 = new Transaction(myWallet1Address, myWallet2Address, 7);
transaction1.signTransaction(myAccount1Key);
blockchain.addTransaction(transaction1);
console.log("\nTransaction from ", getShortSring(myWallet1Address), " to ", getShortSring(myWallet2Address), " of ", 7);

// Mine one block
console.log("\nWallet 1 mining...");
blockchain.minePendingTransactions(myWallet1Address);

// Create a second transaction & sign it 
const transaction2 = new Transaction(myWallet2Address, myWallet1Address, 3);
transaction2.signTransaction(myAccount2Key);
blockchain.addTransaction(transaction2);
console.log("\nTransaction from ", getShortSring(myWallet2Address), " to ", getShortSring(myWallet1Address), " of ", 3);

// Mine one block
console.log("\nWallet 2 mining...");
blockchain.minePendingTransactions(myWallet2Address);

// Mine one block
console.log("\nWallet 2 mining...");
blockchain.minePendingTransactions(myWallet2Address);

/**
 * This code changes the amount of second transaction in the fourth block
 * This is not a good practice, but it is just to show how the blockchain works
 * If the amount of the transaction is changed, the hash of the block will changed
 * and the block will be invalid, resulting in an invalid blockchain
 */
// blockchain.chain[3].transactions[1].amount = 1;

// Display the wallet balances
console.log("\nBalance of wallet 1: " + blockchain.getBalanceOfAddress(myWallet1Address));
console.log("Balance of wallet 2: " + blockchain.getBalanceOfAddress(myWallet2Address));

// Display the blockchain validity 
console.log("Blockchain validity: " + blockchain.isChainValid());

// Save the chain into a json file (for later use)
var fs = require('fs');
fs.writeFile('chain.json', JSON.stringify(blockchain.chain), 'utf8', function(err) {
    if (err) throw err;
  }
);
