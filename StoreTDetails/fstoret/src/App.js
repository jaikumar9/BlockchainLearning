import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error.message);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div>
      <h1>Transaction List</h1>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.hash}>
            <strong>Hash:</strong> {transaction.hash}<br />
            <strong>From:</strong> {transaction.from}<br />
            <strong>To:</strong> {transaction.to}<br />
            <strong>Value:</strong> {transaction.value}<br />
            <strong>Gas Price:</strong> {transaction.gasPrice}<br />
            <strong>Gas Used:</strong> {transaction.gasUsed}<br />
            <strong>Block Number:</strong> {transaction.blockNumber}<br />
            <strong>Timestamp:</strong> {transaction.timestamp}<br />
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
