const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/StoreTDetails');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for transactions
const transactionSchema = new mongoose.Schema({
  to: String,
  from: String,
  value: String,
});

// Create a model based on the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Fixed Ethereum address to monitor
const monitoredAddress = '0x970eA4a7F0F0872B5aC888f00B82E07f2aC31799';

// Express route to check for new transactions
app.get('/checkTransactions', async (req, res) => {
  const apiKey = 'KYNZ1UNJ4S3UD53NIG9TM98KUGJSAHSJVG'; // Replace with your PolygonScan API key

  try {
    // Call PolygonScan API to get transaction data for the fixed address
    const response = await axios.get(`https://api.polygonscan.com/matic/mumbai/api?module=account&action=txlist&address=${monitoredAddress}&apikey=${apiKey}`);

    const transactions = response.data.result;
     console.log(transactions, 'Transactions retrieved from PolygonScan');
     
    // Save new transactions to MongoDB
    for (const tx of transactions) {
      const newTransaction = new Transaction({
        to: tx.to,
        from: tx.from,
        value: tx.value,
      });
      await newTransaction.save();
    }

    // Notify clients about new transactions using Socket.IO
    io.emit('newTransactions', transactions);
    console.log(transactions, 'New transactions saved to the database');

    res.json({ message: 'Transactions checked and saved to the database.' });
  } catch (error) {
    console.error('Error checking transactions:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Express route to get transaction data from the database
app.get('/getTransactions', async (req, res) => {
  try {
    // Retrieve transaction data from MongoDB
    const transactions = await Transaction.find({}).exec();
    res.json({ transactions });
  } catch (error) {
    console.error('Error getting transactions from the database:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Socket.IO connection event
io.on('connection', (socket) => {
  console.log('A client connected');
});

// Start the Express server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
