import React, { useState } from 'react';
const Web3 = require("web3");

const App = () => {
  const [transactionHash, setTransactionHash] = useState('');
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [error, setError] = useState('');

  const apiBaseUrl = 'https://api.polygonscan.com/api';
  const apiKey = 'KYNZ1UNJ4S3UD53NIG9TM98KUGJSAHSJVG';

  const handleInputChange = (event) => {
    setTransactionHash(event.target.value);
  };

  const handleSearch = async () => {
    if (!transactionHash) {
      setError('Please enter a valid transaction hash.');
      return;
    }

    const apiUrl = `${apiBaseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      const transaction = data.result;
      console.log('Transaction:', transaction);

      if (transaction && transaction.from && transaction.to && transaction.value) {
        const fromAddress = transaction.from;
        const toAddress = transaction.to;
        const amountWei = transaction.value;

        // Convert amount to ETH and format with 4 decimals
        const amountEth = Web3.utils.fromWei(amountWei, 'ether');
        const formattedAmount = parseFloat(amountEth).toFixed(4);

        const newTransactionDetails = {
          fromAddress,
          toAddress,
          amount: formattedAmount,
          currency: 'MATIC',
        };

        setTransactionDetails(newTransactionDetails);
        setError('');
      } else {
        setError('Error: Required transaction data is missing or undefined');
        setTransactionDetails(null);
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      setTransactionDetails(null);
    }
  };

  return (
    <div>
      <h2>Transaction Details</h2>
      <label>
        Enter Transaction Hash:
        <input type="text" value={transactionHash} onChange={handleInputChange} />
      </label>
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {transactionDetails && (
        <div>
          <p>From Address: {transactionDetails.fromAddress}</p>
          <p>To Address: {transactionDetails.toAddress}</p>
          <p>Amount: {transactionDetails.amount} {transactionDetails.currency}</p>
        </div>
      )}
    </div>
  );
};

export default App;
