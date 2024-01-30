const axios = require('axios');
const { MongoClient } = require('mongodb');

const apiKey = 'KYNZ1UNJ4S3UD53NIG9TM98KUGJSAHSJVG';
const address = '0x970eA4a7F0F0872B5aC888f00B82E07f2aC31799';

const formatValue = value => parseFloat(value).toFixed(5);

const getMongoClient = async () => {
  const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client;
};

const insertTransaction = async (client, tx) => {
  try {
    const database = client.db('StoreTDetails');
    const collection = database.collection('transactions');
    await collection.insertOne({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: formatValue(tx.value),
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
      blockNumber: tx.blockNumber,                                   
      timestamp: new Date(tx.timeStamp * 1000),
    });
    console.log('Transaction inserted:', tx.hash);
  } catch (error) {
    console.error('Error inserting transaction:', error.message);
  }
};

const getTransactions = async (address, page = 1) => {
  const client = await getMongoClient();

  try {
    const apiUrl =`https://api-mumbai.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&page=${page}&apikey=${apiKey}`;
    const response = await axios.get(apiUrl);

    if (response.data.status === '1') {
      const transactions = response.data.result;
      if (transactions.length > 0) {
        for (const tx of transactions) {
          await insertTransaction(client, tx);
        }

        // Check if there are more pages and fetch them
        const nextPage = page + 1;
        if (nextPage <= Math.ceil(response.data.result / 10)) {
          await getTransactions(address, nextPage);
        }
      } else {
        console.log('No transactions found for address:', address);
      }
    } else {
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
  } finally {
    await client.close();
  }
};

getTransactions(address);
