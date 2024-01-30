const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());

const getMongoClient = async () => {
  const client = new MongoClient('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  return client;
};

// Endpoint to fetch transactions from MongoDB sorted by timestamp (latest first)
app.get('/transactions', async (req, res) => {
  try {
    const client = await getMongoClient();
    const database = client.db('StoreTDetails');
    const collection = database.collection('transactions');

    // Sort transactions by timestamp in descending order
    const transactions = await collection.find().sort({ timestamp: -1 }).toArray();

    client.close();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/fetchAndStore', async (req, res) => {
  const apiKey = 'KYNZ1UNJ4S3UD53NIG9TM98KUGJSAHSJVG';
  const address = '0x970eA4a7F0F0872B5aC888f00B82E07f2aC31799';

  const formatValue = value => parseFloat(value).toFixed(5);
  const client = await getMongoClient();

  try {
    const apiUrl = `https://api-mumbai.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
    const response = await axios.get(apiUrl);

    if (response.data.status === '1') {
      const transactions = response.data.result;
      if (transactions.length > 0) {
        const database = client.db('StoreTDetails');
        const collection = database.collection('transactions');

        for (const tx of transactions) {
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
        }
      } else {
        console.log('No transactions found for address:', address);
      }
    } else {
      console.log('Error:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching and storing transactions:', error.message);
  } finally {
    client.close();
    res.json({ message: 'Transactions fetched and stored successfully.' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
