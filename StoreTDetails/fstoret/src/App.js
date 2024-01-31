import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [searchHash, setSearchHash] = useState('');
  const [searchResult, setSearchResult] = useState(null);

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

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/transactions/${searchHash}`);
      setSearchResult(response.data);
    } catch (error) {
      console.error('Error fetching transaction:', error.message);
      setSearchResult(null);
    }
  };

  return (
    <div>
      <h1>Transaction List</h1>
      <div>
        <label>Search by Hash:</label>
        <input
          type="text"
          placeholder="Enter transaction hash"
          value={searchHash}
          onChange={(e) => setSearchHash(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <ul>
        {searchResult ? (
          <li>
            <strong>Hash:</strong> {searchResult.hash}<br />
            <strong>From:</strong> {searchResult.from}<br />
            <strong>To:</strong> {searchResult.to}<br />
            <strong>Value:</strong> {searchResult.value}<br />
            <strong>Gas Price:</strong> {searchResult.gasPrice}<br />
            <strong>Gas Used:</strong> {searchResult.gasUsed}<br />
            <strong>Block Number:</strong> {searchResult.blockNumber}<br />
            <strong>Timestamp:</strong> {searchResult.timestamp}<br />
            <hr />
          </li>
        ) : (
          transactions.map(transaction => (
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
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
