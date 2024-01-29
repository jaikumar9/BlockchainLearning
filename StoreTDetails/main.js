const { ethers } = require('ethers');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const walletAddress = '0x970eA4a7F0F0872B5aC888f00B82E07f2aC31799';
const polygonScanApiKey = 'KYNZ1UNJ4S3UD53NIG9TM98KUGJSAHSJVG';
const mongodbUri = 'mongodb://localhost:27017/your_database';

const provider = new ethers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com'); // Use the appropriate Polygon RPC endpoint

async function connectToMongoDB() {
  const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    await monitorTransactions(client);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function monitorTransactions(client) {
  try {
    while (true) {
      const response = await axios.get(`https://api.polygonscan.com/api?module=account&action=tokentx&address=${walletAddress}&apikey=${polygonScanApiKey}`);
      const transactions = response.data.result;

      for (const transaction of transactions) {
        // Check if the transaction is an incoming transaction to the wallet
        if (transaction.to.toLowerCase() === walletAddress.toLowerCase()) {
          // Extract relevant details from the transaction
          const { hash, from, to, value, timeStamp } = transaction;

          // Store in MongoDB
          await storeTransaction(client, { hash, from, to, value, timeStamp });
        }
      }

      // Sleep for a while before checking for new transactions again (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function storeTransaction(client, transaction) {
  const db = client.db('your_database');
  const collection = db.collection('transactions');
  await collection.insertOne(transaction);
  console.log(`Transaction ${transaction.hash} stored in MongoDB.`);
}

// Start the script
connectToMongoDB();
